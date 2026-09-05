import { initialStoreData } from '../utils/initialStoreData.js';
import { storageService } from './storageService.js';
import { prisma, isDbConnected } from '../config/database.js';

let inMemoryReviews: any[] = [...initialStoreData.reviews];
let inMemoryWishlists: Map<string, string[]> = new Map(); // userId -> productIds[]

function formatReviewFromPrisma(r: any) {
  return {
    ...r,
    status: r.status ? r.status.toLowerCase() : (r.approved ? 'approved' : 'pending'),
    createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
    createdAtFa: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(r.createdAt ? new Date(r.createdAt) : new Date()),
  };
}

export class ReviewService {
  async getProductReviews(productId: string) {
    if (isDbConnected()) {
      try {
        const reviews = await prisma.review.findMany({
          where: {
            productId,
            status: 'APPROVED',
          },
          orderBy: { createdAt: 'desc' },
        });
        return reviews.map(formatReviewFromPrisma);
      } catch (err) {
        console.warn('Prisma getProductReviews fallback:', err);
      }
    }

    return inMemoryReviews.filter(
      (r) => r.productId === productId && (r.status === 'approved' || r.approved === true)
    );
  }

  async getAllReviewsAdmin() {
    if (isDbConnected()) {
      try {
        const reviews = await prisma.review.findMany({
          include: { product: { select: { titleFa: true, sku: true } } },
          orderBy: { createdAt: 'desc' },
        });
        return reviews.map(formatReviewFromPrisma);
      } catch (err) {
        console.warn('Prisma getAllReviewsAdmin fallback:', err);
      }
    }
    return inMemoryReviews;
  }

  async createReview(data: any) {
    let voiceUrl = data.voiceRecordingUrl || data.voiceRecording?.dataUrl;
    if (data.voiceRecording?.dataUrl) {
      voiceUrl = await storageService.saveVoiceRecording(
        data.voiceRecording.dataUrl,
        data.voiceRecording.mimeType
      );
    }

    const now = new Date();

    if (isDbConnected()) {
      try {
        const created = await prisma.review.create({
          data: {
            id: data.id || `rev-${Date.now()}`,
            productId: data.productId,
            userId: data.userId || null,
            authorName: data.userName || data.fullName || data.authorName || 'کاربر گرامی',
            companyName: data.companyName || null,
            rating: Number(data.rating || 5),
            comment: data.comment || '',
            voiceRecordingUrl: voiceUrl || null,
            voiceDuration: data.voiceDuration || data.voiceRecording?.duration ? Number(data.voiceDuration || data.voiceRecording?.duration) : null,
            isVerifiedPurchase: Boolean(data.isVerifiedPurchase),
            status: 'PENDING',
            likesCount: 0,
          },
        });
        return formatReviewFromPrisma(created);
      } catch (err) {
        console.warn('Prisma createReview fallback to memory:', err);
      }
    }

    const newReview = {
      ...data,
      id: `rev-${Date.now()}`,
      status: 'pending',
      approved: false,
      likesCount: 0,
      createdAt: now.toISOString(),
      createdAtFa: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(now),
    };

    inMemoryReviews.unshift(newReview);
    return newReview;
  }

  async updateReviewStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    if (isDbConnected()) {
      try {
        const updated = await prisma.review.update({
          where: { id },
          data: {
            status: status.toUpperCase(),
          },
        });
        return formatReviewFromPrisma(updated);
      } catch (err) {
        console.warn('Prisma updateReviewStatus fallback:', err);
      }
    }

    const index = inMemoryReviews.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('دیدگاه یافت نشد.');
    inMemoryReviews[index].status = status;
    inMemoryReviews[index].approved = status === 'approved';
    return inMemoryReviews[index];
  }

  async deleteReview(id: string) {
    if (isDbConnected()) {
      try {
        const deleted = await prisma.review.delete({ where: { id } });
        return formatReviewFromPrisma(deleted);
      } catch (err) {
        console.warn('Prisma deleteReview fallback:', err);
      }
    }

    const index = inMemoryReviews.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('دیدگاه یافت نشد.');
    const [deleted] = inMemoryReviews.splice(index, 1);
    return deleted;
  }
}

export class WishlistService {
  async getWishlist(userId: string) {
    if (isDbConnected() && userId) {
      try {
        const items = await prisma.wishlist.findMany({
          where: { userId },
          select: { productId: true },
        });
        return items.map((i) => i.productId);
      } catch (err) {
        console.warn('Prisma getWishlist fallback:', err);
      }
    }
    return inMemoryWishlists.get(userId) || [];
  }

  async toggleWishlist(userId: string, productId: string) {
    if (isDbConnected() && userId) {
      try {
        const existing = await prisma.wishlist.findFirst({
          where: { userId, productId },
        });
        let isAdded = false;
        if (existing) {
          await prisma.wishlist.delete({ where: { id: existing.id } });
          isAdded = false;
        } else {
          await prisma.wishlist.create({
            data: {
              id: `wish-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              userId,
              productId,
            },
          });
          isAdded = true;
        }
        const updated = await this.getWishlist(userId);
        return { wishlist: updated, isAdded };
      } catch (err) {
        console.warn('Prisma toggleWishlist fallback:', err);
      }
    }

    const list = inMemoryWishlists.get(userId) || [];
    const index = list.indexOf(productId);
    let isAdded = false;

    if (index > -1) {
      list.splice(index, 1);
      isAdded = false;
    } else {
      list.push(productId);
      isAdded = true;
    }

    inMemoryWishlists.set(userId, list);
    return { wishlist: list, isAdded };
  }
}

export const reviewService = new ReviewService();
export const wishlistService = new WishlistService();
