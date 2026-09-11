const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  // covers reference photos as well as common design-file formats used for final artwork
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
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB (design files can be large)
});

module.exports = upload;
