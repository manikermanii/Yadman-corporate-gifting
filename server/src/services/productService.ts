import { prisma, isDbConnected } from '../config/database.js';
import { initialStoreData } from '../utils/initialStoreData.js';

// In-memory fallback cache
let inMemoryProducts = [...initialStoreData.products];
let inMemoryCategories = [...initialStoreData.categories];

function formatProductFromPrisma(p: any) {
  return {
    id: p.id,
    titleFa: p.titleFa,
    titleEn: p.titleEn,
    sku: p.sku,
    slug: p.slug,
    category: p.categoryId,
    categoryId: p.categoryId,
    price: p.price,
    oldPrice: p.oldPrice,
    discountPercent: p.discountPercent || 0,
    rating: p.rating || 5.0,
    reviewsCount: p.reviewsCount || 0,
    salesCount: p.salesCount || 0,
    description: p.description || '',
    image: p.image || '',
    itemsIncluded: typeof p.itemsIncluded === 'string' ? JSON.parse(p.itemsIncluded || '[]') : (p.itemsIncluded || []),
    boxType: p.boxType || 'هاردباکس لوکس',
    ribbonColor: p.ribbonColor || 'زرشکی',
    ribbonColorHex: p.ribbonColorHex || '#8B0000',
    waxSeal: p.waxSeal || 'مهر موم طلایی',
    badge: p.badge || undefined,
    weightGrams: p.weightGrams || 500,
    dimensions: p.dimensions || undefined,
    materials: p.materials || undefined,
    shippingInfo: p.shippingInfo || undefined,
    customizationOptions: p.customizationOptions || undefined,
    inStock: p.inStock !== false,
    stockQuantity: p.stockQuantity ?? 15,
    lowStockThreshold: p.lowStockThreshold ?? 3,
    status: p.status ? p.status.toLowerCase() : 'active',
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags || []),
    occasions: typeof p.occasions === 'string' ? JSON.parse(p.occasions || '[]') : (p.occasions || []),
    giftType: p.giftType || undefined,
    boxPackagingType: p.boxPackagingType || undefined,
    suitableFor: typeof p.suitableFor === 'string' ? JSON.parse(p.suitableFor || '[]') : (p.suitableFor || []),
    brandOrigin: p.brandOrigin || undefined,
    featured: Boolean(p.featured),
    isB2BRecommended: Boolean(p.isB2BRecommended),
    additionalImages: p.images ? p.images.map((img: any) => img.url) : [],
    videos: p.videos || [],
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
  };
}

function formatCategoryFromPrisma(c: any) {
  return {
    id: c.id,
    nameFa: c.nameFa,
    nameEn: c.nameEn,
    slug: c.slug,
    descriptionFa: c.descriptionFa || '',
    iconName: c.iconName || 'Gift',
    isFeatured: Boolean(c.isFeatured),
    productsCount: c._count?.products || 0,
  };
}

export class ProductService {
  async getProducts(query: {
    category?: string;
    searchQuery?: string;
    minPrice?: number;
    maxPrice?: number;
    occasions?: string[];
    giftTypes?: string[];
    boxPackagingTypes?: string[];
    suitableFor?: string[];
    brandOrigins?: string[];
    inStockOnly?: boolean;
    discountOnly?: boolean;
    minRating?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
    isB2BRecommended?: boolean;
    status?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 24));
    const skip = (page - 1) * limit;

    let items: any[] = [];

