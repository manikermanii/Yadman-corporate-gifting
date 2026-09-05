import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Customer Auth
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);

// Admin Auth
router.post('/admin/login', authController.adminLogin);
router.post('/admin/logout', authController.logout);
router.get('/admin/me', requireAdmin, authController.getMe);

export default router;
