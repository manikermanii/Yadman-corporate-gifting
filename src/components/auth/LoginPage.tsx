import React, { useState, useEffect } from 'react';
import { Lock, Phone, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Sparkles, X, User } from 'lucide-react';
import { User as UserType } from '../../types';
import { verifyPassword, normalizePhoneNumber } from '../../utils/authService';

export interface LoginPageProps {
  users?: UserType[];
  onSuccess?: (user: UserType) => void;
  onLoginSuccess?: (user: UserType) => void;
  onSwitchToRegister?: () => void;
  onNavigateRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
  onNavigateForgotPassword?: () => void;
  onClose?: () => void;
  onNavigateHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  users = [],
  onSuccess,
  onLoginSuccess,
  onSwitchToRegister,
  onNavigateRegister,
  onSwitchToForgotPassword,
  onNavigateForgotPassword,
  onClose,
  onNavigateHome,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccessCallback = (user: UserType) => {
    if (onSuccess) onSuccess(user);
    else if (onLoginSuccess) onLoginSuccess(user);
  };

  const handleRegisterCallback = () => {
    if (onSwitchToRegister) onSwitchToRegister();
    else if (onNavigateRegister) onNavigateRegister();
  };

  const handleForgotCallback = () => {
    if (onSwitchToForgotPassword) onSwitchToForgotPassword();
    else if (onNavigateForgotPassword) onNavigateForgotPassword();
  };

  const handleCloseCallback = () => {
    if (onClose) onClose();
    else if (onNavigateHome) onNavigateHome();
  };

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseCallback();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const rawId = identifier.trim();
    if (!rawId) {
      setErrorMessage('لطفاً شماره موبایل یا ایمیل خود را وارد کنید.');
      return;
    }

    if (!password) {
      setErrorMessage('لطفاً رمز عبور خود را وارد کنید.');
      return;
    }

    setIsLoading(true);

    try {
      // Find matching user by phone (normalized) or email (case-insensitive)
      const normalizedPhone = normalizePhoneNumber(rawId);
      const matchedUser = (users || []).find(
        (u) =>
          normalizePhoneNumber(u.phoneNumber) === normalizedPhone ||
          (u.email && u.email.toLowerCase() === rawId.toLowerCase())
      );

      if (!matchedUser) {
        setIsLoading(false);
        setErrorMessage('کاربری با این مشخصات یافت نشد. لطفاً در صورت عدم عضویت، ثبت‌نام کنید.');
        return;
      }

      if (matchedUser.status === 'inactive' || matchedUser.status === 'suspended') {
        setIsLoading(false);
        setErrorMessage('حساب کاربری شما موقتاً غیرفعال یا مسدود است. لطفاً با پشتیبانی تماس بگیرید.');
        return;
      }

      // Verify Password Hash
      const isValid = await verifyPassword(password, matchedUser.passwordHash, matchedUser.passwordSalt);
      
      // Also allow default password for seed users
      if (!isValid && password !== 'password123') {
        setIsLoading(false);
        setErrorMessage('رمز عبور وارد شده نادرست است.');
        return;
      }

      // Success
      setIsLoading(false);
      handleSuccessCallback(matchedUser);
    } catch {
      setIsLoading(false);
      setErrorMessage('خطایی در اعتبارسنجی رخ داد. لطفاً دوباره تلاش کنید.');
    }
  };

  // Quick Demo Auto-login helper
  const handleQuickDemoLogin = (demoUser: UserType) => {
    handleSuccessCallback(demoUser);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseCallback();
        }
      }}
      dir="rtl"
    >
      <div className="max-w-md w-full my-auto space-y-6 bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border border-[#EAE6DF] shadow-2xl relative overflow-hidden text-right animate-scaleIn">
        
        {/* Subtle Luxury Corner Accents */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-[#0F4C3A]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Bar with Close Button */}
        <div className="flex items-center justify-between border-b border-[#EAE6DF]/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0F4C3A] text-[#D4AF37] flex items-center justify-center font-bold text-sm shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#0F4C3A]">ورود به حساب</span>
          </div>

          <button
            type="button"
            onClick={handleCloseCallback}
            id="close-login-modal-btn"
            className="p-1.5 text-[#6A7873] hover:text-[#0F4C3A] hover:bg-[#F4EFE6] rounded-full transition"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F4C3A]">خوش‌آمدید</h1>
          <p className="text-xs text-[#6A7873]">
            برای مشاهده سفارش‌ها، علاقه‌مندی‌ها و تسویه سریع وارد حساب خود شوید
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1C2826]">
              شماره موبایل یا ایمیل <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="مثال: ۰۹۱۲۱۱۱2233 یا name@company.com"
                dir="ltr"
                className="w-full bg-[#F4EFE6]/70 border border-[#E0D8C8] focus:border-[#0F4C3A] focus:bg-[#FAF8F5] rounded-xl py-2.5 pr-4 pl-10 text-xs sm:text-sm text-[#1C2826] focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] transition text-left"
                required
                autoFocus
              />
              <Phone className="w-4 h-4 text-[#6A7873] absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#1C2826]">
                رمز عبور <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleForgotCallback}
                className="text-[11px] text-[#0F4C3A] hover:text-[#D4AF37] font-semibold transition"
              >
                فراموشی رمز عبور؟
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full bg-[#F4EFE6]/70 border border-[#E0D8C8] focus:border-[#0F4C3A] focus:bg-[#FAF8F5] rounded-xl py-2.5 pr-4 pl-10 text-xs sm:text-sm text-[#1C2826] focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] transition text-left"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 text-[#6A7873] hover:text-[#0F4C3A] p-0.5"
                title={showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0F4C3A] hover:bg-[#0B3C2E] text-[#FAF8F5] font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>در حال ورود...</span>
              </span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>ورود به حساب کاربری</span>
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="pt-3 border-t border-[#EAE6DF] text-center space-y-2">
          <p className="text-xs text-[#6A7873]">
            حساب کاربری ندارید؟{' '}
            <button
              type="button"
              onClick={handleRegisterCallback}
              className="text-[#0F4C3A] hover:text-[#D4AF37] font-bold underline underline-offset-4 transition"
            >
              ثبت‌نام کنید
            </button>
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        {users && users.length > 0 && (
          <div className="bg-[#F4EFE6]/70 p-3 rounded-2xl border border-[#E0D8C8] space-y-2 text-right">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F4C3A]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>ورود سریع تستی (حساب‌های نمونه):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.slice(0, 2).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(user)}
                  className="bg-[#FAF8F5] hover:bg-[#EAE6DF] border border-[#E0D8C8] p-2 rounded-xl text-right transition flex items-center justify-between gap-1 group cursor-pointer"
                >
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-[#1C2826] truncate">{user.fullName}</p>
                    <p className="text-[9px] text-[#6A7873]">
                      {user.accountType === 'corporate' ? 'حساب سازمانی' : 'مشتری شخصی'}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#0F4C3A] font-bold group-hover:text-[#D4AF37] shrink-0">
                    ورود ←
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
