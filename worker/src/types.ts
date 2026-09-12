export type Bindings = {
  DB: D1Database;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  CORS_ALLOWED_ORIGINS?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
};

export interface Product {
  id: number;
  name: string;
  malayalam_name?: string | null;
  malayalamName?: string | null;
  description?: string | null;
  price: number;
  unit?: string | null;
  category: string;
  image_url?: string | null;
  imageUrl?: string | null;
  image_key?: string | null;
  imageKey?: string | null;
  image_content_type?: string | null;
  imageContentType?: string | null;
  available: boolean;
  featured: boolean;
  preparation_time?: string | null;
  preparationTime?: string | null;
}

export interface CreateProductInput {
  name: string;
  malayalam_name?: string;
  malayalamName?: string;
  description?: string;
  price: number;
  unit?: string;
  category: string;
  image_url?: string;
  imageUrl?: string;
  image_key?: string;
  imageKey?: string;
  image_content_type?: string;
  imageContentType?: string;
  available?: boolean;
  featured?: boolean;
  preparation_time?: string;
  preparationTime?: string;
}

export interface Review {
  id: number;
  customer_name: string;
  customerName: string;
  rating: number;
  review_text: string;
  reviewText: string;
  product_name?: string | null;
  productName?: string | null;
  approved: boolean;
  created_at: string;
  createdAt: string;
}

export interface CreateReviewInput {
  customer_name?: string;
  customerName?: string;
  rating: number;
  review_text?: string;
  reviewText?: string;
  product_name?: string;
  productName?: string;
}
