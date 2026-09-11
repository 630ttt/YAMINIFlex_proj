const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');

function getBucket() {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('MongoDB connection is not ready');
  }

  return new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
}

async function saveUpload(file) {
  if (!file || !file.buffer) {
    return '';
  }

  const bucket = getBucket();
  const uploadStream = bucket.openUploadStream(file.originalname, {
    contentType: file.mimetype || 'application/octet-stream',
    metadata: {
      originalName: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      size: file.size || file.buffer.length,
      uploadedAt: new Date().toISOString(),
    },
  });

  await new Promise((resolve, reject) => {
    uploadStream.on('finish', resolve);
    uploadStream.on('error', reject);
    uploadStream.end(file.buffer);
  });

  return `/api/files/${uploadStream.id.toString()}`;
}

async function saveUploads(files = []) {
  return Promise.all(files.map((file) => saveUpload(file)));
}

async function streamFileFromGridFs(req, res) {
  try {
    if (!mongoose.connection || !mongoose.connection.db) {
      return res.status(503).json({ success: false, message: 'MongoDB connection is not ready' });
    }

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid file id' });
    }

    const fileId = new ObjectId(req.params.id);
    const bucket = getBucket();

    const file = await bucket.find({ _id: fileId }).next();
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', () => {
      if (!res.headersSent) {
        res.status(404).json({ success: false, message: 'File not found' });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { saveUpload, saveUploads, streamFileFromGridFs };
