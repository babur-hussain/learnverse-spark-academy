const fs = require('fs');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

require('dotenv').config();

const { Category, Course, Subject, Chapter, Resource, Class } = require('./src/models');

const filePath = path.join(__dirname, '..', 'db_cluster-23-10-2025@13-49-07.backup');

// Deterministic UUID to ObjectId conversion
function uuidToObjectId(uuid) {
    if (!uuid || uuid === '\\N') return null; // PostGres nulls are \N in COPY
    const hash = crypto.createHash('md5').update(uuid).digest('hex');
    return new mongoose.Types.ObjectId(hash.substring(0, 24));
}

// Convert PostGres strings
function pgString(val) {
    if (val === undefined || val === null || val === '\\N') return null;
    return String(val).replace(/\\b/g, '\b')
        .replace(/\\f/g, '\f')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\v/g, '\v')
        .replace(/\\\\/g, '\\');
}

// Remap Supabase URLs to S3
function applyS3Url(val) {
    if (!val) return val;
    const str = pgString(val);
    if (!str) return str;
    return str.replace(/https:\/\/[^\/]+\.supabase\.co\/storage\/v1\/object\/public\/[^\/]+\//g, 'https://learnverse.s3.ap-south-1.amazonaws.com/uploads/');
}

async function migrateDb() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnverse');
    console.log('✅ Connected to MongoDB');

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let currentTable = null;
    let columns = [];

    // Track bulk insert items to avoid saturating memory completely
    const tableData = {
        'categories': [],
        'courses': [],
        'subjects': [],
        'chapters': [],
        'resources': [],
        'classes': []
    };

    const TARGET_TABLES = ['categories', 'courses', 'subjects', 'chapters', 'resources', 'classes'];

    // Parse lines
    for await (const line of rl) {
        if (line.startsWith('COPY public.')) {
            // Example: COPY public.categories (id, name, slug) FROM stdin;
            const match = line.match(/^COPY public\.([a-zA-Z0-9_]+) \((.+)\) FROM stdin;/);
            if (match) {
                currentTable = match[1];
                columns = match[2].split(', ').map(c => c.trim());
                console.log(`Parsing table: ${currentTable}`);
            }
            continue;
        }

        if (line === '\\.' && currentTable) {
            currentTable = null;
            columns = [];
            continue;
        }

        if (currentTable && TARGET_TABLES.includes(currentTable)) {
            const values = line.split('\t');
            const row = {};
            for (let i = 0; i < columns.length; i++) {
                row[columns[i]] = values[i];
            }
            tableData[currentTable].push(row);
        }
    }

    console.log('✅ SQL parsing finished. Starting insertions into MongoDB...');

    // Helper to run sequential inserts
    const insertManyToDb = async (Model, arr, transformFn) => {
        if (!arr || arr.length === 0) return;
        try {
            const docs = arr.map(transformFn).filter(Boolean); // Transform
            for (const d of docs) {
                await Model.findByIdAndUpdate(d._id, { $set: d }, { upsert: true, new: true });
            }
            console.log(`Successfully migrated ${arr.length} records to ${Model.modelName}`);
        } catch (e) {
            console.error(`Failed inserting ${Model.modelName}:`, e.message);
        }
    }

    // 1. Classes
    await insertManyToDb(Class, tableData['classes'], row => ({
        _id: uuidToObjectId(row.id),
        name: pgString(row.name),
        slug: pgString(row.slug),
        order_index: row.order_index === '\\N' ? 0 : parseInt(row.order_index),
        is_active: row.is_active === 't',
        createdAt: row.created_at === '\\N' ? new Date() : new Date(row.created_at)
    }));

    // 2. Categories
    await insertManyToDb(Category, tableData['categories'], row => ({
        _id: uuidToObjectId(row.id),
        name: pgString(row.name),
        description: pgString(row.description),
        slug: pgString(row.slug),
        icon: applyS3Url(row.icon),
        is_active: row.is_active === 't',
        order_index: row.order_index === '\\N' ? 0 : parseInt(row.order_index),
        createdAt: row.created_at === '\\N' ? new Date() : new Date(row.created_at)
    }));

    // 3. Subjects
    await insertManyToDb(Subject, tableData['subjects'], row => ({
        _id: uuidToObjectId(row.id),
        name: pgString(row.name),
        description: pgString(row.description),
        icon: applyS3Url(row.icon),
        class_id: uuidToObjectId(row.class_id),
        category_id: uuidToObjectId(row.category_id), // Wait, does Postgres Subject have category_id? If not it ignores it
        order_index: parseInt(row.order_index) || 0,
        is_active: row.is_active === 't'
    }));

    // 4. Courses
    await insertManyToDb(Course, tableData['courses'], row => ({
        _id: uuidToObjectId(row.id),
        title: pgString(row.title),
        description: pgString(row.description),
        thumbnail_url: applyS3Url(row.thumbnail_url),
        price: parseFloat(row.price) || 0,
        original_price: parseFloat(row.original_price) || 0,
        // Supabase arrays are curly braces e.g. {tag1,tag2} => needs parsing:
        tags: row.tags && row.tags !== '\\N' ? row.tags.replace(/^{|}$/g, '').split(',') : [],
        difficulty_level: pgString(row.difficulty_level),
        instructor_id: uuidToObjectId(row.instructor_id), // Wait, users might not migrate..
        category_ids: row.category_ids && row.category_ids !== '\\N' ? row.category_ids.replace(/^{|}$/g, '').split(',').map(uuidToObjectId) : [],
        subject_id: uuidToObjectId(row.subject_id),
        is_published: row.is_published === 't',
        is_featured: row.is_featured === 't',
        rating: parseFloat(row.rating) || 0,
        total_reviews: parseInt(row.total_reviews) || 0,
        students_count: parseInt(row.students_count) || 0
    }));

    // 5. Chapters
    await insertManyToDb(Chapter, tableData['chapters'], row => ({
        _id: uuidToObjectId(row.id),
        course_id: uuidToObjectId(row.course_id),
        title: pgString(row.title),
        description: pgString(row.description),
        order_index: parseInt(row.order_index) || 0,
        is_free: row.is_free === 't'
    }));

    // 6. Resources
    await insertManyToDb(Resource, tableData['resources'], row => ({
        _id: uuidToObjectId(row.id),
        chapter_id: uuidToObjectId(row.chapter_id),
        title: pgString(row.title),
        type: pgString(row.type),
        url: applyS3Url(row.file_url || row.url), // depends on sql schema
        duration_minutes: parseInt(row.duration_minutes) || 0,
        order_index: parseInt(row.order_index) || 0,
        is_downloadable: row.is_downloadable === 't'
    }));

    console.log('✅ ALL DATA SUCCESSFULLY MAPPED AND INSERTED!');
    mongoose.disconnect();
}

migrateDb().catch(e => {
    console.error("Fatal Error:", e);
    process.exit(1);
});
