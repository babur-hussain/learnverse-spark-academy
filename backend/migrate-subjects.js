const fs = require('fs');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

require('dotenv').config();

const { Subject } = require('./src/models');
const filePath = path.join(__dirname, '..', 'db_cluster-23-10-2025@13-49-07.backup');

function uuidToObjectId(uuid) {
    if (!uuid || uuid === '\\N') return null;
    const hash = crypto.createHash('md5').update(uuid).digest('hex');
    return new mongoose.Types.ObjectId(hash.substring(0, 24));
}

function pgString(val) {
    if (val === undefined || val === null || val === '\\N') return null;
    return String(val).replace(/\\b/g, '\b').replace(/\\f/g, '\f').replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\v/g, '\v').replace(/\\\\/g, '\\');
}

function applyS3Url(val) {
    if (!val) return val;
    const str = pgString(val);
    if (!str) return str;
    return str.replace(/https:\/\/[^\/]+\.supabase\.co\/storage\/v1\/object\/public\/[^\/]+\//g, 'https://learnverse.s3.ap-south-1.amazonaws.com/uploads/');
}

async function migrateSubjects() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnverse');
    console.log('✅ Connected to MongoDB for Subject mapping');

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let currentTable = null;
    let columns = [];

    const classSubjectsMap = {};
    const subjects = [];

    for await (const line of rl) {
        if (line.startsWith('COPY public.')) {
            const match = line.match(/^COPY public\.([a-zA-Z0-9_]+) \((.+)\) FROM stdin;/);
            if (match) {
                currentTable = match[1];
                columns = match[2].split(', ').map(c => c.trim());
            }
            continue;
        }

        if (line === '\\.' && currentTable) {
            currentTable = null;
            columns = [];
            continue;
        }

        if (currentTable === 'class_subjects') {
            const values = line.split('\t');
            const row = {};
            for (let i = 0; i < columns.length; i++) {
                row[columns[i]] = values[i];
            }
            classSubjectsMap[row.subject_id] = row.class_id;
        } else if (currentTable === 'subjects') {
            const values = line.split('\t');
            const row = {};
            for (let i = 0; i < columns.length; i++) {
                row[columns[i]] = values[i];
            }
            subjects.push(row);
        }
    }

    console.log(`Found ${subjects.length} subjects and ${Object.keys(classSubjectsMap).length} relational map entries.`);

    if (subjects.length > 0) {
        const docs = subjects.map(row => {
            // Postgres `subjects` table lacks `class_id`. It relies on `class_subjects`.
            const resolvedClassId = classSubjectsMap[row.id] || null;

            return {
                _id: uuidToObjectId(row.id),
                name: pgString(row.title) || pgString(row.name) || 'Untitled Subject', // It used `title` historically!
                description: pgString(row.description),
                icon_url: applyS3Url(row.icon || row.thumbnail_url),
                class_id: uuidToObjectId(resolvedClassId),
                order_index: parseInt(row.order_index) || 0,
                is_active: true // Default to true because the column didn't even exist!
            };
        }).filter(Boolean);

        let inserted = 0;
        for (const d of docs) {
            await Subject.findByIdAndUpdate(d._id, { $set: d }, { upsert: true, new: true });
            inserted++;
        }
        console.log(`✅ Successfully mapped ${inserted} Subjects including proper names and class_ids!`);
    }

    mongoose.disconnect();
}

migrateSubjects().catch(console.error);
