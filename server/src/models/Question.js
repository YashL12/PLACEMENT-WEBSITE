const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewRound',
      required: true,
      index: true,
    },
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
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    context: {
      type: String,
      default: '',
    },
    topic: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 1,
    },
    solutionUrl: {
      type: String,
      default: '',
      trim: true,
    },
    sourceDocument: {
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
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ round: 1, order: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
