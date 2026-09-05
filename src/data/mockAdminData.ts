import {
  Order,
  CorporateInquiry,
  StoreSettings,
  Product,
  CustomContentItem,
  Category,
  Coupon,
  ProductReview,
  ConsultationRequest,
  User,
  BlogPost,
  BlogCategory,
  BlogAuthor,
  HomepageCMSConfig,
} from '../types';
import { PRODUCTS, CUSTOM_ITEMS, INITIAL_REVIEWS, INITIAL_COUPONS, HERO_BANNER_IMAGE } from './products';
import { CATEGORIES } from './categories';
import { INITIAL_BLOG_POSTS, INITIAL_BLOG_CATEGORIES, INITIAL_BLOG_AUTHORS } from './blogData';
import { DEFAULT_HOMEPAGE_CMS_CONFIG } from './defaultHomepageCMS';

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'یادمان',
  storeNameFa: 'یادمان | پک‌های هدیه و هدایای سازمانی',
  storeNameEn: 'Yadman Luxury Gifts',
  tagline: 'انتخابی برای هدیه‌های ماندگار',
  announcementText: 'ارسال اکسپرس و رایگان برای سفارش‌های بالای ۳ میلیون تومان | بسته‌بندی هاردباکس و خطاطی کارت هدیه',
  freeShippingThreshold: 3000000,
  supportPhone: '۰۲۱-۸۸۸۸۰۰۰۰',
  corporatePhone: '۰۲۱-۸۸۸۸۰۰۰۰ (داخلی ۱۰۴ و ۱۰۵)',
  corporateEmail: 'corporate@yadman.ir',
  isStoreActive: true,
  customRibbonEnabled: true,
  waxSealEnabled: true,
  freeCalligraphyEnabled: true,
  heroImage: HERO_BANNER_IMAGE,
  defaultMetaTitle: 'یادمان | پک‌های هدیه و هدایای سازمانی',
  defaultMetaDescription: 'یادمان؛ انتخابی برای هدیه‌های ماندگار. ارائه پک‌های هدیه شخصی و سازمانی با امکان شخصی‌سازی و طراحی پک اختصاصی.',
  defaultOgImage: 'https://yadman.ir/og-cover.jpg',
  canonicalBaseUrl: 'https://yadman.ir',
  instagramHandle: 'yadman_gifts',
  telegramHandle: 'yadman_gifts_official',
  homepage: {
    ...DEFAULT_HOMEPAGE_CMS_CONFIG,
    banners: [],
  },
};

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_INQUIRIES: CorporateInquiry[] = [];

export const INITIAL_CONSULTATIONS: ConsultationRequest[] = [];

export const INITIAL_USERS: User[] = [];

// ==========================================
// STORAGE LOADERS & SAVERS (Clean State)
// ==========================================

export const loadOrdersFromStorage = (): Order[] => {
  try {
    const data = localStorage.getItem('yadman_orders') || localStorage.getItem('hedyeh_orders');
    if (!data) {
      return INITIAL_ORDERS;
    }
    const parsed: Order[] = JSON.parse(data);
    // Filter out old demo sample orders if any
    const realOrders = parsed.filter(
      (o) => o.id && !['HD-984210', 'HD-983104', 'HD-981045', 'HD-979402', 'HD-985112'].includes(o.id)
    );
    return realOrders;
  } catch {
    return INITIAL_ORDERS;
  }
};

