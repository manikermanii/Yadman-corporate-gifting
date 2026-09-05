import React, { useState } from 'react';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  Layers,
  Copy,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Eye,
  Tag,
  Image as ImageIcon,
  Film,
} from 'lucide-react';
import { Product, CategoryId, ProductStatus } from '../../types';
import { formatToman, toPersianDigits } from '../../utils/formatters';

interface AdminProductsProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleStock: (productId: string) => void;
  onDuplicateProduct?: (product: Product) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleStock,
  onDuplicateProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryId>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_desc' | 'price_asc' | 'stock_desc' | 'rating'>('newest');

  const categories: { id: CategoryId; nameFa: string }[] = [
    { id: 'all', nameFa: 'همه دسته‌ها' },
    { id: 'saffron', nameFa: 'زعفران و هل' },
    { id: 'handicraft', nameFa: 'صنایع دستی' },
    { id: 'perfume', nameFa: 'عطر و گلاب' },
    { id: 'vip', nameFa: 'پک‌های ویژه' },
    { id: 'corporate', nameFa: 'سازمانی' },
    { id: 'zodiac', nameFa: 'مناسبتی' },
  ];

  // Filtering & Sorting logic
  const filteredProducts = products
    .filter((p) => {
      // Category filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

      // Product Status filter
      if (statusFilter !== 'all') {
        const prodStatus = p.status || (p.inStock ? 'active' : 'out_of_stock');
        if (prodStatus !== statusFilter) return false;
      }

      // Stock status filter
      if (stockFilter === 'in_stock' && (!p.inStock || (p.stockQuantity !== undefined && p.stockQuantity <= 0))) return false;
      if (stockFilter === 'out_of_stock' && (p.inStock && (p.stockQuantity === undefined || p.stockQuantity > 0))) return false;
      if (stockFilter === 'low_stock') {
        const isLow = p.inStock && p.stockQuantity !== undefined && p.stockQuantity <= (p.lowStockThreshold || 5);
        if (!isLow) return false;
      }

      // Search query (title, sku, tags, description, items)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.titleFa.toLowerCase().includes(q) || (p.titleEn && p.titleEn.toLowerCase().includes(q));
        const matchesSku = p.sku && p.sku.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesItems = p.itemsIncluded.some((item) => item.toLowerCase().includes(q));
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSku && !matchesDesc && !matchesItems && !matchesTags) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'stock_desc') return (b.stockQuantity || 0) - (a.stockQuantity || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // Default order
    });

  const getCategoryBadge = (cat: CategoryId) => {
    switch (cat) {
      case 'saffron':
        return <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">زعفران و هل</span>;
      case 'handicraft':
        return <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">صنایع دستی</span>;
      case 'perfume':
        return <span className="bg-rose-50 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">عطر و گلاب</span>;
      case 'vip':
        return <span className="bg-[#D4AF37]/20 text-[#0F4C3A] text-[10px] font-bold px-2 py-0.5 rounded-md">ویژه VIP</span>;
      case 'corporate':
        return <span className="bg-purple-50 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">سازمانی</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-md">عمومی</span>;
    }
  };

  const getStatusBadge = (status?: ProductStatus, inStock?: boolean) => {
    if (status === 'draft') {
      return <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md">پیش‌نویس</span>;
    }
    if (status === 'archived') {
      return <span className="bg-zinc-200 text-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded-md">بایگانی</span>;
    }
    if (status === 'out_of_stock' || !inStock) {
      return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">ناموجود</span>;
    }
    return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">فعال در ویترین</span>;
  };

  const handleDuplicate = (product: Product) => {
    if (onDuplicateProduct) {
      onDuplicateProduct(product);
    } else {
      const duplicated: Product = {
        ...product,
        id: `gift-${Date.now()}`,
        sku: `${product.sku}-COPY`,
        titleFa: `${product.titleFa} (کپی)`,
        status: 'draft',
      };
      onEditProduct(duplicated);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F4C3A]">
            مدیریت محصولات، پک‌های هدیه و گالری تصاویر
          </h1>
          <p className="text-xs text-[#6A7873] mt-1">
            ایجاد و ویرایش محصول، گالری تصاویر نامحدود، تعیین موجودی انبار، برچسب‌ها، تنوع و تنظیمات سئو
          </p>
        </div>

        <button
          onClick={onAddProduct}
          id="admin-add-product-btn"
          className="bg-[#0F4C3A] hover:bg-[#0B3C2E] text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl active:scale-98"
        >
          <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
          <span>افزودن محصول جدید</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EAE6DF] shadow-xs space-y-4">
        
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                categoryFilter === cat.id
                  ? 'bg-[#0F4C3A] text-white shadow-xs'
                  : 'bg-[#F4EFE6] text-[#2C3B37] hover:bg-[#EAE6DF]'
              }`}
            >
              {cat.nameFa}
            </button>
          ))}
        </div>

        {/* Search, Status & Sort Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در عنوان، کد کالا (SKU)، برچسب‌ها یا اقلام پک..."
              className="w-full bg-[#FAF8F5] text-xs text-[#1C2826] pr-10 pl-4 py-2.5 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#8C8375] absolute right-3.5 top-3" />
          </div>

          {/* Stock & Status Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full bg-[#FAF8F5] text-xs font-bold text-[#0F4C3A] p-2.5 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
            >
              <option value="all">فیلتر موجودی: همه موارد</option>
              <option value="in_stock">فقط موجود در انبار</option>
              <option value="low_stock">⚠️ رو به اتمام (هشدار کسری)</option>
              <option value="out_of_stock">❌ ناموجود</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#FAF8F5] text-xs font-bold text-[#0F4C3A] p-2.5 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
            >
              <option value="newest">مرتب‌سازی: پیش‌فرض</option>
              <option value="price_desc">قیمت: گران‌ترین به ارزان‌ترین</option>
              <option value="price_asc">قیمت: ارزان‌ترین به گران‌ترین</option>
              <option value="stock_desc">موجودی: بیشترین تعداد انبار</option>
              <option value="rating">بالاترین امتیاز مشتریان</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between text-[11px] text-[#6A7873] pt-1">
          <span>نمایش {toPersianDigits(filteredProducts.length)} محصول از مجموع {toPersianDigits(products.length)} محصول</span>
          {(searchQuery || categoryFilter !== 'all' || stockFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStockFilter('all');
                setStatusFilter('all');
              }}
              className="text-rose-600 hover:underline font-bold"
            >
              پاک‌کردن فیلترها
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#EAE6DF] shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-[#8C8375] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] mx-auto flex items-center justify-center text-[#8C8375]">
              <Search className="w-6 h-6" />
            </div>
            <div className="font-bold text-sm text-[#0F4C3A]">هیچ محصولی با معیارهای جستجوی شما یافت نشد!</div>
            <p className="text-xs">برای مشاهده محصولات، فیلترها را تغییر داده یا محصول جدیدی اضافه کنید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EAE6DF] text-[#6A7873] font-bold">
                  <th className="py-4 pr-6">تصویر و گالری</th>
                  <th className="py-4">عنوان محصول و کد SKU</th>
                  <th className="py-4">دسته‌بندی</th>
                  <th className="py-4">قیمت و تخفیف</th>
                  <th className="py-4">وضعیت انبار</th>
                  <th className="py-4">وضعیت نمایش</th>
                  <th className="py-4 pl-6 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFE6]">
                {filteredProducts.map((product) => {
                  const imageCount = product.images?.length || (product.additionalImages?.length ? product.additionalImages.length + 1 : 1);
                  const isLowStock = product.inStock && product.stockQuantity !== undefined && product.stockQuantity <= (product.lowStockThreshold || 5);

                  return (
                    <tr key={product.id} className="hover:bg-[#FAF8F5] transition">
                      
                      {/* Image & Gallery Count */}
                      <td className="py-3.5 pr-6">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-[#EAE6DF] bg-[#F4EFE6] group">
                          <img
                            src={product.image}
                            alt={product.titleFa}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {imageCount > 1 && (
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 backdrop-blur-xs">
                              <ImageIcon className="w-2.5 h-2.5 text-[#D4AF37]" />
                              <span>{imageCount}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Title & SKU */}
                      <td className="py-3.5 max-w-[260px]">
                        <div className="font-extrabold text-[#0F4C3A] text-sm line-clamp-1">
                          {product.titleFa}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#6A7873] font-mono">
                            SKU: {product.sku || product.id}
                          </span>
                          {product.titleEn && (
                            <span className="text-[10px] text-[#8C8375] font-english-serif line-clamp-1 truncate">
                              • {product.titleEn}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.badge && (
                            <span className="text-[9px] bg-[#D4AF37]/20 text-[#0F4C3A] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                              {product.badge}
                            </span>
                          )}
                          {product.videos && product.videos.length > 0 && (
                            <span className="text-[9px] bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                              <Film className="w-2.5 h-2.5 text-rose-600" />
                              <span>ویدیو ({toPersianDigits(product.videos.length)})</span>
                            </span>
                          )}
                          {product.hasVariants && (
                            <span className="text-[9px] bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                              دارای تنوع
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5">
                        {getCategoryBadge(product.category)}
                      </td>

                      {/* Price & Discount */}
                      <td className="py-3.5">
                        <div className="font-extrabold text-[#0F4C3A]">
                          {formatToman(product.price)}
                        </div>
                        {product.oldPrice && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-[#8C8375] line-through">
                              {formatToman(product.oldPrice)}
                            </span>
                            {product.discountPercent && (
                              <span className="text-[9px] text-rose-600 bg-rose-50 font-bold px-1.5 py-0.2 rounded">
                                {toPersianDigits(product.discountPercent)}٪-
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5">
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => onToggleStock(product.id)}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition ${
                              product.inStock
                                ? isLowStock
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {product.inStock ? (
                              isLowStock ? (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>{toPersianDigits(product.stockQuantity ?? 0)} عدد (رو به اتمام)</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>{toPersianDigits(product.stockQuantity ?? 0)} عدد موجود</span>
                                </>
                              )
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>اتمام موجودی</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Display Status */}
                      <td className="py-3.5">
                        {getStatusBadge(product.status, product.inStock)}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 pl-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="bg-[#F4EFE6] hover:bg-[#0F4C3A] hover:text-white text-[#0F4C3A] px-3 py-1.5 rounded-xl transition flex items-center gap-1 text-xs font-bold shadow-xs"
                            title="ویرایش کامل محصول و گالری"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>ویرایش</span>
                          </button>

                          <button
                            onClick={() => handleDuplicate(product)}
                            className="p-1.5 text-gray-500 hover:text-[#0F4C3A] hover:bg-[#FAF8F5] rounded-lg transition"
                            title="ایجاد کپی از این محصول"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`آیا از حذف پک هدیه "${product.titleFa}" از سیستم مطمئن هستید؟`)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف محصول"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
