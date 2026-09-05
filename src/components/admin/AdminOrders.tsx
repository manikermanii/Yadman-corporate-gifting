import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Clock,
  Sparkles,
  Stamp,
  Truck,
  CheckCircle2,
  AlertCircle,
  Phone,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatToman, toPersianDigits } from '../../utils/formatters';

interface AdminOrdersProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  onViewOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'highest_price'>('newest');

  const filterTabs: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'همه سفارش‌ها', count: orders.length },
    { id: 'pending', label: 'در انتظار بررسی', count: orders.filter((o) => o.status === 'pending').length },
    { id: 'preparing', label: 'در حال آماده‌سازی', count: orders.filter((o) => o.status === 'preparing').length },
    { id: 'packaged', label: 'مهر و موم شده', count: orders.filter((o) => o.status === 'packaged').length },
    { id: 'shipped', label: 'ارسال شده', count: orders.filter((o) => o.status === 'shipped').length },
    { id: 'delivered', label: 'تحویل شده', count: orders.filter((o) => o.status === 'delivered').length },
  ];

  const filteredOrders = orders
    .filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        order.id.toLowerCase().includes(q) ||
        order.customer.fullName.toLowerCase().includes(q) ||
        order.customer.phoneNumber.includes(q) ||
        order.customer.city.toLowerCase().includes(q) ||
        order.items.some((i) => (i.product?.titleFa || '').toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOption === 'highest_price') {
        return b.totalPrice - a.totalPrice;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"><Clock className="w-3 h-3" /> در انتظار</span>;
      case 'preparing':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> آماده‌سازی</span>;
      case 'packaged':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"><Stamp className="w-3 h-3 text-[#D4AF37]" /> مهر و موم شده</span>;
      case 'shipped':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"><Truck className="w-3 h-3" /> ارسال شده</span>;
      case 'delivered':
        return <span className="bg-[#0F4C3A]/10 text-[#0F4C3A] text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> تحویل شده</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> لغو شده</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F4C3A]">
            مدیریت سفارش‌ها و خط بسته‌بندی
          </h1>
          <p className="text-xs text-[#6A7873] mt-1">
            مشاهده اطلاعات مشتریان، خطاطی کارت تبریک، مهر و موم و تغییر وضعیت ارسال
          </p>
        </div>

        <div className="text-xs text-[#6A7873] bg-white px-4 py-2 rounded-2xl border border-[#EAE6DF] font-bold">
          مجموع سفارش‌های ثبت شده: <span className="text-[#0F4C3A] font-extrabold">{toPersianDigits(orders.length)}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EAE6DF] shadow-xs space-y-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#0F4C3A] text-white shadow-xs'
                  : 'bg-[#F4EFE6] text-[#2C3B37] hover:bg-[#EAE6DF]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id ? 'bg-[#D4AF37] text-[#0F4C3A]' : 'bg-[#E0D8C8] text-[#1C2826]'
                }`}
              >
                {toPersianDigits(tab.count)}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input & Sort Selector */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو با کد سفارش (HD-...)، نام خریدار، شماره تماس یا شهر..."
              className="w-full bg-[#FAF8F5] text-xs text-[#1C2826] pr-10 pl-4 py-2.5 rounded-xl border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#8C8375] absolute right-3.5 top-3" />
          </div>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="bg-[#FAF8F5] text-xs font-bold text-[#0F4C3A] border border-[#E0D8C8] rounded-xl px-4 py-2.5 focus:outline-none"
          >
            <option value="newest">مرتب‌سازی: جدیدترین سفارش‌ها</option>
            <option value="highest_price">مرتب‌سازی: بیشترین مبلغ سفارش</option>
          </select>
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#EAE6DF] shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-12 h-12 text-[#8C8375] mx-auto opacity-50" />
            <h3 className="font-bold text-sm text-[#0F4C3A]">هیچ سفارشی با این مشخصات یافت نشد</h3>
            <p className="text-xs text-[#8C8375]">فیلترها یا عبارت جستجو را تغییر دهید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EAE6DF] text-[#6A7873] font-bold">
                  <th className="py-4 pr-6">کد سفارش</th>
                  <th className="py-4">مشتری و تماس</th>
                  <th className="py-4">اقلام و شخصی‌سازی</th>
                  <th className="py-4">مبلغ کل</th>
                  <th className="py-4">تاریخ ثبت</th>
                  <th className="py-4">وضعیت فرآیند</th>
                  <th className="py-4 pl-6 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFE6]">
                {filteredOrders.map((order) => {
                  const firstItem = order.items[0];
                  const itemName = firstItem?.product?.titleFa || firstItem?.customBoxDetails?.boxType.nameFa || 'پک هدیه';
                  const extraCount = order.items.length - 1;

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF8F5] transition">
                      <td className="py-4 pr-6 font-mono font-extrabold text-[#0F4C3A]">
                        {order.id}
                      </td>
                      <td className="py-4">
                        <div className="font-bold text-[#1C2826]">{order.customer.fullName}</div>
                        <div className="text-[11px] text-[#6A7873] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#0F4C3A]" />
                          <span>{order.customer.phoneNumber}</span>
                          <span className="text-[#A0988A]">({order.customer.city})</span>
                        </div>
                      </td>
                      <td className="py-4 max-w-[200px]">
                        <div className="font-medium text-[#2C3B37] truncate">{itemName}</div>
                        {extraCount > 0 && (
                          <span className="text-[10px] text-[#8C8375] block mt-0.5">
                            +{toPersianDigits(extraCount)} مورد دیگر
                          </span>
                        )}
                        {firstItem?.ribbonColor && (
                          <span className="text-[10px] text-[#0F4C3A] bg-[#0F4C3A]/5 px-1.5 py-0.5 rounded-md inline-block mt-1">
                            روبان: {firstItem.ribbonColor}
                          </span>
                        )}
                      </td>
                      <td className="py-4 font-extrabold text-[#0F4C3A]">
                        {formatToman(order.totalPrice)}
                      </td>
                      <td className="py-4 text-[11px] text-[#6A7873]">
                        {order.createdAtFa}
                      </td>
                      <td className="py-4">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-[#F4EFE6] border border-[#E0D8C8] text-[#0F4C3A] font-bold text-[11px] rounded-lg px-2 py-1.5 focus:outline-none"
                        >
                          <option value="pending">در انتظار بررسی</option>
                          <option value="preparing">در حال آماده‌سازی</option>
                          <option value="packaged">مهر و موم شده</option>
                          <option value="shipped">ارسال شده</option>
                          <option value="delivered">تحویل شده</option>
                          <option value="cancelled">لغو شده</option>
                        </select>
                      </td>
                      <td className="py-4 pl-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onViewOrder(order)}
                            className="bg-[#0F4C3A] hover:bg-[#0B3C2E] text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1 text-xs font-bold shadow-xs"
                            title="مشاهده جزئیات و چاپ فاکتور"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>جزئیات</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`آیا از حذف سفارش ${order.id} اطمینان دارید؟`)) {
                                onDeleteOrder(order.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف سفارش"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
