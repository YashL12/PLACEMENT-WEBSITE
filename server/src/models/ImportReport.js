const mongoose = require('mongoose');

const importReportSchema = new mongoose.Schema(
  {
    importDate: {
      type: Date,
      default: Date.now,
    },
    sourceFiles: {
      type: [String],
      default: [],
    },
    companiesCount: {
      type: Number,
      default: 0,
    },
    experiencesCount: {
      type: Number,
      default: 0,
    },
    roundsCount: {
      type: Number,
      default: 0,
    },
    questionsCount: {
      type: Number,
      default: 0,
    },
    flaggedRecords: [
      {
        recordType: { type: String },
        name: { type: String },
        reason: { type: String },
        sourceLocation: { type: String },
      },
    ],
    duplicatesDetected: [
      {
        companyName: { type: String },
        duplicateAlias: { type: String },
        actionTaken: { type: String },
      },
    ],
    errorLog: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const ImportReport = mongoose.model('ImportReport', importReportSchema);

module.exports = ImportReport;
