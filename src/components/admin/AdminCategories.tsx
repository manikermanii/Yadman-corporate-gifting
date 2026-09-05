import React, { useState } from 'react';
import { Category, CategoryId } from '../../types';
import { toPersianDigits } from '../../utils/formatters';
import { Plus, Edit2, Trash2, Tag, Check, X, Sparkles, Layers } from 'lucide-react';

interface AdminCategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onSaveCategories: (updated: Category[]) => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  setCategories,
  onSaveCategories,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [descriptionFa, setDescriptionFa] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const openCreateModal = () => {
    setEditingCategory(null);
    setNameFa('');
    setNameEn('');
    setSlug('');
    setDescriptionFa('');
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setNameFa(cat.nameFa);
    setNameEn(cat.nameEn);
    setSlug(cat.slug);
    setDescriptionFa(cat.descriptionFa);
    setIsFeatured(!!cat.isFeatured);
    setIsModalOpen(true);
  };

  const handleDelete = (id: CategoryId) => {
    if (id === 'all') {
      alert('دسته «همه مجموعه‌ها» قابل حذف نمی‌باشد.');
      return;
    }
    if (confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      onSaveCategories(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa || !slug) return;

    if (editingCategory) {
      const updated = categories.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              nameFa,
              nameEn,
              slug,
              descriptionFa,
              isFeatured,
            }
          : c
      );
      setCategories(updated);
      onSaveCategories(updated);
    } else {
      const newId = `cat_${Date.now()}` as CategoryId;
      const newCat: Category = {
        id: newId,
        nameFa,
        nameEn: nameEn || 'Custom Category',
        slug,
        descriptionFa,
        isFeatured,
        iconName: 'Gift',
      };
      const updated = [...categories, newCat];
      setCategories(updated);
      onSaveCategories(updated);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F4C3A] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#D4AF37]" />
            <span>مدیریت دسته‌بندی‌های محصولات</span>
          </h2>
          <p className="text-xs text-[#6A7873] mt-1">
            تعریف، ویرایش و ساماندهی دسته‌های هدیه شخصی و هدایای سازمانی با قابلیت سئو
          </p>
        </div>

        <button
          onClick={openCreateModal}
          id="btn-add-category"
          className="flex items-center justify-center gap-2 bg-[#0F4C3A] hover:bg-[#0B3C2E] text-[#FAF8F5] px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>افزودن دسته‌بندی جدید</span>
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#EAE6DF] text-center space-y-3 text-[#6A7873]">
          <Tag className="w-10 h-10 text-[#D4AF37] mx-auto opacity-70" />
          <h3 className="font-bold text-sm text-[#0F4C3A]">هنوز دسته‌بندی جدیدی اضافه نشده است</h3>
          <p className="text-xs max-w-sm mx-auto">
            برای ایجاد اولین دسته‌بندی محصولات، بر روی دکمه «افزودن دسته‌بندی جدید» کلیک کنید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-xs hover:border-[#D4AF37]/50 transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0F4C3A] text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    {cat.nameFa}
                  </span>
                  {cat.isFeatured && (
                    <span className="bg-[#0F4C3A]/10 text-[#0F4C3A] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      ویژه
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#6A7873] font-english-serif tracking-wider">
                  {cat.nameEn}
                </p>

                <p className="text-xs text-[#3A4A45] line-clamp-2 leading-relaxed">
                  {cat.descriptionFa || 'بدون توضیحات تکمیلی'}
                </p>

                <div className="text-[10px] text-[#8C8375] bg-[#FAF8F5] p-2 rounded-lg border border-[#EAE6DF] font-mono">
                  slug: /{cat.slug}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#EAE6DF]">
                <span className="text-[11px] text-[#6A7873]">
                  ترتیب نمایش: {toPersianDigits(idx + 1)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-[#0F4C3A] hover:bg-[#F4EFE6] rounded-lg transition"
                    title="ویرایش"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {cat.id !== 'all' && (
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-[#800020] hover:bg-red-50 rounded-lg transition"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-lg rounded-2xl border border-[#D4AF37]/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
              <h3 className="font-extrabold text-[#0F4C3A] text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <span>{editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}</span>
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
                  نام دسته‌بندی (فارسی):
                </label>
                <input
                  type="text"
                  required
                  value={nameFa}
                  onChange={(e) => setNameFa(e.target.value)}
                  placeholder="مثال: پک‌های هدایای یلدا"
                  className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
                  نام انگلیسی (جهت نمایش سئو و متادیتا):
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Yalda Special Gift Boxes"
                  className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none font-english-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
                  نامک پیوند یکتا (Slug URL):
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="e.g. yalda-gifts"
                  className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F4C3A] mb-1">
                  توضیحات دسته‌بندی و متای سئو:
                </label>
                <textarea
                  rows={3}
                  value={descriptionFa}
                  onChange={(e) => setDescriptionFa(e.target.value)}
                  placeholder="توضیح کوتاه درباره محتوای این دسته از هدایا..."
                  className="w-full bg-white text-xs p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cat-featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#0F4C3A] rounded border-[#E0D8C8]"
                />
                <label htmlFor="cat-featured" className="text-xs text-[#1C2826] font-semibold">
                  نمایش به عنوان دسته ویژه در صفحه اصلی و منوی ناوبری
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
                  {editingCategory ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
