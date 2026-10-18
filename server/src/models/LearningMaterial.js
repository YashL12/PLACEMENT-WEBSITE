const mongoose = require('mongoose');

const learningMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      trim: true,
      uppercase: true,
    },
    fileName: {
      type: String,
      trim: true,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileUrl: {
      type: String,
      required: [true, 'Resource URL or file path is required'],
      trim: true,
    },
    isExternalLink: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

learningMaterialSchema.index({ title: 'text', description: 'text', category: 'text', companyName: 'text' });

const LearningMaterial = mongoose.model('LearningMaterial', learningMaterialSchema);

module.exports = LearningMaterial;
