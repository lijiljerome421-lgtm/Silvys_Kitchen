export const WHATSAPP_PHONE = '917639164647';
export const WHATSAPP_DISPLAY_PHONE = '+91 7639164647';

export const BACKEND_HOST = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const API_BASE_URL = `${BACKEND_HOST}/api/products`;
export const REVIEWS_API_URL = `${BACKEND_HOST}/api/reviews`;
export const PROMOTIONS_API_URL = `${BACKEND_HOST}/api/promotions`;

export const getImageUrl = (url: string | undefined | null): string => {
  if (!url) return 'assets/logo.jpg';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${BACKEND_HOST}${url}`;
  }
  return url;
};

export const OFFICIAL_TAGLINE = 'Handmade with love, rooted in tradition';
export const MALAYALAM_TAGLINE = 'കൈപ്പുണ്യത്തിന്റെ അവസാന വാക്ക്';
export const CONTACT_EMAIL = 'silvyskitchen2000@gmail.com';
export const HERITAGE_YEAR = 'Since 2000';

