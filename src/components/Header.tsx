import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Sparkles,
  Building2,
  Gift,
  PhoneCall,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Headphones,
  User as UserIcon,
  LogIn,
  UserPlus,
  Heart,
  Package,
  MapPin,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { toPersianDigits, formatToman } from '../utils/formatters';
import { CartItem, User, HeaderConfig } from '../types';
import { YadmanLogo } from './common/YadmanLogo';
import { renderLucideIcon } from './admin/homepage/IconSelector';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartItems: CartItem[];
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAdmin: () => void;
  pendingAdminCount?: number;
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenAccount: (tab?: string) => void;
  onLogout: () => void;
  wishlistCount?: number;
  config?: HeaderConfig;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartItems,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  onOpenAdmin,
  pendingAdminCount = 0,
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onOpenAccount,
  onLogout,
  wishlistCount = 0,
  config,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => {
    const itemPrice = item.product
      ? item.product.price
      : item.customBoxDetails
      ? item.customBoxDetails.totalPrice
      : 0;
    return acc + itemPrice * item.quantity;
  }, 0);

  // Default navigation items if no CMS config is provided
  const defaultNavItems = [
    { id: 'home', label: 'صفحه اصلی', iconName: 'Gift', visible: true },
    { id: 'catalog', label: 'پک‌های هدیه', iconName: 'Gift', visible: true },
    { id: 'corporate', label: 'هدایای سازمانی', iconName: 'Building2', visible: true },
    { id: 'consultation', label: 'مشاوره انتخاب هدیه', iconName: 'Headphones', badge: 'رایگان', visible: true },
    { id: 'builder', label: 'پک‌های اختصاصی', iconName: 'Sparkles', visible: true },
    { id: 'blog', label: 'مجله یادمان', iconName: 'BookOpen', visible: true },
  ];

  const activeNavItems = config?.navItems && config.navItems.length > 0
    ? config.navItems.filter((i) => i.visible)
    : defaultNavItems;

  const getNavItemTarget = (item: { id: string; targetTab?: string }): string => {
    if (item.targetTab) return item.targetTab;
    return item.id.replace(/^nav-/, '');
  };

  const showAnnouncement = config ? config.showAnnouncement : true;
  const announcementText = config?.announcementText || 'ارسال رایگان برای سفارش‌های بالای ۳ میلیون تومان';
  const showPhone = config ? config.showPhone : true;
  const phoneText = config?.phoneText || 'مشاوره و سفارش سازمانی: ۰۲۱-۸۸۸۸۰۰۰۰';
  const phoneLink = config?.phoneLink || 'tel:02188880000';
  const searchPlaceholder = config?.searchPlaceholder || 'جستجو در میان پک‌های هدیه، سازمانی و مناسبتی';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EAE6DF] shadow-xs transition-all text-right">
      {/* Top Announcement Bar */}
      {showAnnouncement && (
        <div className="bg-[#0F4C3A] text-[#F4EFE6] text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-right">
            <div className="flex items-center gap-2">
              <span>{announcementText}</span>
            </div>
            {showPhone && (
              <div className="flex items-center gap-4 text-[11px]">
                <a href={phoneLink} className="hover:text-[#D4AF37] transition flex items-center gap-1 opacity-90">
                  <PhoneCall className="w-3 h-3" />
                  <span>{phoneText}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Header Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Official Brand Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center text-right group focus:outline-none cursor-pointer"
            id="brand-logo-btn"
            title="یادمان - صفحه اصلی"
          >
            {config?.logoImage ? (
              <img
                src={config.logoImage}
                alt={config.logoAlt || config.websiteName || 'یادمان'}
                className="h-9 sm:h-10 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <YadmanLogo variant="header" />
            )}
          </button>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-6 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-[#F4EFE6]/80 text-[#1C2826] text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-full border border-[#E0D8C8] focus:border-[#0F4C3A] focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] placeholder-[#8C8375] transition"
              id="header-search-input"
            />
            <Search className="w-4 h-4 text-[#0F4C3A] absolute right-3.5 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-3 text-xs text-[#8C8375] hover:text-[#1C2826]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Left Actions: Wishlist, User Auth, Cart & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Wishlist Shortcut Button */}
            <button
              onClick={() => {
                if (currentUser) {
                  onOpenAccount('wishlist');
                } else {
                  onOpenLogin();
                }
              }}
              className="relative p-2.5 rounded-full bg-[#F4EFE6] hover:bg-[#EAE6DF] text-[#0F4C3A] hover:text-rose-600 transition shadow-2xs"
              title="علاقه‌مندی‌ها"
              id="header-wishlist-btn"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {toPersianDigits(wishlistCount)}
                </span>
              )}
            </button>

            {/* Authentication / User Account Dropdown */}
            <div className="relative" ref={userMenuRef}>
              {currentUser ? (
                /* Logged In User Button */
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  id="header-user-menu-btn"
                  className="flex items-center gap-2 bg-[#F4EFE6] hover:bg-[#EAE6DF] border border-[#E0D8C8] text-[#0F4C3A] px-3 py-2 rounded-full transition-all shadow-2xs cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0F4C3A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col text-right leading-tight max-w-[120px]">
                    <span className="text-xs font-bold text-[#1C2826] truncate">{currentUser.fullName}</span>
                    <span className="text-[10px] text-[#6A7873]">
                      {currentUser.accountType === 'corporate' ? 'حساب سازمانی' : 'داشبورد کاربر'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6A7873]" />
                </button>
              ) : (
                /* Logged Out: Login / Register Button */
                <div className="flex items-center gap-1">
                  <button
                    onClick={onOpenLogin}
                    id="header-login-btn"
                    className="hidden sm:inline-flex items-center gap-1.5 bg-transparent hover:bg-[#F4EFE6] text-[#0F4C3A] font-bold text-xs px-3 py-2 rounded-full border border-[#E0D8C8] transition"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>ورود</span>
                  </button>

                  <button
                    onClick={onOpenRegister}
                    id="header-register-btn"
                    className="hidden sm:inline-flex items-center gap-1.5 bg-[#0F4C3A] hover:bg-[#0B3C2E] text-[#FAF8F5] font-bold text-xs px-3.5 py-2 rounded-full transition shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>ثبت‌نام</span>
                  </button>

                  {/* Icon Button for Mobile */}
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    id="header-auth-icon-btn"
                    className="sm:hidden p-2.5 rounded-full bg-[#F4EFE6] text-[#0F4C3A] hover:bg-[#EAE6DF] transition"
                    title="ورود یا ثبت‌نام"
                  >
                    <UserIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-[#FAF8F5] rounded-2xl border border-[#EAE6DF] shadow-xl py-2 z-50 animate-scaleIn text-right">
                  {currentUser ? (
                    <>
                      {/* User Header */}
                      <div className="px-4 py-2.5 border-b border-[#EAE6DF]">
                        <p className="text-xs font-bold text-[#0F4C3A] truncate">{currentUser.fullName}</p>
                        <p className="text-[10px] text-[#6A7873] font-mono mt-0.5">{currentUser.phoneNumber}</p>
                        {currentUser.accountType === 'corporate' && (
                          <span className="inline-block mt-1 bg-[#D4AF37]/20 text-[#0F4C3A] text-[9px] font-bold px-2 py-0.5 rounded-md">
                            {currentUser.corporateProfile?.companyName || 'حساب سازمانی تایید شده'}
                          </span>
                        )}
                      </div>

                      {/* User Links */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onOpenAccount('overview');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-xs font-bold text-[#1C2826] hover:bg-[#F4EFE6] flex items-center gap-2 transition"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-[#0F4C3A]" />
                          <span>داشبورد کاربری</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenAccount('orders');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-xs font-bold text-[#1C2826] hover:bg-[#F4EFE6] flex items-center gap-2 transition"
                        >
                          <Package className="w-3.5 h-3.5 text-[#0F4C3A]" />
                          <span>سفارش‌های من</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenAccount('addresses');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-xs font-bold text-[#1C2826] hover:bg-[#F4EFE6] flex items-center gap-2 transition"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#0F4C3A]" />
                          <span>آدرس‌های من</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenAccount('wishlist');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-xs font-bold text-[#1C2826] hover:bg-[#F4EFE6] flex items-center justify-between transition"
                        >
                          <div className="flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            <span>علاقه‌مندی‌ها</span>
                          </div>
                          {wishlistCount > 0 && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-bold">
                              {toPersianDigits(wishlistCount)}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="pt-1 border-t border-[#EAE6DF]">
                        <button
                          onClick={() => {
                            onLogout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>خروج از حساب</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Logged out mobile dropdown options */
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onOpenLogin();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-xs font-bold text-[#0F4C3A] hover:bg-[#F4EFE6] flex items-center gap-2 transition"
                      >
                        <LogIn className="w-4 h-4 text-[#D4AF37]" />
                        <span>ورود به حساب</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenRegister();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-xs font-bold text-[#0F4C3A] hover:bg-[#F4EFE6] flex items-center gap-2 transition"
                      >
                        <UserPlus className="w-4 h-4 text-[#D4AF37]" />
                        <span>ثبت‌نام حساب جدید</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              id="header-cart-btn"
              className="relative flex items-center gap-2 sm:gap-3 bg-[#0F4C3A] hover:bg-[#0B3C2E] text-[#FAF8F5] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all shadow-sm hover:shadow-md active:scale-98"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#0F4C3A] font-bold text-[9px] sm:text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {toPersianDigits(totalCartCount)}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-right pr-1 border-r border-[#1B5E4A]">
                <span className="text-[9px] sm:text-[10px] text-[#E0D8C8]">سبد خرید</span>
                <span className="text-[11px] sm:text-xs font-bold text-[#FAF8F5]">
                  {totalCartCount === 0 ? 'خالی' : formatToman(totalCartPrice)}
                </span>
              </div>
            </button>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#0F4C3A] hover:bg-[#F4EFE6] rounded-lg transition"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Bar - Desktop */}
        <nav className="hidden md:flex items-center justify-center gap-1 sm:gap-2 mt-3 pt-2.5 border-t border-[#EAE6DF]">
          {activeNavItems.map((item) => {
            const targetTab = getNavItemTarget(item);
            const isActive = activeTab === item.id || activeTab === targetTab || (item.targetTab && activeTab === item.targetTab);
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(targetTab)}
                id={`nav-item-${item.id}`}
                className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#0F4C3A] text-[#FAF8F5] shadow-xs'
                    : 'text-[#2C3B37] hover:bg-[#F4EFE6] hover:text-[#0F4C3A]'
                }`}
              >
                {renderLucideIcon(
                  item.iconName,
                  `w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#0F4C3A]'}`
                )}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#D4AF37] text-[#0F4C3A]' : 'bg-[#0F4C3A]/10 text-[#0F4C3A]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Search input for mobile */}
        <div className="mt-3 md:hidden relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-[#F4EFE6] text-[#1C2826] text-xs pr-9 pl-4 py-2 rounded-lg border border-[#E0D8C8] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#0F4C3A] absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-t border-[#EAE6DF] px-4 py-3 space-y-2">
          {activeNavItems.map((item) => {
            const targetTab = getNavItemTarget(item);
            const isActive = activeTab === item.id || activeTab === targetTab || (item.targetTab && activeTab === item.targetTab);
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(targetTab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium cursor-pointer ${
                  isActive ? 'bg-[#0F4C3A] text-[#FAF8F5]' : 'text-[#1C2826] hover:bg-[#F4EFE6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {renderLucideIcon(
                    item.iconName,
                    `w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#0F4C3A]'}`
                  )}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-[#D4AF37] text-[#0F4C3A] px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Mobile Auth actions */}
          <div className="pt-2 border-t border-[#EAE6DF] flex items-center gap-2">
            {currentUser ? (
              <button
                onClick={() => {
                  onOpenAccount('overview');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 bg-[#0F4C3A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-[#D4AF37]" />
                <span>داشبورد کاربری ({currentUser.fullName})</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 p-2.5 bg-[#F4EFE6] text-[#0F4C3A] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-[#D4AF37]" />
                  <span>ورود</span>
                </button>
                <button
                  onClick={() => {
                    onOpenRegister();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 p-2.5 bg-[#0F4C3A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-[#D4AF37]" />
                  <span>ثبت‌نام</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

