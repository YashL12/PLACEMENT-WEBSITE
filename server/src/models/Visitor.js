const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: [true, 'Visitor ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    firstVisit: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastVisit: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalSessions: {
      type: Number,
      default: 1,
      min: 0,
    },
    totalPageViews: {
      type: Number,
      default: 1,
      min: 0,
    },
    isReturning: {
      type: Boolean,
      default: false,
      index: true,
    },
    device: {
      type: String,
      enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
      default: 'Desktop',
      index: true,
    },
    browser: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    browserVersion: {
      type: String,
      default: '',
    },
    os: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    osVersion: {
      type: String,
      default: '',
    },
    ip: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    country: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    state: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    city: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    lastSessionId: {
      type: String,
      default: '',
    },
    lastPageUrl: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-speed dashboard analytics
visitorSchema.index({ createdAt: -1, isReturning: 1 });
visitorSchema.index({ country: 1, state: 1, city: 1 });
visitorSchema.index({ lastVisit: -1 });

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;

