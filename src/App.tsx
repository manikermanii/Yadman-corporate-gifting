/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CustomBoxBuilder } from './components/CustomBoxBuilder';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CorporateGiftSection } from './components/CorporateGiftSection';
import { CorporateLandingPage } from './components/CorporateLandingPage';
import { ConsultationSection } from './components/ConsultationSection';
import { ConsultationPage } from './components/ConsultationPage';
import { AiGiftConcierge } from './components/AiGiftConcierge';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { ShopCatalogView } from './components/shop/ShopCatalogView';
import { PromotionalBannersSection } from './components/common/PromotionalBannersSection';
import { Sparkles } from 'lucide-react';

// Blog Components
import { BlogIndexPage } from './components/blog/BlogIndexPage';
import { BlogArticlePage } from './components/blog/BlogArticlePage';
import { HomeBlogSection } from './components/blog/HomeBlogSection';

// Authentication & User Components
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { UserAccountDashboard } from './components/account/UserAccountDashboard';

import {
  mergeCarts,
  getPersianNowString,
} from './utils/authService';
import {
  getAdminSession,
  clearAdminSession,
  AdminSession,
} from './utils/adminAuthService';
import {
  DEFAULT_FILTER_STATE,
  parseFiltersFromUrl,
  serializeFiltersToUrl,
} from './utils/filterEngine';

import { RIBBONS, WAX_SEALS, INITIAL_COUPONS, INITIAL_REVIEWS } from './data/products';
import { CATEGORIES } from './data/categories';
import {
  Product,
  CategoryId,
  CartItem,
  RibbonOption,
  WaxSealOption,
  BoxTypeOption,
  CustomContentItem,
  Order,
  CorporateInquiry,
  StoreSettings,
  Category,
  Coupon,
  ProductReview,
  ConsultationRequest,
  ConsultationCustomerType,
  User,
  ProductFilterState,
  BlogPost,
  BlogCategory,
  BlogAuthor,
  VoiceRecordingData,
} from './types';
import {
  loadOrdersFromStorage,
  loadInquiriesFromStorage,
  loadConsultationsFromStorage,
  loadProductsFromStorage,
  loadCustomItemsFromStorage,
  loadStoreSettingsFromStorage,
  loadCategoriesFromStorage,
  loadCouponsFromStorage,
  loadReviewsFromStorage,
  loadUsersFromStorage,
  loadCurrentUserFromStorage,
  loadBlogPostsFromStorage,
  loadBlogCategoriesFromStorage,
  loadBlogAuthorsFromStorage,
  saveOrdersToStorage,
  saveInquiriesToStorage,
  saveConsultationsToStorage,
  saveProductsToStorage,
  saveCustomItemsToStorage,
  saveStoreSettingsToStorage,
  saveCategoriesToStorage,
  saveCouponsToStorage,
  saveReviewsToStorage,
  saveUsersToStorage,
  saveCurrentUserToStorage,
  saveBlogPostsToStorage,
  saveBlogCategoriesToStorage,
  saveBlogAuthorsToStorage,
} from './data/mockAdminData';

const normalizeTab = (rawTab: string): string => {
  if (!rawTab) return 'home';
  const clean = rawTab.startsWith('nav-') ? rawTab.replace(/^nav-/, '') : rawTab;
  if (clean === 'b2b') return 'corporate';
  if (clean === 'custom-box') return 'builder';
  if (clean === 'shop' || clean === 'products') return 'catalog';
  return clean;
};

