import React, { useState } from 'react';
import {
  AdminSection,
  Order,
  CorporateInquiry,
  Product,
  CustomContentItem,
  StoreSettings,
  OrderStatus,
  CorporateInquiryStatus,
  Category,
  Coupon,
  ProductReview,
  ConsultationRequest,
  ConsultationStatus,
  User,
  BlogPost,
  BlogCategory,
  BlogAuthor,
} from '../../types';
import { AdminHeader } from './AdminHeader';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { OrderDetailsModal } from './OrderDetailsModal';
import { AdminProducts } from './AdminProducts';
import { ProductEditModal } from './ProductEditModal';
import { AdminCorporateInquiries } from './AdminCorporateInquiries';
import { AdminConsultations } from './AdminConsultations';
import { AdminCustomItems } from './AdminCustomItems';
import { AdminSettings } from './AdminSettings';
import { AdminCategories } from './AdminCategories';
import { AdminInventory } from './AdminInventory';
import { AdminDiscounts } from './AdminDiscounts';
import { AdminReviews } from './AdminReviews';
import { AdminSeo } from './AdminSeo';
import { AdminUsers } from './AdminUsers';
import { AdminBlog } from './AdminBlog';
import { AdminHomepageSettings } from './AdminHomepageSettings';
import {
  INITIAL_ORDERS,
  INITIAL_INQUIRIES,
  INITIAL_CONSULTATIONS,
  INITIAL_STORE_SETTINGS,
  INITIAL_USERS,
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
  saveBlogPostsToStorage,
  saveBlogCategoriesToStorage,
  saveBlogAuthorsToStorage,
} from '../../data/mockAdminData';
import { PRODUCTS, CUSTOM_ITEMS, INITIAL_COUPONS, INITIAL_REVIEWS } from '../../data/products';
import { CATEGORIES } from '../../data/categories';

