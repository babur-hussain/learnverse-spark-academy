const mongoose = require('mongoose');
require('dotenv').config();

const { Class } = require('./src/models');

async function fixClasses() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const all = await Class.find().lean();
    console.log('Total classes:', all.length);

    // These are the migrated class IDs that actually have subjects linked to them
    const migratedIds = [
        '390a844a1c870e1bc096df97', // Class 6
        'e1231e15db4edb360fbb030a', // Class 7
        'ba18f58d798aec2fddc272d7', // Class 8
        'c943314b1d727b6e88972976', // Class 9
        '80c6e8b9ffd0821bb95f4f44', // Class 10
        '39bbff65ed4927337df8b860', // Class 11
        'f4d31454ebe00c09e1f92f69', // Class 12
    ];

    // Seeded classes that are duplicates with no subjects linked
    const seeded = all.filter(c => !migratedIds.includes(c._id.toString()));
    console.log('Seeded (no subjects):', seeded.map(c => c.name).join(', '));
    console.log('Migrated (has subjects):', all.filter(c => migratedIds.includes(c._id.toString())).map(c => c.name).join(', '));

    // Delete seeded duplicates
    for (const s of seeded) {
        await Class.findByIdAndDelete(s._id);
    }
    console.log('Deleted', seeded.length, 'duplicate seeded classes');

    // Verify remaining
    const remaining = await Class.find().lean();
    console.log('Remaining classes:', remaining.map(c => c.name).join(', '));

    mongoose.disconnect();
}

fixClasses().catch(console.error);
