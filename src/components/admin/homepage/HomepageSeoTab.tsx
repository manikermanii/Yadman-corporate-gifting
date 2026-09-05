import React, { useState } from 'react';
import { HomepageSeoConfig } from '../../../types';
import { ImageUploadField } from '../../common/ImageUploadField';
import { HERO_BANNER_IMAGE } from '../../../data/products';
import {
  Search,
  Share2,
  Tag,
  Plus,
  X,
  ExternalLink,
  Globe,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface HomepageSeoTabProps {
  seo: HomepageSeoConfig;
  onChange: (updated: HomepageSeoConfig) => void;
}

export const HomepageSeoTab: React.FC<HomepageSeoTabProps> = ({ seo, onChange }) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const kw = newKeyword.trim();
    if (!seo.keywords?.includes(kw)) {
      onChange({ ...seo, keywords: [...(seo.keywords || []), kw] });
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    onChange({ ...seo, keywords: (seo.keywords || []).filter((k) => k !== kw) });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Meta Title & Description */}
      <div className="bg-white p-6 rounded-3xl border border-[#EAE6DF] shadow-xs space-y-4">
        <h2 className="font-extrabold text-sm text-[#0F4C3A] flex items-center gap-2 border-b border-[#F4EFE6] pb-3">
          <Search className="w-4 h-4 text-[#D4AF37]" />
          <span>عنوان و توضیحات متای صفحه اصلی (Google Search Snippet)</span>
        </h2>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#0F4C3A]">
              عنوان صفحه در موتورهای جستجو (Meta Title):
            </label>
            <span
              className={`text-[10px] font-bold ${
                (seo.metaTitle?.length || 0) > 65 ? 'text-amber-700' : 'text-[#6A7873]'
              }`}
            >
              {seo.metaTitle?.length || 0} / ۶۰ کاراکتر (طول بهینه)
            </span>
          </div>
          <input
            type="text"
            value={seo.metaTitle || ''}
            onChange={(e) => onChange({ ...seo, metaTitle: e.target.value })}
            className="w-full bg-[#FAF8F5] p-3 rounded-xl border border-[#E0D8C8] text-xs font-extrabold text-[#0F4C3A] focus:outline-none"
            placeholder="یادمان | پک‌های هدیه لوکس و هدایای سازمانی فاخر"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#0F4C3A]">
              توضیحات متای صفحه (Meta Description):
            </label>
            <span
              className={`text-[10px] font-bold ${
                (seo.metaDescription?.length || 0) > 160 ? 'text-amber-700' : 'text-[#6A7873]'
              }`}
            >
              {seo.metaDescription?.length || 0} / ۱۶۰ کاراکتر (طول بهینه)
            </span>
          </div>
          <textarea
            rows={3}
            value={seo.metaDescription || ''}
            onChange={(e) => onChange({ ...seo, metaDescription: e.target.value })}
            className="w-full bg-[#FAF8F5] p-3 rounded-xl border border-[#E0D8C8] text-xs leading-relaxed focus:outline-none"
            placeholder="یادمان؛ ارائه پک‌های هدیه لوکس زعفران، صنایع دستی و هدایای سازمانی..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
            آدرس کانونیکال (Canonical URL):
          </label>
          <input
            type="url"
            value={seo.canonicalUrl || 'https://yadman.ir'}
            onChange={(e) => onChange({ ...seo, canonicalUrl: e.target.value })}
            className="w-full bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E0D8C8] text-xs font-mono text-left"
            placeholder="https://yadman.ir"
            dir="ltr"
          />
        </div>

        {/* Live Google Search Preview */}
        <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-gray-200 space-y-1 text-left" dir="ltr">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Google Search Preview Simulator
          </span>
          <div className="text-xs text-[#202124] font-sans flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#0F4C3A] text-white text-[9px] flex items-center justify-center font-bold">
              Y
            </span>
            <span className="text-[#202124] font-medium">Yadman Luxury Gifts</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-500 truncate">{seo.canonicalUrl || 'https://yadman.ir'}</span>
          </div>
          <h3 className="text-base text-[#1a0dab] font-medium hover:underline cursor-pointer pt-0.5 line-clamp-1">
            {seo.metaTitle || 'یادمان | پک‌های هدیه لوکس و هدایای سازمانی فاخر'}
          </h3>
          <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed pt-0.5">
            {seo.metaDescription ||
              'یادمان؛ انتخابی برای هدیه‌های ماندگار. ارائه پک‌های هدیه شخصی و سازمانی با امکان شخصی‌سازی و طراحی پک اختصاصی.'}
          </p>
        </div>
      </div>

      {/* 2. Keywords Management */}
      <div className="bg-white p-6 rounded-3xl border border-[#EAE6DF] shadow-xs space-y-4">
        <h2 className="font-extrabold text-sm text-[#0F4C3A] flex items-center gap-2 border-b border-[#F4EFE6] pb-3">
          <Tag className="w-4 h-4 text-[#D4AF37]" />
          <span>کلمات کلیدی سئو (SEO Keywords)</span>
        </h2>

        <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-[#FAF8F5] rounded-2xl border border-[#E0D8C8]">
          {(seo.keywords || []).map((kw, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 bg-white border border-[#D4AF37]/40 text-[#0F4C3A] text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs"
            >
              <span>{kw}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(kw)}
                className="text-gray-400 hover:text-red-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {(!seo.keywords || seo.keywords.length === 0) && (
            <span className="text-xs text-[#8C8375]">هنوز کلمه کلیدی ثبت نشده است.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddKeyword();
              }
            }}
            placeholder="کلمه کلیدی جدید را وارد کنید و اینتر بزنید..."
            className="flex-1 bg-white p-2.5 rounded-xl border border-[#E0D8C8] text-xs"
          />
          <button
            type="button"
            onClick={handleAddKeyword}
            className="px-4 py-2.5 bg-[#0F4C3A] text-white text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-[#0B3C2E] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن تگ</span>
          </button>
        </div>
      </div>

      {/* 3. Open Graph (Social Sharing) */}
      <div className="bg-white p-6 rounded-3xl border border-[#EAE6DF] shadow-xs space-y-4">
        <h2 className="font-extrabold text-sm text-[#0F4C3A] flex items-center gap-2 border-b border-[#F4EFE6] pb-3">
          <Share2 className="w-4 h-4 text-[#D4AF37]" />
          <span>کارت اشتراک‌گذاری شبکه‌های اجتماعی (Open Graph & Twitter Card)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
              عنوان اشتراک (OG Title):
            </label>
            <input
              type="text"
              value={seo.ogTitle || ''}
              onChange={(e) => onChange({ ...seo, ogTitle: e.target.value })}
              className="w-full bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E0D8C8] text-xs font-bold"
              placeholder="یادمان | هدیه‌ای برای ماندن در یاد"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
              توضیحات اشتراک (OG Description):
            </label>
            <input
              type="text"
              value={seo.ogDescription || ''}
              onChange={(e) => onChange({ ...seo, ogDescription: e.target.value })}
              className="w-full bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E0D8C8] text-xs"
              placeholder="پک‌های هدیه فاخر شخصی و سازمانی..."
            />
          </div>
        </div>

        {/* OG Image */}
        <div className="pt-2">
          <ImageUploadField
            label="تصویر کاور اشتراک در شبکه‌های اجتماعی (OG Image):"
            description="تصویری که در تلگرام، واتس‌اپ، لینکدین و توییتر هنگام ارسال لینک سایت نمایش داده می‌شود."
            value={seo.ogImage || HERO_BANNER_IMAGE}
            onChange={(url) => onChange({ ...seo, ogImage: url })}
            defaultImage={HERO_BANNER_IMAGE}
            aspectRatioHint="نسبت 1.91:1 (رزولوشن استاندارد 1200x630 پیکسل)"
          />
        </div>
      </div>

    </div>
  );
};
