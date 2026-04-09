const mongoose = require('mongoose');
require('dotenv').config();

const { Class, Subject } = require('./src/models');

// Map subject name patterns to class slugs
const classPatterns = [
    { pattern: /class\s*6/i, slug: '6th' },
    { pattern: /6th/i, slug: '6th' },
    { pattern: /class\s*7/i, slug: '7th' },
    { pattern: /7th/i, slug: '7th' },
    { pattern: /class\s*8/i, slug: '8th' },
    { pattern: /8th/i, slug: '8th' },
    { pattern: /class\s*9/i, slug: '9th' },
    { pattern: /9th/i, slug: '9th' },
    { pattern: /class\s*10/i, slug: '10th' },
    { pattern: /10th/i, slug: '10th' },
    { pattern: /class\s*11/i, slug: '11th' },
    { pattern: /11th/i, slug: '11th' },
    { pattern: /class\s*12/i, slug: '12th' },
    { pattern: /12th/i, slug: '12th' },
];

async function remapSubjects() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all seeded classes by slug
    const classes = await Class.find().lean();
    const slugToId = {};
    for (const c of classes) {
        slugToId[c.slug] = c._id;
    }
    console.log('Class slug map:', Object.keys(slugToId).join(', '));

    // Get all subjects
    const subjects = await Subject.find().lean();
    console.log(`Processing ${subjects.length} subjects...`);

    let remapped = 0;
    let unmatched = [];

    for (const sub of subjects) {
        const name = sub.name || '';
        let matched = false;

        for (const { pattern, slug } of classPatterns) {
            if (pattern.test(name)) {
                const newClassId = slugToId[slug];
                if (newClassId) {
                    await Subject.findByIdAndUpdate(sub._id, { $set: { class_id: newClassId } });
                    console.log(`  ✅ ${name} -> ${slug}`);
                    remapped++;
                    matched = true;
                    break;
                }
            }
        }

        if (!matched && !sub.class_id) {
            unmatched.push(name);
        }
    }

    console.log(`\nRemapped ${remapped} subjects`);
    if (unmatched.length > 0) {
        console.log(`Unmatched subjects (${unmatched.length}):`);
        unmatched.forEach(n => console.log(`  - ${n}`));
    }

    // Verify final state
    console.log('\nFinal verification:');
    for (const c of classes) {
        const count = await Subject.countDocuments({ class_id: c._id });
        if (count > 0) console.log(`  ${c.name}: ${count} subjects`);
    }

    mongoose.disconnect();
}

remapSubjects().catch(console.error);
