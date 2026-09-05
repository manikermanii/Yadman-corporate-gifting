import React, { useState } from 'react';
import { ProductReview, Product } from '../../types';
import { toPersianDigits } from '../../utils/formatters';
import { MessageSquare, Star, CheckCircle, XCircle, Trash2, Search, ThumbsUp, ShieldCheck, Mic } from 'lucide-react';
import { AudioPlayer } from '../common/AudioPlayer';

interface AdminReviewsProps {
  reviews: ProductReview[];
  setReviews: React.Dispatch<React.SetStateAction<ProductReview[]>>;
  products: Product[];
  onSaveReviews: (updated: ProductReview[]) => void;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({
  reviews,
  setReviews,
  products,
  onSaveReviews,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReviews = reviews.filter((r) => {
    const matchStatus = filterStatus === 'all' ? true : r.status === filterStatus;
    const matchSearch =
      r.authorName.includes(searchTerm) ||
      r.comment.includes(searchTerm) ||
      r.companyName?.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    setReviews(updated);
    onSaveReviews(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این نظر اطمینان دارید؟')) {
      const updated = reviews.filter((r) => r.id !== id);
      setReviews(updated);
      onSaveReviews(updated);
    }
  };

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;

  return (
    <div className="space-y-6 text-right">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F4C3A] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
            <span>مدیریت و تایید نظرات و تجربیات خریداران</span>
          </h2>
          <p className="text-xs text-[#6A7873] mt-1">
            بررسی و انتشار نظرات مشتریان، تایید خریداران واقعی و پایش امتیاز محصولات
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE6DF]">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'all'
                ? 'bg-[#0F4C3A] text-white'
                : 'text-[#6A7873] hover:text-[#0F4C3A]'
            }`}
          >
            همه ({toPersianDigits(reviews.length)})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white'
                : 'text-[#6A7873] hover:text-amber-700'
            }`}
          >
            در انتظار تایید ({toPersianDigits(pendingCount)})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'approved'
                ? 'bg-emerald-700 text-white'
                : 'text-[#6A7873] hover:text-emerald-700'
            }`}
          >
            منتشر شده ({toPersianDigits(approvedCount)})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE6DF] shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-[#8C8375]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="جستجو در متن نظر، نام نویسنده یا شرکت..."
          className="w-full text-xs bg-transparent focus:outline-none text-[#1C2826]"
        />
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#EAE6DF] text-[#6A7873] text-xs">
            نظری در این بخش یافت نشد.
          </div>
        ) : (
          filteredReviews.map((review) => {
            const product = products.find((p) => p.id === review.productId);
            return (
              <div
                key={review.id}
                className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-xs hover:border-[#D4AF37]/50 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE6DF] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center font-bold text-sm">
                      {review.authorName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#0F4C3A] text-sm">
                          {review.authorName}
                        </span>
                        {review.voiceRecording && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] bg-[#0F4C3A]/10 text-[#0F4C3A] font-bold px-1.5 py-0.5 rounded-full" title="دارای پیام صوتی">
                            <Mic className="w-3 h-3 text-[#D4AF37]" />
                            <span>صوت</span>
                          </span>
                        )}
                        {review.companyName && (
                          <span className="text-[11px] text-[#6A7873] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE6DF]">
                            {review.companyName}
                          </span>
                        )}
                        {review.isVerifiedBuyer && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                            <ShieldCheck className="w-3 h-3" />
                            خریدار تایید شده
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8C8375]">{review.createdAtFa}</span>
                    </div>
                  </div>

                  {/* Rating Stars & Status */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[#D4AF37]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'fill-[#D4AF37]' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        review.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : review.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {review.status === 'approved'
                        ? 'منتشر شده'
                        : review.status === 'pending'
                        ? 'در انتظار بررسی'
                        : 'رد شده'}
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-[#2C3B37] leading-relaxed pr-2">
                  {review.comment}
                </p>

                {/* Voice Recording Player */}
                {review.voiceRecording && (
                  <div className="pt-2">
                    <AudioPlayer
                      recording={review.voiceRecording}
                      title={`پیام صوتی ${review.authorName}`}
                      compact={true}
                    />
                  </div>
                )}

                {/* Associated Product & Action buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#EAE6DF] text-xs">
                  <div className="text-[11px] text-[#6A7873] flex items-center gap-2">
                    <span>محصول مربوطه:</span>
                    <span className="font-bold text-[#0F4C3A]">
                      {product ? product.titleFa : 'محصول حذف شده'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#8C8375] mr-3">
                      <ThumbsUp className="w-3 h-3" />
                      {toPersianDigits(review.likesCount)} پسند
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(review.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>تایید و انتشار</span>
                      </button>
                    )}

                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(review.id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>عدم انتشار</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-1.5 text-[#800020] hover:bg-red-50 rounded-lg transition"
                      title="حذف کامل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
