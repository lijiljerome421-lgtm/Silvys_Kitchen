export interface Product {
  id: number;
  name: string;
  malayalamName?: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  preparationTime?: string;
}

export interface Review {
  id: number;
  customerName: string;
  rating: number;
  reviewText: string;
  productName?: string;
  approved: boolean;
  createdAt: string;
}
