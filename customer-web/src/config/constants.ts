export const WHATSAPP_PHONE = '917639164647';
export const WHATSAPP_DISPLAY_PHONE = '+91 7639164647';

export const BACKEND_HOST = window.location.hostname === 'localhost' ? 'http://localhost:8080' : `${window.location.protocol}//${window.location.hostname}:8080`;
export const API_BASE_URL = `${BACKEND_HOST}/api/products`;
export const REVIEWS_API_URL = `${BACKEND_HOST}/api/reviews`;

export const getImageUrl = (url: string | undefined): string => {
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
