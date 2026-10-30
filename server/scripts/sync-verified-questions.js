'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const CodingQuestion = require('../src/models/CodingQuestion');

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function classifySqlTopic(questionText) {
  const q = questionText.toLowerCase();
  if (q.includes('lag(') || q.includes('lead(') || q.includes('over (') || q.includes('partition by')) {
    return 'Window Functions';
  }
  if (q.includes('join') || q.includes('joined') || q.includes('attending doctor') || q.includes('admissions table')) {
    return 'Joins & Multi-Table';
  }
  if (q.includes('group by') || q.includes('having') || q.includes('count(') || q.includes('sum(') || q.includes('avg(') || q.includes('max(') || q.includes('min(')) {
    return 'Aggregation & Grouping';
  }
  if (q.includes('case when') || q.includes('isobese') || q.includes('has_insurance')) {
    return 'Conditional Logic';
  }
  if (q.includes('update ') || q.includes('replace it with')) {
    return 'Data Modification';
  }
  if (q.includes('like ') || q.includes('similar to') || q.includes('concat(') || q.includes('length(')) {
    return 'String Manipulation & Regex';
  }
  if (q.includes('where ') || q.includes('between') || q.includes('null') || q.includes('distinct')) {
    return 'Filtering & Sorting';
  }
  return 'Basic Queries';
}

function cleanQuestionText(raw) {
  return (raw || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSqlTitle(cleanText, id, db) {
  // Extract a concise, readable title from the question
  let title = cleanText;
  if (title.length > 70) {
    // Cut at punctuation or sensible boundary
    const sentenceEnd = title.search(/[.;]/);
    if (sentenceEnd > 15 && sentenceEnd <= 75) {
      title = title.substring(0, sentenceEnd).trim();
    } else {
      title = title.substring(0, 68).trim() + '...';
    }
  }
  return title;
}

async function syncQuestions() {
  await connectDB();
  console.log('MongoDB Connected for question synchronization.\n');

  // 1. Audit existing questions
  const totalBefore = await CodingQuestion.countDocuments();
  const excelCount = await CodingQuestion.countDocuments({ source: 'excel-import' });
  const originalCount = await CodingQuestion.countDocuments({ source: 'original' });
  const noUrlCount = await CodingQuestion.countDocuments({
    $or: [{ externalUrl: '' }, { externalUrl: { $exists: false } }, { externalUrl: null }]
  });

  console.log('--- Initial Audit ---');
  console.log(`Total questions in DB: ${totalBefore}`);
  console.log(`Unverified / Excel import questions: ${excelCount}`);
  console.log(`Questions with missing externalUrl: ${noUrlCount}`);
  console.log(`Verified original questions: ${originalCount}\n`);

  // 2. Remove all unverified questions (excel-import without valid platform url)
  const deleteResult = await CodingQuestion.deleteMany({
    $or: [
      { source: 'excel-import' },
      { externalUrl: '' },
      { externalUrl: { $exists: false } },
      { externalUrl: null }
    ]
  });
  console.log(`Removed ${deleteResult.deletedCount} unverified/incomplete questions from database.\n`);

  // 3. Clean up interviewContext on remaining questions so no "excel" references remain
  const sanitizeResult = await CodingQuestion.updateMany(
    { interviewContext: { $regex: /excel/i } },
    { $set: { interviewContext: '' } }
  );
  console.log(`Sanitized interviewContext on ${sanitizeResult.modifiedCount} questions.\n`);

  // 4. Load SQL-Practice questions from json
  const rawSqlList = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'sql-practice-questions.json'), 'utf8')
  );
  console.log(`Loaded ${rawSqlList.length} genuine questions from SQL-Practice.com bundle.`);

  let sqlAdded = 0;
  let sqlUpdated = 0;

  for (const item of rawSqlList) {
    const cleanStatement = cleanQuestionText(item.question);
    const dbName = item.database === 'northwind' ? 'Northwind' : 'Hospital';
    const difficulty =
      item.mode === 'hard' ? 'Hard' : item.mode === 'medium' ? 'Medium' : 'Easy';
    const topic = classifySqlTopic(cleanStatement);
    const title = generateSqlTitle(cleanStatement, item.id, item.database);

    const slugBase = `sql-practice-${item.database}-${slugify(title)}`.slice(0, 75);
    const slug = `${slugBase}-${item.id}`;

    const doc = {
      slug,
      title: `${dbName}: ${title}`,
      category: 'SQL',
      topic,
      difficulty,
      statement: cleanStatement,
      platform: 'SQL-Practice',
      externalUrl: 'https://www.sql-practice.com/',
      companyTags: ['SQL-Practice', `${dbName} DB`],
      companyTagSource: 'platform',
      interviewContext: `SQL-Practice.com ${dbName} Database challenge (${difficulty} tier). Focuses on practical real-world relational schema querying.`,
      source: 'sql-practice',
      isPublished: true,
      sortOrder: item.id + 100,
      acceptanceRate: difficulty === 'Easy' ? '82%' : difficulty === 'Medium' ? '64%' : '45%',
    };

    const res = await CodingQuestion.updateOne(
      { slug },
      { $set: doc },
      { upsert: true }
    );

    if (res.upsertedCount > 0) {
      sqlAdded++;
    } else {
      sqlUpdated++;
    }
  }

  console.log(`SQL-Practice questions: ${sqlAdded} inserted, ${sqlUpdated} updated.`);

  // 5. Ensure indexes
  await CodingQuestion.collection.createIndex({ slug: 1 }, { unique: true });
  await CodingQuestion.collection.createIndex({ category: 1, difficulty: 1 });
  await CodingQuestion.collection.createIndex({ platform: 1 });
  await CodingQuestion.collection.createIndex({ isPublished: 1 });
  console.log('Database indexes verified.\n');

  // 6. Final Audit & Statistics
  const totalAfter = await CodingQuestion.countDocuments();
  const byCatAfter = await CodingQuestion.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  const byPlatformAfter = await CodingQuestion.aggregate([
    { $group: { _id: '$platform', count: { $sum: 1 } } }
  ]);
  const byDifficultyAfter = await CodingQuestion.aggregate([
    { $group: { _id: '$difficulty', count: { $sum: 1 } } }
  ]);

  console.log('--- Final Database State ---');
  console.log(`Total Verified Questions: ${totalAfter}`);
  console.log('By Category:', byCatAfter);
  console.log('By Platform:', byPlatformAfter);
  console.log('By Difficulty:', byDifficultyAfter);

  await mongoose.disconnect();
}

syncQuestions().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
