const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    aliases: {
      type: [String],
      default: [],
      index: true,
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    logoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    about: {
      type: String,
      trim: true,
      default: '',
    },
    generalAdvice: {
      type: [String],
      default: [],
    },
    placementYears: {
      type: [Number],
      default: [],
      index: true,
    },
    totalExperiencesCount: {
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

// Text index for search across name and aliases
companySchema.index({ name: 'text', aliases: 'text', normalizedName: 'text' });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
