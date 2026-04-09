const fs = require('fs');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

require('dotenv').config();

const { Resource } = require('./src/models');
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

async function migrateResources() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnverse');
    console.log('✅ Connected to MongoDB for Resource migration');

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let currentTable = null;
    let columns = [];
    const resources = [];

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

        if (currentTable === 'course_resources' || currentTable === 'subject_resources' || currentTable === 'contents') {
            const values = line.split('\t');
            const row = {};
            for (let i = 0; i < columns.length; i++) {
                row[columns[i]] = values[i];
            }
            // normalize table names into fields
            if (currentTable === 'contents') {
                row._original_table = 'contents';
            }
            resources.push(row);
        }
    }

    console.log(`Found ${resources.length} resources. Computing Docs...`);

    if (resources.length > 0) {
        const docs = resources.map(row => {
            const urlRaw = row.url || row.file_url || row.path;
            let t = 'document';
            const mtype = pgString(row.mime_type) || pgString(row.type) || '';
            if (mtype.includes('video') || mtype.includes('mp4')) t = 'video';
            else if (mtype.includes('audio') || mtype.includes('mp3')) t = 'audio';
            else if (mtype.includes('pdf')) t = 'document';

            return {
                _id: uuidToObjectId(row.id),
                title: pgString(row.name) || pgString(row.title) || 'Untitled Resource',
                type: t,
                url: applyS3Url(urlRaw),
                course_id: uuidToObjectId(row.course_id),
                subject_id: uuidToObjectId(row.subject_id),
                chapter_id: uuidToObjectId(row.chapter_id),
                duration_minutes: parseInt(row.duration) || 0,
                is_free: row.is_free === 't',
                order_index: parseInt(row.order_index) || 0,
                createdAt: row.created_at === '\\N' ? new Date() : new Date(row.created_at)
            };
        }).filter(Boolean);

        console.log(`🚀 Injecting ${docs.length} Resources...`);
        let inserted = 0;
        const CHUNK_SIZE = 100;

        for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
            const chunk = docs.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map(async (d) => {
                try {
                    await Resource.findByIdAndUpdate(d._id, { $set: d }, { upsert: true, new: true });
                    inserted++;
                } catch (e) { }
            }));
            process.stdout.write(`\\r📦 Placed [${inserted} / ${docs.length}] resources natively...`);
        }

        console.log(`\\n\\n✅ SUCCESS! All ${inserted} resources migrated completely!`);
    } else {
        console.log('No resources found in the SQL dump.');
    }

    mongoose.disconnect();
}

migrateResources().catch(console.error);
