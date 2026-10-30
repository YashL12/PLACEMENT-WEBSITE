import React from 'react';
import { Code2 } from 'lucide-react';
import { QuestionListing } from '../components/QuestionListing';

const DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stacks and Queues',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Recursion and Backtracking',
  'Binary Search',
  'Two Pointers',
  'Sliding Window',
  'Hashing',
  'Heaps and Priority Queues',
  'Bit Manipulation',
  'Matrices',
  'Tries',
  'Mathematical Algorithms',
];

export const DSAPracticePage = () => (
  <QuestionListing
    category="DSA"
    topics={DSA_TOPICS}
    accentColor="#7c3aed"
    accentBg="#f5f3ff"
    title="DSA Practice"
    subtitle="Data Structures & Algorithms questions from real GECR placement drives. Solve on LeetCode, GeeksforGeeks, HackerRank, and more."
    icon={Code2}
  />
);
