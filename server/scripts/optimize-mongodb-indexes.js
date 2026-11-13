const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

async function optimizeIndexes() {
  await connectDB();
  console.log('--- Inspecting and Optimizing MongoDB Indexes ---');

  const db = mongoose.connection.db;

  // 1. Companies collection
  console.log('Optimizing Company indexes...');
  await db.collection('companies').createIndex({ isPublished: 1, placementYears: 1 }, { background: true });
  await db.collection('companies').createIndex({ isPublished: 1, priorityOrder: 1, name: 1 }, { background: true });
  await db.collection('companies').createIndex({ normalizedName: 1 }, { background: true });
  await db.collection('companies').createIndex({ aliases: 1 }, { background: true });

  // 2. InterviewExperiences collection
  console.log('Optimizing InterviewExperience indexes...');
  await db.collection('interviewexperiences').createIndex({ company: 1, placementYear: 1 }, { background: true });
  await db.collection('interviewexperiences').createIndex({ placementYear: 1, isPublished: 1, createdAt: -1 }, { background: true });
  await db.collection('interviewexperiences').createIndex({ sourceDocument: 1 }, { background: true });

  // 3. InterviewRounds collection
  console.log('Optimizing InterviewRound indexes...');
  await db.collection('interviewrounds').createIndex({ experience: 1, roundOrder: 1 }, { background: true });
  await db.collection('interviewrounds').createIndex({ company: 1, isPublished: 1 }, { background: true });

  // 4. Questions collection
  console.log('Optimizing Question indexes...');
  await db.collection('questions').createIndex({ round: 1, order: 1 }, { background: true });
  await db.collection('questions').createIndex({ company: 1, isPublished: 1 }, { background: true });
  await db.collection('questions').createIndex({ topic: 1 }, { background: true });

  // 5. CodingQuestions collection
  console.log('Optimizing CodingQuestion indexes...');
  await db.collection('codingquestions').createIndex({ category: 1, isPublished: 1, difficulty: 1 }, { background: true });
  await db.collection('codingquestions').createIndex({ slug: 1 }, { unique: true, background: true });
  await db.collection('codingquestions').createIndex({ topic: 1, category: 1 }, { background: true });

  // 6. LearningMaterials collection
  console.log('Optimizing LearningMaterial indexes...');
  await db.collection('learningmaterials').createIndex({ category: 1, isPublished: 1 }, { background: true });

  // 7. Alumni collection
  console.log('Optimizing Alumni indexes...');
  await db.collection('alumnis').createIndex({ isPublished: 1, isFeatured: -1, name: 1 }, { background: true });
  await db.collection('alumnis').createIndex({ companyName: 1 }, { background: true });

  // 8. Analytics collections
  console.log('Optimizing Analytics indexes...');
  await db.collection('visitors').createIndex({ visitorId: 1 }, { unique: true, background: true });
  await db.collection('visitors').createIndex({ lastVisit: -1 }, { background: true });
  await db.collection('visitors').createIndex({ isActive: 1, lastVisit: -1 }, { background: true });

  await db.collection('visitorsessions').createIndex({ sessionId: 1 }, { unique: true, background: true });
  await db.collection('visitorsessions').createIndex({ visitorId: 1, startedAt: -1 }, { background: true });
  await db.collection('visitorsessions').createIndex({ lastActivityAt: -1 }, { background: true });

  await db.collection('pageviews').createIndex({ enteredAt: -1 }, { background: true });
  await db.collection('pageviews').createIndex({ pageUrl: 1, enteredAt: -1 }, { background: true });
  await db.collection('pageviews').createIndex({ visitorId: 1, enteredAt: -1 }, { background: true });

  await db.collection('userevents').createIndex({ eventType: 1, createdAt: -1 }, { background: true });
  await db.collection('userevents').createIndex({ visitorId: 1, createdAt: -1 }, { background: true });

  console.log('All indexes created/verified successfully!');

  // List indexes for confirmation
  const compIndexes = await db.collection('companies').indexes();
  console.log('Company indexes:', compIndexes.map(i => i.name));

  const expIndexes = await db.collection('interviewexperiences').indexes();
  console.log('Experience indexes:', expIndexes.map(i => i.name));

  process.exit(0);
}

optimizeIndexes().catch((err) => {
  console.error('Error optimizing indexes:', err);
  process.exit(1);
});
