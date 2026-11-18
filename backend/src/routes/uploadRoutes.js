const express = require('express');
const { upload } = require('../middleware/upload');

const router = express.Router();

// A relative path, not `${req.protocol}://${req.get('host')}/...` — the
// upload request usually arrives at this backend via a frontend app's own
// server-side proxy (e.g. admin-next's /uploads rewrite), so req.get('host')
// would resolve to that proxy's internal address (localhost:5000) rather
// than the public domain the browser can actually reach. Every frontend app
// proxies /uploads/* to this backend itself, so a relative path resolves
// correctly no matter which app's domain the image is viewed from.
function fileUrl(filename) {
  return `/uploads/${filename}`;
}

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: fileUrl(req.file.filename) });
});

router.post('/multiple', upload.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' });
  res.json({ urls: req.files.map((f) => fileUrl(f.filename)) });
});

module.exports = router;
