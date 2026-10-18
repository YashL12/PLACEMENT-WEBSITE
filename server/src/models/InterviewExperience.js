const mongoose = require('mongoose');

const alumniContributionSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const interviewExperienceSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    role: {
      type: String,
      trim: true,
      default: 'Software Engineer',
    },
    placementYear: {
      type: Number,
      default: null, // null when unknown, strictly not guessing
      index: true,
    },
    sourceDocument: {
      type: String,
      required: true,
      enum: ['Placement Data.docx', 'Questions TnP 2024 .pdf', 'Questions TnP 2025.pdf', 'Manual Entry'],
    },
    sourcePage: {
      type: String,
      default: '',
    },
    processOverview: {
      type: String,
      default: '',
    },
    totalRoundsCount: {
      type: Number,
      default: 0,
    },
    advice: {
      type: [String],
      default: [],
    },
    alumniContributions: {
      type: [alumniContributionSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    needsReview: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const InterviewExperience = mongoose.model('InterviewExperience', interviewExperienceSchema);

module.exports = InterviewExperience;
