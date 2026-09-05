import React, { useState } from 'react';
import { Product } from '../../types';
import { toPersianDigits, formatToman } from '../../utils/formatters';
import { Boxes, AlertTriangle, CheckCircle, Search, Save, RefreshCw } from 'lucide-react';

interface AdminInventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onSaveProducts: (updated: Product[]) => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  products,
  setProducts,
  onSaveProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockChanges, setStockChanges] = useState<{ [id: string]: number }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      p.titleFa.includes(searchTerm) ||
      p.sku?.includes(searchTerm) ||
      p.category.includes(searchTerm)
  );

  const lowStockCount = products.filter(
    (p) => p.inStock && (p.stockQuantity || 0) <= (p.lowStockThreshold || 5)
  ).length;

  const outOfStockCount = products.filter((p) => !p.inStock || (p.stockQuantity || 0) === 0).length;

  const handleStockQuantityChange = (productId: string, val: number) => {
    setStockChanges((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const handleToggleInStock = (productId: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const nextInStock = !p.inStock;
        return {
          ...p,
          inStock: nextInStock,
          stockQuantity: nextInStock && p.stockQuantity === 0 ? 10 : p.stockQuantity,
        };
      }
      return p;
    });
    setProducts(updated);
    onSaveProducts(updated);
  };

  const handleSaveAllStock = () => {
    const updated = products.map((p) => {
      if (stockChanges[p.id] !== undefined) {
        const newQty = stockChanges[p.id];
        return {
          ...p,
          stockQuantity: newQty,
          inStock: newQty > 0,
        };
      }
      return p;
    });
    setProducts(updated);
    onSaveProducts(updated);
    setStockChanges({});
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F4C3A] flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#D4AF37]" />
            <span>مدیریت موجودی انبار و هشدار کسری</span>
          </h2>
          <p className="text-xs text-[#6A7873] mt-1">
            کنترل تعداد موجودی فیزیکی هاردباکس‌ها، زعفران و اقلام کادویی در انبار مرکزی
          </p>
        </div>

        <button
          onClick={handleSaveAllStock}
          disabled={Object.keys(stockChanges).length === 0}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
            Object.keys(stockChanges).length > 0
              ? 'bg-[#0F4C3A] hover:bg-[#0B3C2E] text-white cursor-pointer'
              : 'bg-[#EAE6DF] text-[#8C8375] cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4 text-[#D4AF37]" />
          <span>ذخیره تغییرات موجودی ({toPersianDigits(Object.keys(stockChanges).length)})</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>تغییرات موجودی با موفقیت در سیستم انبارداری ثبت و بروزرسانی شد.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6A7873]">کل اقلام کاتالوگ</span>
            <p className="text-2xl font-extrabold text-[#0F4C3A] mt-1">
              {toPersianDigits(products.length)} قلم
            </p>
          </div>
          <Boxes className="w-8 h-8 text-[#0F4C3A]/20" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-900 font-medium">اقلام در مرز اتمام (کمتر از حد آستانه)</span>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">
              {toPersianDigits(lowStockCount)} محصول
            </p>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500/40" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-red-900 font-medium">محصولات اتمام موجودی (ناموجود)</span>
            <p className="text-2xl font-extrabold text-red-700 mt-1">
              {toPersianDigits(outOfStockCount)} محصول
            </p>
          </div>
          <RefreshCw className="w-8 h-8 text-red-500/40" />
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE6DF] shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-[#8C8375]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="جستجوی محصول با نام، کد SKU یا دسته..."
          className="w-full text-xs bg-transparent focus:outline-none text-[#1C2826]"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#FAF8F5] text-[#6A7873] border-b border-[#EAE6DF]">
              <tr>
                <th className="p-4 font-semibold">تصویر و نام محصول</th>
                <th className="p-4 font-semibold">کد کالا (SKU)</th>
                <th className="p-4 font-semibold">قیمت فروش</th>
                <th className="p-4 font-semibold text-center">وضعیت انبار</th>
                <th className="p-4 font-semibold text-center">تعداد موجود در انبار</th>
                <th className="p-4 font-semibold text-center">آستانه هشدار</th>
                <th className="p-4 font-semibold text-center">عملیات وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DF]">
              {filteredProducts.map((product) => {
                const currentQty =
                  stockChanges[product.id] !== undefined
                    ? stockChanges[product.id]
                    : product.stockQuantity || 0;

                const isLow = currentQty <= (product.lowStockThreshold || 5) && currentQty > 0;
                const isOut = !product.inStock || currentQty === 0;

                return (
                  <tr key={product.id} className="hover:bg-[#FAF8F5]/60 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.titleFa}
                          className="w-12 h-12 rounded-xl object-cover border border-[#EAE6DF]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-bold text-[#0F4C3A] block">{product.titleFa}</span>
                          <span className="text-[10px] text-[#6A7873]">{product.boxType}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-[#2C3B37]">
                      {product.sku || product.id}
                    </td>

                    <td className="p-4 font-semibold text-[#0F4C3A]">
                      {formatToman(product.price)}
                    </td>

                    <td className="p-4 text-center">
                      {isOut ? (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          ناموجود در انبار
                        </span>
                      ) : isLow ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          کمبود موجودی ({toPersianDigits(currentQty)} عدد)
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          موجود و آماده ارسال
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStockQuantityChange(product.id, currentQty - 1)}
                          className="w-7 h-7 bg-[#F4EFE6] hover:bg-[#EAE6DF] rounded-lg font-bold text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQty}
                          onChange={(e) =>
                            handleStockQuantityChange(product.id, parseInt(e.target.value) || 0)
                          }
                          className="w-14 text-center text-xs font-bold p-1 bg-[#FAF8F5] border border-[#E0D8C8] rounded-lg focus:border-[#0F4C3A] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleStockQuantityChange(product.id, currentQty + 1)}
                          className="w-7 h-7 bg-[#F4EFE6] hover:bg-[#EAE6DF] rounded-lg font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-center text-[#6A7873] font-bold">
                      {toPersianDigits(product.lowStockThreshold || 5)} عدد
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleInStock(product.id)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition ${
                          product.inStock
                            ? 'bg-[#0F4C3A]/10 text-[#0F4C3A] hover:bg-red-50 hover:text-red-700'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {product.inStock ? 'تغییر به ناموجود' : 'فعال‌سازی موجودی'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
