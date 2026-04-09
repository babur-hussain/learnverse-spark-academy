const fs = require('fs');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

require('dotenv').config();

const { College } = require('./src/models');
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

async function migrateColleges() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnverse');
    console.log('✅ Connected to MongoDB for College migration');

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let currentTable = null;
    let columns = [];
    const colleges = [];

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

        if (currentTable === 'colleges') {
            const values = line.split('\t');
            const row = {};
            for (let i = 0; i < columns.length; i++) {
                row[columns[i]] = values[i];
            }
            colleges.push(row);
        }
    }

    console.log(`Found ${colleges.length} colleges. Starting insertions...`);

    if (colleges.length > 0) {
        const docs = colleges.map(row => ({
            _id: uuidToObjectId(row.id),
            name: pgString(row.name),
            description: pgString(row.description),
            slug: pgString(row.slug) || pgString(row.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            city: pgString(row.city),
            state: pgString(row.state),
            type: pgString(row.type),
            established_year: parseInt(row.established_year) || null,
            website: pgString(row.website),
            is_featured: row.is_featured === 't',
            is_active: row.is_active === 't',
            order_index: parseInt(row.order_index) || 0,
            createdAt: row.created_at === '\\N' ? new Date() : new Date(row.created_at)
        })).filter(Boolean);

        for (const d of docs) {
            await College.findByIdAndUpdate(d._id, { $set: d }, { upsert: true, new: true });
        }
        console.log(`✅ Successfully migrated ${colleges.length} Colleges to MongoDB!`);
    } else {
        console.log('No colleges found in the SQL dump.');
    }

    mongoose.disconnect();
}

migrateColleges().catch(console.error);
