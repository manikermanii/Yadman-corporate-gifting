import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit3,
  CheckCircle,
  XCircle,
  Building2,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  Shield,
  X,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { User, Order } from '../../types';
import { formatToman, toPersianDigits } from '../../utils/formatters';

interface AdminUsersProps {
  users: User[];
  orders: Order[];
  onUpdateUser: (updatedUser: User) => void;
  onViewOrderDetails?: (order: Order) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  orders,
  onUpdateUser,
  onViewOrderDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected user for Detail Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // User for Edit Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<User['status']>('active');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phoneNumber.includes(searchTerm) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.corporateProfile?.companyName &&
        u.corporateProfile.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = accountTypeFilter === 'all' || u.accountType === accountTypeFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setEditFullName(u.fullName);
    setEditPhone(u.phoneNumber);
    setEditEmail(u.email || '');
    setEditStatus(u.status);
    setEditAdminNotes(u.adminNotes || '');
    setEditCompanyName(u.corporateProfile?.companyName || '');
    setEditJobTitle(u.corporateProfile?.jobTitle || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated: User = {
      ...editingUser,
      fullName: editFullName.trim(),
      phoneNumber: editPhone.trim(),
      email: editEmail.trim() || undefined,
      status: editStatus,
      adminNotes: editAdminNotes.trim(),
      corporateProfile:
        editingUser.accountType === 'corporate'
          ? {
              ...(editingUser.corporateProfile || { corporatePhone: editPhone }),
              companyName: editCompanyName.trim(),
              jobTitle: editJobTitle.trim(),
            }
          : undefined,
    };

    onUpdateUser(updated);
    setEditingUser(null);
    if (selectedUser?.id === updated.id) {
      setSelectedUser(updated);
    }
  };

  const handleToggleStatus = (u: User) => {
    const nextStatus: User['status'] = u.status === 'active' ? 'inactive' : 'active';
    const updated: User = { ...u, status: nextStatus };
    onUpdateUser(updated);
  };

