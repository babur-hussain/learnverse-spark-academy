const router = require('express').Router();
const { getPresignedUploadUrl, getPresignedDownloadUrl, deleteFile } = require('../config/s3');

// POST /api/storage/presigned-url — get a pre-signed upload URL
router.post('/presigned-url', async (req, res) => {
  try {
    const { fileName, fileType, folder } = req.body;
    const result = await getPresignedUploadUrl(fileName, fileType, folder);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storage/download-url — get a pre-signed download/view URL
router.get('/download-url', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url query parameter is required' });
    const signedUrl = getPresignedDownloadUrl(url);
    res.json({ url: signedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/storage/file — delete a file from S3
router.delete('/file', async (req, res) => {
  try {
    const { key } = req.body;
    await deleteFile(key);
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
