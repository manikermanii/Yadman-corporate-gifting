import { Router } from 'express';
import { inquiriesController } from '../controllers/inquiriesController.js';
import { requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Corporate Inquiries
router.post('/corporate-inquiries', optionalAuth, inquiriesController.createCorporateInquiry);
router.get('/admin/corporate-inquiries', requireAdmin, inquiriesController.getCorporateInquiriesAdmin);
router.put('/admin/corporate-inquiries/:id', requireAdmin, inquiriesController.updateCorporateInquiry);

// Consultations
router.post('/consultations', optionalAuth, inquiriesController.createConsultation);
router.get('/admin/consultations', requireAdmin, inquiriesController.getConsultationsAdmin);
router.put('/admin/consultations/:id', requireAdmin, inquiriesController.updateConsultation);

// Custom Gift Boxes
router.post('/custom-gift-boxes', optionalAuth, inquiriesController.createCustomGiftBox);
router.get('/admin/custom-gift-boxes', requireAdmin, inquiriesController.getCustomGiftBoxesAdmin);

export default router;
