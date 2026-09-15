export type Bindings = {
  DB: D1Database;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  CORS_ALLOWED_ORIGINS?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
};

export interface WeightOption {
  unit: string;
  price: number;
}

export interface NutritionInfo {
  serving_size?: string | number | null;
  servingSize?: string | number | null;
  energy_kcal?: number | null;
  energyKcal?: number | null;
  protein_g?: number | null;
  proteinG?: number | null;
  carbohydrate_g?: number | null;
  carbohydrateG?: number | null;
  total_sugar_g?: number | null;
  totalSugarG?: number | null;
  added_sugar_g?: number | null;
  addedSugarG?: number | null;
  dietary_fibre_g?: number | null;
  dietaryFibreG?: number | null;
  total_fat_g?: number | null;
  totalFatG?: number | null;
  saturated_fat_g?: number | null;
  saturatedFatG?: number | null;
  trans_fat_g?: number | null;
  transFatG?: number | null;
  cholesterol_mg?: number | null;
  cholesterolMg?: number | null;
  sodium_mg?: number | null;
  sodiumMg?: number | null;
  [key: string]: any;
}

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
  image_url_2?: string | null;
  imageUrl2?: string | null;
  image_url_3?: string | null;
  imageUrl3?: string | null;
  images: string[];
  image_key?: string | null;
  imageKey?: string | null;
  image_content_type?: string | null;
  imageContentType?: string | null;
  available: boolean;
  featured: boolean;
  preparation_time?: string | null;
  preparationTime?: string | null;
  weight_options?: WeightOption[] | null;
  weightOptions?: WeightOption[] | null;
  nutrition_info?: NutritionInfo | null;
  nutritionInfo?: NutritionInfo | null;
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
  image_url_2?: string;
  imageUrl2?: string;
  image_url_3?: string;
  imageUrl3?: string;
  images?: string[];
  image_key?: string;
  imageKey?: string;
  image_content_type?: string;
  imageContentType?: string;
  available?: boolean;
  featured?: boolean;
  preparation_time?: string;
  preparationTime?: string;
  weight_options?: WeightOption[] | string;
  weightOptions?: WeightOption[] | string;
  nutrition_info?: NutritionInfo | string;
  nutritionInfo?: NutritionInfo | string;
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
  product_id?: number | null;
  productId?: number | null;
  approved: boolean;
  is_featured: boolean;
  isFeatured: boolean;
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
  product_id?: number;
  productId?: number;
}

export interface Promotion {
  id: number;
  title: string;
  subtitle?: string | null;
  image_url: string;
  imageUrl: string;
  link_type: string;
  linkType: string;
  link_value?: string | null;
  linkValue?: string | null;
  active: boolean;
  display_order: number;
  displayOrder: number;
  created_at: string;
  createdAt: string;
}

export interface CreatePromotionInput {
  title: string;
  subtitle?: string;
  image_url?: string;
  imageUrl?: string;
  link_type?: string;
  linkType?: string;
  link_value?: string;
  linkValue?: string;
  active?: boolean;
  display_order?: number;
  displayOrder?: number;
}