    if (isDbConnected()) {
      try {
        const dbProducts = await prisma.product.findMany({
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            videos: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          },
        });
        items = dbProducts.map(formatProductFromPrisma);
      } catch (err) {
        console.warn('Fallback to in-memory products:', err);
        items = [...inMemoryProducts];
      }
    } else {
      items = [...inMemoryProducts];
    }

    // Status filter
    const requestedStatus = (query.status || 'active').toLowerCase();
    items = items.filter((p) => (p.status || 'active').toLowerCase() === requestedStatus);

    // Category filter
    if (query.category && query.category !== 'all') {
      items = items.filter((p) => p.category === query.category || p.categoryId === query.category);
    }

    // Search query
    if (query.searchQuery && query.searchQuery.trim()) {
      const q = query.searchQuery.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.titleFa.toLowerCase().includes(q) ||
          (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.sku.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    // Price range
    if (typeof query.minPrice === 'number' && query.minPrice > 0) {
      items = items.filter((p) => p.price >= query.minPrice!);
    }
    if (typeof query.maxPrice === 'number' && query.maxPrice > 0) {
      items = items.filter((p) => p.price <= query.maxPrice!);
    }

    // Occasions
    if (query.occasions && query.occasions.length > 0) {
      items = items.filter((p) =>
        p.occasions && query.occasions!.some((occ) => p.occasions?.includes(occ))
      );
    }

    // Gift Types
    if (query.giftTypes && query.giftTypes.length > 0) {
      items = items.filter((p) => p.giftType && query.giftTypes!.includes(p.giftType));
    }

    // Box packaging types
    if (query.boxPackagingTypes && query.boxPackagingTypes.length > 0) {
      items = items.filter((p) => p.boxPackagingType && query.boxPackagingTypes!.includes(p.boxPackagingType));
    }

    // Suitable for
    if (query.suitableFor && query.suitableFor.length > 0) {
      items = items.filter((p) =>
        p.suitableFor && query.suitableFor!.some((s: string) => p.suitableFor?.includes(s))
      );
    }

    // Brand Origins
    if (query.brandOrigins && query.brandOrigins.length > 0) {
      items = items.filter((p) => p.brandOrigin && query.brandOrigins!.includes(p.brandOrigin));
    }

    // In-stock only
    if (query.inStockOnly) {
      items = items.filter((p) => p.inStock && (p.stockQuantity ?? 1) > 0);
    }

    // Discount only
    if (query.discountOnly) {
      items = items.filter((p) => (p.discountPercent || 0) > 0);
    }

    // Min rating
    if (typeof query.minRating === 'number' && query.minRating > 0) {
      items = items.filter((p) => (p.rating || 5.0) >= query.minRating!);
    }

    // Featured
    if (query.featured !== undefined) {
      items = items.filter((p) => Boolean(p.featured) === query.featured);
    }

    // Sorting
    switch (query.sortBy) {
      case 'price_asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        break;
      case 'popular':
        items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'discount':
        items.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        break;
      case 'bestseller':
      default:
        items.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
    }

    const total = items.length;
    const paginatedItems = items.slice(skip, skip + limit);

    return {
      products: paginatedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getProductBySlugOrId(identifier: string) {
    if (isDbConnected()) {
      try {
        const prod = await prisma.product.findFirst({
          where: {
            OR: [
              { id: identifier },
              { slug: identifier },
              { sku: identifier },
            ],
          },
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            videos: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          },
        });
        if (prod) return formatProductFromPrisma(prod);
      } catch (err) {
        console.warn('Prisma getProductBySlugOrId error, falling back:', err);
      }
    }
    const product = inMemoryProducts.find(
      (p) => p.id === identifier || p.slug === identifier || p.sku === identifier
    );
    return product || null;
  }

  async getProductById(id: string) {
    return this.getProductBySlugOrId(id);
  }

  async createProduct(data: any) {
    const slug =
      data.slug ||
      data.titleFa
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FF\w-]/g, '') ||
      `product-${Date.now()}`;

    if (isDbConnected()) {
      const created = await prisma.product.create({
        data: {
          id: data.id || `PRD-${Date.now().toString().slice(-5)}`,
          titleFa: data.titleFa,
          titleEn: data.titleEn || null,
          sku: data.sku || `SKU-${Date.now()}`,
          slug,
          categoryId: data.categoryId || data.category,
          price: Number(data.price),
          oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
          discountPercent: data.discountPercent ? Number(data.discountPercent) : 0,
          description: data.description || '',
          image: data.image || '',
          itemsIncluded: JSON.stringify(data.itemsIncluded || []),
          boxType: data.boxType || 'هاردباکس لوکس',
          ribbonColor: data.ribbonColor || 'زرشکی',
          ribbonColorHex: data.ribbonColorHex || '#8B0000',
          waxSeal: data.waxSeal || 'مهر موم طلایی',
          badge: data.badge || null,
          weightGrams: data.weightGrams ? Number(data.weightGrams) : 500,
          dimensions: data.dimensions || null,
          materials: data.materials || null,
          shippingInfo: data.shippingInfo || null,
          customizationOptions: data.customizationOptions || null,
          inStock: data.inStock !== false,
          stockQuantity: data.stockQuantity ? Number(data.stockQuantity) : 15,
          lowStockThreshold: data.lowStockThreshold ? Number(data.lowStockThreshold) : 3,
          status: (data.status || 'ACTIVE').toUpperCase(),
          tags: JSON.stringify(data.tags || []),
          occasions: JSON.stringify(data.occasions || []),
          giftType: data.giftType || null,
          boxPackagingType: data.boxPackagingType || null,
          suitableFor: JSON.stringify(data.suitableFor || []),
          brandOrigin: data.brandOrigin || null,
          featured: Boolean(data.featured),
          isB2BRecommended: Boolean(data.isB2BRecommended),
          seoTitle: data.seoTitle || data.titleFa,
          seoDescription: data.seoDescription || data.description?.slice(0, 160) || null,
        },
        include: {
          images: true,
          videos: true,
        },
      });
      return formatProductFromPrisma(created);
    }

    const newProduct = {
      ...data,
      id: `PRD-${Date.now().toString().slice(-5)}`,
      slug,
      rating: 5.0,
      reviewsCount: 0,
      salesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryProducts.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, data: any) {
    if (isDbConnected()) {
      const updatePayload: any = {};
      if (data.titleFa !== undefined) updatePayload.titleFa = data.titleFa;
      if (data.titleEn !== undefined) updatePayload.titleEn = data.titleEn;
      if (data.sku !== undefined) updatePayload.sku = data.sku;
      if (data.slug !== undefined) updatePayload.slug = data.slug;
      if (data.category !== undefined || data.categoryId !== undefined) {
        updatePayload.categoryId = data.categoryId || data.category;
      }
      if (data.price !== undefined) updatePayload.price = Number(data.price);
      if (data.oldPrice !== undefined) updatePayload.oldPrice = data.oldPrice ? Number(data.oldPrice) : null;
      if (data.discountPercent !== undefined) updatePayload.discountPercent = Number(data.discountPercent);
      if (data.description !== undefined) updatePayload.description = data.description;
      if (data.image !== undefined) updatePayload.image = data.image;
      if (data.itemsIncluded !== undefined) updatePayload.itemsIncluded = JSON.stringify(data.itemsIncluded);
      if (data.boxType !== undefined) updatePayload.boxType = data.boxType;
      if (data.ribbonColor !== undefined) updatePayload.ribbonColor = data.ribbonColor;
      if (data.ribbonColorHex !== undefined) updatePayload.ribbonColorHex = data.ribbonColorHex;
      if (data.waxSeal !== undefined) updatePayload.waxSeal = data.waxSeal;
      if (data.badge !== undefined) updatePayload.badge = data.badge;
      if (data.weightGrams !== undefined) updatePayload.weightGrams = Number(data.weightGrams);
      if (data.dimensions !== undefined) updatePayload.dimensions = data.dimensions;
      if (data.materials !== undefined) updatePayload.materials = data.materials;
      if (data.shippingInfo !== undefined) updatePayload.shippingInfo = data.shippingInfo;
      if (data.customizationOptions !== undefined) updatePayload.customizationOptions = data.customizationOptions;
      if (data.inStock !== undefined) updatePayload.inStock = Boolean(data.inStock);
      if (data.stockQuantity !== undefined) updatePayload.stockQuantity = Number(data.stockQuantity);
      if (data.lowStockThreshold !== undefined) updatePayload.lowStockThreshold = Number(data.lowStockThreshold);
      if (data.status !== undefined) updatePayload.status = String(data.status).toUpperCase();
      if (data.tags !== undefined) updatePayload.tags = JSON.stringify(data.tags);
      if (data.occasions !== undefined) updatePayload.occasions = JSON.stringify(data.occasions);
      if (data.giftType !== undefined) updatePayload.giftType = data.giftType;
      if (data.boxPackagingType !== undefined) updatePayload.boxPackagingType = data.boxPackagingType;
      if (data.suitableFor !== undefined) updatePayload.suitableFor = JSON.stringify(data.suitableFor);
      if (data.brandOrigin !== undefined) updatePayload.brandOrigin = data.brandOrigin;
      if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
      if (data.isB2BRecommended !== undefined) updatePayload.isB2BRecommended = Boolean(data.isB2BRecommended);

      const updated = await prisma.product.update({
        where: { id },
        data: updatePayload,
        include: {
          images: true,
          videos: true,
        },
      });
      return formatProductFromPrisma(updated);
    }

    const index = inMemoryProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('محصول مورد نظر یافت نشد.');
    }

    const updated = {
      ...inMemoryProducts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    inMemoryProducts[index] = updated;
    return updated;
  }

  async deleteProduct(id: string) {
    if (isDbConnected()) {
      const deleted = await prisma.product.delete({
        where: { id },
      });
      return formatProductFromPrisma(deleted);
    }
    const index = inMemoryProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('محصول مورد نظر یافت نشد.');
    }
    const [deleted] = inMemoryProducts.splice(index, 1);
    return deleted;
  }

  async updateStock(id: string, quantityChange: number) {
    if (isDbConnected()) {
      const prod = await prisma.product.findUnique({ where: { id } });
      if (!prod) return null;
      const newQty = Math.max(0, prod.stockQuantity + quantityChange);
      const updated = await prisma.product.update({
        where: { id },
        data: {
          stockQuantity: newQty,
          inStock: newQty > 0,
        },
      });
      return formatProductFromPrisma(updated);
    }
    const index = inMemoryProducts.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const product = inMemoryProducts[index];
    const newQty = Math.max(0, (product.stockQuantity || 0) + quantityChange);
    product.stockQuantity = newQty;
    product.inStock = newQty > 0;
    return product;
  }
}

