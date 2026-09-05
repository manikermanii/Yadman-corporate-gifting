import { Router } from 'express';
import { cartController, orderController, couponController } from '../controllers/cartOrderCouponController.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Cart APIs
router.get('/cart', optionalAuth, cartController.getCart);
router.post('/cart/items', optionalAuth, cartController.addItem);
router.put('/cart/items/:itemId', optionalAuth, cartController.updateItemQuantity);
router.delete('/cart/items/:itemId', optionalAuth, cartController.removeItem);
router.delete('/cart', optionalAuth, cartController.clearCart);

// Coupons
router.post('/coupons/validate', couponController.validateCoupon);
router.get('/admin/coupons', requireAdmin, couponController.getCouponsAdmin);
router.post('/admin/coupons', requireAdmin, couponController.createCoupon);
router.put('/admin/coupons/:id', requireAdmin, couponController.updateCoupon);
router.delete('/admin/coupons/:id', requireAdmin, couponController.deleteCoupon);

// Orders
router.post('/orders', optionalAuth, orderController.createOrder);
router.get('/orders/my', requireAuth, orderController.getMyOrders);
router.get('/orders/:id', optionalAuth, orderController.getOrderById);

// Admin Orders
router.get('/admin/orders', requireAdmin, orderController.getAllOrdersAdmin);
router.get('/admin/orders/:id', requireAdmin, orderController.getOrderById);
router.put('/admin/orders/:id/status', requireAdmin, orderController.updateOrderStatus);

export default router;
