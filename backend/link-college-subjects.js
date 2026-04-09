const mongoose = require('mongoose');
require('dotenv').config();

const { Subject, College } = require('./src/models');

async function linkCollegeSubjects() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get colleges
    const colleges = await College.find().lean();
    console.log('Colleges:', colleges.map(c => `${c.name} (${c._id})`).join(', '));

    // Get all BSC subjects (no class_id, no college_id)
    const bscSubjects = await Subject.find({
        name: /BSC|B\.Sc/i,
        class_id: null
    }).lean();
    console.log(`\nFound ${bscSubjects.length} BSC subjects to link`);

    // For now, link all BSC subjects to the first college (JH COLLEGE)
    // The user can reassign in the admin panel later
    const defaultCollege = colleges[0];
    if (!defaultCollege) {
        console.error('No colleges found!');
        process.exit(1);
    }

    console.log(`Linking all BSC subjects to: ${defaultCollege.name}`);

    for (const sub of bscSubjects) {
        await Subject.findByIdAndUpdate(sub._id, { $set: { college_id: defaultCollege._id } });
        console.log(`  ✅ ${sub.name} -> ${defaultCollege.name}`);
    }

    // Also check for any other unlinked subjects
    const unlinked = await Subject.find({ class_id: null, college_id: null }).lean();
    if (unlinked.length > 0) {
        console.log(`\n⚠️  ${unlinked.length} subjects still unlinked:`);
        unlinked.forEach(s => console.log(`  - ${s.name}`));
    }

    // Verify
    console.log('\nVerification:');
    for (const college of colleges) {
        const count = await Subject.countDocuments({ college_id: college._id });
        console.log(`  ${college.name}: ${count} subjects`);
    }

    mongoose.disconnect();
}

linkCollegeSubjects().catch(console.error);
