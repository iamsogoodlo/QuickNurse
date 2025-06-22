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

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const nurse = await Nurse.findOne({ nurse_id: nurseId });
    if (!nurse) {
      return res.status(404).json({ success: false, error: 'Nurse not found' });
    }

    // Remove existing doc of same type
    nurse.documents = nurse.documents.filter(doc => doc.document_type !== document_type);

    const newDocument = {
      document_type,
      file_url: `/uploads/documents/${nurseId}/${req.file.filename}`,
      file_name: req.file.originalname,
      uploaded_at: new Date(),
      verification_status: 'pending',
      expiration_date: expiration_date ? new Date(expiration_date) : null,
      notes: notes || ''
    };

    nurse.documents.push(newDocument);

    // Check if all required documents uploaded
    const requiredDocs = ['nursing_license', 'government_id', 'malpractice_insurance', 'bls_certification'];
    const uploadedTypes = nurse.documents.map(d => d.document_type);
    const hasAllRequired = requiredDocs.every(t => uploadedTypes.includes(t));

    if (hasAllRequired && nurse.account_status === 'pending_documents') {
      nurse.account_status = 'under_review';
      nurse.verification_status = 'under_review';
    }

    await nurse.save();

    res.json({ success: true, document: newDocument, account_status: nurse.account_status, all_required_uploaded: hasAllRequired });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/nurse/:nurseId', async (req, res) => {
  try {
    const { nurseId } = req.params;
    const nurse = await Nurse.findOne({ nurse_id: nurseId }).select('documents account_status verification_status');
    if (!nurse) {
      return res.status(404).json({ success: false, error: 'Nurse not found' });
    }

    const requiredDocs = [
      { type: 'nursing_license', name: 'Nursing License', required: true },
      { type: 'government_id', name: 'Government ID', required: true },
      { type: 'malpractice_insurance', name: 'Malpractice Insurance', required: true },
      { type: 'bls_certification', name: 'BLS Certification', required: true },
      { type: 'acls_certification', name: 'ACLS Certification', required: false },
      { type: 'resume', name: 'Resume/CV', required: false },
      { type: 'background_check', name: 'Background Check', required: false }
    ];

    const documentStatus = requiredDocs.map(reqDoc => {
      const uploaded = nurse.documents.find(d => d.document_type === reqDoc.type);
      return {
        document_type: reqDoc.type,
        document_name: reqDoc.name,
        required: reqDoc.required,
        uploaded: !!uploaded,
        verification_status: uploaded ? uploaded.verification_status : 'not_uploaded',
        uploaded_at: uploaded ? uploaded.uploaded_at : null,
        verified_at: uploaded ? uploaded.verified_at : null,
        expiration_date: uploaded ? uploaded.expiration_date : null,
        rejection_reason: uploaded ? uploaded.rejection_reason : null,
        file_url: uploaded ? uploaded.file_url : null
      };
    });

    const requiredCount = requiredDocs.filter(d => d.required).length;
    const uploadedRequiredCount = documentStatus.filter(d => d.required && d.uploaded).length;
    const completionPercentage = Math.round((uploadedRequiredCount / requiredCount) * 100);

    res.json({
      success: true,
      nurse_id: nurseId,
      account_status: nurse.account_status,
      verification_status: nurse.verification_status,
      completion_percentage: completionPercentage,
      documents: documentStatus
    });
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

    const requiredTypes = ['nursing_license', 'government_id', 'malpractice_insurance', 'bls_certification'];
    const requiredDocs = nurse.documents.filter(d => requiredTypes.includes(d.document_type));
    const allApproved = requiredDocs.length === requiredTypes.length && requiredDocs.every(d => d.verification_status === 'approved');

    if (allApproved) {
      nurse.account_status = 'active';
      nurse.verification_status = 'verified';
      nurse.approved_at = new Date();
      nurse.approved_by = verified_by;
    } else if (requiredDocs.some(d => d.verification_status === 'rejected')) {
      nurse.account_status = 'pending_documents';
      nurse.verification_status = 'documents_required';
    }

    await nurse.save();

    res.json({
      success: true,
      document_status: doc.verification_status,
      account_status: nurse.account_status,
      verification_status: nurse.verification_status
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/documents/pending-verification
// Admin endpoint to get documents pending verification
router.get('/pending-verification', async (req, res) => {
  try {
    const nurses = await Nurse.find({ 'documents.verification_status': 'pending' }).select('nurse_id first_name last_name documents created_at');

    const pendingDocuments = [];

    nurses.forEach(nurse => {
      nurse.documents.forEach(doc => {
        if (doc.verification_status === 'pending') {
          pendingDocuments.push({
            nurse_id: nurse.nurse_id,
            nurse_name: `${nurse.first_name} ${nurse.last_name}`,
            document_id: doc._id,
            document_type: doc.document_type,
            file_url: doc.file_url,
            uploaded_at: doc.uploaded_at,
            expiration_date: doc.expiration_date
          });
        }
      });
    });

    pendingDocuments.sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));

    res.json({ success: true, count: pendingDocuments.length, pending_documents: pendingDocuments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
