const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure local upload directory exists
const uploadDir = path.resolve(__dirname, '../../uploads/learning-materials');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with filename sanitization
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize original file name
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Allowed MIME types and extensions for educational materials
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.txt'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(
        `Invalid file extension '${ext}'. Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP.`
      ),
      false
    );
  }

  // Also check mime type when available
  if (file.mimetype && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    // Some browsers send generic octet-stream for docx/pptx
    if (file.mimetype !== 'application/octet-stream') {
      return cb(
        new Error(`Invalid MIME type '${file.mimetype}'. Only verified document formats are permitted.`),
        false
      );
    }
  }

  cb(null, true);
};

// Maximum file size: 50MB
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter,
});

module.exports = { upload, uploadDir };
