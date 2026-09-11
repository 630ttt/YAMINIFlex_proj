const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|pdf|ai|psd|cdr|eps|svg|tif|tiff|zip/;
  const isAllowed = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed: images, PDF, AI, PSD, CDR, EPS, SVG, TIFF, ZIP'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 },
});

module.exports = upload;
