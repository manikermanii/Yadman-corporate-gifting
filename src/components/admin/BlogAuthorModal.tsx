import React, { useState, useEffect } from 'react';
import { BlogAuthor } from '../../types';
import { X, Save, User } from 'lucide-react';

interface BlogAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: BlogAuthor | null;
  onSave: (savedAuthor: BlogAuthor) => void;
}

export const BlogAuthorModal: React.FC<BlogAuthorModalProps> = ({
  isOpen,
  onClose,
  author,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [socialLink, setSocialLink] = useState('');

  useEffect(() => {
    if (author) {
      setName(author.name);
      setRole(author.role);
      setAvatar(author.avatar);
      setBio(author.bio || '');
      setEmail(author.email || '');
      setSocialLink(author.socialLink || '');
    } else {
      setName('');
      setRole('');
      setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
      setBio('');
      setEmail('');
      setSocialLink('');
    }
  }, [author, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    onSave({
      id: author ? author.id : `author-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      avatar: avatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: bio.trim(),
      email: email.trim(),
      socialLink: socialLink.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 text-right">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE6DF] overflow-hidden animate-fadeIn">
        <div className="bg-[#0F4C3A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-bold text-sm sm:text-base">
              {author ? 'ویرایش نویسنده' : 'افزودن نویسنده جدید'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F4C3A]">نام و نام خانوادگی</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: سارا مهدی‌زاده"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DF] text-xs focus:border-[#0F4C3A] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F4C3A]">سمت / عنوان تخصص</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="کارشناس ارشد تشریفات"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DF] text-xs focus:border-[#0F4C3A] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F4C3A]">آدرس تصویر آواتار</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DF] text-xs focus:border-[#0F4C3A] focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F4C3A]">بیوگرافی کوتاه</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="توضیح مختصر درباره سوابق و تجربیات نویسنده..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DF] text-xs focus:border-[#0F4C3A] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F4C3A]">ایمیل نویسنده</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="author@yadman.ir"
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DF] text-xs focus:border-[#0F4C3A] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F4C3A]">لینک شبکه اجتماعی (اختیاری)</label>
              <input
                type="url"
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DF] text-xs focus:border-[#0F4C3A] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAE6DF] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#6A7873] hover:bg-[#FAF8F5] rounded-xl"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0F4C3A] text-white text-xs font-bold rounded-xl hover:bg-[#155A45] shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره نویسنده</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
