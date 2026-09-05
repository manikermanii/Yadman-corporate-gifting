import { Request, Response, NextFunction } from 'express';
import { reviewService, wishlistService } from '../services/reviewWishlistService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { reviewCreateSchema } from '../validators/index.js';

export class ReviewController {
  async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const reviews = await reviewService.getProductReviews(productId);
      return sendSuccess(res, reviews);
    } catch (err: any) {
      next(err);
    }
  }

  async getAllReviewsAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewService.getAllReviewsAdmin();
      return sendSuccess(res, reviews);
    } catch (err: any) {
      next(err);
    }
  }

  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = reviewCreateSchema.parse(req.body);
      const review = await reviewService.createReview({
        ...validated,
        userId: req.user?.userId,
      });
      return sendSuccess(res, review, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updateReviewStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await reviewService.updateReviewStatus(id, status);
      return sendSuccess(res, updated);
    } catch (err: any) {
      next(err);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await reviewService.deleteReview(id);
      return sendSuccess(res, deleted);
    } catch (err: any) {
      next(err);
    }
  }
}

export class WishlistController {
  async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'لطفاً وارد شوید.', 401);
      }
      const list = await wishlistService.getWishlist(req.user.userId);
      return sendSuccess(res, list);
    } catch (err: any) {
      next(err);
    }
  }

  async toggleWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'لطفاً وارد شوید.', 401);
      }
      const { productId } = req.params;
      const result = await wishlistService.toggleWishlist(req.user.userId, productId);
      return sendSuccess(res, result);
    } catch (err: any) {
      next(err);
    }
  }
}

export const reviewController = new ReviewController();
export const wishlistController = new WishlistController();
