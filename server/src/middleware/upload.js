const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure local upload directories exist
const uploadDir = path.resolve(__dirname, '../../uploads/learning-materials');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const logoUploadDir = path.resolve(__dirname, '../../uploads/logos');
if (!fs.existsSync(logoUploadDir)) {
  fs.mkdirSync(logoUploadDir, { recursive: true });
}

// Storage configuration with filename sanitization for learning materials
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Storage configuration for company logos
const logoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, logoUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `logo_${baseName}_${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico'];
const ALLOWED_IMAGE_MIME = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/x-icon'];

const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return cb(new Error('Invalid image format. Supported formats: PNG, JPG, JPEG, SVG, WebP.'), false);
  }
  if (file.mimetype && !ALLOWED_IMAGE_MIME.includes(file.mimetype)) {
    return cb(new Error('Invalid image MIME type.'), false);
  }
  cb(null, true);
};

// Logo upload: 5MB max
const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
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

module.exports = { upload, uploadLogo, uploadDir, logoUploadDir };
