const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
require('dotenv').config();

const BUCKET_NAME = process.env.S3_BUCKET || 'learnverse';

const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION || 'ap-south-1',
    maxRetries: 3,
});

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.svg': return 'image/svg+xml';
        case '.mp4': return 'video/mp4';
        case '.pdf': return 'application/pdf';
        case '.mp3': return 'audio/mpeg';
        case '.json': return 'application/json';
        default: return 'application/octet-stream';
    }
}

let totalFiles = 0;
let uploadedFiles = 0;

async function countFiles(directory) {
    if (!fs.existsSync(directory)) return;
    const files = fs.readdirSync(directory);
    for (const file of files) {
        if (file === '.DS_Store') continue;
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await countFiles(fullPath);
        } else {
            totalFiles++;
        }
    }
}

function updateProgress() {
    if (totalFiles === 0) return;
    const percent = ((uploadedFiles / totalFiles) * 100).toFixed(2);
    const barLength = 40;
    const filled = Math.round((barLength * uploadedFiles) / totalFiles);
    const bar = '█'.repeat(filled) + '-'.repeat(barLength - filled);
    process.stdout.write(`\r🚀 FastSync Progress: [${bar}] ${percent}% | ${uploadedFiles}/${totalFiles} files pushed`);
}

const fileQueue = [];

// Recursively build a flat array of files to upload
async function buildUploadQueue(directory, baseDir = '') {
    if (!fs.existsSync(directory)) return;

    const files = fs.readdirSync(directory);
    for (const file of files) {
        if (file === '.DS_Store') continue;

        const fullPath = path.join(directory, file);
        const stats = fs.statSync(fullPath);
        const relativeKey = path.join(baseDir, file).replace(/\\/g, '/');

        if (stats.isDirectory()) {
            await buildUploadQueue(fullPath, relativeKey);
        } else {
            fileQueue.push({ fullPath, key: `uploads/${relativeKey}` });
        }
    }
}

async function runFastMigration() {
    console.log('🔍 Calculating files to migrate to AWS S3...');
    const rootStoragePath = '/Users/baburhussain/Downloads/wdmzylggisbudnddcpfw';

    if (!fs.existsSync(rootStoragePath)) {
        console.error(`❌ Cannot find storage directory at ${rootStoragePath}`);
        process.exit(1);
    }

    await countFiles(rootStoragePath);
    console.log(`✅ Found ${totalFiles} total static assets.`);
    console.log('⚡ Identifying keys...');

    await buildUploadQueue(rootStoragePath);

    console.log('☁️ Beginning highly-parallel bulk upload (Chunk Size: 50)...\\n');
    updateProgress();

    // Process highly parallel uploads
    const CHUNK_SIZE = 50;
    for (let i = 0; i < fileQueue.length; i += CHUNK_SIZE) {
        const chunk = fileQueue.slice(i, i + CHUNK_SIZE);

        await Promise.all(chunk.map(async ({ fullPath, key }) => {
            try {
                const fileContent = fs.readFileSync(fullPath);
                await s3.upload({
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: fileContent,
                    ContentType: getContentType(fullPath)
                }).promise();

                uploadedFiles++;
                updateProgress();
            } catch (err) {
                process.stdout.write(`\\n❌ Error on ${key}: ${err.message}\\n`);
            }
        }));
    }

    console.log('\\n\\n🎉 HUGE SUCCESS! Ultra-fast Storage Migration Completed!');
}

runFastMigration();
