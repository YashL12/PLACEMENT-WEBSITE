const mongoose = require('mongoose');

const userEventSchema = new mongoose.Schema(
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
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: [
        'search',
        'feature_click',
        'practice_view',
        'code_run',
        'resource_download',
        'tab_switch',
        'auth',
        'general',
      ],
      default: 'general',
      index: true,
    },
    category: {
      type: String,
      default: 'general',
      index: true,
      trim: true,
    },
    action: {
      type: String,
      required: [true, 'Action name is required'],
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    pageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// High performance compound indexes for analytics aggregations
userEventSchema.index({ timestamp: -1, eventType: 1 });
userEventSchema.index({ eventType: 1, 'metadata.query': 1 });
userEventSchema.index({ category: 1, action: 1, timestamp: -1 });
userEventSchema.index({ visitorId: 1, timestamp: -1 });
userEventSchema.index({ sessionId: 1, timestamp: 1 });

const UserEvent = mongoose.model('UserEvent', userEventSchema);

module.exports = UserEvent;