  // Get orders for a specific user
  const getUserOrders = (user: User) => {
    return orders.filter(
      (o) =>
        o.userId === user.id ||
        o.customer.phoneNumber === user.phoneNumber ||
        (user.email && o.customer.email?.toLowerCase() === user.email.toLowerCase())
    );
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F4C3A] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#D4AF37]" />
            <span>مدیریت کاربران و مشتریان</span>
          </h2>
          <p className="text-xs text-[#6A7873] mt-1">
            مشاهده اطلاعات مشتریان شخصی و سازمانی، مدیریت دسترسی‌ها و سوابق خرید
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-[#0F4C3A]/10 text-[#0F4C3A] font-bold px-3 py-1.5 rounded-xl">
            کل کاربران: {toPersianDigits(users.length)}
          </span>
          <span className="bg-[#D4AF37]/20 text-[#0F4C3A] font-bold px-3 py-1.5 rounded-xl">
            سازمانی (B2B): {toPersianDigits(users.filter((u) => u.accountType === 'corporate').length)}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EAE6DF] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو بر اساس نام، شماره موبایل، ایمیل یا نام شرکت..."
            className="w-full bg-[#F4EFE6]/70 border border-[#E0D8C8] focus:border-[#0F4C3A] rounded-xl py-2.5 pr-10 pl-4 text-xs text-[#1C2826] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#6A7873] absolute right-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#6A7873]" />
            <span className="text-[#6A7873]">نوع حساب:</span>
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className="bg-[#F4EFE6] border border-[#E0D8C8] rounded-xl py-1.5 px-3 text-xs font-bold text-[#0F4C3A] focus:outline-none"
            >
              <option value="all">همه حساب‌ها</option>
              <option value="personal">مشتری شخصی</option>
              <option value="corporate">حساب سازمانی (B2B)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#6A7873]">وضعیت:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F4EFE6] border border-[#E0D8C8] rounded-xl py-1.5 px-3 text-xs font-bold text-[#0F4C3A] focus:outline-none"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="suspended">مسدود</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#FAF8F5] rounded-2xl border border-[#EAE6DF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#F4EFE6] border-b border-[#EAE6DF] text-[#0F4C3A] font-bold">
              <tr>
                <th className="p-4">کاربر</th>
                <th className="p-4">نوع حساب</th>
                <th className="p-4">شماره تماس / ایمیل</th>
                <th className="p-4">تاریخ ثبت‌نام</th>
                <th className="p-4">سفارش‌ها</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DF]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#6A7873] space-y-2">
                    <Users className="w-10 h-10 text-[#D4AF37] mx-auto opacity-70 mb-2" />
                    <div className="font-bold text-sm text-[#0F4C3A]">هیچ کاربری یافت نشد</div>
                    <div className="text-xs">با ثبت‌نام مشتریان جدید در وب‌سایت، مشخصات آن‌ها در این بخش نمایش داده خواهد شد.</div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                const userOrdersList = getUserOrders(user);
                const totalSpent = userOrdersList.reduce((acc, curr) => acc + curr.totalPrice, 0);

                return (
                  <tr key={user.id} className="hover:bg-[#F4EFE6]/50 transition">
                    {/* User info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0F4C3A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#1C2826]">{user.fullName}</p>
                          <p className="text-[10px] text-[#6A7873]">کد: {user.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Account Type */}
                    <td className="p-4">
                      {user.accountType === 'corporate' ? (
                        <div className="space-y-0.5">
                          <span className="bg-[#D4AF37]/20 text-[#0F4C3A] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#D4AF37]" />
                            <span>سازمانی</span>
                          </span>
                          {user.corporateProfile?.companyName && (
                            <p className="text-[10px] text-[#6A7873] truncate max-w-[120px]">
                              {user.corporateProfile.companyName}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="bg-[#0F4C3A]/10 text-[#0F4C3A] px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          <span>شخصی</span>
                        </span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="p-4">
                      <p className="font-mono font-bold text-[#1C2826]">{user.phoneNumber}</p>
                      {user.email && <p className="text-[10px] text-[#6A7873]">{user.email}</p>}
                    </td>

                    {/* Registration Date */}
                    <td className="p-4 text-[#6A7873]">
                      {user.createdAtFa}
                    </td>

                    {/* Orders count & spent */}
                    <td className="p-4">
                      <p className="font-bold text-[#0F4C3A]">
                        {toPersianDigits(userOrdersList.length)} سفارش
                      </p>
                      {totalSpent > 0 && (
                        <p className="text-[10px] text-[#6A7873]">{formatToman(totalSpent)}</p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : user.status === 'inactive'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {user.status === 'active' ? 'فعال' : user.status === 'inactive' ? 'غیرفعال' : 'مسدود'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 bg-[#F4EFE6] hover:bg-[#0F4C3A] text-[#0F4C3A] hover:text-white rounded-lg transition"
                          title="مشاهده جزئیات کامل"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 bg-[#F4EFE6] hover:bg-[#D4AF37] text-[#0F4C3A] rounded-lg transition"
                          title="ویرایش مشخصات"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1.5 rounded-lg transition ${
                            user.status === 'active'
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                          }`}
                          title={user.status === 'active' ? 'غیرفعال‌سازی کاربر' : 'فعال‌سازی کاربر'}
                        >
                          {user.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- USER DETAILS MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] max-w-2xl w-full rounded-3xl border border-[#EAE6DF] shadow-2xl p-6 sm:p-8 space-y-6 text-right my-8 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0F4C3A] text-white flex items-center justify-center font-bold text-lg">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#0F4C3A]">{selectedUser.fullName}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedUser.accountType === 'corporate'
                          ? 'bg-[#D4AF37] text-[#0F4C3A]'
                          : 'bg-[#0F4C3A]/10 text-[#0F4C3A]'
                      }`}
                    >
                      {selectedUser.accountType === 'corporate' ? 'حساب سازمانی' : 'مشتری عادی'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6A7873]">عضویت: {selectedUser.createdAtFa} • شناسه: {selectedUser.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-[#6A7873] hover:text-[#0F4C3A] rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F4EFE6]/60 p-4 rounded-2xl border border-[#E0D8C8] text-xs">
              <div>
                <p className="text-[#6A7873]">شماره تماس:</p>
                <p className="font-bold text-[#1C2826] font-mono mt-0.5">{selectedUser.phoneNumber}</p>
              </div>

              <div>
                <p className="text-[#6A7873]">ایمیل:</p>
                <p className="font-bold text-[#1C2826] mt-0.5">{selectedUser.email || 'ثبت نشده'}</p>
              </div>

              {selectedUser.accountType === 'corporate' && selectedUser.corporateProfile && (
                <>
                  <div>
                    <p className="text-[#6A7873]">نام شرکت / سازمان:</p>
                    <p className="font-bold text-[#0F4C3A] mt-0.5">{selectedUser.corporateProfile.companyName}</p>
                  </div>
                  <div>
                    <p className="text-[#6A7873]">سمت سازمانی:</p>
                    <p className="font-bold text-[#1C2826] mt-0.5">{selectedUser.corporateProfile.jobTitle || 'ثبت نشده'}</p>
                  </div>
                  {selectedUser.corporateProfile.nationalId && (
                    <div>
                      <p className="text-[#6A7873]">شناسه ملی شرکت:</p>
                      <p className="font-mono font-bold text-[#1C2826] mt-0.5">{selectedUser.corporateProfile.nationalId}</p>
                    </div>
                  )}
                  {selectedUser.corporateProfile.corporatePhone && (
                    <div>
                      <p className="text-[#6A7873]">تلفن سازمانی:</p>
                      <p className="font-mono font-bold text-[#1C2826] mt-0.5">{selectedUser.corporateProfile.corporatePhone}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Admin Notes */}
            {selectedUser.adminNotes && (
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE6DF] text-xs space-y-1">
                <p className="font-bold text-[#0F4C3A]">یادداشت اختصاصی مدیر فروش:</p>
                <p className="text-[#6A7873] leading-relaxed">{selectedUser.adminNotes}</p>
              </div>
            )}

            {/* Saved Addresses */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0F4C3A] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>آدرس‌های ثبت شده ({toPersianDigits(selectedUser.addresses.length)}):</span>
              </h4>
              {selectedUser.addresses.length === 0 ? (
                <p className="text-xs text-[#6A7873]">آدرسی ثبت نشده است.</p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedUser.addresses.map((addr) => (
                    <div key={addr.id} className="bg-white p-3 rounded-xl border border-[#EAE6DF] text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1C2826]">{addr.title} - {addr.recipientName}</span>
                        {addr.isDefault && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">پیش‌فرض</span>}
                      </div>
                      <p className="text-[#6A7873]">{addr.province}، {addr.city}، {addr.address} ({addr.phoneNumber})</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0F4C3A] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#D4AF37]" />
                <span>سوابق خرید:</span>
              </h4>
              {(() => {
                const uOrders = getUserOrders(selectedUser);
                if (uOrders.length === 0) {
                  return <p className="text-xs text-[#6A7873]">هیچ سفارشی ثبت نشده است.</p>;
                }
                return (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uOrders.map((ord) => (
                      <div key={ord.id} className="bg-white p-3 rounded-xl border border-[#EAE6DF] flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-[#0F4C3A]">{ord.id}</p>
                          <p className="text-[10px] text-[#6A7873]">{ord.createdAtFa} • {formatToman(ord.totalPrice)}</p>
                        </div>
                        <span className="text-[10px] bg-[#F4EFE6] text-[#0F4C3A] px-2 py-0.5 rounded-md font-bold">
                          {ord.status === 'preparing' ? 'در حال آماده‌سازی' : ord.status === 'delivered' ? 'تحویل شده' : ord.status}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-[#0F4C3A] text-white text-xs font-bold px-5 py-2 rounded-xl hover:bg-[#0B3C2E] transition"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] max-w-md w-full rounded-3xl border border-[#EAE6DF] shadow-2xl p-6 sm:p-8 space-y-6 text-right animate-scaleIn">
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
              <h3 className="text-base font-extrabold text-[#0F4C3A]">ویرایش مشخصات کاربر</h3>
              <button onClick={() => setEditingUser(null)} className="text-[#6A7873] hover:text-[#0F4C3A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C2826]">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-[#F4EFE6]/70 border border-[#E0D8C8] focus:border-[#0F4C3A] rounded-xl py-2 px-3 text-xs text-[#1C2826] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C2826]">شماره موبایل</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    dir="ltr"
                    className="w-full bg-[#F4EFE6]/70 border border-[#E0D8C8] focus:border-[#0F4C3A] rounded-xl py-2 px-3 text-xs text-[#1C2826] focus:outline-none text-left"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C2826]">وضعیت حساب</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-[#F4EFE6]/70 border border-[#E0D8C8] focus:border-[#0F4C3A] rounded-xl py-2 px-2 text-xs text-[#1C2826] focus:outline-none font-bold"
                  >
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                    <option value="suspended">مسدود شده</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C2826]">ایمیل</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  dir="ltr"
                  className="w-full bg-[#F4EFE6]/70 border border-[#E0D8C8] focus:border-[#0F4C3A] rounded-xl py-2 px-3 text-xs text-[#1C2826] focus:outline-none text-left"
                />
              </div>

              {editingUser.accountType === 'corporate' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#1C2826]">نام شرکت</label>
                    <input
                      type="text"
                      value={editCompanyName}
                      onChange={(e) => setEditCompanyName(e.target.value)}
                      className="w-full bg-[#F4EFE6]/70 border border-[#E0D8C8] focus:border-[#0F4C3A] rounded-xl py-2 px-3 text-xs text-[#1C2826] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#1C2826]">سمت سازمانی</label>
                    <input
                      type="text"
                      value={editJobTitle}
                      onChange={(e) => setEditJobTitle(e.target.value)}
                      className="w-full bg-[#F4EFE6]/70 border border-[#E0D8C8] focus:border-[#0F4C3A] rounded-xl py-2 px-3 text-xs text-[#1C2826] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C2826]">یادداشت‌های مدیریتی</label>
                <textarea
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="یادداشت‌های اختصاصی مدیران فروش..."
                  className="w-full bg-[#F4EFE6]/70 border border-[#E0D8C8] focus:border-[#0F4C3A] rounded-xl p-2.5 text-xs text-[#1C2826] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EAE6DF]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6A7873] hover:bg-[#EAE6DF]"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-[#0F4C3A] hover:bg-[#0B3C2E] text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
