'use strict';
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');
const CodingQuestion = require('../src/models/CodingQuestion');

async function clean() {
  await connectDB();
  console.log('Connected to DB');

  const updates = [
    { match: { title: 'N-th Fibonacci Number' }, topic: 'Recursion and Backtracking' },
    { match: { title: 'Check for Prime Number' }, topic: 'Mathematical Algorithms' },
    { match: { title: 'Factorial of a Number (Recursion)' }, topic: 'Recursion and Backtracking' },
    { match: { title: 'Binary Search' }, topic: 'Binary Search' },
    { match: { title: 'GCD and LCM (Euclidean Algorithm)' }, topic: 'Recursion and Backtracking' },
    { match: { title: 'Basic SQL SELECT Queries and Filtering' }, topic: 'SELECT and Filtering' },
    { match: { title: 'GROUP BY and HAVING Aggregate Queries' }, topic: 'GROUP BY and HAVING' },
    { match: { title: 'Customers Who Never Order (SQL Left Join)' }, topic: 'Joins' },
    { match: { title: 'Longest Common Subsequence' }, topic: 'Dynamic Programming' },
    { match: { title: 'Coin Change' }, topic: 'Dynamic Programming' },
    { match: { title: 'Combine Two Tables (Outer Join)' }, topic: 'Joins' },
    { match: { title: 'Employees Earning More Than Their Managers' }, topic: 'Joins' },
    { match: { title: 'Duplicate Emails' }, topic: 'Duplicate Detection' },
    { match: { title: 'Find the Winner of the Circular Game (Josephus Problem)' }, topic: 'Recursion and Backtracking' },
    { match: { title: 'Climbing Stairs' }, topic: 'Dynamic Programming' },
  ];

  for (const item of updates) {
    await CodingQuestion.updateMany(item.match, { $set: { topic: item.topic } });
  }

  await CodingQuestion.updateMany({ topic: 'Joins & Multi-Table' }, { $set: { topic: 'Joins' } });
  await CodingQuestion.updateMany({ topic: 'Basic Queries' }, { $set: { topic: 'SELECT and Filtering' } });
  await CodingQuestion.updateMany({ topic: 'Filtering & Sorting' }, { $set: { topic: 'SELECT and Filtering' } });

  const remainingEmpty = await CodingQuestion.countDocuments({ $or: [{ topic: '' }, { topic: null }] });
  console.log('Remaining empty topics:', remainingEmpty);

  const dsaTopics = await CodingQuestion.distinct('topic', { category: 'DSA' });
  const sqlTopics = await CodingQuestion.distinct('topic', { category: 'SQL' });
  console.log('Cleaned DSA Topics:', dsaTopics);
  console.log('Cleaned SQL Topics:', sqlTopics);

  await mongoose.disconnect();
}

clean().catch(console.error);
