import React, { useState } from 'react';
import { Coupon } from '../../types';
import { toPersianDigits, formatToman } from '../../utils/formatters';
import { Ticket, Plus, Trash2, Edit2, CheckCircle, XCircle, Percent, Calendar, Layers, X } from 'lucide-react';

interface AdminDiscountsProps {
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  onSaveCoupons: (updated: Coupon[]) => void;
}

export const AdminDiscounts: React.FC<AdminDiscountsProps> = ({
  coupons,
  setCoupons,
  onSaveCoupons,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(2000000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | undefined>(1000000);
  const [usageLimit, setUsageLimit] = useState(100);
  const [expiresAtFa, setExpiresAtFa] = useState('۱۴۰۵/۱۲/۲۹');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setType('percentage');
    setValue(10);
    setMinOrderAmount(2000000);
    setMaxDiscountAmount(1000000);
    setUsageLimit(100);
    setExpiresAtFa('۱۴۰۵/۱۲/۲۹');
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cp: Coupon) => {
    setEditingCoupon(cp);
    setCode(cp.code);
    setType(cp.type);
    setValue(cp.value);
    setMinOrderAmount(cp.minOrderAmount);
    setMaxDiscountAmount(cp.maxDiscountAmount);
    setUsageLimit(cp.usageLimit);
    setExpiresAtFa(cp.expiresAtFa);
    setDescription(cp.description);
    setIsActive(cp.isActive);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این کد تخفیف اطمینان دارید؟')) {
      const updated = coupons.filter((c) => c.id !== id);
      setCoupons(updated);
      onSaveCoupons(updated);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    setCoupons(updated);
    onSaveCoupons(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    if (editingCoupon) {
      const updated = coupons.map((c) =>
        c.id === editingCoupon.id
          ? {
              ...c,
              code: code.toUpperCase().trim(),
              type,
              value: Number(value),
              minOrderAmount: Number(minOrderAmount),
              maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
              usageLimit: Number(usageLimit),
              expiresAtFa,
              description,
              isActive,
            }
          : c
      );
      setCoupons(updated);
      onSaveCoupons(updated);
    } else {
      const newCoupon: Coupon = {
        id: `cp-${Date.now()}`,
        code: code.toUpperCase().trim(),
        type,
        value: Number(value),
        minOrderAmount: Number(minOrderAmount),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        usageLimit: Number(usageLimit),
        usageCount: 0,
        isActive,
        expiresAt: new Date(Date.now() + 3600000 * 24 * 180).toISOString(),
        expiresAtFa,
        description,
      };
      const updated = [newCoupon, ...coupons];
      setCoupons(updated);
      onSaveCoupons(updated);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F4C3A] flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#D4AF37]" />
            <span>مدیریت کدهای تخفیف و جشنواره‌ها</span>
          </h2>
          <p className="text-xs text-[#6A7873] mt-1">
            تعریف کدهای تخفیف درصدی و نقدی، تعیین سقف تخفیف، حداقل خرید و تاریخ انقضا
          </p>
        </div>

        <button
          onClick={openCreateModal}
          id="btn-add-coupon"
          className="flex items-center justify-center gap-2 bg-[#0F4C3A] hover:bg-[#0B3C2E] text-[#FAF8F5] px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>ایجاد کد تخفیف جدید</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#FAF8F5] text-[#6A7873] border-b border-[#EAE6DF]">
              <tr>
                <th className="p-4 font-semibold">کد تخفیف</th>
                <th className="p-4 font-semibold">نوع و مقدار تخفیف</th>
                <th className="p-4 font-semibold">حداقل مبلغ خرید</th>
                <th className="p-4 font-semibold text-center">دفعات مصرف</th>
                <th className="p-4 font-semibold">مهلت اعتبار</th>
                <th className="p-4 font-semibold text-center">وضعیت</th>
                <th className="p-4 font-semibold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DF]">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#6A7873] space-y-2">
                    <Ticket className="w-10 h-10 text-[#D4AF37] mx-auto opacity-70 mb-2" />
                    <div className="font-bold text-sm text-[#0F4C3A]">هنوز کد تخفیفی ایجاد نشده است</div>
                    <div className="text-xs">برای ایجاد اولین کد تخفیف، روی دکمه «ایجاد کد تخفیف جدید» کلیک کنید.</div>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-[#FAF8F5]/60 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-[#0F4C3A] bg-[#0F4C3A]/10 px-3 py-1 rounded-lg border border-[#0F4C3A]/20">
                        {coupon.code}
                      </span>
                    </div>
                    {coupon.description && (
                      <span className="text-[10px] text-[#6A7873] block mt-1">
                        {coupon.description}
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-[#0F4C3A]">
                      {coupon.type === 'percentage'
                        ? `${toPersianDigits(coupon.value)} درصد`
                        : formatToman(coupon.value)}
                    </span>
                    {coupon.maxDiscountAmount && coupon.type === 'percentage' && (
                      <span className="text-[10px] text-[#8C8375] block">
                        (حداکثر تا {formatToman(coupon.maxDiscountAmount)})
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-[#2C3B37] font-medium">
                    {coupon.minOrderAmount ? formatToman(coupon.minOrderAmount) : 'بدون محدودیت'}
                  </td>

                  <td className="p-4 text-center text-[#2C3B37]">
                    <span className="font-bold">{toPersianDigits(coupon.usageCount)}</span>
                    <span className="text-[#8C8375]"> / {toPersianDigits(coupon.usageLimit)}</span>
                  </td>

                  <td className="p-4 text-[#6A7873] font-medium">
                    {coupon.expiresAtFa || 'نامحدود'}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleActive(coupon.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${
                        coupon.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {coupon.isActive ? 'فعال' : 'غیرفعال'}
                    </button>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-1.5 text-[#0F4C3A] hover:bg-[#F4EFE6] rounded-lg transition"
                        title="ویرایش"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-1.5 text-[#800020] hover:bg-red-50 rounded-lg transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-lg rounded-2xl border border-[#D4AF37]/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
              <h3 className="font-extrabold text-[#0F4C3A] text-base flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#D4AF37]" />
                <span>{editingCoupon ? 'ویرایش کد تخفیف' : 'ایجاد کد تخفیف جدید'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#6A7873] hover:text-[#0F4C3A] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
                  کد تخفیف (لاتین):
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. HEDYEH20"
                  className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F4C3A] mb-1">نوع تخفیف:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
                  >
                    <option value="percentage">درصدی (%)</option>
                    <option value="fixed">مبلغ ثابت (تومان)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
                    مقدار تخفیف ({type === 'percentage' ? 'درصد' : 'تومان'}):
                  </label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
                    حداقل مبلغ سفارش (تومان):
                  </label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
                    حداکثر سقف تخفیف (تومان):
                  </label>
                  <input
                    type="number"
                    value={maxDiscountAmount || ''}
                    onChange={(e) =>
                      setMaxDiscountAmount(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="اختیاری"
                    className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
                    سقف دفعات استفاده:
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
                    تاریخ انقضا (شمسی):
                  </label>
                  <input
                    type="text"
                    value={expiresAtFa}
                    onChange={(e) => setExpiresAtFa(e.target.value)}
                    placeholder="۱۴۰۵/۱۲/۲۹"
                    className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F4C3A] mb-1">توضیح کد:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: تخفیف ویژه اعضای خبرنامه یا کمپین نوروزی"
                  className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="coupon-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#0F4C3A] rounded border-[#E0D8C8]"
                />
                <label htmlFor="coupon-active" className="text-xs text-[#1C2826] font-semibold">
                  کد تخفیف هم‌اکنون فعال و قابل اعمال در سبد خرید باشد
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#EAE6DF]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-[#6A7873] hover:text-[#1C2826] font-medium"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F4C3A] hover:bg-[#0B3C2E] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  {editingCoupon ? 'ذخیره تغییرات' : 'ثبت کد تخفیف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
