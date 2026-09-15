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
  malayalamName?: string | null;
  malayalam_name?: string | null;
  description: string;
  price: number;
  unit: string;
  category: string;
  imageUrl?: string | null;
  image_url?: string | null;
  imageUrl2?: string | null;
  image_url_2?: string | null;
  imageUrl3?: string | null;
  image_url_3?: string | null;
  images?: string[];
  available: boolean;
  featured: boolean;
  preparationTime?: string | null;
  preparation_time?: string | null;
  weightOptions?: WeightOption[] | null;
  weight_options?: WeightOption[] | null;
  nutritionInfo?: NutritionInfo | null;
  nutrition_info?: NutritionInfo | null;
}

export interface Review {
  id: number;
  customerName: string;
  customer_name?: string;
  rating: number;
  reviewText: string;
  review_text?: string;
  productName?: string | null;
  product_name?: string | null;
  productId?: number | null;
  product_id?: number | null;
  approved: boolean;
  isFeatured?: boolean;
  is_featured?: boolean;
  createdAt: string;
  created_at?: string;
}

export interface Promotion {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  image_url: string;
  linkType: string;
  link_type: string;
  linkValue?: string | null;
  link_value?: string | null;
  active: boolean;
  displayOrder: number;
  display_order: number;
  createdAt: string;
  created_at: string;
}