export class CategoryService {
  async getCategories() {
    if (isDbConnected()) {
      try {
        const categories = await prisma.category.findMany({
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: { nameFa: 'asc' },
        });
        return categories.map(formatCategoryFromPrisma);
      } catch (err) {
        console.warn('Prisma getCategories error, falling back:', err);
      }
    }
    return inMemoryCategories;
  }

  async getCategoryBySlug(slug: string) {
    if (isDbConnected()) {
      try {
        const cat = await prisma.category.findFirst({
          where: {
            OR: [
              { slug },
              { id: slug },
            ],
          },
          include: {
            _count: {
              select: { products: true },
            },
          },
        });
        if (cat) return formatCategoryFromPrisma(cat);
      } catch (err) {
        console.warn('Prisma getCategoryBySlug error, falling back:', err);
      }
    }
    return inMemoryCategories.find((c) => c.slug === slug || c.id === slug) || null;
  }

  async createCategory(data: any) {
    const id = data.id || `cat_${Date.now()}`;
    if (isDbConnected()) {
      const created = await prisma.category.create({
        data: {
          id,
          nameFa: data.nameFa,
          nameEn: data.nameEn || '',
          slug: data.slug || id,
          descriptionFa: data.descriptionFa || '',
          iconName: data.iconName || 'Gift',
          isFeatured: Boolean(data.isFeatured),
        },
      });
      return formatCategoryFromPrisma(created);
    }
    const newCategory = { ...data, id };
    inMemoryCategories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: string, data: any) {
    if (isDbConnected()) {
      const updated = await prisma.category.update({
        where: { id },
        data: {
          nameFa: data.nameFa,
          nameEn: data.nameEn,
          slug: data.slug,
          descriptionFa: data.descriptionFa,
          iconName: data.iconName,
          isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : undefined,
        },
      });
      return formatCategoryFromPrisma(updated);
    }
    const index = inMemoryCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('دسته‌بندی یافت نشد.');
    inMemoryCategories[index] = { ...inMemoryCategories[index], ...data };
    return inMemoryCategories[index];
  }

  async deleteCategory(id: string) {
    if (isDbConnected()) {
      const hasProducts = await prisma.product.count({ where: { categoryId: id } });
      if (hasProducts > 0) {
        throw new Error('امکان حذف این دسته‌بندی وجود ندارد چون محصولاتی به آن متصل هستند.');
      }
      const deleted = await prisma.category.delete({ where: { id } });
      return formatCategoryFromPrisma(deleted);
    }
    const hasProducts = inMemoryProducts.some((p) => p.category === id);
    if (hasProducts) {
      throw new Error('امکان حذف این دسته‌بندی وجود ندارد چون محصولاتی به آن متصل هستند.');
    }
    const index = inMemoryCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('دسته‌بندی یافت نشد.');
    const [deleted] = inMemoryCategories.splice(index, 1);
    return deleted;
  }
}

export const productService = new ProductService();
export const categoryService = new CategoryService();
