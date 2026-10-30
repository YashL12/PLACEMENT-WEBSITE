const mongoose = require('mongoose');

/**
 * CodingQuestion — powers the Coding Practice module.
 * Separate from the existing PYQ `Question` model which stores interview-round questions.
 */

const sampleTestCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    expectedOutput: { type: String, required: true },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const starterCodeSchema = new mongoose.Schema(
  {
    java: { type: String, default: '' },
    javascript: { type: String, default: '' },
    python: { type: String, default: '' },
  },
  { _id: false }
);

const solutionSchema = new mongoose.Schema(
  {
    java: { type: String, default: '' },
    javascript: { type: String, default: '' },
    python: { type: String, default: '' },
  },
  { _id: false }
);

// For SQL questions
const sqlSetupSchema = new mongoose.Schema(
  {
    tableDefinitions: { type: String, default: '' }, // CREATE TABLE statements
    insertStatements: { type: String, default: '' },  // INSERT INTO statements
    schemaDescription: { type: String, default: '' }, // Human-readable schema
  },
  { _id: false }
);

const codingQuestionSchema = new mongoose.Schema(
  {
    // Stable identifier (URL slug)
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
    },

    // DSA | SQL | General Programming
    category: {
      type: String,
      required: true,
      enum: ['DSA', 'SQL', 'General Programming'],
      index: true,
    },

    // DSA topics; empty for SQL/General Programming
    topic: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },

    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard'],
      index: true,
    },

    // Full problem statement (Markdown or plain text)
    statement: {
      type: String,
      required: [true, 'Problem statement is required'],
    },

    constraints: {
      type: String,
      default: '',
    },

    // Public examples shown in the workspace
    examples: {
      type: [{ input: String, output: String, explanation: String }],
      default: [],
    },

    // Public sample test cases used by Run button
    sampleTestCases: {
      type: [sampleTestCaseSchema],
      default: [],
    },

    // Starter code per language (not for SQL)
    starterCode: {
      type: starterCodeSchema,
      default: () => ({}),
    },

    // Reference solutions per language (not for SQL)
    solutions: {
      type: solutionSchema,
      default: () => ({}),
    },

    // SQL-specific setup (only for SQL category)
    sqlSetup: {
      type: sqlSetupSchema,
      default: null,
    },

    // External solve destination platform
    platform: {
      type: String,
      default: 'LeetCode',
      trim: true,
      index: true,
    },

    // Verified canonical link to solve directly on the destination platform
    externalUrl: {
      type: String,
      default: '',
      trim: true,
    },

    // Interview context / provenance notes from GECR student reports
    interviewContext: {
      type: String,
      default: '',
      trim: true,
    },

    // Company tags — must come exclusively from existing companies
    companyTags: {
      type: [String],
      default: [],
      index: true,
    },

    // Provenance: how confident are we about company association
    companyTagSource: {
      type: String,
      enum: ['verified', 'practice-style', 'gecr-pyq', 'verified-pyq', 'company-pattern'],
      default: 'company-pattern',
    },

    // Source & licensing
    source: {
      type: String,
      default: 'original',
      trim: true,
    },
    license: {
      type: String,
      default: '',
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Display order within same difficulty+category (lower = first)
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Numeric rank for sort: Easy=1, Medium=2, Hard=3 — set automatically
    difficultyRank: {
      type: Number,
      default: 1,
      index: true,
    },
  },
  { timestamps: true }
);

const RANK = { Easy: 1, Medium: 2, Hard: 3 };

codingQuestionSchema.pre('save', function (next) {
  this.difficultyRank = RANK[this.difficulty] || 1;
  next();
});

codingQuestionSchema.pre('insertMany', function (next, docs) {
  if (Array.isArray(docs)) {
    docs.forEach((d) => {
      d.difficultyRank = RANK[d.difficulty] || 1;
    });
  }
  next();
});

// Compound index for the most common list query: category + difficulty + topic + published
codingQuestionSchema.index({ category: 1, difficulty: 1, isPublished: 1 });
codingQuestionSchema.index({ category: 1, topic: 1, difficulty: 1, isPublished: 1 });
codingQuestionSchema.index({ companyTags: 1, isPublished: 1 });
// Text index for title search
codingQuestionSchema.index({ title: 'text' });

const CodingQuestion = mongoose.model('CodingQuestion', codingQuestionSchema);

module.exports = CodingQuestion;
