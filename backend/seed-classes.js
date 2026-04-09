const mongoose = require('mongoose');
const { Class } = require('./src/models');
require('dotenv').config();

const classesToSeed = [
    'Nursery', 'KG1', 'KG2',
    '1st Class', '2nd Class', '3rd Class', '4th Class', '5th Class',
    '6th Class', '7th Class', '8th Class', '9th Class', '10th Class',
    '11th Class', '12th Class'
];

async function seedClasses() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnverse';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB. Seeding classes...');

        for (let i = 0; i < classesToSeed.length; i++) {
            const name = classesToSeed[i];
            const slug = name.toLowerCase().replace(/\s+/g, '-');

            const exists = await Class.findOne({ slug });
            if (!exists) {
                await Class.create({
                    name,
                    slug,
                    order_index: i + 1,
                    is_active: true
                });
                console.log(`✅ Default class added: ${name}`);
            } else {
                console.log(`⏩ Skipped existing class: ${name}`);
            }
        }
        console.log('Class seeding completed!');
    } catch (error) {
        console.error('Error seeding classes:', error);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}

seedClasses();
