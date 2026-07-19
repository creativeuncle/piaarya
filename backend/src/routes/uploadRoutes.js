const express = require('express');
const { upload } = require('../middleware/upload');

const router = express.Router();

function fileUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: fileUrl(req, req.file.filename) });
});

router.post('/multiple', upload.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' });
  res.json({ urls: req.files.map((f) => fileUrl(req, f.filename)) });
});

module.exports = router;
