import React, { useState } from 'react';
import { PlusCircle, Search, Edit, Trash2, Sliders, Save, Sparkles } from 'lucide-react';
import { CustomContentItem } from '../../types';
import { formatToman } from '../../utils/formatters';

interface AdminCustomItemsProps {
  customItems: CustomContentItem[];
  onUpdateCustomItem: (item: CustomContentItem) => void;
  onAddCustomItem: (item: CustomContentItem) => void;
  onDeleteCustomItem: (id: string) => void;
}

export const AdminCustomItems: React.FC<AdminCustomItemsProps> = ({
  customItems,
  onUpdateCustomItem,
  onAddCustomItem,
  onDeleteCustomItem,
}) => {
  const [editingItem, setEditingItem] = useState<CustomContentItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [nameFa, setNameFa] = useState('');
  const [category, setCategory] = useState<CustomContentItem['category']>('saffron');
  const [price, setPrice] = useState<number>(500000);
  const [weightGrams, setWeightGrams] = useState<number>(100);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const filteredItems = customItems.filter(
    (item) =>
      !searchQuery ||
      item.nameFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (item: CustomContentItem) => {
    setEditingItem(item);
    setIsNew(false);
    setNameFa(item.nameFa);
    setCategory(item.category);
    setPrice(item.price);
    setWeightGrams(item.weightGrams);
    setDescription(item.description);
    setImage(item.image);
  };

  const handleOpenAdd = () => {
    setIsNew(true);
    setEditingItem({
      id: `custom-item-${Date.now()}`,
      nameFa: '',
      category: 'saffron',
      price: 650000,
      weightGrams: 150,
      description: '',
      image: customItems[0]?.image || '',
      inStock: true,
    });
    setNameFa('');
    setCategory('saffron');
    setPrice(650000);
    setWeightGrams(150);
    setDescription('');
    setImage(customItems[0]?.image || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa || !editingItem) return;

    const saved: CustomContentItem = {
      ...editingItem,
      nameFa,
      category,
      price: Number(price),
      weightGrams: Number(weightGrams),
      description,
      image: image || editingItem.image,
    };

    if (isNew) {
      onAddCustomItem(saved);
    } else {
      onUpdateCustomItem(saved);
    }

    setEditingItem(null);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F4C3A]">
            مدیریت اقلام و متریال ساخت باکس اختصاصی
          </h1>
          <p className="text-xs text-[#6A7873] mt-1">
            ویرایش قیمت، وزن و مشخصات زعفران، صنایع دستی، دمنوش‌ها و اکسسوری‌های قابل انتخاب در استودیوی ساخت باکس
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#0F4C3A] hover:bg-[#0B3C2E] text-white px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
        >
          <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
          <span>افزودن قلم جدید</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-[#EAE6DF] shadow-xs">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در میان اقلام داخل باکس..."
            className="w-full bg-[#FAF8F5] text-xs text-[#1C2826] pr-10 pl-4 py-2.5 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#8C8375] absolute right-3.5 top-3" />
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE6DF] space-y-3 text-[#6A7873]">
          <Sliders className="w-10 h-10 text-[#D4AF37] mx-auto opacity-70" />
          <h3 className="font-bold text-sm text-[#0F4C3A]">هنوز قلمی برای ساخت پک اختصاصی تعریف نشده است</h3>
          <p className="text-xs max-w-sm mx-auto">
            برای ایجاد اولین آیتم سفارشی، روی دکمه «افزودن قلم جدید» کلیک نمایید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-[#EAE6DF] shadow-xs space-y-3 flex flex-col justify-between hover:border-[#D4AF37] transition"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-[#0F4C3A]">{item.nameFa}</h3>
                  <span className="text-[10px] bg-[#F4EFE6] text-[#0F4C3A] font-bold px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-[#4A5A55] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F4EFE6] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8C8375] block">قیمت:</span>
                  <span className="font-extrabold text-sm text-[#0F4C3A]">
                    {formatToman(item.price)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="bg-[#F4EFE6] hover:bg-[#0F4C3A] hover:text-white text-[#0F4C3A] px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>ویرایش</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`آیا از حذف قلم "${item.nameFa}" اطمینان دارید؟`)) {
                        onDeleteCustomItem(item.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Edit/Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div
            className="bg-[#FAF8F5] w-full max-w-xl rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl overflow-hidden text-right relative p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
              <h2 className="font-extrabold text-base text-[#0F4C3A] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#D4AF37]" />
                {isNew ? 'افزودن متریال / محصول جدید برای باکس' : `ویرایش: ${editingItem.nameFa}`}
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-[#0F4C3A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0F4C3A] mb-1">نام قلم کالا: *</label>
                <input
                  type="text"
                  required
                  value={nameFa}
                  onChange={(e) => setNameFa(e.target.value)}
                  placeholder="مثال: زعفران سوپر نگین صادراتی (۳ مثقال)"
                  className="w-full bg-white p-3 rounded-xl border border-[#E0D8C8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0F4C3A] mb-1">دسته‌بندی:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white p-3 rounded-xl border border-[#E0D8C8]"
                  >
                    <option value="saffron">زعفران و هل</option>
                    <option value="sweets">شیرینی و گز و نبات</option>
                    <option value="crafts">صنایع دستی و هاون</option>
                    <option value="drinks">دمنوش و چای</option>
                    <option value="scent">عطر و گلاب و شمع</option>
                    <option value="cards">کتاب و دیوان حافظ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0F4C3A] mb-1">قیمت (تومان): *</label>
                  <input
                    type="number"
                    required
                    step={10000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white p-3 rounded-xl border border-[#E0D8C8] font-bold text-[#0F4C3A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0F4C3A] mb-1">توضیح کوتاه:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیح خاستگاه، کیفیت یا ظرف..."
                  className="w-full bg-white p-3 rounded-xl border border-[#E0D8C8]"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#EAE6DF]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-[#D0C8B8] font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-[#0F4C3A] hover:bg-[#0B3C2E] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition"
                >
                  <Save className="w-4 h-4 text-[#D4AF37]" />
                  <span>ذخیره قلم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
