const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION || 'ap-south-1',
});

const BUCKET = process.env.S3_BUCKET || 'learnverse';
const REGION = process.env.S3_REGION || 'ap-south-1';

async function listAllS3Objects() {
  const allObjects = [];
  let continuationToken = undefined;
  
  while (true) {
    const params = { Bucket: BUCKET, MaxKeys: 1000 };
    if (continuationToken) params.ContinuationToken = continuationToken;
    
    const data = await s3.listObjectsV2(params).promise();
    if (data.Contents) allObjects.push(...data.Contents);
    
    if (!data.IsTruncated) break;
    continuationToken = data.NextContinuationToken;
  }
  
  return allObjects;
}

function extractFilename(key) {
  // Get the last part of the path (the actual filename)
  return key.split('/').pop();
}

function extractFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const path = decodeURIComponent(urlObj.pathname);
    return path.split('/').pop();
  } catch {
    return null;
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Step 1: List ALL S3 objects
  console.log('\n📦 Listing all S3 objects...');
  const s3Objects = await listAllS3Objects();
  console.log(`Found ${s3Objects.length} objects in S3 bucket "${BUCKET}"`);

  // Build a lookup map: filename -> { key, size }
  const s3Map = new Map();
  // Also build a map by UUID portion of filename for Supabase-style UUIDs
  const s3UuidMap = new Map();
  
  for (const obj of s3Objects) {
    if (obj.Key.endsWith('/') || obj.Key.endsWith('.DS_Store') || obj.Key.endsWith('.keep')) continue;
    
    const filename = extractFilename(obj.Key);
    // Store all matches (may have duplicates across folders)
    if (!s3Map.has(filename)) s3Map.set(filename, []);
    s3Map.get(filename).push({ key: obj.Key, size: obj.Size });
    
    // Also index by UUID if the filename is a UUID pattern
    const uuidMatch = filename.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (uuidMatch) {
      if (!s3UuidMap.has(uuidMatch[1])) s3UuidMap.set(uuidMatch[1], []);
      s3UuidMap.get(uuidMatch[1]).push({ key: obj.Key, size: obj.Size, filename });
    }
  }
  
  console.log(`Indexed ${s3Map.size} unique filenames`);

  // Step 2: Get all resources from MongoDB
  const db = mongoose.connection.db;
  const resources = await db.collection('resources').find({}).toArray();
  console.log(`\n📄 Found ${resources.length} resources in MongoDB`);

  // Step 3: Check each resource URL
  let fixed = 0;
  let alreadyOk = 0;
  let notFound = 0;
  const notFoundList = [];

  for (const resource of resources) {
    const url = resource.url;
    if (!url) { notFound++; notFoundList.push({ title: resource.title, reason: 'no url field' }); continue; }

    // Extract the key from the current URL
    let currentKey;
    try {
      const urlObj = new URL(url);
      currentKey = decodeURIComponent(urlObj.pathname.slice(1));
    } catch {
      notFound++;
      notFoundList.push({ title: resource.title, reason: 'invalid url' });
      continue;
    }

    // Check if the file exists at the current key
    try {
      await s3.headObject({ Bucket: BUCKET, Key: currentKey }).promise();
      alreadyOk++;
      continue; // File exists at current URL, no fix needed
    } catch {
      // File doesn't exist at current URL, try to find it
    }

    // Try to find the file by its filename
    const filename = extractFilename(currentKey);
    const matches = s3Map.get(filename);
    
    if (matches && matches.length > 0) {
      // Found a match by filename
      const bestMatch = matches[0];
      const newUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURI(bestMatch.key)}`;
      
      await db.collection('resources').updateOne(
        { _id: resource._id },
        { $set: { url: newUrl, file_size: bestMatch.size } }
      );
      console.log(`  ✅ Fixed: "${resource.title}" -> ${bestMatch.key.substring(0, 80)}`);
      fixed++;
      continue;
    }

    // Try to find by UUID in the filename
    const uuidMatch = filename.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (uuidMatch) {
      const uuidMatches = s3UuidMap.get(uuidMatch[1]);
      if (uuidMatches && uuidMatches.length > 0) {
        const bestMatch = uuidMatches[0];
        const newUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURI(bestMatch.key)}`;
        
        await db.collection('resources').updateOne(
          { _id: resource._id },
          { $set: { url: newUrl, file_size: bestMatch.size } }
        );
        console.log(`  ✅ Fixed (UUID): "${resource.title}" -> ${bestMatch.key.substring(0, 80)}`);
        fixed++;
        continue;
      }
    }

    // Try matching by resource title -> S3 filename (fuzzy)
    const titleNorm = (resource.title || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    let foundByTitle = false;
    for (const [fn, entries] of s3Map) {
      const fnNorm = fn.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (titleNorm && fnNorm.includes(titleNorm) || (titleNorm.length > 5 && fnNorm.includes(titleNorm))) {
        const bestMatch = entries[0];
        const newUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURI(bestMatch.key)}`;
        
        await db.collection('resources').updateOne(
          { _id: resource._id },
          { $set: { url: newUrl, file_size: bestMatch.size } }
        );
        console.log(`  ✅ Fixed (title match): "${resource.title}" -> ${bestMatch.key.substring(0, 80)}`);
        fixed++;
        foundByTitle = true;
        break;
      }
    }
    
    if (!foundByTitle) {
      notFound++;
      notFoundList.push({ title: resource.title, url: url.substring(0, 80), key: currentKey.substring(0, 60) });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS:');
  console.log(`  ✅ Already correct: ${alreadyOk}`);
  console.log(`  🔧 Fixed: ${fixed}`);
  console.log(`  ❌ Not found in S3: ${notFound}`);
  
  if (notFoundList.length > 0 && notFoundList.length <= 30) {
    console.log('\n❌ Unresolved resources:');
    notFoundList.forEach(r => console.log(`  - "${r.title}" | ${r.url || r.reason}`));
  } else if (notFoundList.length > 30) {
    console.log(`\n❌ ${notFoundList.length} unresolved resources (showing first 30):`);
    notFoundList.slice(0, 30).forEach(r => console.log(`  - "${r.title}" | ${r.url || r.reason}`));
  }

  await mongoose.disconnect();
}

run().catch(console.error);