export default function App() {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => getAdminSession());
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    const p = window.location.pathname;
    const h = window.location.hash;
    return p === '/admin' || p.startsWith('/admin/') || h === '#admin';
  });
  const [activeTab, setActiveTab] = useState<string>('home');
  const [accountSubTab, setAccountSubTab] = useState<string>('overview');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [consultationCustomerType, setConsultationCustomerType] = useState<ConsultationCustomerType>('personal');

  // Unified Product Filter State & URL Sync
  const [filters, setFilters] = useState<ProductFilterState>(() => {
    return parseFiltersFromUrl(window.location.search, DEFAULT_FILTER_STATE);
  });

  // Auth Modal State ('login' | 'register' | 'forgot_password' | null)
  const [authModal, setAuthModal] = useState<'login' | 'register' | 'forgot_password' | null>(null);

  // Persistent Users & Authentication State
  const [users, setUsers] = useState<User[]>(loadUsersFromStorage);
  const [currentUser, setCurrentUser] = useState<User | null>(loadCurrentUserFromStorage);

  // Persistent Admin State
  const [orders, setOrders] = useState<Order[]>(loadOrdersFromStorage);
  const [inquiries, setInquiries] = useState<CorporateInquiry[]>(loadInquiriesFromStorage);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>(loadConsultationsFromStorage);
  const [products, setProducts] = useState<Product[]>(loadProductsFromStorage);
  const [customItems, setCustomItems] = useState<CustomContentItem[]>(loadCustomItemsFromStorage);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(loadStoreSettingsFromStorage);
  const [categories, setCategories] = useState<Category[]>(loadCategoriesFromStorage);
  const [coupons, setCoupons] = useState<Coupon[]>(loadCouponsFromStorage);
  const [reviews, setReviews] = useState<ProductReview[]>(loadReviewsFromStorage);

  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Blog State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(loadBlogPostsFromStorage);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>(loadBlogCategoriesFromStorage);
  const [blogAuthors, setBlogAuthors] = useState<BlogAuthor[]>(loadBlogAuthorsFromStorage);
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(null);
  const [activeBlogCategorySlug, setActiveBlogCategorySlug] = useState<string | null>(null);

  // Sync blog data to storage
  useEffect(() => {
    saveBlogPostsToStorage(blogPosts);
  }, [blogPosts]);

  useEffect(() => {
    saveBlogCategoriesToStorage(blogCategories);
  }, [blogCategories]);

  useEffect(() => {
    saveBlogAuthorsToStorage(blogAuthors);
  }, [blogAuthors]);

  // Sync filters to URL query string when on catalog page
  useEffect(() => {
    if (activeTab === 'catalog') {
      const urlQuery = serializeFiltersToUrl(filters);
      const newUrl = `/catalog${urlQuery}`;
      window.history.replaceState({ filters, tab: 'catalog' }, '', newUrl);
    }
  }, [filters, activeTab]);

  // Handle URL path initialization and popstate synchronization
  const syncRouteFromLocation = useCallback(() => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    if (pathname === '/admin' || pathname.startsWith('/admin') || hash === '#admin') {
      setIsAdminView(true);
      return;
    }

    setIsAdminView(false);

    if (pathname.startsWith('/blog/category/')) {
      const catSlug = pathname.replace('/blog/category/', '').replace(/\/$/, '');
      setActiveBlogCategorySlug(catSlug);
      setActiveArticleSlug(null);
      setActiveTab('blog');
    } else if (pathname.startsWith('/blog/')) {
      const slug = pathname.replace('/blog/', '').replace(/\/$/, '');
      if (slug) {
        setActiveArticleSlug(slug);
        setActiveTab('blog-article');
      } else {
        setActiveTab('blog');
      }
    } else if (pathname === '/blog') {
      setActiveArticleSlug(null);
      setActiveBlogCategorySlug(null);
      setActiveTab('blog');
    } else if (pathname === '/catalog' || pathname === '/shop' || pathname === '/products') {
      setFilters(parseFiltersFromUrl(window.location.search, DEFAULT_FILTER_STATE));
      setActiveTab('catalog');
    } else if (pathname === '/corporate' || pathname === '/b2b') {
      setActiveTab('corporate');
    } else if (pathname === '/consultation') {
      setActiveTab('consultation');
    } else if (pathname === '/builder' || pathname === '/custom-box') {
      setActiveTab('builder');
    } else if (pathname === '/account') {
      setActiveTab('account');
    } else if (pathname === '/ai') {
      setActiveTab('ai');
    } else {
      setActiveTab('home');
    }
  }, []);

  useEffect(() => {
    syncRouteFromLocation();
    const handlePopState = () => {
      syncRouteFromLocation();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncRouteFromLocation]);

  // Blog Navigation Handlers
  const handleNavigateToBlog = (catSlug?: string) => {
    setActiveBlogCategorySlug(catSlug || null);
    setActiveArticleSlug(null);
    setActiveTab('blog');
    const newUrl = catSlug ? `/blog/category/${catSlug}` : '/blog';
    window.history.pushState({ tab: 'blog' }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToArticle = (slug: string) => {
    setActiveArticleSlug(slug);
    setActiveTab('blog-article');
    window.history.pushState({ tab: 'blog-article', slug }, '', `/blog/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Main Unified Tab Navigation Handler
  const handleNavigateTab = (
    rawTab: string,
    options?: { scrollToTop?: boolean; replaceUrl?: boolean }
  ) => {
    const tab = normalizeTab(rawTab);
    setIsAdminView(false);

    if (tab === 'blog') {
      handleNavigateToBlog();
      return;
    }

    setActiveArticleSlug(null);
    setActiveBlogCategorySlug(null);
    setActiveTab(tab);

    let targetPath = '/';
    if (tab === 'catalog') targetPath = '/catalog';
    else if (tab === 'corporate') targetPath = '/corporate';
    else if (tab === 'consultation') targetPath = '/consultation';
    else if (tab === 'builder') targetPath = '/builder';
    else if (tab === 'account') targetPath = '/account';
    else if (tab === 'ai') targetPath = '/ai';
    else if (tab === 'home') targetPath = '/';

    if (tab === 'catalog') {
      const urlQuery = serializeFiltersToUrl(filters);
      targetPath = `${targetPath}${urlQuery}`;
    }

    if (window.location.pathname !== targetPath) {
      if (options?.replaceUrl) {
        window.history.replaceState({ tab }, '', targetPath);
      } else {
        window.history.pushState({ tab }, '', targetPath);
      }
    }

    if (options?.scrollToTop !== false) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Update filters handler
  const handleUpdateFilters = (updates: Partial<ProductFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  // Reset filters handler
  const handleResetFilters = () => {
    setFilters({
      ...DEFAULT_FILTER_STATE,
      category: 'all',
      searchQuery: '',
    });
  };

  // Quick navigation to catalog with specific category or search
  const handleNavigateToCatalogWithCategory = (catId: CategoryId) => {
    setFilters((prev) => ({ ...prev, category: catId, page: 1 }));
    handleNavigateTab('catalog');
  };

  const handleLikeBlogPost = (postId: string) => {
    const updated = blogPosts.map((p) => {
      if (p.id === postId) {
        return { ...p, likesCount: (p.likesCount || 0) + 1 };
      }
      return p;
    });
    setBlogPosts(updated);
    saveBlogPostsToStorage(updated);
  };

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hedyeh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hedyeh_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Sync current user to localStorage
  useEffect(() => {
    saveCurrentUserToStorage(currentUser);
  }, [currentUser]);

  // Sync users list to localStorage
  useEffect(() => {
    saveUsersToStorage(users);
  }, [users]);

  // Dynamic document title update
  useEffect(() => {
    if (storeSettings.storeName) {
      if (activeTab === 'corporate') {
        document.title = `هدایای سازمانی و رویدادها | ${storeSettings.storeName}`;
      } else if (activeTab === 'builder') {
        document.title = `طراحی و ساخت آنلاین پک هدیه اختصاصی | ${storeSettings.storeName}`;
      } else if (activeTab === 'catalog') {
        document.title = `کاتالوگ پک‌های هدیه لوکس | ${storeSettings.storeName}`;
      } else if (activeTab === 'consultation') {
        document.title = `مشاوره انتخاب هدیه | ${storeSettings.storeName}`;
      } else if (activeTab === 'blog') {
        document.title = `مجله یادمان | ایده‌ها و راهنمای انتخاب پک‌های هدیه | ${storeSettings.storeName}`;
      } else if (activeTab === 'blog-article') {
        const article = blogPosts.find((p) => p.slug === activeArticleSlug || p.id === activeArticleSlug);
        document.title = article ? `${article.seoTitle || article.title} | ${storeSettings.storeName}` : `مجله یادمان | ${storeSettings.storeName}`;
      } else if (activeTab === 'account') {
        document.title = `حساب کاربری | ${storeSettings.storeName}`;
      } else if (activeTab === 'ai') {
        document.title = `مشاور هوشمند انتخاب هدیه | ${storeSettings.storeName}`;
      } else {
        if (storeSettings.homepage?.seo?.metaTitle) {
          document.title = storeSettings.homepage.seo.metaTitle;
        } else {
          document.title = `${storeSettings.storeName} | ${storeSettings.tagline}`;
        }
      }
    }
  }, [activeTab, storeSettings, activeArticleSlug, blogPosts]);

  // Filtering products
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      product.titleFa.includes(searchQuery) ||
      product.description.includes(searchQuery) ||
      product.itemsIncluded.some((item) => item.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Pending items count for admin badge
  const pendingAdminCount =
    orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length +
    inquiries.filter((i) => i.status === 'new').length +
    consultations.filter((c) => c.status === 'new').length +
    reviews.filter((r) => r.status === 'pending').length;

  // --- Auth Handlers ---
  const handleLoginSuccess = (user: User) => {
    // Merge guest cart with user cart
    const mergedCart = mergeCarts(cartItems, user.cart || []);
    setCartItems(mergedCart);

    const updatedUser: User = {
      ...user,
      cart: mergedCart,
      lastLoginAt: new Date().toISOString(),
      lastLoginAtFa: getPersianNowString(),
    };

    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    setCurrentUser(updatedUser);
    saveCurrentUserToStorage(updatedUser);
    setAuthModal(null);
  };

  const handleRegisterSuccess = (newUser: User) => {
    // Merge guest cart with new user cart
    const mergedCart = mergeCarts(cartItems, newUser.cart || []);
    setCartItems(mergedCart);

    const registeredUser: User = {
      ...newUser,
      cart: mergedCart,
    };

    const updatedUsers = [registeredUser, ...users];
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    setCurrentUser(registeredUser);
    saveCurrentUserToStorage(registeredUser);
    setAuthModal(null);
  };

  const handlePasswordResetComplete = (updatedUser: User) => {
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    // Switch to login modal
    setAuthModal('login');
  };

  const handleLogout = () => {
    if (currentUser) {
      // Save current cart before logging out
      const updatedUser: User = { ...currentUser, cart: cartItems };
      const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
      setUsers(updatedUsers);
      saveUsersToStorage(updatedUsers);
    }
    setCurrentUser(null);
    saveCurrentUserToStorage(null);
    if (activeTab === 'account') {
      setActiveTab('home');
    }
  };

  const handleUpdateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    saveCurrentUserToStorage(updatedUser);
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
  };

  const handleOpenAccount = (subTab: string = 'overview') => {
    setAccountSubTab(subTab);
    if (!currentUser) {
      setAuthModal('login');
      return;
    }
    handleNavigateTab('account');
  };

  // --- Wishlist Handlers ---
  const userWishlistIds = currentUser?.wishlist || [];

  const handleToggleWishlist = (product: Product) => {
    if (!currentUser) {
      setAuthModal('login');
      return;
    }

    const isAlreadyWishlisted = (currentUser.wishlist || []).includes(product.id);
    const updatedWishlist = isAlreadyWishlisted
      ? (currentUser.wishlist || []).filter((id) => id !== product.id)
      : [...(currentUser.wishlist || []), product.id];

    const updatedUser: User = {
      ...currentUser,
      wishlist: updatedWishlist,
    };

    handleUpdateCurrentUser(updatedUser);
  };

  // --- Store & Consultation Handlers ---
  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleOpenConsultation = (initialType?: ConsultationCustomerType) => {
    if (initialType) {
      setConsultationCustomerType(initialType);
    }
    handleNavigateTab('consultation');
  };

  const handleConsultationSubmitted = (newRequest: ConsultationRequest) => {
    const updated = [newRequest, ...consultations];
    setConsultations(updated);
    saveConsultationsToStorage(updated);
  };

  const handleAddToCartDirect = (product: Product) => {
    const defaultRibbon = RIBBONS.find((r) => r.colorHex === product.ribbonColorHex) || RIBBONS[0];
    const defaultSeal = WAX_SEALS[0];

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product?.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random()}`,
          product,
          quantity: 1,
          cardMessage: 'با آرزوی بهترین‌ها و شادکامی',
          waxSeal: defaultSeal.nameFa,
          ribbonColor: defaultRibbon.nameFa,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleAddToCartWithOptions = (
    product: Product,
    selectedRibbon: RibbonOption,
    selectedWaxSeal: WaxSealOption,
    cardMessage: string,
    recipientName: string
  ) => {
    setCartItems((prev) => [
      ...prev,
      {
        id: `cart-${Date.now()}-${Math.random()}`,
        product,
        quantity: 1,
        cardMessage,
        recipientName,
        waxSeal: selectedWaxSeal.nameFa,
        ribbonColor: selectedRibbon.nameFa,
      },
    ]);
    setIsCartOpen(true);
  };

  const handleAddCustomBoxToCart = (customBox: {
    boxType: BoxTypeOption;
    ribbon: RibbonOption;
    waxSeal: WaxSealOption;
    items: CustomContentItem[];
    cardMessage: string;
    cardFont: string;
    totalPrice: number;
    voiceRecording?: VoiceRecordingData;
  }) => {
    setCartItems((prev) => [
      ...prev,
      {
        id: `custom-box-${Date.now()}`,
        isCustomBox: true,
        customBoxDetails: customBox,
        quantity: 1,
      },
    ]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleStartCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderPlaced = (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
    setLastPlacedOrder(newOrder);
  };

  const handleInquirySubmitted = (newInquiry: CorporateInquiry) => {
    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    saveInquiriesToStorage(updated);
  };

  const handleAddReview = (newReview: ProductReview) => {
    const updated = [newReview, ...reviews];
    setReviews(updated);
    saveReviewsToStorage(updated);
  };

  const handleExitAdmin = () => {
    setIsAdminView(false);
    if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
      window.history.pushState(null, '', '/');
    }
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setAdminSession(null);
    setIsAdminView(true);
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
  };

  const handleAdminLoginSuccess = (session: AdminSession) => {
    setAdminSession(session);
    setIsAdminView(true);
  };

  // Render Admin View
  if (isAdminView) {
    if (!adminSession) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          onBackToStore={handleExitAdmin}
        />
      );
    }

    return (
      <AdminPanel
        onExitAdmin={handleExitAdmin}
        onLogout={handleAdminLogout}
        orders={orders}
        setOrders={setOrders}
        inquiries={inquiries}
        setInquiries={setInquiries}
        consultations={consultations}
        setConsultations={setConsultations}
        products={products}
        setProducts={setProducts}
        customItems={customItems}
        setCustomItems={setCustomItems}
        storeSettings={storeSettings}
        setStoreSettings={setStoreSettings}
        categories={categories}
        setCategories={setCategories}
        coupons={coupons}
        setCoupons={setCoupons}
        reviews={reviews}
        setReviews={setReviews}
        users={users}
        setUsers={setUsers}
        blogPosts={blogPosts}
        setBlogPosts={setBlogPosts}
        blogCategories={blogCategories}
        setBlogCategories={setBlogCategories}
        blogAuthors={blogAuthors}
        setBlogAuthors={setBlogAuthors}
        onViewPostInBlog={(slug) => {
          setIsAdminView(false);
          handleNavigateToArticle(slug);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C2826] font-['Vazirmatn',sans-serif] flex flex-col selection:bg-[#0F4C3A] selection:text-[#FAF8F5]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={filters.searchQuery}
        setSearchQuery={(q) => {
          handleUpdateFilters({ searchQuery: q, page: 1 });
          if (q.trim() && activeTab !== 'catalog') {
            handleNavigateTab('catalog');
          }
        }}
        onOpenAdmin={() => setIsAdminView(true)}
        pendingAdminCount={pendingAdminCount}
        currentUser={currentUser}
        onOpenLogin={() => setAuthModal('login')}
        onOpenRegister={() => setAuthModal('register')}
        onOpenAccount={handleOpenAccount}
        onLogout={handleLogout}
        wishlistCount={userWishlistIds.length}
        config={storeSettings.homepage?.header}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {/* Tab 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            <Hero
              heroImage={storeSettings.heroImage}
              config={storeSettings.homepage?.hero}
              onExploreCatalog={() => handleNavigateTab('catalog')}
              onOpenBuilder={() => handleNavigateTab('builder')}
              onOpenAiConcierge={() => handleNavigateTab('ai')}
              onNavigateTab={(tab) => handleNavigateTab(tab)}
            />

            {/* Promotional Banners Carousel/Stack */}
            {Boolean(storeSettings.homepage?.banners) && (
              <PromotionalBannersSection
                banners={
                  Array.isArray(storeSettings.homepage?.banners)
                    ? storeSettings.homepage.banners
                    : (storeSettings.homepage?.banners as any)?.banners || []
                }
                onNavigateTab={(tab) => handleNavigateTab(tab)}
              />
            )}

            {/* Catalog Showcase Section */}
            {storeSettings.homepage?.products?.visible !== false && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" id="home-showcase-products">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right">
                  <div>
                    {storeSettings.homepage?.products?.badgeText && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0F4C3A]/10 text-[#0F4C3A] mb-1.5">
                        <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                        <span>{storeSettings.homepage.products.badgeText}</span>
                      </div>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F4C3A]">
                      {storeSettings.homepage?.products?.title || 'ویترین پک‌های هدیه'}
                    </h2>
                    <p className="text-xs text-[#6A7873] mt-1">
                      {storeSettings.homepage?.products?.description ||
                        'بسته‌بندی اختصاصی هاردباکس همراه با امکان درج کارت تبریک و مهر و موم'}
                    </p>
                  </div>

                  {/* Category Pills */}
                  {storeSettings.homepage?.products?.showCategoryFilter !== false && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleNavigateToCatalogWithCategory(cat.id)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                            filters.category === cat.id
                              ? 'bg-[#0F4C3A] text-white shadow-xs'
                              : 'bg-[#F4EFE6] text-[#2C3B37] hover:bg-[#EAE6DF]'
                          }`}
                        >
                          {cat.nameFa}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    const prodConfig = storeSettings.homepage?.products;
                    let displayList: Product[] = [];
                    if (prodConfig?.selectedProductIds && prodConfig.selectedProductIds.length > 0) {
                      displayList = prodConfig.selectedProductIds
                        .map((id) => products.find((p) => p.id === id))
                        .filter((p): p is Product => Boolean(p));
                    }
                    if (displayList.length === 0) {
                      const limit = prodConfig?.displayLimit || 6;
                      displayList = products.slice(0, limit);
                    }
                    return displayList.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={handleQuickView}
                        onAddToCart={handleAddToCartDirect}
                        isWishlisted={userWishlistIds.includes(product.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ));
                  })()}
                </div>

                {/* View all in catalog button */}
                {storeSettings.homepage?.products?.showViewAllButton !== false && (
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={() => handleNavigateTab('catalog')}
                      className="bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#0F4C3A] border-2 border-[#0F4C3A] font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-all active:scale-98 cursor-pointer"
                    >
                      {storeSettings.homepage?.products?.viewAllButtonText ||
                        'مشاهده همه هدایا در فروشگاه با فیلترهای پیشرفته'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Prominent Consultation Section on Homepage */}
            <ConsultationSection
              onOpenConsultation={handleOpenConsultation}
              config={storeSettings.homepage?.consultation}
            />

            {/* Corporate Banner Section Preview */}
            <CorporateGiftSection
              onInquirySubmitted={handleInquirySubmitted}
              onOpenConsultation={handleOpenConsultation}
              config={storeSettings.homepage?.corporate}
            />

            {/* Blog Articles Section on Homepage */}
            <HomeBlogSection
              posts={blogPosts}
              categories={blogCategories}
              authors={blogAuthors}
              onOpenBlog={() => handleNavigateToBlog()}
              onSelectPost={handleNavigateToArticle}
              onSelectCategory={(slug) => handleNavigateToBlog(slug)}
              config={storeSettings.homepage?.blog}
            />
          </div>
        )}

        {/* Tab 2: DEDICATED FULL CATALOG & ADVANCED FILTERING VIEW */}
        {activeTab === 'catalog' && (
          <ShopCatalogView
            products={products}
            categories={categories}
            filters={filters}
            onUpdateFilters={handleUpdateFilters}
            onResetFilters={handleResetFilters}
            onQuickView={handleQuickView}
            onAddToCart={handleAddToCartDirect}
            wishlistIds={userWishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* Tab 3: DEDICATED CONSULTATION PAGE */}
        {activeTab === 'consultation' && (
          <ConsultationPage
            initialCustomerType={consultationCustomerType}
            storeSettings={storeSettings}
            onConsultationSubmitted={handleConsultationSubmitted}
            onExploreCatalog={() => handleNavigateTab('catalog')}
          />
        )}

        {/* Tab 4: CUSTOM BUILDER */}
        {activeTab === 'builder' && (
          <ErrorBoundary fallbackTitle="خطایی در بخش ساخت پک اختصاصی رخ داده است">
            <CustomBoxBuilder
              products={products}
              customItems={customItems}
              onExploreCatalog={() => handleNavigateTab('catalog')}
              onAddCustomBoxToCart={handleAddCustomBoxToCart}
            />
          </ErrorBoundary>
        )}

        {/* Tab 5: CORPORATE (B2B Dedicated Landing) */}
        {activeTab === 'corporate' && (
          <CorporateLandingPage
            onInquirySubmitted={handleInquirySubmitted}
            onExploreCatalog={() => handleNavigateTab('catalog')}
            onOpenConsultation={handleOpenConsultation}
          />
        )}

        {/* Tab 6: USER ACCOUNT DASHBOARD */}
        {activeTab === 'account' && (
          currentUser ? (
            <UserAccountDashboard
              currentUser={currentUser}
              orders={orders}
              products={products}
              coupons={coupons}
              onUpdateUser={handleUpdateCurrentUser}
              onLogout={handleLogout}
              onExploreCatalog={() => handleNavigateTab('catalog')}
              onAddToCart={handleAddToCartDirect}
              onToggleWishlist={handleToggleWishlist}
              onStartConsultation={handleOpenConsultation}
              initialTab={accountSubTab}
            />
          ) : (
            <div className="bg-[#FAF8F5] min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
              <h2 className="text-xl font-bold text-[#0F4C3A]">برای مشاهده حساب کاربری لطفا وارد شوید</h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAuthModal('login')}
                  className="bg-[#0F4C3A] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0B3C2E] transition"
                >
                  ورود به حساب
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModal('register')}
                  className="bg-transparent border border-[#0F4C3A] text-[#0F4C3A] px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0F4C3A]/5 transition"
                >
                  ثبت‌نام
                </button>
              </div>
            </div>
          )
        )}

        {/* Tab 7: AI CONCIERGE */}
        {activeTab === 'ai' && (
          <AiGiftConcierge
            onSelectProduct={handleQuickView}
            onAddToCart={handleAddToCartDirect}
          />
        )}

        {/* Tab 8: BLOG INDEX (مجله یادمان) */}
        {activeTab === 'blog' && (
          <BlogIndexPage
            posts={blogPosts}
            categories={blogCategories}
            authors={blogAuthors}
            selectedCategorySlug={activeBlogCategorySlug}
            onSelectPost={handleNavigateToArticle}
            onSelectCategory={handleNavigateToBlog}
            onOpenConsultation={handleOpenConsultation}
            onBackToHome={() => handleNavigateTab('home')}
          />
        )}

        {/* Tab 9: BLOG ARTICLE DETAIL PAGE */}
        {activeTab === 'blog-article' && (
          <BlogArticlePage
            post={
              blogPosts.find((p) => p.slug === activeArticleSlug || p.id === activeArticleSlug) ||
              blogPosts[0]
            }
            allPosts={blogPosts}
            categories={blogCategories}
            authors={blogAuthors}
            products={products}
            storeSettings={storeSettings}
            onSelectPost={handleNavigateToArticle}
            onSelectCategory={handleNavigateToBlog}
            onBackToBlog={() => handleNavigateToBlog()}
            onOpenConsultation={handleOpenConsultation}
            onOpenBuilder={() => handleNavigateTab('builder')}
            onOpenCorporate={() => handleNavigateTab('corporate')}
            onQuickViewProduct={handleQuickView}
            onAddToCartProduct={handleAddToCartDirect}
            userWishlistIds={userWishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        config={storeSettings.homepage?.footer}
        onNavigateToBlog={() => handleNavigateToBlog()}
        onNavigateTab={(tab) => handleNavigateTab(tab)}
      />

      {/* Product Detail & Customization Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          reviews={reviews}
          onAddReview={handleAddReview}
          onAddToCartWithOptions={handleAddToCartWithOptions}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={handleStartCheckout}
        />
      )}

      {/* Full Checkout & Payment Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          coupons={coupons}
          onOrderPlaced={handleOrderPlaced}
          onClearCart={() => setCartItems([])}
          currentUser={currentUser}
        />
      )}

      {/* Order Success Confirmation Modal */}
      {isOrderSuccessOpen && (
        <OrderSuccessModal
          isOpen={isOrderSuccessOpen}
          onClose={() => setIsOrderSuccessOpen(false)}
          cartItems={lastPlacedOrder?.items || cartItems}
        />
      )}

      {/* --- AUTHENTICATION MODALS --- */}
      {authModal === 'login' && (
        <LoginPage
          users={users}
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setAuthModal('register')}
          onSwitchToForgotPassword={() => setAuthModal('forgot_password')}
          onClose={() => setAuthModal(null)}
        />
      )}

      {authModal === 'register' && (
        <RegisterPage
          users={users}
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setAuthModal('login')}
          onClose={() => setAuthModal(null)}
        />
      )}

      {authModal === 'forgot_password' && (
        <ForgotPasswordPage
          users={users}
          onSuccess={handlePasswordResetComplete}
          onPasswordResetComplete={handlePasswordResetComplete}
          onSwitchToLogin={() => setAuthModal('login')}
          onClose={() => setAuthModal(null)}
        />
      )}
    </div>
  );
}
