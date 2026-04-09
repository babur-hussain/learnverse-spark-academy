const mongoose = require('mongoose');
require('dotenv').config();

const { User } = require('./src/models');

async function clearStaleProfiles() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all stale class_id / college_id references from user profiles
    const result = await User.updateMany(
        {},
        { $set: { class_id: null, college_id: null } }
    );
    console.log('Cleared stale class/college IDs from', result.modifiedCount, 'user profiles');

    mongoose.disconnect();
}

clearStaleProfiles().catch(console.error);
