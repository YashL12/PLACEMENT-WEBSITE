const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema(
  {
    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewExperience',
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    roundOrder: {
      type: Number,
      required: true,
      default: 1,
    },
    roundName: {
      type: String,
      required: true,
      trim: true,
    },
    roundType: {
      type: String,
      enum: [
        'Aptitude',
        'Coding',
        'Technical',
        'HR',
        'Personal',
        'Managerial',
        'Group Discussion',
        'Practical',
        'Panel',
        'Other',
      ],
      default: 'Other',
    },
    description: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      default: '',
    },
    sourceLocation: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

interviewRoundSchema.index({ experience: 1, roundOrder: 1 });

const InterviewRound = mongoose.model('InterviewRound', interviewRoundSchema);

module.exports = InterviewRound;
