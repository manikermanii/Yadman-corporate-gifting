import { Request, Response, NextFunction } from 'express';
import { cartService, orderService, couponService } from '../services/orderService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { orderCreateSchema, couponValidateSchema } from '../validators/index.js';

function getCartKey(req: Request): string {
  if (req.user?.userId) {
    return `user_${req.user.userId}`;
  }
  const sessionHeader = req.headers['x-session-id'] as string;
  if (sessionHeader) {
    return `session_${sessionHeader}`;
  }
  return 'default_guest_cart';
}

export class CartController {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cartKey = getCartKey(req);
      const cart = await cartService.getCart(cartKey);
      return sendSuccess(res, cart);
    } catch (err: any) {
      next(err);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const cartKey = getCartKey(req);
      const cart = await cartService.addToCart(cartKey, req.body);
      return sendSuccess(res, cart);
    } catch (err: any) {
      next(err);
    }
  }

  async updateItemQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const cartKey = getCartKey(req);
      const { itemId } = req.params;
      const { quantity } = req.body;
      const cart = await cartService.updateItemQuantity(cartKey, itemId, quantity);
      return sendSuccess(res, cart);
    } catch (err: any) {
      next(err);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const cartKey = getCartKey(req);
      const { itemId } = req.params;
      const cart = await cartService.removeItem(cartKey, itemId);
      return sendSuccess(res, cart);
    } catch (err: any) {
      next(err);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cartKey = getCartKey(req);
      const cart = await cartService.clearCart(cartKey);
      return sendSuccess(res, cart);
    } catch (err: any) {
      next(err);
    }
  }
}

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = orderCreateSchema.parse(req.body);
      const order = await orderService.createOrder({
        ...validated,
        userId: req.user?.userId,
      });

      // Clear the user's cart upon order placement
      const cartKey = getCartKey(req);
      await cartService.clearCart(cartKey);

      return sendSuccess(res, order, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'لطفاً وارد شوید.', 401);
      }
      const orders = await orderService.getOrders({ userId: req.user.userId });
      return sendSuccess(res, orders);
    } catch (err: any) {
      next(err);
    }
  }

  async getAllOrdersAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getOrders();
      return sendSuccess(res, orders);
    } catch (err: any) {
      next(err);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      return sendSuccess(res, order);
    } catch (err: any) {
      next(err);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const order = await orderService.updateOrderStatus(id, status, adminNotes);
      return sendSuccess(res, order);
    } catch (err: any) {
      next(err);
    }
  }
}

export class CouponController {
  async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = couponValidateSchema.parse(req.body);
      const result = await couponService.validateCoupon(validated.code, validated.cartTotal);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, 'INVALID_COUPON', err.message, 400);
    }
  }

  async getCouponsAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await couponService.getCoupons();
      return sendSuccess(res, coupons);
    } catch (err: any) {
      next(err);
    }
  }

  async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.createCoupon(req.body);
      return sendSuccess(res, coupon, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coupon = await couponService.updateCoupon(id, req.body);
      return sendSuccess(res, coupon);
    } catch (err: any) {
      next(err);
    }
  }

  async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await couponService.deleteCoupon(id);
      return sendSuccess(res, deleted);
    } catch (err: any) {
      next(err);
    }
  }
}

export const cartController = new CartController();
export const orderController = new OrderController();
export const couponController = new CouponController();
