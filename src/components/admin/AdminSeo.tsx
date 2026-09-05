import React, { useState } from 'react';
import { StoreSettings, Product, Category, BlogPost, BlogCategory } from '../../types';
import { Globe, Search, Code2, CheckCircle, Save, ExternalLink, Sparkles, Copy, Check } from 'lucide-react';
import { toPersianDigits } from '../../utils/formatters';

interface AdminSeoProps {
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  products: Product[];
  categories: Category[];
  blogPosts?: BlogPost[];
  blogCategories?: BlogCategory[];
  onSaveSettings: (updated: StoreSettings) => void;
}

export const AdminSeo: React.FC<AdminSeoProps> = ({
  settings,
  setSettings,
  products,
  categories,
  blogPosts = [],
  blogCategories = [],
  onSaveSettings,
}) => {
  const [defaultMetaTitle, setDefaultMetaTitle] = useState(
    settings.defaultMetaTitle || 'یادمان | پک‌های هدیه و هدایای سازمانی'
  );
  const [defaultMetaDescription, setDefaultMetaDescription] = useState(
    settings.defaultMetaDescription ||
      'یادمان؛ انتخابی برای هدیه‌های ماندگار. ارائه پک‌های هدیه شخصی و سازمانی با امکان شخصی‌سازی و طراحی پک اختصاصی.'
  );
  const [canonicalBaseUrl, setCanonicalBaseUrl] = useState(
    settings.canonicalBaseUrl || 'https://yadman.ir'
  );
  const [defaultOgImage, setDefaultOgImage] = useState(
    settings.defaultOgImage || 'https://yadman.ir/og-cover.jpg'
  );
  const [saved, setSaved] = useState(false);
  const [copiedTab, setCopiedTab] = useState<'sitemap' | 'schema' | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreSettings = {
      ...settings,
      defaultMetaTitle,
      defaultMetaDescription,
      canonicalBaseUrl,
      defaultOgImage,
    };
    setSettings(updated);
    onSaveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const publishedBlogPosts = blogPosts.filter((p) => p.status === 'published');

  const generateSitemapXml = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${canonicalBaseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${canonicalBaseUrl}/corporate-gifts</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${canonicalBaseUrl}/custom-gift-box</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${canonicalBaseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${categories
  .filter((c) => c.id !== 'all')
  .map(
    (c) => `  <url>
    <loc>${canonicalBaseUrl}/category/${c.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
${products
  .map(
    (p) => `  <url>
    <loc>${canonicalBaseUrl}/product/${p.slug || p.id}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
${blogCategories
  .map(
    (bc) => `  <url>
    <loc>${canonicalBaseUrl}/blog/category/${bc.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
${publishedBlogPosts
  .map(
    (bp) => `  <url>
    <loc>${canonicalBaseUrl}/blog/${bp.slug}</loc>
    <lastmod>${(bp.updatedAt || bp.publishedAt || new Date().toISOString()).split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  };

  const generateSchemaJsonLd = () => {
    return JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${canonicalBaseUrl}/#organization`,
            name: 'یادمان',
            url: canonicalBaseUrl,
            logo: `${canonicalBaseUrl}/logo.svg`,
            sameAs: [
              `https://instagram.com/${settings.instagramHandle || 'yadman_gifts'}`,
              `https://t.me/${settings.telegramHandle || 'yadman_gifts_official'}`,
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+98-21-88880000',
              contactType: 'customer service',
              areaServed: 'IR',
              availableLanguage: ['Persian', 'English'],
            },
          },
          {
            '@type': 'WebSite',
            '@id': `${canonicalBaseUrl}/#website`,
            url: canonicalBaseUrl,
            name: 'یادمان',
            description: defaultMetaDescription,
            publisher: { '@id': `${canonicalBaseUrl}/#organization` },
            potentialAction: {
              '@type': 'SearchAction',
              target: `${canonicalBaseUrl}/?search={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      },
      null,
      2
    );
  };

  const copyToClipboard = (text: string, type: 'sitemap' | 'schema') => {
    navigator.clipboard.writeText(text);
    setCopiedTab(type);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="space-y-8 text-right">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F4C3A] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#D4AF37]" />
            <span>مدیریت جامع سئو، متاتگ‌ها و داده‌های ساختاریافته (Schema.org)</span>
          </h2>
          <p className="text-xs text-[#6A7873] mt-1">
            پیکربندی متاتگ‌های گوگل، پیش‌نمایش زنده در نتایج جستجو (SERP)، نقشه سایت و اسکیما
          </p>
        </div>

        <button
          onClick={handleSave}
          id="btn-save-seo"
          className="flex items-center justify-center gap-2 bg-[#0F4C3A] hover:bg-[#0B3C2E] text-[#FAF8F5] px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#D4AF37]" />
          <span>ذخیره تنظیمات سئو</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>تنظیمات متاتگ‌ها و سئوی سایت با موفقیت بروزرسانی و ذخیره شد.</span>
        </div>
      )}

      {/* Google SERP Live Simulator */}
      <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-[#0F4C3A] flex items-center gap-2">
          <Search className="w-4 h-4 text-[#D4AF37]" />
          <span>پیش‌نمایش زنده در موتور جستجوی گوگل (Google SERP Preview)</span>
        </h3>

        <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-[#DADCE0] space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-[12px] text-[#202124] dir-ltr text-left">
            <div className="w-6 h-6 rounded-full bg-[#0F4C3A] text-white flex items-center justify-center font-bold text-[10px]">
              Y
            </div>
            <div>
              <span className="font-medium text-[#202124] block leading-none">Yadman Luxury Gifts</span>
              <span className="text-[#5F6368] text-[11px] block">{canonicalBaseUrl}</span>
            </div>
          </div>

          <h4 className="text-[#1A0DAB] hover:underline text-base sm:text-lg font-medium cursor-pointer line-clamp-1 pt-1">
            {defaultMetaTitle}
          </h4>

          <p className="text-[#4D5156] text-xs leading-relaxed line-clamp-2">
            {defaultMetaDescription}
          </p>

          <div className="flex items-center gap-4 pt-2 text-[11px] text-[#1A0DAB]">
            <span className="hover:underline cursor-pointer">هدایای سازمانی VIP</span>
            <span className="hover:underline cursor-pointer">پک‌های زعفران و هل</span>
            <span className="hover:underline cursor-pointer">سفارش جعبه اختصاصی</span>
          </div>
        </div>
      </div>

      {/* SEO Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-xs space-y-6">
        <h3 className="font-extrabold text-sm text-[#0F4C3A]">پیکربندی متاتگ‌های پیش‌فرض سایت</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#0F4C3A]">
                  عنوان سئو پیش‌فرض (Meta Title):
                </label>
                <span className={`text-[10px] ${defaultMetaTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-[#8C8375]'}`}>
                  {toPersianDigits(defaultMetaTitle.length)} / ۶۰ کاراکتر
                </span>
              </div>
              <input
                type="text"
                required
                value={defaultMetaTitle}
                onChange={(e) => setDefaultMetaTitle(e.target.value)}
                className="w-full bg-[#FAF8F5] text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#0F4C3A]">
                  توضیحات متا پیش‌فرض (Meta Description):
                </label>
                <span className={`text-[10px] ${defaultMetaDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-[#8C8375]'}`}>
                  {toPersianDigits(defaultMetaDescription.length)} / ۱۶۰ کاراکتر
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={defaultMetaDescription}
                onChange={(e) => setDefaultMetaDescription(e.target.value)}
                className="w-full bg-[#FAF8F5] text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
                آدرس پایه و پیوند کانونیکال (Canonical URL Base):
              </label>
              <input
                type="url"
                required
                value={canonicalBaseUrl}
                onChange={(e) => setCanonicalBaseUrl(e.target.value)}
                className="w-full bg-[#FAF8F5] text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none font-mono dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
                تصویر اشتراک‌گذاری در شبکه‌های اجتماعی (og:image):
              </label>
              <input
                type="url"
                value={defaultOgImage}
                onChange={(e) => setDefaultOgImage(e.target.value)}
                className="w-full bg-[#FAF8F5] text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none font-mono dir-ltr text-left"
              />
            </div>

            <div className="p-4 bg-[#0F4C3A]/5 rounded-xl border border-[#0F4C3A]/10 text-xs space-y-1.5 text-[#3A4A45]">
              <span className="font-bold text-[#0F4C3A] block">نکته تخصصی سئو:</span>
              <p className="leading-relaxed">
                تمام صفحات محصولات و دسته‌بندی‌ها به طور خودکار از تگ‌های کانونیکال اختصاصی، عناوین بهینه‌شده فارسی و تصاویر با ویژگی alt بهره‌مند هستند.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* XML Sitemap & Schema Code Generators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sitemap */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-[#0F4C3A] flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#D4AF37]" />
              <span>نقشه سایت داینامیک (sitemap.xml)</span>
            </h3>
            <button
              onClick={() => copyToClipboard(generateSitemapXml(), 'sitemap')}
              className="flex items-center gap-1 text-[11px] text-[#0F4C3A] hover:bg-[#F4EFE6] px-2.5 py-1 rounded-lg transition font-medium"
            >
              {copiedTab === 'sitemap' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی کد Sitemap</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-[#1C2826] text-[#E0D8C8] p-4 rounded-xl text-[11px] font-mono h-48 overflow-y-auto dir-ltr text-left">
            {generateSitemapXml()}
          </pre>
        </div>

        {/* Schema */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-[#0F4C3A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>داده‌های ساختاریافته JSON-LD (Schema.org)</span>
            </h3>
            <button
              onClick={() => copyToClipboard(generateSchemaJsonLd(), 'schema')}
              className="flex items-center gap-1 text-[11px] text-[#0F4C3A] hover:bg-[#F4EFE6] px-2.5 py-1 rounded-lg transition font-medium"
            >
              {copiedTab === 'schema' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی Schema</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-[#1C2826] text-[#E0D8C8] p-4 rounded-xl text-[11px] font-mono h-48 overflow-y-auto dir-ltr text-left">
            {generateSchemaJsonLd()}
          </pre>
        </div>
      </div>
    </div>
  );
};