interface AdminPanelProps {
  onExitAdmin: () => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  inquiries: CorporateInquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<CorporateInquiry[]>>;
  consultations: ConsultationRequest[];
  setConsultations: React.Dispatch<React.SetStateAction<ConsultationRequest[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  customItems: CustomContentItem[];
  setCustomItems: React.Dispatch<React.SetStateAction<CustomContentItem[]>>;
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  reviews: ProductReview[];
  setReviews: React.Dispatch<React.SetStateAction<ProductReview[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  blogCategories: BlogCategory[];
  setBlogCategories: React.Dispatch<React.SetStateAction<BlogCategory[]>>;
  blogAuthors: BlogAuthor[];
  setBlogAuthors: React.Dispatch<React.SetStateAction<BlogAuthor[]>>;
  onViewPostInBlog?: (slug: string) => void;
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onExitAdmin,
  onLogout,
  orders,
  setOrders,
  inquiries,
  setInquiries,
  consultations,
  setConsultations,
  products,
  setProducts,
  customItems,
  setCustomItems,
  storeSettings,
  setStoreSettings,
  categories,
  setCategories,
  coupons,
  setCoupons,
  reviews,
  setReviews,
  users,
  setUsers,
  blogPosts,
  setBlogPosts,
  blogCategories,
  setBlogCategories,
  blogAuthors,
  setBlogAuthors,
  onViewPostInBlog,
}) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Stats for header badges
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing'
  ).length;
  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;
  const newConsultationsCount = consultations.filter((c) => c.status === 'new').length;
  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;
  const lowStockCount = products.filter(
    (p) => p.inStock && (p.stockQuantity || 0) <= (p.lowStockThreshold || 5)
  ).length;

  // Blog Handlers
  const handleSaveBlogPost = (post: BlogPost) => {
    const exists = blogPosts.some((p) => p.id === post.id);
    let updated: BlogPost[];
    if (exists) {
      updated = blogPosts.map((p) => (p.id === post.id ? post : p));
    } else {
      updated = [post, ...blogPosts];
    }
    setBlogPosts(updated);
    saveBlogPostsToStorage(updated);
  };

  const handleDeleteBlogPost = (postId: string) => {
    const updated = blogPosts.filter((p) => p.id !== postId);
    setBlogPosts(updated);
    saveBlogPostsToStorage(updated);
  };

  const handleSaveBlogCategory = (category: BlogCategory) => {
    const exists = blogCategories.some((c) => c.id === category.id);
    let updated: BlogCategory[];
    if (exists) {
      updated = blogCategories.map((c) => (c.id === category.id ? category : c));
    } else {
      updated = [...blogCategories, category];
    }
    setBlogCategories(updated);
    saveBlogCategoriesToStorage(updated);
  };

  const handleDeleteBlogCategory = (categoryId: string) => {
    const updated = blogCategories.filter((c) => c.id !== categoryId);
    setBlogCategories(updated);
    saveBlogCategoriesToStorage(updated);
  };

  const handleSaveBlogAuthor = (author: BlogAuthor) => {
    const exists = blogAuthors.some((a) => a.id === author.id);
    let updated: BlogAuthor[];
    if (exists) {
      updated = blogAuthors.map((a) => (a.id === author.id ? author : a));
    } else {
      updated = [...blogAuthors, author];
    }
    setBlogAuthors(updated);
    saveBlogAuthorsToStorage(updated);
  };

  const handleDeleteBlogAuthor = (authorId: string) => {
    const updated = blogAuthors.filter((a) => a.id !== authorId);
    setBlogAuthors(updated);
    saveBlogAuthorsToStorage(updated);
  };

  // User Handlers
  const handleUpdateUser = (updatedUser: User) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    saveUsersToStorage(updated);
  };

  // Order Handlers
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    const updated = orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
    setOrders(updated);
    saveOrdersToStorage(updated);
    setSelectedOrder(updatedOrder);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    saveOrdersToStorage(updated);
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    saveOrdersToStorage(updated);
  };

  // Product Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (product: Product) => {
    const exists = products.some((p) => p.id === product.id);
    let updated: Product[];
    if (exists) {
      updated = products.map((p) => (p.id === product.id ? product : p));
    } else {
      updated = [product, ...products];
    }
    setProducts(updated);
    saveProductsToStorage(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    saveProductsToStorage(updated);
  };

  const handleToggleStock = (productId: string) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, inStock: !p.inStock } : p
    );
    setProducts(updated);
    saveProductsToStorage(updated);
  };

  // Inquiry Handlers
  const handleUpdateInquiryStatus = (
    id: string,
    newStatus: CorporateInquiryStatus,
    adminNotes?: string
  ) => {
    const updated = inquiries.map((inq) =>
      inq.id === id ? { ...inq, status: newStatus, adminNotes: adminNotes ?? inq.adminNotes } : inq
    );
    setInquiries(updated);
    saveInquiriesToStorage(updated);
  };

  const handleDeleteInquiry = (id: string) => {
    const updated = inquiries.filter((inq) => inq.id !== id);
    setInquiries(updated);
    saveInquiriesToStorage(updated);
  };

  // Consultation Handlers
  const handleUpdateConsultationStatus = (
    id: string,
    newStatus: ConsultationStatus,
    adminNotes?: string,
    assignedConsultant?: string
  ) => {
    const updated = consultations.map((c) =>
      c.id === id
        ? {
            ...c,
            status: newStatus,
            adminNotes: adminNotes !== undefined ? adminNotes : c.adminNotes,
            assignedConsultant:
              assignedConsultant !== undefined ? assignedConsultant : c.assignedConsultant,
          }
        : c
    );
    setConsultations(updated);
    saveConsultationsToStorage(updated);
  };

  const handleDeleteConsultation = (id: string) => {
    const updated = consultations.filter((c) => c.id !== id);
    setConsultations(updated);
    saveConsultationsToStorage(updated);
  };

  // Custom Items Handlers
  const handleUpdateCustomItem = (item: CustomContentItem) => {
    const updated = customItems.map((ci) => (ci.id === item.id ? item : ci));
    setCustomItems(updated);
    saveCustomItemsToStorage(updated);
  };

  const handleAddCustomItem = (item: CustomContentItem) => {
    const updated = [item, ...customItems];
    setCustomItems(updated);
    saveCustomItemsToStorage(updated);
  };

  const handleDeleteCustomItem = (id: string) => {
    const updated = customItems.filter((ci) => ci.id !== id);
    setCustomItems(updated);
    saveCustomItemsToStorage(updated);
  };

  // Category Handlers
  const handleSaveCategories = (updatedCats: Category[]) => {
    setCategories(updatedCats);
    saveCategoriesToStorage(updatedCats);
  };

  // Coupon Handlers
  const handleSaveCoupons = (updatedCoupons: Coupon[]) => {
    setCoupons(updatedCoupons);
    saveCouponsToStorage(updatedCoupons);
  };

  // Review Handlers
  const handleSaveReviews = (updatedReviews: ProductReview[]) => {
    setReviews(updatedReviews);
    saveReviewsToStorage(updatedReviews);
  };

  // Settings Handler
  const handleSaveSettings = (settings: StoreSettings) => {
    setStoreSettings(settings);
    saveStoreSettingsToStorage(settings);
  };

  // Reset demo data
  const handleResetData = () => {
    if (confirm('آیا مایلید تمام داده‌های فروشگاه، کاربران، سفارش‌ها و استعلام‌ها به حالت اولیه بازگردانی شوند؟')) {
      setUsers(INITIAL_USERS);
      saveUsersToStorage(INITIAL_USERS);
      setOrders(INITIAL_ORDERS);
      saveOrdersToStorage(INITIAL_ORDERS);
      setInquiries(INITIAL_INQUIRIES);
      saveInquiriesToStorage(INITIAL_INQUIRIES);
      setConsultations(INITIAL_CONSULTATIONS);
      saveConsultationsToStorage(INITIAL_CONSULTATIONS);
      setProducts(PRODUCTS);
      saveProductsToStorage(PRODUCTS);
      setCustomItems(CUSTOM_ITEMS);
      saveCustomItemsToStorage(CUSTOM_ITEMS);
      setCategories(CATEGORIES);
      saveCategoriesToStorage(CATEGORIES);
      setCoupons(INITIAL_COUPONS);
      saveCouponsToStorage(INITIAL_COUPONS);
      setReviews(INITIAL_REVIEWS);
      saveReviewsToStorage(INITIAL_REVIEWS);
      setStoreSettings(INITIAL_STORE_SETTINGS);
      saveStoreSettingsToStorage(INITIAL_STORE_SETTINGS);
      alert('داده‌های پیش‌فرض با موفقیت بازیابی شدند.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1C2826] flex flex-col font-['Vazirmatn',sans-serif]" dir="rtl">
      {/* Header */}
      <AdminHeader
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onExitAdmin={onExitAdmin}
        onLogout={onLogout}
        pendingOrdersCount={pendingOrdersCount}
        newInquiriesCount={newInquiriesCount}
        newConsultationsCount={newConsultationsCount}
        pendingReviewsCount={pendingReviewsCount}
        lowStockCount={lowStockCount}
        usersCount={users.length}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'dashboard' && (
          <AdminDashboard
            orders={orders}
            inquiries={inquiries}
            products={products}
            onNavigateSection={setActiveSection}
            onViewOrder={handleViewOrder}
            onViewInquiry={() => {
              setActiveSection('inquiries');
            }}
            onAddNewProduct={handleOpenAddProduct}
          />
        )}

        {activeSection === 'orders' && (
          <AdminOrders
            orders={orders}
            onViewOrder={handleViewOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
          />
        )}

        {activeSection === 'users' && (
          <AdminUsers
            users={users}
            orders={orders}
            onUpdateUser={handleUpdateUser}
            onViewOrderDetails={handleViewOrder}
          />
        )}

        {activeSection === 'consultations' && (
          <AdminConsultations
            consultations={consultations}
            onUpdateConsultationStatus={handleUpdateConsultationStatus}
            onDeleteConsultation={handleDeleteConsultation}
          />
        )}

        {activeSection === 'products' && (
          <AdminProducts
            products={products}
            onAddProduct={handleOpenAddProduct}
            onEditProduct={handleOpenEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onToggleStock={handleToggleStock}
          />
        )}

        {activeSection === 'categories' && (
          <AdminCategories
            categories={categories}
            setCategories={setCategories}
            onSaveCategories={handleSaveCategories}
          />
        )}

        {activeSection === 'blog' && (
          <AdminBlog
            posts={blogPosts}
            categories={blogCategories}
            authors={blogAuthors}
            products={products}
            onSavePost={handleSaveBlogPost}
            onDeletePost={handleDeleteBlogPost}
            onSaveCategory={handleSaveBlogCategory}
            onDeleteCategory={handleDeleteBlogCategory}
            onSaveAuthor={handleSaveBlogAuthor}
            onDeleteAuthor={handleDeleteBlogAuthor}
            onViewPostInBlog={onViewPostInBlog}
          />
        )}

        {activeSection === 'inventory' && (
          <AdminInventory
            products={products}
            setProducts={setProducts}
            onSaveProducts={(updated) => {
              setProducts(updated);
              saveProductsToStorage(updated);
            }}
          />
        )}

        {activeSection === 'inquiries' && (
          <AdminCorporateInquiries
            inquiries={inquiries}
            onUpdateInquiryStatus={handleUpdateInquiryStatus}
            onDeleteInquiry={handleDeleteInquiry}
          />
        )}

        {activeSection === 'custom_items' && (
          <AdminCustomItems
            customItems={customItems}
            onUpdateCustomItem={handleUpdateCustomItem}
            onAddCustomItem={handleAddCustomItem}
            onDeleteCustomItem={handleDeleteCustomItem}
          />
        )}

        {activeSection === 'discounts' && (
          <AdminDiscounts
            coupons={coupons}
            setCoupons={setCoupons}
            onSaveCoupons={handleSaveCoupons}
          />
        )}

        {activeSection === 'reviews' && (
          <AdminReviews
            reviews={reviews}
            setReviews={setReviews}
            products={products}
            onSaveReviews={handleSaveReviews}
          />
        )}

        {activeSection === 'homepage' && (
          <AdminHomepageSettings
            settings={storeSettings}
            onSaveSettings={handleSaveSettings}
            onExitAdmin={onExitAdmin}
            products={products}
            blogPosts={blogPosts}
          />
        )}

        {activeSection === 'seo' && (
          <AdminSeo
            settings={storeSettings}
            setSettings={setStoreSettings}
            products={products}
            categories={categories}
            blogPosts={blogPosts}
            blogCategories={blogCategories}
            onSaveSettings={handleSaveSettings}
          />
        )}

        {activeSection === 'settings' && (
          <AdminSettings
            settings={storeSettings}
            onSaveSettings={handleSaveSettings}
          />
        )}
      </main>

      {/* Order Details & Packing Slip Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        onUpdateOrder={handleUpdateOrder}
      />

      {/* Product Create / Edit Modal */}
      <ProductEditModal
        product={editingProduct}
        categories={categories}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
