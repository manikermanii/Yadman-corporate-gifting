import React, { useState } from 'react';
import {
  Headphones,
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
  Building2,
  User,
  DollarSign,
  Layers,
  X,
  UserCheck,
  Filter,
  Check,
  ChevronDown,
  Edit,
  Mic,
} from 'lucide-react';
import { ConsultationRequest, ConsultationStatus, ConsultationCustomerType, ConsultationTopic } from '../../types';
import { toPersianDigits } from '../../utils/formatters';
import { AudioPlayer } from '../common/AudioPlayer';

interface AdminConsultationsProps {
  consultations: ConsultationRequest[];
  onUpdateConsultationStatus: (
    id: string,
    newStatus: ConsultationStatus,
    adminNotes?: string,
    assignedConsultant?: string
  ) => void;
  onDeleteConsultation: (id: string) => void;
}

export const AdminConsultations: React.FC<AdminConsultationsProps> = ({
  consultations,
  onUpdateConsultationStatus,
  onDeleteConsultation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Modal / Detail state
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationRequest | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [tempStatus, setTempStatus] = useState<ConsultationStatus>('new');
  const [tempConsultant, setTempConsultant] = useState('');

  // Filtering
  const filteredConsultations = consultations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.occasion && c.occasion.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesType = typeFilter === 'all' || c.customerType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenDetail = (consultation: ConsultationRequest) => {
    setSelectedConsultation(consultation);
    setTempNotes(consultation.adminNotes || '');
    setTempStatus(consultation.status);
    setTempConsultant(consultation.assignedConsultant || '');
  };

  const handleSaveModal = () => {
    if (!selectedConsultation) return;
    onUpdateConsultationStatus(selectedConsultation.id, tempStatus, tempNotes, tempConsultant);
    setSelectedConsultation(null);
  };

  const getTopicLabel = (topic: ConsultationTopic) => {
    switch (topic) {
      case 'box_selection':
        return 'انتخاب پک هدیه';
      case 'corporate_gift':
        return 'هدیه سازمانی';
      case 'custom_box':
        return 'پک اختصاصی';
      case 'bulk_order':
        return 'سفارش تعداد بالا';
      case 'customization':
        return 'شخصی‌سازی و برندینگ';
      case 'other':
        return 'سایر موضوعات';
      default:
        return topic;
    }
  };

  const getStatusBadge = (status: ConsultationStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>جدید</span>
          </span>
        );
      case 'in_review':
        return (
          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>در حال بررسی</span>
          </span>
        );
      case 'contacted':
        return (
          <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>تماس گرفته شد</span>
          </span>
        );
      case 'completed':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>تکمیل شده</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <X className="w-3 h-3" />
            <span>لغو شده</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F4C3A]">
            درخواست‌های مشاوره انتخاب هدیه
          </h1>
          <p className="text-xs text-[#6A7873] mt-1">
            مدیریت سرنخ‌ها، تعیین مشاور، ثبت یادداشت‌های پیگیری و تبدیل درخواست‌ها به سفارش
          </p>
        </div>

        {/* Stats summary */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-[#6A7873] bg-white px-3.5 py-2 rounded-2xl border border-[#EAE6DF] font-bold">
            کل درخواست‌ها: <span className="text-[#0F4C3A] font-extrabold">{toPersianDigits(consultations.length)}</span>
          </div>
          <div className="text-xs text-amber-700 bg-amber-50 px-3.5 py-2 rounded-2xl border border-amber-200 font-bold">
            درخواست‌های جدید: <span className="font-extrabold">{toPersianDigits(consultations.filter(c => c.status === 'new').length)}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#EAE6DF] shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام، شماره تماس، سازمان، مناسبت یا توضیحات..."
              className="w-full bg-[#FAF8F5] border border-[#E0D8C8] rounded-xl pr-9 pl-4 py-2 text-xs text-[#1C2826] focus:outline-none focus:border-[#0F4C3A]"
            />
            <Search className="w-4 h-4 text-[#8C9B95] absolute right-3 top-2.5" />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E0D8C8] rounded-xl px-3 py-2 text-xs text-[#1C2826] focus:outline-none focus:border-[#0F4C3A]"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="new">جدید</option>
              <option value="in_review">در حال بررسی</option>
              <option value="contacted">تماس گرفته شد</option>
              <option value="completed">تکمیل شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
          </div>

          {/* Customer Type Filter */}
          <div className="md:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E0D8C8] rounded-xl px-3 py-2 text-xs text-[#1C2826] focus:outline-none focus:border-[#0F4C3A]"
            >
              <option value="all">همه نوع مشتریان</option>
              <option value="personal">مشتری شخصی</option>
              <option value="corporate">شرکت / سازمان</option>
            </select>
          </div>

        </div>
      </div>

      {/* Consultations Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#EAE6DF] shadow-xs overflow-hidden">
        {filteredConsultations.length === 0 ? (
          <div className="p-12 text-center text-[#8C9B95] space-y-2">
            <Headphones className="w-10 h-10 mx-auto text-[#0F4C3A]/30" />
            <p className="text-sm font-medium">هیچ درخواست مشاوره‌ای با مشخصات انتخابی یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EAE6DF] text-xs font-bold text-[#4A5A55]">
                  <th className="py-3.5 px-4">کد و متقاضی</th>
                  <th className="py-3.5 px-4">نوع مشتری</th>
                  <th className="py-3.5 px-4">موضوع مشاوره</th>
                  <th className="py-3.5 px-4">بودجه و تعداد</th>
                  <th className="py-3.5 px-4">مناسبت و زمان</th>
                  <th className="py-3.5 px-4">وضعیت</th>
                  <th className="py-3.5 px-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF] text-xs">
                {filteredConsultations.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition">
                    
                    {/* Name & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="font-bold text-[#0F4C3A]">{c.fullName}</div>
                        {c.voiceRecording && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] bg-[#0F4C3A]/10 text-[#0F4C3A] font-bold px-1.5 py-0.5 rounded-full" title="دارای پیام صوتی ضبط‌شده">
                            <Mic className="w-3 h-3 text-[#D4AF37]" />
                            <span>صوت</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6A7873] font-mono mt-0.5" dir="ltr">
                        {c.phone}
                      </div>
                      <div className="text-[10px] text-[#8C9B95] mt-0.5 flex items-center gap-1">
                        <span className="font-mono">{c.id}</span> • <span>{c.createdAtFa}</span>
                      </div>
                    </td>

                    {/* Customer Type */}
                    <td className="py-3.5 px-4">
                      {c.customerType === 'corporate' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 bg-[#0F4C3A]/10 text-[#0F4C3A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Building2 className="w-3 h-3" />
                            <span>سازمانی</span>
                          </span>
                          {c.companyName && (
                            <span className="text-[11px] text-[#2C3B37] block font-semibold">
                              {c.companyName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <User className="w-3 h-3" />
                          <span>شخصی</span>
                        </span>
                      )}
                    </td>

                    {/* Topic */}
                    <td className="py-3.5 px-4 font-medium text-[#2C3B37]">
                      <div>{getTopicLabel(c.topic)}</div>
                      {c.preferredContactMethod && (
                        <span className="text-[10px] text-[#8C9B95]">
                          ارتباط: {c.preferredContactMethod === 'phone' ? 'تلفنی' : c.preferredContactMethod === 'whatsapp' ? 'واتساپ' : 'آنلاین'}
                        </span>
                      )}
                    </td>

                    {/* Budget & Quantity */}
                    <td className="py-3.5 px-4 text-[#4A5A55]">
                      <div>{c.approxBudget || 'تعیین نشده'}</div>
                      <div className="text-[11px] text-[#6A7873] mt-0.5">
                        تعداد: {c.quantityNeeded || 'نامشخص'}
                      </div>
                    </td>

                    {/* Occasion & Date */}
                    <td className="py-3.5 px-4 text-[#4A5A55]">
                      <div>{c.occasion || 'عمومی'}</div>
                      {c.targetDate && (
                        <div className="text-[10px] text-[#8C9B95] mt-0.5">
                          موعد: {c.targetDate}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(c.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(c)}
                          className="bg-[#0F4C3A] text-white hover:bg-[#0B3C2E] px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>بررسی و پیگیری</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`آیا از حذف درخواست مشاوره ${c.fullName} اطمینان دارید؟`)) {
                              onDeleteConsultation(c.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="حذف / آرشیو"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details & Status Edit Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EAE6DF] space-y-6 text-right max-h-[90vh] overflow-y-auto animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-[#0F4C3A]">
                    جزئیات درخواست مشاوره {selectedConsultation.fullName}
                  </h3>
                  <span className="font-mono text-xs bg-[#F4EFE6] text-[#0F4C3A] px-2 py-0.5 rounded-md font-bold">
                    {selectedConsultation.id}
                  </span>
                </div>
                <span className="text-[11px] text-[#6A7873] block mt-0.5">
                  ثبت شده در: {selectedConsultation.createdAtFa}
                </span>
              </div>

              <button
                onClick={() => setSelectedConsultation(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#EAE6DF] text-xs">
              
              <div>
                <span className="text-[#8C9B95] block">متقاضی:</span>
                <span className="font-bold text-[#1C2826]">{selectedConsultation.fullName}</span>
              </div>

              <div>
                <span className="text-[#8C9B95] block">شماره تماس:</span>
                <span className="font-bold text-[#0F4C3A] font-mono text-sm" dir="ltr">
                  {selectedConsultation.phone}
                </span>
              </div>

              {selectedConsultation.email && (
                <div>
                  <span className="text-[#8C9B95] block">ایمیل:</span>
                  <span className="font-mono text-[#2C3B37]" dir="ltr">{selectedConsultation.email}</span>
                </div>
              )}

              <div>
                <span className="text-[#8C9B95] block">نوع مشتری:</span>
                <span className="font-bold text-[#2C3B37]">
                  {selectedConsultation.customerType === 'corporate'
                    ? `سازمانی (${selectedConsultation.companyName || 'نام سازمان ثبت نشده'})`
                    : 'مشتری شخصی'}
                </span>
              </div>

              <div>
                <span className="text-[#8C9B95] block">موضوع مشاوره:</span>
                <span className="font-bold text-[#2C3B37]">{getTopicLabel(selectedConsultation.topic)}</span>
              </div>

              <div>
                <span className="text-[#8C9B95] block">روش ارتباطی ترجیحی:</span>
                <span className="font-semibold text-[#0F4C3A]">
                  {selectedConsultation.preferredContactMethod === 'phone'
                    ? 'تماس تلفنی'
                    : selectedConsultation.preferredContactMethod === 'whatsapp'
                    ? 'پیام‌رسان واتساپ'
                    : 'جلسه آنلاین تصویری'}
                </span>
              </div>

              <div>
                <span className="text-[#8C9B95] block">بودجه تقریبی:</span>
                <span className="font-bold text-[#2C3B37]">{selectedConsultation.approxBudget || 'نامشخص'}</span>
              </div>

              <div>
                <span className="text-[#8C9B95] block">تعداد مورد نیاز:</span>
                <span className="font-bold text-[#2C3B37]">{selectedConsultation.quantityNeeded || 'نامشخص'}</span>
              </div>

              <div>
                <span className="text-[#8C9B95] block">مناسبت / رویداد:</span>
                <span className="font-bold text-[#2C3B37]">{selectedConsultation.occasion || 'عمومی'}</span>
              </div>

              <div>
                <span className="text-[#8C9B95] block">زمان تحویل مدنظر:</span>
                <span className="font-bold text-[#2C3B37]">{selectedConsultation.targetDate || 'نامشخص'}</span>
              </div>

            </div>

            {/* Description / Customer message */}
            {selectedConsultation.description && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#2C3B37]">توضیحات و نیازمندی متقاضی:</span>
                <div className="p-3.5 rounded-2xl bg-white border border-[#EAE6DF] text-xs text-[#3A4A45] leading-relaxed">
                  {selectedConsultation.description}
                </div>
              </div>
            )}

            {/* Voice Recording Player */}
            {selectedConsultation.voiceRecording && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#0F4C3A] flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-[#D4AF37]" />
                  <span>پیام صوتی ضبط‌شده توسط متقاضی مشاوره:</span>
                </span>
                <AudioPlayer
                  recording={selectedConsultation.voiceRecording}
                  title={`پیام صوتی ${selectedConsultation.fullName}`}
                />
              </div>
            )}

            {/* Status & Assignment Controls */}
            <div className="space-y-4 border-t border-[#EAE6DF] pt-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2C3B37]">
                    تغییر وضعیت درخواست:
                  </label>
                  <select
                    value={tempStatus}
                    onChange={(e) => setTempStatus(e.target.value as ConsultationStatus)}
                    className="w-full bg-[#FAF8F5] border border-[#E0D8C8] rounded-xl px-3.5 py-2 text-xs text-[#1C2826] font-bold focus:outline-none focus:border-[#0F4C3A]"
                  >
                    <option value="new">جدید (New)</option>
                    <option value="in_review">در حال بررسی (In Review)</option>
                    <option value="contacted">تماس گرفته شد (Contacted)</option>
                    <option value="completed">تکمیل شده (Completed)</option>
                    <option value="cancelled">لغو شده (Cancelled)</option>
                  </select>
                </div>

                {/* Assigned Consultant */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2C3B37]">
                    مشاور مسئول پیگیری:
                  </label>
                  <input
                    type="text"
                    value={tempConsultant}
                    onChange={(e) => setTempConsultant(e.target.value)}
                    placeholder="مثال: خانم شمس یا مهندس رضایی"
                    className="w-full bg-[#FAF8F5] border border-[#E0D8C8] rounded-xl px-3.5 py-2 text-xs text-[#1C2826] focus:outline-none focus:border-[#0F4C3A]"
                  />
                </div>

              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2C3B37]">
                  یادداشت‌های داخلی و نتیجه پیگیری:
                </label>
                <textarea
                  rows={3}
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="ثبت خلاصه مکالمه، تاریخ ارسال نمونه، یا لینک پیش‌فاکتور..."
                  className="w-full bg-[#FAF8F5] border border-[#E0D8C8] rounded-xl p-3 text-xs text-[#1C2826] focus:outline-none focus:border-[#0F4C3A] leading-relaxed resize-none"
                />
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedConsultation(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#6A7873] hover:bg-[#F4EFE6] transition"
              >
                انصراف
              </button>

              <button
                onClick={handleSaveModal}
                className="bg-[#0F4C3A] hover:bg-[#0B3C2E] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>ذخیره تغییرات</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
