const mongoose = require('mongoose');
require('dotenv').config();

const { Class, Subject } = require('./src/models');

// The full seeded class list the user wants
const seededClasses = [
    { name: 'Nursery', slug: 'nursery', order_index: 0 },
    { name: 'KG1', slug: 'kg1', order_index: 1 },
    { name: 'KG2', slug: 'kg2', order_index: 2 },
    { name: '1st Class', slug: '1st', order_index: 3 },
    { name: '2nd Class', slug: '2nd', order_index: 4 },
    { name: '3rd Class', slug: '3rd', order_index: 5 },
    { name: '4th Class', slug: '4th', order_index: 6 },
    { name: '5th Class', slug: '5th', order_index: 7 },
    { name: '6th Class', slug: '6th', order_index: 8 },
    { name: '7th Class', slug: '7th', order_index: 9 },
    { name: '8th Class', slug: '8th', order_index: 10 },
    { name: '9th Class', slug: '9th', order_index: 11 },
    { name: '10th Class', slug: '10th', order_index: 12 },
    { name: '11th Class', slug: '11th', order_index: 13 },
    { name: '12th Class', slug: '12th', order_index: 14 },
];

// Mapping: migrated class name -> seeded class name (for relinking subjects)
const migratedToSeeded = {
    'Class 6': '6th Class',
    'Class 7': '7th Class',
    'Class 8': '8th Class',
    'Class 9': '9th Class',
    'Class 10': '10th Class',
    'Class 11': '11th Class',
    'Class 12': '12th Class',
};

async function restoreClasses() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Step 1: Get migrated classes and their IDs (for subject remapping)
    const migratedClasses = await Class.find().lean();
    console.log('Current classes:', migratedClasses.map(c => c.name).join(', '));

    // Build old ID -> migrated name map
    const oldIdToName = {};
    for (const c of migratedClasses) {
        oldIdToName[c._id.toString()] = c.name;
    }

    // Step 2: Delete ALL existing classes
    await Class.deleteMany({});
    console.log('Cleared all existing classes');

    // Step 3: Re-seed the full class list
    const newClasses = [];
    for (const sc of seededClasses) {
        const created = await Class.create({
            name: sc.name,
            slug: sc.slug,
            order_index: sc.order_index,
            is_active: true,
        });
        newClasses.push(created);
        console.log(`  Created: ${created.name} -> ${created._id}`);
    }
    console.log(`Re-seeded ${newClasses.length} classes`);

    // Step 4: Build name -> new ID map for seeded classes
    const seededNameToId = {};
    for (const c of newClasses) {
        seededNameToId[c.name] = c._id;
    }

    // Step 5: Remap subjects from migrated class IDs to seeded class IDs
    let remapped = 0;
    for (const [migratedName, seededName] of Object.entries(migratedToSeeded)) {
        // Find the old migrated class ID
        const oldClass = migratedClasses.find(c => c.name === migratedName);
        if (!oldClass) continue;

        const newId = seededNameToId[seededName];
        if (!newId) continue;

        const result = await Subject.updateMany(
            { class_id: oldClass._id },
            { $set: { class_id: newId } }
        );
        console.log(`  Remapped ${result.modifiedCount} subjects: ${migratedName} -> ${seededName}`);
        remapped += result.modifiedCount;
    }
    console.log(`Total subjects remapped: ${remapped}`);

    // Step 6: Verify
    const finalClasses = await Class.find().sort({ order_index: 1 }).lean();
    console.log('\nFinal class list:');
    for (const c of finalClasses) {
        const subCount = await Subject.countDocuments({ class_id: c._id });
        console.log(`  ${c.name} (${c._id}) -> ${subCount} subjects`);
    }

    mongoose.disconnect();
}

restoreClasses().catch(console.error);
