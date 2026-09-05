import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  FileText,
  Search,
  Trash2,
  Save,
  MessageSquare,
  AlertCircle,
  Mic,
} from 'lucide-react';
import { CorporateInquiry, CorporateInquiryStatus } from '../../types';
import { toPersianDigits } from '../../utils/formatters';
import { AudioPlayer } from '../common/AudioPlayer';

interface AdminCorporateInquiriesProps {
  inquiries: CorporateInquiry[];
  onUpdateInquiryStatus: (id: string, newStatus: CorporateInquiryStatus, adminNotes?: string) => void;
  onDeleteInquiry: (id: string) => void;
}

export const AdminCorporateInquiries: React.FC<AdminCorporateInquiriesProps> = ({
  inquiries,
  onUpdateInquiryStatus,
  onDeleteInquiry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<CorporateInquiry | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [tempStatus, setTempStatus] = useState<CorporateInquiryStatus>('new');

  const filteredInquiries = inquiries.filter((inq) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      inq.companyName.toLowerCase().includes(q) ||
      inq.contactName.toLowerCase().includes(q) ||
      inq.phone.includes(q) ||
      (inq.email && inq.email.toLowerCase().includes(q))
    );
  });

  const handleOpenDetail = (inquiry: CorporateInquiry) => {
    setSelectedInquiry(inquiry);
    setTempNotes(inquiry.adminNotes || '');
    setTempStatus(inquiry.status);
  };

  const handleSaveModal = () => {
    if (!selectedInquiry) return;
    onUpdateInquiryStatus(selectedInquiry.id, tempStatus, tempNotes);
    setSelectedInquiry(null);
  };

  const getStatusBadge = (status: CorporateInquiryStatus) => {
    switch (status) {
      case 'new':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> استعلام جدید</span>;
      case 'contacted':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Phone className="w-3 h-3" /> تماس گرفته شد</span>;
      case 'sample_sent':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Send className="w-3 h-3" /> ارسال نمونه</span>;
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> تایید و عقد قرارداد</span>;
      case 'closed':
        return <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">بسته شده</span>;
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F4C3A]">
            استعلام‌ها و درخواست‌های سازمانی و هلدینگ‌ها
          </h1>
          <p className="text-xs text-[#6A7873] mt-1">
            پیگیری درخواست‌های استعلام پیش‌فاکتور، ارسال نمونه، درج لوگو و هدایای مدیریتی
          </p>
        </div>

        <div className="text-xs text-[#6A7873] bg-white px-4 py-2 rounded-2xl border border-[#EAE6DF] font-bold">
          مجموع استعلام‌ها: <span className="text-[#0F4C3A] font-extrabold">{toPersianDigits(inquiries.length)}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-[#EAE6DF] shadow-xs">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو بر اساس نام سازمان، نام رابط، شماره تماس یا ایمیل..."
            className="w-full bg-[#FAF8F5] text-xs text-[#1C2826] pr-10 pl-4 py-2.5 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#8C8375] absolute right-3.5 top-3" />
        </div>
      </div>

      {/* Inquiries Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-white rounded-3xl p-5 border border-[#EAE6DF] shadow-xs space-y-4 hover:border-[#D4AF37] transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0F4C3A]/10 text-[#0F4C3A] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-[#0F4C3A]">{inq.companyName}</h3>
                    {inq.voiceRecording && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] bg-[#0F4C3A]/10 text-[#0F4C3A] font-bold px-1.5 py-0.5 rounded-full" title="دارای پیام صوتی ضبط‌شده">
                        <Mic className="w-3 h-3 text-[#D4AF37]" />
                        <span>صوت</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#6A7873]">{inq.contactName}</span>
                </div>
              </div>
              {getStatusBadge(inq.status)}
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-3 rounded-2xl text-xs border border-[#EAE6DF]">
              <div>
                <span className="text-[#8C8375] block text-[10px]">تعداد برآوردی:</span>
                <span className="font-bold text-[#1C2826]">{inq.estimatedQuantity}</span>
              </div>
              <div>
                <span className="text-[#8C8375] block text-[10px]">بودجه هر پک:</span>
                <span className="font-bold text-[#0F4C3A]">{inq.budgetPerBox}</span>
              </div>
            </div>

            {inq.notes && (
              <p className="text-xs text-[#3A4A45] line-clamp-2 leading-relaxed bg-[#FAF8F5]/60 p-2.5 rounded-xl border border-[#EAE6DF]">
                « {inq.notes} »
              </p>
            )}

            {/* Contact Actions & Detail Trigger */}
            <div className="pt-2 border-t border-[#F4EFE6] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${inq.phone}`}
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition text-xs font-bold flex items-center gap-1"
                  title="تماس تلفنی"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{inq.phone}</span>
                </a>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenDetail(inq)}
                  className="bg-[#0F4C3A] hover:bg-[#0B3C2E] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>پیگیری و ثبت یادداشت</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`آیا از حذف استعلام سازمان ${inq.companyName} اطمینان دارید؟`)) {
                      onDeleteInquiry(inq.id);
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

      {/* Inquiry Detail & Status Update Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div
            className="bg-[#FAF8F5] w-full max-w-2xl rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl overflow-hidden text-right relative p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#0F4C3A]" />
                <div>
                  <h2 className="font-extrabold text-base text-[#0F4C3A]">
                    پیگیری استعلام: {selectedInquiry.companyName}
                  </h2>
                  <span className="text-xs text-[#6A7873]">
                    رابط: {selectedInquiry.contactName} • ثبت شده در: {selectedInquiry.createdAtFa}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-[#0F4C3A]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[#EAE6DF]">
                <div>
                  <span className="text-[#6A7873] block mb-1">شماره تماس:</span>
                  <a href={`tel:${selectedInquiry.phone}`} className="font-bold text-[#0F4C3A] font-mono text-sm">
                    {selectedInquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[#6A7873] block mb-1">تعداد و بودجه تخمینی:</span>
                  <span className="font-bold">{selectedInquiry.estimatedQuantity} (هر پک {selectedInquiry.budgetPerBox})</span>
                </div>
              </div>

              {/* Voice Recording Player */}
              {selectedInquiry.voiceRecording && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#0F4C3A] flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-[#D4AF37]" />
                    <span>پیام صوتی ضبط‌شده توسط رابط سازمان:</span>
                  </span>
                  <AudioPlayer
                    recording={selectedInquiry.voiceRecording}
                    title={`پیام صوتی ${selectedInquiry.companyName} (${selectedInquiry.contactName})`}
                  />
                </div>
              )}

              {selectedInquiry.notes && (
                <div className="space-y-1">
                  <span className="font-bold text-[#6A7873] block">توضیحات و نیازمندی متنی:</span>
                  <div className="p-3 bg-white rounded-xl border border-[#EAE6DF] text-[#3A4A45] leading-relaxed">
                    {selectedInquiry.notes}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#0F4C3A] mb-1.5">
                  وضعیت پیگیری سازمانی:
                </label>
                <select
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value as CorporateInquiryStatus)}
                  className="w-full bg-white font-bold text-[#0F4C3A] p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
                >
                  <option value="new">⏳ استعلام جدید (در انتظار تماس اول)</option>
                  <option value="contacted">📞 تماس اولیه و مشاوره انجام شد</option>
                  <option value="sample_sent">🎁 ارسال نمونه پک و کاتالوگ سازمانی</option>
                  <option value="approved">✅ تایید پیش‌فاکتور و عقد قرارداد</option>
                  <option value="closed">🔒 بسته شده / عدم تمایل</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#0F4C3A] mb-1.5">
                  یادداشت‌های داخلی و گزارش مذاکره:
                </label>
                <textarea
                  rows={4}
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="گزارش گفتگو با مدیر روابط عمومی یا تدارکات سازمان، تاریخ جلسه و توافقات قیمت..."
                  className="w-full bg-white p-3 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#EAE6DF]">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl border border-[#D0C8B8] font-bold text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveModal}
                className="bg-[#0F4C3A] hover:bg-[#0B3C2E] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition"
              >
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>ذخیره تغییرات استعلام</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
