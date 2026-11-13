const mongoose = require('mongoose');

const visitorSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    visitorId: {
      type: String,
      required: [true, 'Visitor ID is required'],
      index: true,
      trim: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // duration in seconds
      min: 0,
    },
    pageViewCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    entryPage: {
      type: String,
      default: '/',
      trim: true,
    },
    exitPage: {
      type: String,
      default: '/',
      trim: true,
    },
    referrer: {
      type: String,
      default: '',
      trim: true,
    },
    referrerDomain: {
      type: String,
      default: 'Direct',
      trim: true,
      index: true,
    },
    isBounce: {
      type: Boolean,
      default: true,
      index: true,
    },
    device: {
      type: String,
      default: 'Desktop',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    city: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for time-range filtering and active visitor queries
visitorSessionSchema.index({ startedAt: -1, visitorId: 1 });
visitorSessionSchema.index({ lastActivityAt: -1 });
visitorSessionSchema.index({ visitorId: 1, createdAt: -1 });
visitorSessionSchema.index({ startedAt: 1, isBounce: 1 });

const VisitorSession = mongoose.model('VisitorSession', visitorSessionSchema);

module.exports = VisitorSession;

