import { productService } from './productService.js';
import { initialStoreData } from '../utils/initialStoreData.js';
import { storageService } from './storageService.js';
import { prisma, isDbConnected } from '../config/database.js';

let inMemoryCarts: Map<string, any[]> = new Map(); // key = userId or sessionId
let inMemoryOrders: any[] = [];
let inMemoryCoupons: any[] = (initialStoreData.coupons as any[]).map((c, idx) => ({
  id: c.id || `cpn-${idx + 1}`,
  code: c.code,
  discountPercent: c.discountPercent || null,
  discountAmount: c.discountAmount || null,
  minOrderAmount: c.minOrderAmount || 0,
  maxDiscount: c.maxDiscount || null,
  usageLimit: c.usageLimit || 100,
  usedCount: c.usedCount || 0,
  description: c.description || '',
  isActive: c.isActive !== false,
}));

export class CouponService {
  async getCoupons() {
    if (isDbConnected()) {
      try {
        const dbCoupons = await prisma.coupon.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return dbCoupons;
      } catch (err) {
        console.warn('Prisma getCoupons fallback:', err);
      }
    }
    return inMemoryCoupons;
  }

  async validateCoupon(code: string, cartSubtotal: number) {
    let coupon: any = null;

    if (isDbConnected()) {
      try {
        coupon = await prisma.coupon.findFirst({
          where: {
            code: {
              equals: code.trim(),
              mode: 'insensitive',
            },
          },
        });
      } catch (err) {
        console.warn('Prisma find coupon fallback:', err);
      }
    }

    if (!coupon) {
      coupon = inMemoryCoupons.find(
        (c) => c.code.toUpperCase() === code.trim().toUpperCase()
      );
    }

    if (!coupon) {
      throw new Error('کد تخفیف وارد شده معتبر نیست.');
    }

    if (!coupon.isActive) {
      throw new Error('این کد تخفیف در حال حاضر غیرفعال است.');
    }

    if (coupon.minOrderAmount && cartSubtotal < coupon.minOrderAmount) {
      throw new Error(
        `حداقل مبلغ سفارش برای اعمال این کد ${coupon.minOrderAmount.toLocaleString('fa-IR')} تومان است.`
      );
    }

    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      throw new Error('سقف مجاز استفاده از این کد تخفیف به پایان رسیده است.');
    }

    let discountAmount = 0;
    if (coupon.discountPercent) {
      discountAmount = Math.round((cartSubtotal * coupon.discountPercent) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountAmount) {
      discountAmount = coupon.discountAmount;
    }

    return {
      isValid: true,
      coupon,
      discountAmount,
    };
  }

  async createCoupon(data: any) {
    const code = data.code.toUpperCase().trim();
    if (isDbConnected()) {
      const created = await prisma.coupon.create({
        data: {
          id: data.id || `CPN-${Date.now().toString().slice(-4)}`,
          code,
          discountPercent: data.discountPercent ? Number(data.discountPercent) : null,
          discountAmount: data.discountAmount ? Number(data.discountAmount) : null,
          minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : 0,
          maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
          usageLimit: data.usageLimit ? Number(data.usageLimit) : 100,
          usedCount: 0,
          description: data.description || '',
          isActive: data.isActive !== false,
        },
      });
      return created;
    }
    const newCoupon = {
      ...data,
      id: data.id || `CPN-${Date.now().toString().slice(-4)}`,
      usedCount: 0,
      code,
    };
    inMemoryCoupons.push(newCoupon);
    return newCoupon;
  }

  async updateCoupon(id: string, data: any) {
    if (isDbConnected()) {
      const updated = await prisma.coupon.update({
        where: { id },
        data: {
          code: data.code ? data.code.toUpperCase().trim() : undefined,
          discountPercent: data.discountPercent !== undefined ? (data.discountPercent ? Number(data.discountPercent) : null) : undefined,
          discountAmount: data.discountAmount !== undefined ? (data.discountAmount ? Number(data.discountAmount) : null) : undefined,
          minOrderAmount: data.minOrderAmount !== undefined ? Number(data.minOrderAmount) : undefined,
          maxDiscount: data.maxDiscount !== undefined ? (data.maxDiscount ? Number(data.maxDiscount) : null) : undefined,
          usageLimit: data.usageLimit !== undefined ? Number(data.usageLimit) : undefined,
          description: data.description !== undefined ? data.description : undefined,
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
        },
      });
      return updated;
    }
    const index = inMemoryCoupons.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('کد تخفیف یافت نشد.');
    inMemoryCoupons[index] = { ...inMemoryCoupons[index], ...data };
    return inMemoryCoupons[index];
  }

