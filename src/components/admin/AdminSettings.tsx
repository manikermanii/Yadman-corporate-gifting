import React, { useState } from 'react';
import { Save, Settings, Store, Truck, Phone, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { StoreSettings } from '../../types';
import { formatToman } from '../../utils/formatters';

interface AdminSettingsProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onSaveSettings }) => {
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 text-right max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F4C3A]">
            تنظیمات عمومی فروشگاه و بسته‌بندی
          </h1>
          <p className="text-xs text-[#6A7873] mt-1">
            پیکربندی سقف ارسال رایگان، متن اطلاعیه بالای سایت، اطلاعات پشتیبانی و خدمات اختصاصی
          </p>
        </div>

        {isSaved && (
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>تنظیمات با موفقیت ذخیره شد</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Store Identity & Announcement */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE6DF] shadow-xs space-y-4">
          <h2 className="font-extrabold text-sm text-[#0F4C3A] flex items-center gap-2 border-b border-[#F4EFE6] pb-3">
            <Store className="w-4 h-4 text-[#D4AF37]" />
            هویت فروشگاه و پیام‌های اطلاع‌رسانی
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#0F4C3A] mb-1">
                نام فارسی فروشگاه:
              </label>
              <input
                type="text"
                value={formData.storeNameFa}
                onChange={(e) => setFormData({ ...formData, storeNameFa: e.target.value })}
                className="w-full bg-[#FAF8F5] p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0F4C3A] mb-1">
                عنوان انگلیسی (Brand Name):
              </label>
              <input
                type="text"
                value={formData.storeNameEn}
                onChange={(e) => setFormData({ ...formData, storeNameEn: e.target.value })}
                className="w-full bg-[#FAF8F5] p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none font-english-serif"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0F4C3A] mb-1">
              متن نوار اطلاعیه بالای سایت:
            </label>
            <input
              type="text"
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              className="w-full bg-[#FAF8F5] p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
            />
          </div>
        </div>

        {/* Shipping & Financial Rules */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE6DF] shadow-xs space-y-4">
          <h2 className="font-extrabold text-sm text-[#0F4C3A] flex items-center gap-2 border-b border-[#F4EFE6] pb-3">
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            قوانین ارسال و حمل و نقل
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#0F4C3A] mb-1">
                سقف مبلغ خرید برای ارسال رایگان (تومان):
              </label>
              <input
                type="number"
                step={100000}
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                className="w-full bg-[#FAF8F5] p-3 rounded-xl border border-[#E0D8C8] font-bold text-[#0F4C3A]"
              />
              <span className="text-[11px] text-[#8C8375] block mt-1">
                سفارش‌های بالای {formatToman(formData.freeShippingThreshold)} بدون هزینه ارسال خواهند بود.
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE6DF] shadow-xs space-y-4">
          <h2 className="font-extrabold text-sm text-[#0F4C3A] flex items-center gap-2 border-b border-[#F4EFE6] pb-3">
            <Phone className="w-4 h-4 text-[#D4AF37]" />
            شماره‌های تماس و واحد سازمانی
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#0F4C3A] mb-1">
                شماره پشتیبانی مشتریان:
              </label>
              <input
                type="text"
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="w-full bg-[#FAF8F5] p-3 rounded-xl border border-[#E0D8C8] font-mono text-[#0F4C3A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0F4C3A] mb-1">
                تلفن واحد فروش سازمانی:
              </label>
              <input
                type="text"
                value={formData.corporatePhone}
                onChange={(e) => setFormData({ ...formData, corporatePhone: e.target.value })}
                className="w-full bg-[#FAF8F5] p-3 rounded-xl border border-[#E0D8C8] font-mono text-[#0F4C3A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0F4C3A] mb-1">
                ایمیل واحد سازمانی:
              </label>
              <input
                type="email"
                value={formData.corporateEmail}
                onChange={(e) => setFormData({ ...formData, corporateEmail: e.target.value })}
                className="w-full bg-[#FAF8F5] p-3 rounded-xl border border-[#E0D8C8] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Packaging Features Toggles */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE6DF] shadow-xs space-y-4">
          <h2 className="font-extrabold text-sm text-[#0F4C3A] flex items-center gap-2 border-b border-[#F4EFE6] pb-3">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            سفارشی‌سازی‌های فعال در سبد خرید
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.customRibbonEnabled}
                onChange={(e) => setFormData({ ...formData, customRibbonEnabled: e.target.checked })}
                className="w-4 h-4 text-[#0F4C3A] rounded border-gray-300"
              />
              <div>
                <span className="font-bold text-[#0F4C3A] block">انتخاب رنگ روبان</span>
                <span className="text-[10px] text-[#8C8375]">امکان انتخاب روبان توسط مشتری</span>
              </div>
            </label>

            <label className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.waxSealEnabled}
                onChange={(e) => setFormData({ ...formData, waxSealEnabled: e.target.checked })}
                className="w-4 h-4 text-[#0F4C3A] rounded border-gray-300"
              />
              <div>
                <span className="font-bold text-[#0F4C3A] block">مهر و موم مومی</span>
                <span className="text-[10px] text-[#8C8375]">امکان انتخاب طرح مهر مومی</span>
              </div>
            </label>

            <label className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.freeCalligraphyEnabled}
                onChange={(e) => setFormData({ ...formData, freeCalligraphyEnabled: e.target.checked })}
                className="w-4 h-4 text-[#0F4C3A] rounded border-gray-300"
              />
              <div>
                <span className="font-bold text-[#0F4C3A] block">کارت تبریک رایگان</span>
                <span className="text-[10px] text-[#8C8375]">خدمت خطاطی و چاپ کارت هدیه</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#0F4C3A] hover:bg-[#0B3C2E] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition"
          >
            <Save className="w-4 h-4 text-[#D4AF37]" />
            <span>ذخیره کلیه تنظیمات فروشگاه</span>
          </button>
        </div>

      </form>

    </div>
  );
};