export const saveOrdersToStorage = (orders: Order[]) => {
  try {
    localStorage.setItem('yadman_orders', JSON.stringify(orders));
    localStorage.setItem('hedyeh_orders', JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
};

export const loadInquiriesFromStorage = (): CorporateInquiry[] => {
  try {
    const data =
      localStorage.getItem('yadman_corporate_inquiries') || localStorage.getItem('hedyeh_corporate_inquiries');
    if (!data) {
      return INITIAL_INQUIRIES;
    }
    const parsed: CorporateInquiry[] = JSON.parse(data);
    const realInquiries = parsed.filter(
      (inq) => inq.id && !['CORP-101', 'CORP-102', 'CORP-103', 'CORP-104'].includes(inq.id)
    );
    return realInquiries;
  } catch {
    return INITIAL_INQUIRIES;
  }
};

export const saveInquiriesToStorage = (inquiries: CorporateInquiry[]) => {
  try {
    localStorage.setItem('yadman_corporate_inquiries', JSON.stringify(inquiries));
    localStorage.setItem('hedyeh_corporate_inquiries', JSON.stringify(inquiries));
  } catch (e) {
    console.error('Failed to save inquiries to localStorage', e);
  }
};

export const loadProductsFromStorage = (): Product[] => {
  try {
    const data =
      localStorage.getItem('yadman_products_v2') ||
      localStorage.getItem('yadman_products') ||
      localStorage.getItem('hedyeh_products');
    if (!data) {
      return PRODUCTS;
    }
    const parsed: Product[] = JSON.parse(data);
    // Filter out old demo sample products
    const demoIds = ['gift-01', 'gift-02', 'gift-03', 'gift-04', 'gift-05', 'gift-06', 'prod-saffron-vip', 'prod-termeh-luxury', 'prod-relax-tea', 'prod-nowruz-special', 'prod-executive-coffee', 'prod-yalda-night'];
    const realProducts = parsed.filter((p) => p.id && !demoIds.includes(p.id));
    return realProducts;
  } catch {
    return PRODUCTS;
  }
};

export const saveProductsToStorage = (products: Product[]) => {
  try {
    localStorage.setItem('yadman_products_v2', JSON.stringify(products));
    localStorage.setItem('yadman_products', JSON.stringify(products));
    localStorage.setItem('hedyeh_products', JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
};

export const loadCategoriesFromStorage = (): Category[] => {
  try {
    const data = localStorage.getItem('hedyeh_categories');
    if (!data) {
      return CATEGORIES;
    }
    const parsed: Category[] = JSON.parse(data);
    // If the storage only contains previous demo categories, filter them or return empty
    const demoCatIds = ['corporate', 'executive', 'gift_boxes', 'nowruz', 'yalda', 'welcome_kits', 'promotional', 'occasions', 'saffron', 'handicraft', 'perfume'];
    const realCats = parsed.filter((c) => c.id && !demoCatIds.includes(c.id));
    return realCats;
  } catch {
    return CATEGORIES;
  }
};

export const saveCategoriesToStorage = (categories: Category[]) => {
  try {
    localStorage.setItem('hedyeh_categories', JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories to localStorage', e);
  }
};

export const loadCouponsFromStorage = (): Coupon[] => {
  try {
    const data = localStorage.getItem('hedyeh_coupons');
    if (!data) {
      return INITIAL_COUPONS;
    }
    const parsed: Coupon[] = JSON.parse(data);
    const demoCodes = ['HEDYEH10', 'VIPGIFT', 'NOROOZ1403', 'YALDA', 'NOWRUZ1403', 'YADMAN10'];
    const realCoupons = parsed.filter((c) => c.code && !demoCodes.includes(c.code));
    return realCoupons;
  } catch {
    return INITIAL_COUPONS;
  }
};

export const saveCouponsToStorage = (coupons: Coupon[]) => {
  try {
    localStorage.setItem('hedyeh_coupons', JSON.stringify(coupons));
  } catch (e) {
    console.error('Failed to save coupons to localStorage', e);
  }
};

export const loadReviewsFromStorage = (): ProductReview[] => {
  try {
    const data = localStorage.getItem('hedyeh_reviews');
    if (!data) {
      return INITIAL_REVIEWS;
    }
    const parsed: ProductReview[] = JSON.parse(data);
    const demoRevIds = ['rev-01', 'rev-02', 'rev-03', 'rev-04', 'rev-05', 'rev-1', 'rev-2'];
    const realReviews = parsed.filter((r) => r.id && !demoRevIds.includes(r.id));
    return realReviews;
  } catch {
    return INITIAL_REVIEWS;
  }
};

export const saveReviewsToStorage = (reviews: ProductReview[]) => {
  try {
    localStorage.setItem('hedyeh_reviews', JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save reviews to localStorage', e);
  }
};

export const loadCustomItemsFromStorage = (): CustomContentItem[] => {
  try {
    const data = localStorage.getItem('yadman_custom_items') || localStorage.getItem('hedyeh_custom_items');
    if (!data) {
      return CUSTOM_ITEMS;
    }
    const parsed: CustomContentItem[] = JSON.parse(data);
    const demoItemIds = [
      'item-saffron-5m',
      'item-cardamom-50g',
      'item-brass-mortar',
      'item-rosebud-jar',
      'item-gaz-kermani',
      'item-sohan-asali',
      'item-borage-flower',
      'item-honey-candle',
      'item-hafez-divan',
      'item-nuts-four',
      'item-minakari-vase',
      'item-saffron-khatam',
      'item-termeh-silk',
      'item-copper-vase',
      'item-incense-burner',
      'item-pistachio-jar',
    ];
    const realItems = parsed.filter((i) => i.id && !demoItemIds.includes(i.id));
    return realItems;
  } catch {
    return CUSTOM_ITEMS;
  }
};

export const saveCustomItemsToStorage = (items: CustomContentItem[]) => {
  try {
    localStorage.setItem('yadman_custom_items', JSON.stringify(items));
    localStorage.setItem('hedyeh_custom_items', JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save custom items to localStorage', e);
  }
};

export const loadStoreSettingsFromStorage = (): StoreSettings => {
  try {
    const data = localStorage.getItem('yadman_store_settings') || localStorage.getItem('hedyeh_store_settings');
    const directHero = localStorage.getItem('yadman_hero_image');

    if (!data) {
      const initial: StoreSettings = {
        ...INITIAL_STORE_SETTINGS,
        heroImage: directHero || HERO_BANNER_IMAGE,
        homepage: {
          ...DEFAULT_HOMEPAGE_CMS_CONFIG,
          banners: [],
          hero: {
            ...DEFAULT_HOMEPAGE_CMS_CONFIG.hero,
            heroImage: directHero || HERO_BANNER_IMAGE,
          },
        },
      };
      localStorage.setItem('yadman_store_settings', JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    if (!parsed.heroImage && directHero) {
      parsed.heroImage = directHero;
    }

    const mergedHomepage: HomepageCMSConfig = {
      ...DEFAULT_HOMEPAGE_CMS_CONFIG,
      ...(parsed.homepage || {}),
      banners: parsed.homepage?.banners || [],
      sectionOrder: parsed.homepage?.sectionOrder || DEFAULT_HOMEPAGE_CMS_CONFIG.sectionOrder,
      header: {
        ...DEFAULT_HOMEPAGE_CMS_CONFIG.header,
        ...(parsed.homepage?.header || {}),
        navItems: parsed.homepage?.header?.navItems || DEFAULT_HOMEPAGE_CMS_CONFIG.header.navItems,
      },
      hero: {
        ...DEFAULT_HOMEPAGE_CMS_CONFIG.hero,
        ...(parsed.homepage?.hero || {}),
        heroImage: parsed.homepage?.hero?.heroImage || parsed.heroImage || directHero || HERO_BANNER_IMAGE,
        benefits: parsed.homepage?.hero?.benefits || DEFAULT_HOMEPAGE_CMS_CONFIG.hero.benefits,
      },
      products: {
        ...DEFAULT_HOMEPAGE_CMS_CONFIG.products,
        ...(parsed.homepage?.products || {}),
      },
      consultation: {
        ...DEFAULT_HOMEPAGE_CMS_CONFIG.consultation,
        ...(parsed.homepage?.consultation || {}),
        benefits: parsed.homepage?.consultation?.benefits || DEFAULT_HOMEPAGE_CMS_CONFIG.consultation.benefits,
        cardItems: parsed.homepage?.consultation?.cardItems || DEFAULT_HOMEPAGE_CMS_CONFIG.consultation.cardItems,
      },
      corporate: {
        ...DEFAULT_HOMEPAGE_CMS_CONFIG.corporate,
        ...(parsed.homepage?.corporate || {}),
        features: parsed.homepage?.corporate?.features || DEFAULT_HOMEPAGE_CMS_CONFIG.corporate.features,
        discountTiers:
          parsed.homepage?.corporate?.discountTiers || DEFAULT_HOMEPAGE_CMS_CONFIG.corporate.discountTiers,
      },
      blog: {
        ...DEFAULT_HOMEPAGE_CMS_CONFIG.blog,
        ...(parsed.homepage?.blog || {}),
      },
      footer: {
        ...DEFAULT_HOMEPAGE_CMS_CONFIG.footer,
        ...(parsed.homepage?.footer || {}),
        guarantees: parsed.homepage?.footer?.guarantees || DEFAULT_HOMEPAGE_CMS_CONFIG.footer.guarantees,
        quickLinks: parsed.homepage?.footer?.quickLinks || DEFAULT_HOMEPAGE_CMS_CONFIG.footer.quickLinks,
      },
      seo: {
        ...DEFAULT_HOMEPAGE_CMS_CONFIG.seo,
        ...(parsed.homepage?.seo || {}),
        ogImage: parsed.homepage?.seo?.ogImage || parsed.defaultOgImage || HERO_BANNER_IMAGE,
      },
      global: {
        ...DEFAULT_HOMEPAGE_CMS_CONFIG.global,
        ...(parsed.homepage?.global || {}),
        websiteName: parsed.homepage?.global?.websiteName || parsed.storeName || 'یادمان',
        phone: parsed.homepage?.global?.phone || parsed.supportPhone || '۰۲۱-۸۸۸۸۰۰۰۰',
      },
    };

    const finalSettings: StoreSettings = {
      ...INITIAL_STORE_SETTINGS,
      ...parsed,
      heroImage: parsed.heroImage || mergedHomepage.hero.heroImage,
      homepage: mergedHomepage,
    };

    return finalSettings;
  } catch {
    return INITIAL_STORE_SETTINGS;
  }
};

export const saveStoreSettingsToStorage = (settings: StoreSettings) => {
  try {
    localStorage.setItem('yadman_store_settings', JSON.stringify(settings));
    if (settings.heroImage) {
      localStorage.setItem('yadman_hero_image', settings.heroImage);
    }
  } catch (e) {
    console.error('Failed to save store settings to localStorage', e);
  }
};

export const loadConsultationsFromStorage = (): ConsultationRequest[] => {
  try {
    const data = localStorage.getItem('hedyeh_consultations');
    if (!data) {
      return INITIAL_CONSULTATIONS;
    }
    const parsed: ConsultationRequest[] = JSON.parse(data);
    const demoCnsIds = ['CNS-9041', 'CNS-9038', 'CNS-9032', 'CNS-9029', 'CNS-9025'];
    const realConsultations = parsed.filter((c) => c.id && !demoCnsIds.includes(c.id));
    return realConsultations;
  } catch {
    return INITIAL_CONSULTATIONS;
  }
};

export const saveConsultationsToStorage = (consultations: ConsultationRequest[]) => {
  try {
    localStorage.setItem('hedyeh_consultations', JSON.stringify(consultations));
  } catch (e) {
    console.error('Failed to save consultations to localStorage', e);
  }
};

export const loadUsersFromStorage = (): User[] => {
  try {
    const data = localStorage.getItem('hedyeh_users');
    if (!data) {
      return INITIAL_USERS;
    }
    const parsed: User[] = JSON.parse(data);
    const demoUserIds = ['USR-1001', 'USR-1002', 'USR-1003'];
    const realUsers = parsed.filter((u) => u.id && !demoUserIds.includes(u.id));
    return realUsers;
  } catch {
    return INITIAL_USERS;
  }
};

export const saveUsersToStorage = (users: User[]) => {
  try {
    localStorage.setItem('hedyeh_users', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
};

export const loadCurrentUserFromStorage = (): User | null => {
  try {
    const data = localStorage.getItem('hedyeh_current_user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveCurrentUserToStorage = (user: User) => {
  try {
    localStorage.setItem('hedyeh_current_user', JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save current user to localStorage', e);
  }
};

export const removeCurrentUserFromStorage = () => {
  try {
    localStorage.removeItem('hedyeh_current_user');
  } catch (e) {
    console.error('Failed to remove current user from localStorage', e);
  }
};

// ==========================================
// BLOG CMS STORAGE LOADERS & SAVERS
// ==========================================

export const loadBlogPostsFromStorage = (): BlogPost[] => {
  try {
    const data = localStorage.getItem('hedyeh_blog_posts');
    if (!data) {
      return INITIAL_BLOG_POSTS;
    }
    const parsed: BlogPost[] = JSON.parse(data);
    const demoPostIds = ['post-1', 'post-2', 'post-3', 'post-4', 'post-5', 'post-6'];
    const realPosts = parsed.filter((p) => p.id && !demoPostIds.includes(p.id));
    return realPosts;
  } catch {
    return INITIAL_BLOG_POSTS;
  }
};

export const saveBlogPostsToStorage = (posts: BlogPost[]) => {
  try {
    localStorage.setItem('hedyeh_blog_posts', JSON.stringify(posts));
  } catch (e) {
    console.error('Failed to save blog posts to localStorage', e);
  }
};

export const loadBlogCategoriesFromStorage = (): BlogCategory[] => {
  try {
    const data = localStorage.getItem('hedyeh_blog_categories');
    if (!data) {
      return INITIAL_BLOG_CATEGORIES;
    }
    const parsed: BlogCategory[] = JSON.parse(data);
    const demoCatIds = ['cat-guide', 'cat-corporate', 'cat-ideas', 'cat-occasions', 'cat-packaging', 'cat-executive', 'cat-custom'];
    const realCats = parsed.filter((c) => c.id && !demoCatIds.includes(c.id));
    return realCats;
  } catch {
    return INITIAL_BLOG_CATEGORIES;
  }
};

export const saveBlogCategoriesToStorage = (categories: BlogCategory[]) => {
  try {
    localStorage.setItem('hedyeh_blog_categories', JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save blog categories to localStorage', e);
  }
};

export const loadBlogAuthorsFromStorage = (): BlogAuthor[] => {
  try {
    const data = localStorage.getItem('hedyeh_blog_authors');
    if (!data) {
      return INITIAL_BLOG_AUTHORS;
    }
    const parsed: BlogAuthor[] = JSON.parse(data);
    const demoAuthorIds = ['author-1', 'author-2', 'author-3'];
    const realAuthors = parsed.filter((a) => a.id && !demoAuthorIds.includes(a.id));
    return realAuthors;
  } catch {
    return INITIAL_BLOG_AUTHORS;
  }
};

export const saveBlogAuthorsToStorage = (authors: BlogAuthor[]) => {
  try {
    localStorage.setItem('hedyeh_blog_authors', JSON.stringify(authors));
  } catch (e) {
    console.error('Failed to save blog authors to localStorage', e);
  }
};
