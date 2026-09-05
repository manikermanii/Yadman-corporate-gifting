import React from 'react';
import { Product } from '../types';
import { formatToman, toPersianDigits } from '../utils/formatters';
import { Star, Eye, ShoppingBag, Stamp, Check, Heart, Film, Play } from 'lucide-react';
import { giftRelaxTeaImg } from '../data/products';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const hasVideos = Boolean(product.videos && product.videos.some((v) => v.isActive !== false));

  return (
    <div className="group bg-[#FAF8F5] rounded-2xl border border-[#EAE6DF] hover:border-[#D4AF37]/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Top Image Box */}
      <div className="relative aspect-4/3 w-full bg-[#F4EFE6] overflow-hidden cursor-pointer flex items-center justify-center p-2" onClick={() => onQuickView(product)}>
        <img
          src={product.image || giftRelaxTeaImg}
          alt={product.titleFa}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== giftRelaxTeaImg) {
              target.src = giftRelaxTeaImg;
            }
          }}
        />

        {/* Badge Overlay */}
        {product.badge && (
          <span className="absolute top-3 right-3 bg-[#0F4C3A] text-[#FAF8F5] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md border border-[#D4AF37]/40">
            {product.badge}
          </span>
        )}

        {/* Wax Seal Overlay Badge */}
        <div className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-xs px-2 py-1 rounded-lg border border-[#EAE6DF] flex items-center gap-1.5 shadow-xs">
          <Stamp className="w-3.5 h-3.5 text-[#0F4C3A]" />
          <span className="text-[10px] text-[#0F4C3A] font-semibold">{product.waxSeal}</span>
        </div>

        {/* Video Indicator Pill */}
        {hasVideos && (
          <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg border border-[#D4AF37]/40 flex items-center gap-1.5 text-white shadow-xs">
            <Play className="w-3 h-3 text-[#D4AF37] fill-current" />
            <span className="text-[9px] font-bold text-[#FAF8F5]">ویدیو دارد</span>
          </div>
        )}

        {/* Wishlist Heart Button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`absolute bottom-3 left-3 p-2 rounded-full backdrop-blur-xs transition shadow-sm ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-[#0F4C3A] hover:text-rose-500'
            }`}
            title={isWishlisted ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>
        )}

        {/* Quick View Hover Button Overlay */}
        <div className="absolute inset-0 bg-[#0F4C3A]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            id={`quick-view-btn-${product.id}`}
            className="pointer-events-auto bg-[#FAF8F5] text-[#0F4C3A] hover:bg-[#D4AF37] hover:text-[#0F4C3A] p-2.5 rounded-full shadow-lg transition-all transform translate-y-2 group-hover:translate-y-0"
            title="مشاهده جزئیات و سفارشی‌سازی"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between text-right space-y-3">
        
        <div>
          {/* Rating & Reviews */}
          <div className="flex items-center justify-between text-xs text-[#8C8375] mb-1.5">
            <span className="text-[11px] text-[#0F4C3A] font-medium bg-[#0F4C3A]/5 px-2 py-0.5 rounded-md">
              {product.boxType.slice(0, 22)}...
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
              <span className="font-bold text-[#1C2826]">{toPersianDigits(product.rating)}</span>
              <span>({toPersianDigits(product.reviewsCount)})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-bold text-base text-[#0F4C3A] hover:text-[#D4AF37] cursor-pointer line-clamp-1 transition-colors"
          >
            {product.titleFa}
          </h3>

          {/* Ribbon Color Preview */}
          <div className="flex items-center gap-2 mt-2 text-xs text-[#3A4A45]">
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: product.ribbonColorHex }}
              title={product.ribbonColor}
            />
            <span className="text-[11px] text-[#6A7873] truncate">
              روبان: {product.ribbonColor}
            </span>
          </div>
        </div>

        {/* Included Items Preview Pills */}
        <div className="flex flex-wrap gap-1 my-1">
          {product.itemsIncluded.slice(0, 2).map((item, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-[#F4EFE6] text-[#2C3B37] px-2 py-0.5 rounded-md line-clamp-1"
            >
              ✓ {item}
            </span>
          ))}
          {product.itemsIncluded.length > 2 && (
            <span className="text-[10px] text-[#0F4C3A] font-bold px-1 py-0.5">
              +{toPersianDigits(product.itemsIncluded.length - 2)} مورد دیگر
            </span>
          )}
        </div>

        {/* Pricing & Add Button */}
        <div className="pt-3 border-t border-[#EAE6DF] flex items-center justify-between gap-2">
          
          <div className="text-right">
            {product.oldPrice && (
              <span className="text-[11px] text-[#8C8375] line-through block">
                {formatToman(product.oldPrice)}
              </span>
            )}
            <span className="text-sm sm:text-base font-extrabold text-[#0F4C3A]">
              {formatToman(product.price)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            id={`add-to-cart-btn-${product.id}`}
            className="bg-[#0F4C3A] hover:bg-[#0B3C2E] text-[#FAF8F5] p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline">افزودن</span>
          </button>

        </div>

      </div>

    </div>
  );
};