  async deleteCoupon(id: string) {
    if (isDbConnected()) {
      const deleted = await prisma.coupon.delete({ where: { id } });
      return deleted;
    }
    const index = inMemoryCoupons.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('کد تخفیف یافت نشد.');
    const [deleted] = inMemoryCoupons.splice(index, 1);
    return deleted;
  }
}

export const couponService = new CouponService();

export class CartService {
  async getCart(cartKey: string) {
    const items = inMemoryCarts.get(cartKey) || [];
    let subtotal = 0;

    for (const item of items) {
      subtotal += (item.unitPrice || 0) * (item.quantity || 1);
    }

    return {
      items,
      subtotal,
      itemCount: items.reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    };
  }

  async addItem(cartKey: string, payload: any) {
    let items = inMemoryCarts.get(cartKey) || [];

    if (payload.isCustomBox) {
      const customItem = {
        id: `CART-CUST-${Date.now()}`,
        isCustomBox: true,
        customBoxDetails: payload.customBoxDetails,
        unitPrice: payload.unitPrice || 0,
        quantity: payload.quantity || 1,
        ribbonColor: payload.ribbonColor,
        waxSeal: payload.waxSeal,
        cardMessage: payload.cardMessage,
        recipientName: payload.recipientName,
        deliveryDate: payload.deliveryDate,
        voiceRecordingUrl: payload.voiceRecordingUrl,
        voiceDuration: payload.voiceDuration,
      };
      items.push(customItem);
    } else {
      const existingIndex = items.findIndex(
        (i) => i.productId === payload.productId && !i.isCustomBox
      );

      if (existingIndex > -1) {
        items[existingIndex].quantity += payload.quantity || 1;
        if (payload.ribbonColor) items[existingIndex].ribbonColor = payload.ribbonColor;
        if (payload.waxSeal) items[existingIndex].waxSeal = payload.waxSeal;
        if (payload.cardMessage) items[existingIndex].cardMessage = payload.cardMessage;
        if (payload.voiceRecordingUrl) items[existingIndex].voiceRecordingUrl = payload.voiceRecordingUrl;
      } else {
        const product = await productService.getProductById(payload.productId);
        const newItem = {
          id: `CART-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: payload.productId,
          productTitleFa: product?.titleFa || 'پک هدیه یادمان',
          productSku: product?.sku,
          productImage: product?.image,
          unitPrice: product?.price || payload.unitPrice || 0,
          quantity: payload.quantity || 1,
          ribbonColor: payload.ribbonColor || product?.ribbonColor,
          waxSeal: payload.waxSeal || product?.waxSeal,
          cardMessage: payload.cardMessage,
          recipientName: payload.recipientName,
          deliveryDate: payload.deliveryDate,
          voiceRecordingUrl: payload.voiceRecordingUrl,
          voiceDuration: payload.voiceDuration,
        };
        items.push(newItem);
      }
    }

    inMemoryCarts.set(cartKey, items);
    return this.getCart(cartKey);
  }

  async addToCart(cartKey: string, payload: any) {
    return this.addItem(cartKey, payload);
  }

  async updateItemQuantity(cartKey: string, itemId: string, quantity: number) {
    let items = inMemoryCarts.get(cartKey) || [];
    if (quantity <= 0) {
      items = items.filter((i) => i.id !== itemId);
    } else {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
    }
    inMemoryCarts.set(cartKey, items);
    return this.getCart(cartKey);
  }

  async removeItem(cartKey: string, itemId: string) {
    let items = inMemoryCarts.get(cartKey) || [];
    items = items.filter((i) => i.id !== itemId);
    inMemoryCarts.set(cartKey, items);
    return this.getCart(cartKey);
  }

  async clearCart(cartKey: string) {
    inMemoryCarts.delete(cartKey);
    return { items: [], subtotal: 0, itemCount: 0 };
  }
}

export const cartService = new CartService();

function formatOrderFromPrisma(o: any) {
  return {
    ...o,
    items: o.items ? o.items.map((it: any) => ({
      ...it,
      customBoxDetails: typeof it.customBoxDetails === 'string' ? JSON.parse(it.customBoxDetails || '{}') : it.customBoxDetails,
    })) : [],
  };
}

export class OrderService {
  async createOrder(data: any) {
    const orderNumber = `YAD-${Date.now().toString().slice(-6)}`;
    
    // Normalize customer and address fields
    const customer = data.customer || {};
    const customerName = data.customerName || customer.fullName || 'کاربر گرامی';
    const customerPhone = data.customerPhone || customer.phoneNumber || '';
    const customerEmail = data.customerEmail || customer.email;
    const recipientName = data.recipientName || customer.recipientName;
    const recipientPhone = data.recipientPhone || customer.recipientPhone;
    const deliveryAddress = data.deliveryAddress || customer.address || '';
    const deliveryCity = data.deliveryCity || customer.city || 'تهران';
    const deliveryDate = data.deliveryDate || customer.deliveryDate;
    const cardMessage = data.cardMessage || customer.giftCardMessage;
    const customPackingNotes = data.customPackingNotes || customer.specialInstructions;
    const voiceRecordingUrl = data.voiceRecordingUrl || customer.voiceRecording?.url;
    const voiceDuration = data.voiceDuration || customer.voiceRecording?.duration;

    const subtotal = data.subtotal || data.items?.reduce((acc: number, item: any) => acc + (item.unitPrice || item.price || 0) * (item.quantity || 1), 0) || 0;
    const discountAmount = data.discountAmount || 0;
    const shippingCost = data.shippingCost || 0;
    const totalAmount = data.totalAmount || (subtotal - discountAmount + shippingCost);

    if (isDbConnected()) {
      try {
        const created = await prisma.order.create({
          data: {
            id: `ORD-${Date.now()}`,
            orderNumber,
            userId: data.userId || null,
            customerName,
            customerPhone,
            customerEmail: customerEmail || null,
            recipientName: recipientName || null,
            recipientPhone: recipientPhone || null,
            deliveryAddress,
            deliveryCity,
            deliveryDate: deliveryDate || null,
            cardMessage: cardMessage || null,
            customPackingNotes: customPackingNotes || null,
            voiceRecordingUrl: voiceRecordingUrl || null,
            voiceDuration: voiceDuration ? Number(voiceDuration) : null,
            subtotal: Number(subtotal),
            discountAmount: Number(discountAmount),
            shippingCost: Number(shippingCost),
            totalAmount: Number(totalAmount),
            status: 'PENDING',
            paymentStatus: 'UNPAID',
            paymentProvider: data.paymentProvider || 'zarinpal',
            couponCode: data.couponCode || null,
            adminNotes: data.adminNotes || null,
            items: {
              create: (data.items || []).map((item: any) => ({
                id: `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                productId: item.productId || null,
                isCustomBox: Boolean(item.isCustomBox),
                customBoxDetails: item.customBoxDetails ? JSON.stringify(item.customBoxDetails) : null,
                productTitleFa: item.productTitleFa || item.titleFa || 'آیتم هدیه',
                productSku: item.productSku || item.sku || null,
                unitPrice: Number(item.unitPrice || item.price || 0),
                quantity: Number(item.quantity || 1),
                totalPrice: Number((item.unitPrice || item.price || 0) * (item.quantity || 1)),
                ribbonColor: item.ribbonColor || null,
                waxSeal: item.waxSeal || null,
                cardMessage: item.cardMessage || null,
                recipientName: item.recipientName || null,
                deliveryDate: item.deliveryDate || null,
                voiceRecordingUrl: item.voiceRecordingUrl || null,
                voiceDuration: item.voiceDuration ? Number(item.voiceDuration) : null,
              })),
            },
          },
          include: {
            items: true,
          },
        });

        if (data.couponCode) {
          await prisma.coupon.updateMany({
            where: { code: { equals: data.couponCode.trim(), mode: 'insensitive' } },
            data: { usedCount: { increment: 1 } },
          }).catch((err) => console.warn('Coupon count increment error:', err));
        }

        return formatOrderFromPrisma(created);
      } catch (err) {
        console.warn('Prisma createOrder error, fallback to memory:', err);
      }
    }

    const newOrder = {
      ...data,
      id: `ORD-${Date.now()}`,
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      recipientName,
      recipientPhone,
      deliveryAddress,
      deliveryCity,
      deliveryDate,
      cardMessage,
      customPackingNotes,
      voiceRecordingUrl,
      voiceDuration,
      subtotal,
      discountAmount,
      shippingCost,
      totalAmount,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentProvider: 'zarinpal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryOrders.unshift(newOrder);

    // If coupon was used, increment usage count
    if (data.couponCode) {
      const cpn = inMemoryCoupons.find(
        (c) => c.code.toUpperCase() === data.couponCode?.toUpperCase()
      );
      if (cpn) {
        cpn.usedCount = (cpn.usedCount || 0) + 1;
      }
    }

    return newOrder;
  }

  async getMyOrders(userId: string, phone?: string) {
    if (isDbConnected()) {
      try {
        const whereConditions: any[] = [];
        if (userId) whereConditions.push({ userId });
        if (phone) whereConditions.push({ customerPhone: phone });
        
        if (whereConditions.length > 0) {
          const dbOrders = await prisma.order.findMany({
            where: { OR: whereConditions },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
          });
          return dbOrders.map(formatOrderFromPrisma);
        }
      } catch (err) {
        console.warn('Prisma getMyOrders fallback:', err);
      }
    }
    return inMemoryOrders.filter(
      (o) => (userId && o.userId === userId) || (phone && o.customerPhone === phone)
    );
  }

  async getOrders(query?: { userId?: string; phone?: string; status?: string; search?: string }) {
    if (isDbConnected()) {
      try {
        const where: any = {};
        if (query?.userId) where.userId = query.userId;
        if (query?.phone) where.customerPhone = query.phone;
        if (query?.status && query.status !== 'all') where.status = query.status.toUpperCase();
        if (query?.search) {
          where.OR = [
            { orderNumber: { contains: query.search, mode: 'insensitive' } },
            { customerName: { contains: query.search, mode: 'insensitive' } },
            { customerPhone: { contains: query.search } },
          ];
        }
        const dbOrders = await prisma.order.findMany({
          where,
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        });
        return dbOrders.map(formatOrderFromPrisma);
      } catch (err) {
        console.warn('Prisma getOrders fallback:', err);
      }
    }

    let list = [...inMemoryOrders];
    if (query?.userId) {
      list = list.filter((o) => o.userId === query.userId);
    }
    if (query?.phone) {
      list = list.filter((o) => o.customerPhone === query.phone);
    }
    if (query?.status && query.status !== 'all') {
      list = list.filter((o) => o.status === query.status);
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
      );
    }
    return list;
  }

  async getOrderById(id: string) {
    if (isDbConnected()) {
      try {
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { id },
              { orderNumber: id },
            ],
          },
          include: { items: true },
        });
        if (order) return formatOrderFromPrisma(order);
      } catch (err) {
        console.warn('Prisma getOrderById fallback:', err);
      }
    }
    return inMemoryOrders.find((o) => o.id === id || o.orderNumber === id);
  }

  async getAllOrdersAdmin(query?: { status?: string; search?: string }) {
    return this.getOrders(query);
  }

  async updateOrderStatus(id: string, status: string, adminNotes?: string) {
    if (isDbConnected()) {
      try {
        const existing = await prisma.order.findFirst({
          where: { OR: [{ id }, { orderNumber: id }] },
        });
        if (!existing) throw new Error('سفارش مورد نظر یافت نشد.');
        const updated = await prisma.order.update({
          where: { id: existing.id },
          data: {
            status: status.toUpperCase() as any,
            ...(adminNotes !== undefined ? { adminNotes } : {}),
          },
          include: { items: true },
        });
        return formatOrderFromPrisma(updated);
      } catch (err) {
        console.warn('Prisma updateOrderStatus fallback:', err);
      }
    }

    const order = inMemoryOrders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) throw new Error('سفارش مورد نظر یافت نشد.');

    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;
    order.updatedAt = new Date().toISOString();
    return order;
  }
}

export const orderService = new OrderService();
