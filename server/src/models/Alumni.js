const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Alumni name is required'],
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    linkedinUrl: {
      type: String,
      required: [true, 'LinkedIn profile URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid LinkedIn URL`,
      },
    },
    jobTitle: {
      type: String,
      trim: true,
      default: '',
    },
    companyLogo: {
      type: String,
      trim: true,
      default: '',
    },
    profilePhoto: {
      type: String,
      trim: true,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

alumniSchema.index({ name: 'text', companyName: 'text', jobTitle: 'text' });

const Alumni = mongoose.model('Alumni', alumniSchema);

module.exports = Alumni;
