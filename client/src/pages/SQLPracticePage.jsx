import React from 'react';
import { Database } from 'lucide-react';
import { QuestionListing } from '../components/QuestionListing';

const SQL_TOPICS = [
  'SELECT and Filtering',
  'Joins',
  'GROUP BY and HAVING',
  'Subqueries',
  'Window Functions',
  'Duplicate Detection',
  'Date and Time Queries',
  'Conditional Logic',
  'Data Modification',
];

export const SQLPracticePage = () => (
  <QuestionListing
    category="SQL"
    topics={SQL_TOPICS}
    accentColor="#0369a1"
    accentBg="#f0f9ff"
    title="SQL Practice"
    subtitle="SQL questions from SQL-Practice.com, LeetCode, and HackerRank covering essential queries from basic SELECT and filtering to joins and window functions."
    icon={Database}
  />
);
