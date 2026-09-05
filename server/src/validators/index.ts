import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'نام و نام خانوادگی باید حداقل ۲ حرف باشد'),
  phoneNumber: z.string().regex(/^(\+98|0)?9\d{9}$/, 'شماره موبایل وارد شده معتبر نیست'),
  email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  accountType: z.enum(['personal', 'corporate']).optional(),
  corporateName: z.string().optional(),
  jobTitle: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(3, 'شماره موبایل یا ایمیل را وارد کنید'),
  password: z.string().min(1, 'رمز عبور را وارد کنید'),
});

export const adminLoginSchema = z.object({
  email: z.string().min(3, 'نام کاربری یا ایمیل ادمین را وارد کنید'),
  password: z.string().min(1, 'رمز عبور ادمین را وارد کنید'),
});

export const productCreateSchema = z.object({
  titleFa: z.string().min(2, 'عنوان محصول الزامی است'),
  titleEn: z.string().optional(),
  sku: z.string().min(2, 'کد کالا الزامی است'),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  price: z.number().min(0, 'قیمت باید مثبت باشد'),
  oldPrice: z.number().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  description: z.string().min(5, 'توضیحات کامل الزامی است'),
  shortDescription: z.string().optional(),
  image: z.string().min(1, 'تصویر اصلی الزامی است'),
  images: z.array(z.any()).optional(),
  videos: z.array(z.any()).optional(),
  itemsIncluded: z.array(z.string()).optional(),
  boxType: z.string().optional(),
  ribbonColor: z.string().optional(),
  ribbonColorHex: z.string().optional(),
  waxSeal: z.string().optional(),
  weightGrams: z.number().optional(),
  dimensions: z.string().optional(),
  materials: z.string().optional(),
  shippingInfo: z.string().optional(),
  customizationOptions: z.string().optional(),
  stockQuantity: z.number().min(0).default(50),
  inStock: z.boolean().default(true),
  status: z.enum(['active', 'draft', 'out_of_stock', 'archived']).default('active'),
  tags: z.array(z.string()).optional(),
  occasions: z.array(z.string()).optional(),
  giftType: z.string().optional(),
  boxPackagingType: z.string().optional(),
  suitableFor: z.array(z.string()).optional(),
  brandOrigin: z.string().optional(),
  featured: z.boolean().optional(),
  isB2BRecommended: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const orderCreateSchema = z.object({
  customer: z.object({
    fullName: z.string().min(2, 'نام گیرنده را وارد کنید'),
    phoneNumber: z.string().min(10, 'شماره تماس الزامی است'),
    email: z.string().email().optional().or(z.literal('')),
    province: z.string().min(2, 'استان الزامی است'),
    city: z.string().min(2, 'شهر الزامی است'),
    address: z.string().min(5, 'آدرس دقیق الزامی است'),
    postalCode: z.string().optional(),
    recipientName: z.string().optional(),
    recipientPhone: z.string().optional(),
    deliveryDate: z.string().optional(),
    specialInstructions: z.string().optional(),
    giftCardMessage: z.string().optional(),
    voiceRecording: z.any().optional(),
  }),
  items: z.array(
    z.object({
      id: z.string().optional(),
      productId: z.string().optional(),
      quantity: z.number().min(1),
      isCustomBox: z.boolean().optional(),
      customBoxDetails: z.any().optional(),
      cardMessage: z.string().optional(),
      voiceRecording: z.any().optional(),
      recipientName: z.string().optional(),
      deliveryDate: z.string().optional(),
      ribbonColor: z.string().optional(),
      waxSeal: z.string().optional(),
    })
  ).min(1, 'سبد خرید خالی است'),
  couponCode: z.string().optional(),
  shippingMethod: z.enum(['express_courier', 'post_pishtaz', 'chapar_vip', 'in_person']).default('post_pishtaz'),
  paymentMethod: z.enum(['online', 'card_to_card', 'corporate_invoice']).default('online'),
});

export const couponValidateSchema = z.object({
  code: z.string().min(2, 'کد تخفیف را وارد کنید'),
  cartTotal: z.number().min(0),
});

export const reviewCreateSchema = z.object({
  productId: z.string().min(1, 'شناسه محصول الزامی است'),
  authorName: z.string().min(2, 'نام نویسنده الزامی است'),
  companyName: z.string().optional(),
  rating: z.number().min(1).max(5, 'امتیاز باید بین ۱ تا ۵ باشد'),
  comment: z.string().min(3, 'متن دیدگاه را بنویسید'),
  voiceRecording: z.any().optional(),
  recipientNote: z.string().optional(),
});

export const corporateInquirySchema = z.object({
  companyName: z.string().min(2, 'نام شرکت الزامی است'),
  contactName: z.string().min(2, 'نام مسئول ارتباط الزامی است'),
  phone: z.string().min(10, 'شماره تماس الزامی است'),
  email: z.string().email().optional().or(z.literal('')),
  estimatedQuantity: z.string().min(1, 'تعداد تقریبی را مشخص کنید'),
  budgetPerBox: z.string().min(1, 'بودجه مدنظر را مشخص کنید'),
  occasion: z.string().optional(),
  deliveryDate: z.string().optional(),
  customizationTypes: z.array(z.string()).optional(),
  uploadedLogoUrl: z.string().optional(),
  notes: z.string().optional(),
  voiceRecording: z.any().optional(),
});

export const consultationSchema = z.object({
  fullName: z.string().min(2, 'نام و نام خانوادگی الزامی است'),
  phone: z.string().min(10, 'شماره تماس الزامی است'),
  email: z.string().email().optional().or(z.literal('')),
  customerType: z.enum(['personal', 'corporate']).default('personal'),
  companyName: z.string().optional(),
  topic: z.string().default('box_selection'),
  approxBudget: z.string().optional(),
  quantityNeeded: z.string().optional(),
  occasion: z.string().optional(),
  targetDate: z.string().optional(),
  description: z.string().optional(),
  preferredContactMethod: z.enum(['phone', 'whatsapp', 'online']).default('phone'),
  voiceRecording: z.any().optional(),
});

export const blogPostCreateSchema = z.object({
  title: z.string().min(3, 'عنوان مقاله الزامی است'),
  slug: z.string().min(2, 'نامک (اسلاگ) الزامی است'),
  excerpt: z.string().min(5, 'خلاصه مقاله الزامی است'),
  content: z.string().min(10, 'متن کامل مقاله الزامی است'),
  coverImage: z.string().min(1, 'تصویر شاخص الزامی است'),
  coverImageAlt: z.string().optional(),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  authorId: z.string().min(1, 'نویسنده الزامی است'),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('published'),
  tags: z.array(z.string()).optional(),
  relatedProductIds: z.array(z.string()).optional(),
  readingTimeMinutes: z.number().min(1).default(5),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});
