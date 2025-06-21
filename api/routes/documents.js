const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Nurse = require('../models/Nurse');
const router = express.Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const nurseId = req.params.nurseId;
    const uploadPath = path.join(__dirname, '../uploads/documents', nurseId);
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const documentType = req.body.document_type;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${documentType}_${timestamp}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

router.post('/nurse/:nurseId/upload', upload.single('document'), async (req, res) => {
  try {
    const { nurseId } = req.params;
    const { document_type, expiration_date, notes } = req.body;
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const nurse = await Nurse.findOne({ nurse_id: nurseId });
    if (!nurse) return res.status(404).json({ success: false, error: 'Nurse not found' });

    nurse.documents = nurse.documents.filter(doc => doc.document_type !== document_type);
    const newDoc = {
      document_type,
      file_url: `/uploads/documents/${nurseId}/${req.file.filename}`,
      file_name: req.file.originalname,
      uploaded_at: new Date(),
      verification_status: 'pending',
      expiration_date: expiration_date ? new Date(expiration_date) : null,
      notes: notes || ''
    };
    nurse.documents.push(newDoc);
    await nurse.save();
    res.json({ success: true, document: newDoc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/nurse/:nurseId', async (req, res) => {
  try {
    const { nurseId } = req.params;
    const nurse = await Nurse.findOne({ nurse_id: nurseId }).select('documents account_status verification_status');
    if (!nurse) return res.status(404).json({ success: false, error: 'Nurse not found' });
    res.json({ success: true, documents: nurse.documents, account_status: nurse.account_status, verification_status: nurse.verification_status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/nurse/:nurseId/document/:documentId/verify', async (req, res) => {
  try {
    const { nurseId, documentId } = req.params;
    const { verification_status, rejection_reason, verified_by } = req.body;
    const nurse = await Nurse.findOne({ nurse_id: nurseId });
    if (!nurse) return res.status(404).json({ success: false, error: 'Nurse not found' });
    const doc = nurse.documents.id(documentId);
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
    doc.verification_status = verification_status;
    doc.verified_at = new Date();
    doc.verified_by = verified_by;
    if (verification_status === 'rejected') doc.rejection_reason = rejection_reason;
    await nurse.save();
    res.json({ success: true, document_status: doc.verification_status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
