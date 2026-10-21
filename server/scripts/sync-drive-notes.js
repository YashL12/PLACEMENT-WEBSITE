const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const connectDB = require('../src/config/db');
const LearningMaterial = require('../src/models/LearningMaterial');
const { syncNotesData } = require('./drive-notes-data');

async function syncDriveNotes() {
  await connectDB();
  console.log('Connected to DB. Removing existing learning materials...');
  
  await LearningMaterial.deleteMany({});
  console.log('Cleared existing materials.');

  // Insert sequentially with timestamp descending so first element has newest createdAt
  const baseTime = Date.now();
  for (let i = 0; i < syncNotesData.length; i++) {
    const data = {
      ...syncNotesData[i],
      createdAt: new Date(baseTime - i * 1000),
      updatedAt: new Date(baseTime - i * 1000),
    };
    await LearningMaterial.create(data);
  }

  console.log(`Successfully inserted ${syncNotesData.length} notes (Handwritten Java Notes first) into MongoDB!`);
  process.exit(0);
}

syncDriveNotes().catch(err => {
  console.error('Error syncing drive notes:', err);
  process.exit(1);
});
