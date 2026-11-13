const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: [true, 'Visitor ID is required'],
      index: true,
      trim: true,
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      index: true,
      trim: true,
    },
    pageUrl: {
      type: String,
      required: [true, 'Page URL is required'],
      trim: true,
      index: true,
    },
    pageTitle: {
      type: String,
      default: '',
      trim: true,
    },
    enteredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    exitedAt: {
      type: Date,
      default: null,
    },
    timeSpent: {
      type: Number,
      default: 0, // seconds spent on this page
      min: 0,
    },
    referrer: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for page ranking aggregations and time window analysis
pageViewSchema.index({ pageUrl: 1, enteredAt: -1 });
pageViewSchema.index({ enteredAt: -1, visitorId: 1 });
pageViewSchema.index({ sessionId: 1, enteredAt: 1 });

const PageView = mongoose.model('PageView', pageViewSchema);

module.exports = PageView;

