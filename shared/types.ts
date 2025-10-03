import z from "zod";

// User types
export const UserSchema = z.object({
  id: z.number(),
  username: z.string().nullable(),
  email: z.string().nullable(),
  full_name: z.string().nullable(),
  balance: z.number().default(0),
  is_admin: z.boolean().default(false),
  is_vip: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string()
});

export type User = z.infer<typeof UserSchema>;

// Category types
export const CategorySchema = z.object({
  id: z.number(),
  name_ar: z.string(),
  name_en: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  parent_id: z.number().nullable(),
  level: z.number().default(0),
  full_path: z.string().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string()
});

export type Category = z.infer<typeof CategorySchema>;

// Product types
export const ProductSchema = z.object({
  id: z.number(),
  category_id: z.number().nullable(),
  name_ar: z.string(),
  name_en: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  image_url: z.string().nullable(),
  external_product_id: z.string().nullable(),
  service_type: z.string().default('package'),
  min_quantity: z.number().default(1),
  max_quantity: z.number().default(1000),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string()
});

export type Product = z.infer<typeof ProductSchema>;

// Order types
export const OrderSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  product_id: z.number().nullable(),
  quantity: z.number().default(1),
  price: z.number(),
  status: z.string().default('pending'),
  order_data: z.string().nullable(),
  external_order_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export type Order = z.infer<typeof OrderSchema>;

// Banner types
export const BannerSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  image_url: z.string(),
  link_url: z.string().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string()
});

export type Banner = z.infer<typeof BannerSchema>;

// Settings types
export const SettingSchema = z.object({
  id: z.number(),
  setting_key: z.string(),
  setting_value: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export type Setting = z.infer<typeof SettingSchema>;

// API Request/Response types
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const RegisterRequestSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2)
});

export const HomeDataSchema = z.object({
  banners: z.array(BannerSchema),
  categories: z.array(CategorySchema),
  featured_products: z.array(ProductSchema),
  announcement: z.string().nullable(),
  site_name: z.string()
});

export type HomeData = z.infer<typeof HomeDataSchema>;

export const OrderRequestSchema = z.object({
  product_id: z.number(),
  quantity: z.number().min(1),
  order_data: z.object({}).optional()
});

// Payment Method types
export const PaymentMethodSchema = z.object({
  id: z.number(),
  name_ar: z.string(),
  name_en: z.string(),
  image_url: z.string().nullable(),
  description_ar: z.string().nullable(),
  description_en: z.string().nullable(),
  instructions_ar: z.string().nullable(),
  instructions_en: z.string().nullable(),
  requires_receipt: z.boolean().default(true),
  requires_transaction_id: z.boolean().default(false),
  custom_fields: z.string().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string()
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// Wallet Transaction types
export const WalletTransactionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  amount: z.number(),
  transaction_type: z.string(),
  status: z.string().default('pending'),
  payment_method_id: z.number().nullable(),
  receipt_image_url: z.string().nullable(),
  transaction_id: z.string().nullable(),
  admin_notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;

// Admin Permission types
export const AdminPermissionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  permission_key: z.string(),
  permission_value: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string()
});

export type AdminPermission = z.infer<typeof AdminPermissionSchema>;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type OrderRequest = z.infer<typeof OrderRequestSchema>;
