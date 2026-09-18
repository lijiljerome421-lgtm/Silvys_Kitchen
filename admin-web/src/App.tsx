import React, { useState, useEffect } from 'react';
import { Product, Review, Promotion, WeightOption, NutritionInfo } from './types';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Upload,
  Check,
  EyeOff,
  Star,
  Search,
  Image as ImageIcon,
  Sparkles,
  Tag,
  Info
} from 'lucide-react';

const BACKEND_HOST = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const API_BASE_URL = `${BACKEND_HOST}/api/products`;
const LOGIN_API_URL = `${BACKEND_HOST}/api/admin/login`;
const REVIEWS_ADMIN_API = `${BACKEND_HOST}/api/admin/reviews`;
const PROMOTIONS_ADMIN_API = `${BACKEND_HOST}/api/admin/promotions`;

const getImageUrl = (url: string | undefined | null): string => {
  if (!url) return 'assets/logo.jpg';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${BACKEND_HOST}${url}`;
  }
  return url;
};

const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = sessionStorage.getItem('silvy_admin_token');
  return {
    ...extraHeaders,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!sessionStorage.getItem('silvy_admin_token');
  });
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'products' | 'promotions' | 'reviews'>('products');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'FEATURED'>('ALL');

  // Product Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  
  // Product Multi-Image States
  const [selectedImageFile1, setSelectedImageFile1] = useState<File | null>(null);
  const [selectedImageFile2, setSelectedImageFile2] = useState<File | null>(null);
  const [selectedImageFile3, setSelectedImageFile3] = useState<File | null>(null);
  const [imagePreviewUrl1, setImagePreviewUrl1] = useState<string | null>(null);
  const [imagePreviewUrl2, setImagePreviewUrl2] = useState<string | null>(null);
  const [imagePreviewUrl3, setImagePreviewUrl3] = useState<string | null>(null);

  // Flexible Weight Options State
  const [weightOptionsState, setWeightOptionsState] = useState<WeightOption[]>([]);
  const [weightOptionError, setWeightOptionError] = useState<string | null>(null);

  // Optional Nutrition Info State
  const [showNutritionForm, setShowNutritionForm] = useState<boolean>(false);
  const [nutritionInfoState, setNutritionInfoState] = useState<NutritionInfo>({});
  const [nutritionError, setNutritionError] = useState<string | null>(null);

  // Promotion Edit Modal State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState<boolean>(false);
  const [editingPromotion, setEditingPromotion] = useState<Partial<Promotion> | null>(null);
  const [selectedPromoImageFile, setSelectedPromoImageFile] = useState<File | null>(null);
  const [promoImagePreviewUrl, setPromoImagePreviewUrl] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleUnauthorized = (res: Response) => {
    if (res.status === 401) {
      sessionStorage.removeItem('silvy_admin_token');
      setIsAuthenticated(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
      loadPromotions();
      loadReviews();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('Please enter username and password');
      return;
    }
    try {
      const res = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          sessionStorage.setItem('silvy_admin_token', data.token);
          setIsAuthenticated(true);
          setPassword('');
          return;
        }
      }
      const errData = await res.json().catch(() => ({}));
      alert(errData.message || 'Invalid admin credentials');
    } catch (err) {
      console.error('Login error:', err);
      alert('Could not connect to authentication server');
    }
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem('silvy_admin_token');
    if (token) {
      try {
        await fetch(`${BACKEND_HOST}/api/admin/logout`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      } catch (err) {}
    }
    sessionStorage.removeItem('silvy_admin_token');
    setIsAuthenticated(false);
    setPassword('');
  };

  const loadProducts = async () => {
    try {
      const res = await fetch(API_BASE_URL, {
        headers: getAuthHeaders(),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data && data.success && Array.isArray(data.data) ? data.data : null);
        if (list) {
          setProducts(list);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API connection offline:', err);
    }
  };

  const loadPromotions = async () => {
    try {
      const res = await fetch(PROMOTIONS_ADMIN_API, {
        headers: getAuthHeaders(),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data && data.success && Array.isArray(data.data) ? data.data : null);
        if (list) {
          setPromotions(list);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend Promotions API offline:', err);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch(REVIEWS_ADMIN_API, {
        headers: getAuthHeaders(),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data && data.success && Array.isArray(data.data) ? data.data : null);
        if (list) {
          setReviews(list);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend Reviews API offline:', err);
    }
  };

  const handleToggleStock = async (id: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ available: !product.available }),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        await loadProducts();
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        await loadProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Image compressor helper
  const compressImageFile = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              resolve(blob || file);
            },
            'image/jpeg',
            0.85
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = url;
    });
  };

  const uploadSingleImage = async (file: File): Promise<string> => {
    const compressedBlob = await compressImageFile(file);
    const formData = new FormData();
    formData.append('file', compressedBlob, file.name || 'image.jpg');

    const uploadRes = await fetch(`${BACKEND_HOST}/api/admin/upload-image`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (handleUnauthorized(uploadRes)) {
      throw new Error('Unauthorized upload request');
    }

    if (uploadRes.ok) {
      const uploadData = await uploadRes.json();
      if (uploadData.success && uploadData.data?.secure_url) {
        return uploadData.data.secure_url;
      }
      throw new Error(uploadData.error || 'Cloudinary image upload failed');
    }
    const errData = await uploadRes.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || `Image upload failed (${uploadRes.status})`);
  };

  // OPEN PRODUCT MODAL
  const openProductModal = (product?: Product) => {
    if (product) {
      const img1 = product.imageUrl ?? product.image_url ?? null;
      const img2 = product.imageUrl2 ?? product.image_url_2 ?? (product.images && product.images[1]) ?? null;
      const img3 = product.imageUrl3 ?? product.image_url_3 ?? (product.images && product.images[2]) ?? null;

      setEditingProduct({
        ...product,
        imageUrl: img1,
        imageUrl2: img2,
        imageUrl3: img3,
      });
      setImagePreviewUrl1(img1);
      setImagePreviewUrl2(img2);
      setImagePreviewUrl3(img3);

      const woList = product.weightOptions ?? product.weight_options ?? [];
      setWeightOptionsState(Array.isArray(woList) ? woList.map(o => ({ unit: o.unit, price: Number(o.price) })) : []);

      const niObj = product.nutritionInfo ?? product.nutrition_info ?? null;
      if (niObj && typeof niObj === 'object' && Object.keys(niObj).length > 0) {
        setNutritionInfoState(niObj);
        setShowNutritionForm(true);
      } else {
        setNutritionInfoState({});
        setShowNutritionForm(false);
      }
    } else {
      setEditingProduct({ available: true, featured: false, category: 'Pickles' });
      setImagePreviewUrl1(null);
      setImagePreviewUrl2(null);
      setImagePreviewUrl3(null);
      setWeightOptionsState([]);
      setNutritionInfoState({});
      setShowNutritionForm(false);
    }

    setSelectedImageFile1(null);
    setSelectedImageFile2(null);
    setSelectedImageFile3(null);
    setWeightOptionError(null);
    setNutritionError(null);
    setIsModalOpen(true);
  };

  // WEIGHT OPTIONS MANAGEMENT HANDLERS
  const handleAddWeightOption = () => {
    setWeightOptionsState((prev) => [...prev, { unit: '', price: 0 }]);
    setWeightOptionError(null);
  };

  const handleUpdateWeightOption = (index: number, field: 'unit' | 'price', value: string | number) => {
    setWeightOptionsState((prev) => {
      const updated = [...prev];
      if (field === 'unit') {
        updated[index] = { ...updated[index], unit: String(value) };
      } else {
        updated[index] = { ...updated[index], price: Number(value) };
      }
      return updated;
    });
    setWeightOptionError(null);
  };

  const handleRemoveWeightOption = (index: number) => {
    setWeightOptionsState((prev) => prev.filter((_, i) => i !== index));
    setWeightOptionError(null);
  };

  const validateWeightOptions = (list: WeightOption[]): string | null => {
    if (list.length === 0) return null;
    const seenUnits = new Set<string>();

    for (let i = 0; i < list.length; i++) {
      const opt = list[i];
      const trimmedUnit = (opt.unit || '').trim();
      if (!trimmedUnit) {
        return `Option ${i + 1} has an empty unit label.`;
      }
      if (opt.price <= 0 || isNaN(opt.price)) {
        return `Option "${trimmedUnit}" must have a price > 0.`;
      }
      const unitKey = trimmedUnit.toLowerCase();
      if (seenUnits.has(unitKey)) {
        return `Duplicate weight option "${trimmedUnit}" is not allowed.`;
      }
      seenUnits.add(unitKey);
    }
    return null;
  };

  // NUTRITION INFO MANAGEMENT HANDLERS
  const handleUpdateNutritionInfo = (field: string, value: string) => {
    setNutritionInfoState((prev) => {
      if (value === '') {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      }
      const numVal = field === 'serving_size' ? value : Number(value);
      return {
        ...prev,
        [field]: numVal,
      };
    });
    setNutritionError(null);
  };

  const validateNutritionInfo = (info: NutritionInfo): string | null => {
    const keys = Object.keys(info);
    if (keys.length === 0) return null;

    for (const key of keys) {
      if (key !== 'serving_size' && key !== 'servingSize') {
        const val = Number(info[key]);
        if (isNaN(val) || val < 0) {
          return `Nutrition value for ${key} must be a number >= 0.`;
        }
      }
    }
    return null;
  };

  // PRODUCT SAVE HANDLER
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || editingProduct?.price === undefined || editingProduct?.price === null) return;

    // Validate Weight Options
    const woErr = validateWeightOptions(weightOptionsState);
    if (woErr) {
      setWeightOptionError(woErr);
      return;
    }

    // Validate Nutrition Info
    let cleanNutritionObj: NutritionInfo | null = null;
    if (showNutritionForm) {
      const nutErr = validateNutritionInfo(nutritionInfoState);
      if (nutErr) {
        setNutritionError(nutErr);
        return;
      }
      if (Object.keys(nutritionInfoState).length > 0) {
        cleanNutritionObj = nutritionInfoState;
      }
    }

    setIsSaving(true);

    try {
      let finalImg1 = editingProduct.imageUrl ?? editingProduct.image_url ?? null;
      let finalImg2 = editingProduct.imageUrl2 ?? editingProduct.image_url_2 ?? null;
      let finalImg3 = editingProduct.imageUrl3 ?? editingProduct.image_url_3 ?? null;

      if (selectedImageFile1) {
        finalImg1 = await uploadSingleImage(selectedImageFile1);
      }
      if (selectedImageFile2) {
        finalImg2 = await uploadSingleImage(selectedImageFile2);
      }
      if (selectedImageFile3) {
        finalImg3 = await uploadSingleImage(selectedImageFile3);
      }

      const imagesList: string[] = [];
      if (finalImg1 && finalImg1.trim()) imagesList.push(finalImg1.trim());
      if (finalImg2 && finalImg2.trim()) imagesList.push(finalImg2.trim());
      if (finalImg3 && finalImg3.trim()) imagesList.push(finalImg3.trim());

      const categoryUpper = (editingProduct.category || 'PICKLES').toUpperCase();

      const productPayload = {
        name: editingProduct.name || '',
        malayalam_name: editingProduct.malayalamName ?? editingProduct.malayalam_name ?? null,
        malayalamName: editingProduct.malayalamName ?? editingProduct.malayalam_name ?? null,
        category: categoryUpper,
        price: Number(editingProduct.price) || 0,
        unit: editingProduct.unit || '500g Jar',
        preparation_time: editingProduct.preparationTime ?? editingProduct.preparation_time ?? 'Made in small batches',
        preparationTime: editingProduct.preparationTime ?? editingProduct.preparation_time ?? 'Made in small batches',
        description: editingProduct.description || '',
        image_url: imagesList[0] || null,
        imageUrl: imagesList[0] || null,
        image_url_2: imagesList[1] || null,
        imageUrl2: imagesList[1] || null,
        image_url_3: imagesList[2] || null,
        imageUrl3: imagesList[2] || null,
        images: imagesList,
        available: editingProduct.available !== false,
        featured: !!editingProduct.featured,
        weight_options: weightOptionsState.length > 0 ? weightOptionsState : null,
        weightOptions: weightOptionsState.length > 0 ? weightOptionsState : null,
        nutrition_info: cleanNutritionObj,
        nutritionInfo: cleanNutritionObj,
      };

      if (editingProduct.id) {
        const res = await fetch(`${API_BASE_URL}/${editingProduct.id}`, {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(productPayload),
        });
        if (handleUnauthorized(res)) return;
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || `Failed to update product (${res.status})`);
        }
      } else {
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(productPayload),
        });
        if (handleUnauthorized(res)) return;
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || `Failed to create product (${res.status})`);
        }
      }

      await loadProducts();
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert(`Error saving product: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  // PROMOTION MODAL & ACTIONS
  const openPromotionModal = (promo?: Promotion) => {
    if (promo) {
      setEditingPromotion(promo);
      setPromoImagePreviewUrl(promo.imageUrl || promo.image_url);
    } else {
      setEditingPromotion({
        active: true,
        displayOrder: promotions.length + 1,
        linkType: 'NONE',
      });
      setPromoImagePreviewUrl(null);
    }
    setSelectedPromoImageFile(null);
    setIsPromoModalOpen(true);
  };

  const handleTogglePromotionActive = async (id: number) => {
    try {
      const res = await fetch(`${PROMOTIONS_ADMIN_API}/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        await loadPromotions();
      }
    } catch (err) {
      console.error('Error toggling promotion active state:', err);
    }
  };

  const handleDeletePromotion = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promotion poster?')) return;
    try {
      const res = await fetch(`${PROMOTIONS_ADMIN_API}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        await loadPromotions();
      }
    } catch (err) {
      console.error('Error deleting promotion:', err);
    }
  };

  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromotion?.title?.trim()) {
      alert('Promotion title is required');
      return;
    }

    let imageUrlToSave = editingPromotion.imageUrl || editingPromotion.image_url || '';
    if (selectedPromoImageFile) {
      try {
        setIsSaving(true);
        imageUrlToSave = await uploadSingleImage(selectedPromoImageFile);
      } catch (err: any) {
        alert(`Failed to upload promotion poster image: ${err.message}`);
        setIsSaving(false);
        return;
      }
    }

    if (!imageUrlToSave) {
      alert('Promotion image poster is required');
      return;
    }

    setIsSaving(true);
    try {
      const promoPayload = {
        title: editingPromotion.title.trim(),
        subtitle: editingPromotion.subtitle ? editingPromotion.subtitle.trim() : null,
        image_url: imageUrlToSave,
        imageUrl: imageUrlToSave,
        link_type: editingPromotion.linkType || editingPromotion.link_type || 'NONE',
        linkType: editingPromotion.linkType || editingPromotion.link_type || 'NONE',
        link_value: editingPromotion.linkValue ? editingPromotion.linkValue.trim() : null,
        linkValue: editingPromotion.linkValue ? editingPromotion.linkValue.trim() : null,
        active: editingPromotion.active !== false,
        display_order: Number(editingPromotion.displayOrder ?? editingPromotion.display_order ?? 0),
        displayOrder: Number(editingPromotion.displayOrder ?? editingPromotion.display_order ?? 0),
      };

      if (editingPromotion.id) {
        const res = await fetch(`${PROMOTIONS_ADMIN_API}/${editingPromotion.id}`, {
          method: 'PUT',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(promoPayload),
        });
        if (handleUnauthorized(res)) return;
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || `Failed to update promotion`);
        }
      } else {
        const res = await fetch(PROMOTIONS_ADMIN_API, {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(promoPayload),
        });
        if (handleUnauthorized(res)) return;
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || `Failed to create promotion`);
        }
      }

      await loadPromotions();
      setIsPromoModalOpen(false);
      setEditingPromotion(null);
    } catch (err: any) {
      alert(`Error saving promotion: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  // REVIEW ADMIN ACTIONS
  const handleApproveReview = async (id: number) => {
    try {
      const res = await fetch(`${REVIEWS_ADMIN_API}/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, approved: true } : r))
        );
      }
    } catch (err) {}
  };

  const handleHideReview = async (id: number) => {
    try {
      const res = await fetch(`${REVIEWS_ADMIN_API}/${id}/hide`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, approved: false } : r))
        );
      }
    } catch (err) {}
  };

  const handleToggleFeatureReview = async (id: number) => {
    try {
      const res = await fetch(`${REVIEWS_ADMIN_API}/${id}/feature`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const updatedRev = data.data;
          setReviews((prev) =>
            prev.map((r) => (r.id === id ? { ...r, isFeatured: updatedRev.isFeatured, is_featured: updatedRev.is_featured } : r))
          );
        } else {
          await loadReviews();
        }
      }
    } catch (err) {
      console.error('Error toggling featured review status:', err);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review note?')) return;
    try {
      const res = await fetch(`${REVIEWS_ADMIN_API}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (handleUnauthorized(res)) return;
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {}
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-parchment font-body">
        <div className="bg-parchment-card border border-border-warm rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
          <img src="assets/logo.jpg" alt="Silvy's Kitchen" className="h-20 mx-auto mb-3 object-contain rounded-2xl border border-border-warm bg-white p-1" />
          <h1 className="font-heading text-2xl font-bold text-espresso">Silvy's Kitchen</h1>
          <span className="text-[10px] uppercase tracking-widest text-olive-leaf font-bold bg-olive-tint px-3 py-1 rounded-full border border-olive-leaf/20 inline-block mt-1 mb-4">
            Mobile Admin Panel
          </span>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-espresso mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl border border-border-warm bg-white text-sm focus:ring-1 focus:ring-olive-leaf focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-espresso mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-border-warm bg-white text-sm focus:ring-1 focus:ring-olive-leaf focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-warm-md"
            >
              Access Mobile Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.malayalamName && p.malayalamName.includes(searchTerm)) ||
      (p.malayalam_name && p.malayalam_name.includes(searchTerm));
    const matchesCat =
      selectedCategory === 'All' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === 'PENDING') return r.approved === false;
    if (reviewFilter === 'APPROVED') return r.approved === true;
    if (reviewFilter === 'FEATURED') return r.approved === true && (r.isFeatured || r.is_featured);
    return true;
  });

  const pendingReviewCount = reviews.filter((r) => !r.approved).length;

  return (
    <div className="min-h-screen bg-parchment font-body text-espresso max-w-md mx-auto relative shadow-2xl flex flex-col pb-24 border-x border-border-warm/40">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 bg-olive-deep text-parchment px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="assets/logo.jpg" alt="Logo" className="h-9 w-9 object-contain rounded-lg bg-white p-0.5" />
          <div>
            <h1 className="font-heading text-base font-bold text-rattan-gold leading-tight">
              Silvy's Kitchen
            </h1>
            <span className="text-[9px] text-parchment/80 uppercase tracking-wider block">
              Phone Admin
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </header>

      {/* Mobile Navigation Tabs (Products / Promotions / Reviews) */}
      <div className="bg-parchment-deep border-b border-border-warm/60 px-2 py-2 flex items-center justify-between gap-1.5">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
            activeTab === 'products'
              ? 'bg-olive-deep text-white shadow-xs'
              : 'bg-white text-espresso border border-border-warm/60 hover:bg-parchment'
          }`}
        >
          <Package className="w-3.5 h-3.5 shrink-0" />
          <span>Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('promotions')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
            activeTab === 'promotions'
              ? 'bg-olive-deep text-white shadow-xs'
              : 'bg-white text-espresso border border-border-warm/60 hover:bg-parchment'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-rattan-gold" />
          <span>Promos ({promotions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 relative transition-all ${
            activeTab === 'reviews'
              ? 'bg-olive-deep text-white shadow-xs'
              : 'bg-white text-espresso border border-border-warm/60 hover:bg-parchment'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
          <span>Reviews</span>
          {pendingReviewCount > 0 && (
            <span className="bg-red-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shrink-0">
              {pendingReviewCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <main className="p-4 flex-grow space-y-4">
          {/* Mobile Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-espresso-muted" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-warm bg-white text-xs focus:ring-1 focus:ring-olive-leaf focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              {['All', 'Pickles', 'Snacks'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                    selectedCategory === cat
                      ? 'bg-olive-tint text-olive-deep border-olive-leaf/40 font-bold'
                      : 'bg-white text-espresso-muted border-border-warm/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards List */}
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-10 bg-parchment-card rounded-2xl border border-dashed border-border-warm/80">
                <p className="text-xs text-espresso-muted">No products found matching filters.</p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const mainImg = p.imageUrl ?? p.image_url;
                const imagesList = p.images && p.images.length > 0
                  ? p.images
                  : [mainImg, p.imageUrl2 ?? p.image_url_2, p.imageUrl3 ?? p.image_url_3].filter(Boolean) as string[];

                const woList = p.weightOptions ?? p.weight_options ?? [];
                const nutInfo = p.nutritionInfo ?? p.nutrition_info;

                return (
                  <div
                    key={p.id}
                    className="bg-parchment-card border border-border-warm/80 rounded-2xl p-3.5 shadow-warm-xs space-y-3"
                  >
                    <div className="flex gap-3 items-start">
                      {/* Product Thumbnail Carousel / Badge */}
                      <div className="relative shrink-0">
                        <img
                          src={getImageUrl(mainImg)}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded-xl border border-border-warm/50 bg-white"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'assets/logo.jpg';
                          }}
                        />
                        {imagesList.length > 1 && (
                          <span className="absolute bottom-0 right-0 bg-espresso text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-tl-md rounded-br-xl">
                            📷 {imagesList.length}
                          </span>
                        )}
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-olive-deep uppercase bg-olive-tint px-2 py-0.5 rounded-md border border-olive-leaf/20">
                            {p.category}
                          </span>
                          <span className="font-heading font-bold text-sm text-olive-deep">
                            ₹{p.price}
                          </span>
                        </div>

                        <h3 className="font-heading text-sm font-bold text-espresso truncate mt-0.5">
                          {p.name}
                        </h3>
                        {(p.malayalamName || p.malayalam_name) && (
                          <span className="text-xs text-espresso-muted font-normal block font-malayalam truncate">
                            {p.malayalamName || p.malayalam_name}
                          </span>
                        )}

                        {/* Weight Options summary pills if configured */}
                        {woList && woList.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {woList.map((opt, idx) => (
                              <span key={idx} className="text-[9px] font-semibold bg-white text-espresso-muted px-1.5 py-0.5 rounded border border-border-warm/60">
                                {opt.unit}: ₹{opt.price}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Verified Nutrition badge if present */}
                        {nutInfo && Object.keys(nutInfo).length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-1 font-semibold">
                            <Info className="w-2.5 h-2.5" /> Nutrition Info Available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions Row */}
                    <div className="pt-2 border-t border-border-warm/40 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleStock(p.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          p.available
                            ? 'bg-olive-tint text-olive-deep border border-olive-leaf/30'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {p.available ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{p.available ? 'In Stock' : 'Out of Stock'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openProductModal(p)}
                          className="px-3 py-1.5 rounded-xl border border-border-warm bg-white hover:bg-parchment text-espresso text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      )}

      {/* TAB 2: PROMOTIONS MANAGEMENT */}
      {activeTab === 'promotions' && (
        <main className="p-4 flex-grow space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold text-espresso flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rattan-gold fill-rattan-gold" />
              <span>Promotional Banners</span>
            </h2>
            <button
              onClick={() => openPromotionModal()}
              className="px-3 py-1.5 bg-olive-deep text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Banner</span>
            </button>
          </div>

          {/* Promotions Cards List */}
          <div className="space-y-3">
            {promotions.length === 0 ? (
              <div className="text-center py-10 bg-parchment-card rounded-2xl border border-dashed border-border-warm/80">
                <p className="text-xs text-espresso-muted">No promotional banners configured yet.</p>
                <button
                  onClick={() => openPromotionModal()}
                  className="mt-3 text-xs font-bold text-olive-deep underline"
                >
                  + Create First Banner
                </button>
              </div>
            ) : (
              promotions.map((promo) => {
                const imgUrl = promo.imageUrl ?? promo.image_url;
                const linkType = promo.linkType ?? promo.link_type ?? 'NONE';
                const linkVal = promo.linkValue ?? promo.link_value;

                return (
                  <div
                    key={promo.id}
                    className="bg-parchment-card border border-border-warm/80 rounded-2xl p-3.5 shadow-warm-xs space-y-3"
                  >
                    <div className="relative rounded-xl overflow-hidden h-32 bg-white border border-border-warm">
                      <img
                        src={getImageUrl(imgUrl)}
                        alt={promo.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'assets/logo.jpg';
                        }}
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border shadow-xs ${
                          promo.active
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-gray-700 text-white border-gray-800'
                        }`}>
                          {promo.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <span className="text-[9px] font-bold bg-espresso/80 text-white px-2 py-0.5 rounded-full">
                          Order: #{promo.displayOrder ?? promo.display_order ?? 0}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-heading text-sm font-bold text-espresso">
                        {promo.title}
                      </h3>
                      {promo.subtitle && (
                        <p className="text-xs text-espresso-muted mt-0.5">
                          {promo.subtitle}
                        </p>
                      )}
                      {linkType !== 'NONE' && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-olive-deep font-semibold">
                          <Tag className="w-3 h-3" />
                          <span>Link: {linkType} {linkVal ? `(${linkVal})` : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Promotion Action Controls */}
                    <div className="pt-2 border-t border-border-warm/40 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleTogglePromotionActive(promo.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
                          promo.active
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        <span>{promo.active ? 'Deactivate' : 'Activate'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPromotionModal(promo)}
                          className="px-3 py-1.5 rounded-xl border border-border-warm bg-white text-espresso text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeletePromotion(promo.id)}
                          className="p-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      )}

      {/* TAB 3: REVIEWS MANAGEMENT */}
      {activeTab === 'reviews' && (
        <main className="p-4 flex-grow space-y-4">
          {/* Review Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: `All (${reviews.length})` },
              { id: 'PENDING', label: `Pending (${pendingReviewCount})` },
              { id: 'APPROVED', label: `Approved (${reviews.filter(r => r.approved).length})` },
              { id: 'FEATURED', label: `Featured (${reviews.filter(r => r.approved && (r.isFeatured || r.is_featured)).length})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setReviewFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors border ${
                  reviewFilter === f.id
                    ? 'bg-olive-deep text-white border-olive-deep'
                    : 'bg-white text-espresso-muted border-border-warm/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Review Cards List */}
          <div className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-10 bg-parchment-card rounded-2xl border border-dashed border-border-warm/80">
                <p className="text-xs text-espresso-muted">No reviews matching this status filter.</p>
              </div>
            ) : (
              filteredReviews.map((r) => {
                const prodName = r.productName ?? r.product_name ?? (r.productId ?? r.product_id ? products.find(p => p.id === (r.productId ?? r.product_id))?.name : null);
                const isFeatured = r.isFeatured || r.is_featured;

                return (
                  <div
                    key={r.id}
                    className="bg-parchment-card border border-border-warm/80 rounded-2xl p-4 shadow-warm-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-bold text-sm text-espresso">
                            {r.customerName || r.customer_name}
                          </span>
                          {prodName && (
                            <span className="text-[10px] text-olive-deep font-semibold bg-olive-tint px-2 py-0.5 rounded-full border border-olive-leaf/20 truncate max-w-[140px]">
                              📦 {prodName}
                            </span>
                          )}
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < r.rating
                                  ? 'text-rattan-gold fill-rattan-gold'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Status Pills */}
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            r.approved
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {r.approved ? 'Approved' : 'Pending'}
                        </span>

                        {isFeatured && (
                          <span className="text-[9px] font-extrabold text-amber-900 bg-rattan-gold/20 border border-rattan-gold/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 text-rattan-gold fill-rattan-gold" /> Shown on Home
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-xs text-espresso italic bg-white p-3 rounded-xl border border-border-warm/40 font-serif leading-relaxed">
                      "{r.reviewText || r.review_text}"
                    </p>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-border-warm/40 flex items-center justify-between gap-2">
                      {/* Show on Home Toggle Button */}
                      {r.approved ? (
                        <button
                          onClick={() => handleToggleFeatureReview(r.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                            isFeatured
                              ? 'bg-rattan-gold/30 text-amber-950 border border-rattan-gold hover:bg-rattan-gold/40'
                              : 'bg-white text-espresso border border-border-warm/60 hover:bg-parchment'
                          }`}
                          title="Toggle homepage visibility. Turning OFF keeps review on product page."
                        >
                          <Star className={`w-3.5 h-3.5 ${isFeatured ? 'text-rattan-gold fill-rattan-gold' : 'text-gray-400'}`} />
                          <span>{isFeatured ? 'Show on Home: ON' : 'Show on Home: OFF'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-espresso-muted italic">
                          (Approve review to show on home)
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        {!r.approved ? (
                          <button
                            onClick={() => handleApproveReview(r.id)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHideReview(r.id)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold"
                          title="Delete Note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      )}

      {/* Sticky Bottom Floating Add Button */}
      {activeTab === 'products' && (
        <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-20">
          <button
            onClick={() => openProductModal()}
            className="pointer-events-auto w-full bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white py-3.5 rounded-2xl font-bold text-sm shadow-warm-lg flex items-center justify-center gap-2 border border-white/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>+ Add Product</span>
          </button>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso/60 backdrop-blur-xs p-0 sm:p-4 font-body">
          <div className="bg-parchment-card border-t-2 sm:border-2 border-border-warm rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-border-warm/60 mb-4">
              <h2 className="font-heading text-xl font-bold text-espresso">
                {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-espresso-muted hover:text-espresso text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Product Basic Info */}
              <div>
                <label className="block font-semibold text-espresso mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Homemade Chicken Pickle"
                  value={editingProduct?.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border-warm bg-white text-sm focus:outline-none focus:ring-1 focus:ring-olive-leaf"
                />
              </div>

              <div>
                <label className="block font-semibold text-espresso mb-1">Malayalam Name</label>
                <input
                  type="text"
                  placeholder="e.g. നാടൻ ചിക്കൻ അച്ചാർ"
                  value={editingProduct?.malayalamName || editingProduct?.malayalam_name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, malayalamName: e.target.value, malayalam_name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border-warm bg-white text-sm font-malayalam focus:outline-none focus:ring-1 focus:ring-olive-leaf"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-espresso mb-1">Category *</label>
                  <select
                    value={editingProduct?.category || 'Pickles'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-border-warm bg-white font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-olive-leaf"
                  >
                    <option value="Pickles">Pickles</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-espresso mb-1">Default / Fallback Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="280"
                    value={editingProduct?.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-border-warm bg-white text-sm focus:outline-none focus:ring-1 focus:ring-olive-leaf"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-espresso mb-1">Default Unit Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 500g Jar"
                    value={editingProduct?.unit || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full p-3 rounded-xl border border-border-warm bg-white text-xs focus:outline-none focus:ring-1 focus:ring-olive-leaf"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-espresso mb-1">Stock Availability</label>
                  <select
                    value={editingProduct?.available !== false ? 'Available' : 'Out of Stock'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, available: e.target.value === 'Available' })}
                    className="w-full p-3 rounded-xl border border-border-warm bg-white font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-olive-leaf"
                  >
                    <option value="Available">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-espresso mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Traditional Kerala ingredients and preparation..."
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border-warm bg-white text-xs focus:outline-none focus:ring-1 focus:ring-olive-leaf"
                />
              </div>

              {/* B. MULTI-IMAGE MANAGEMENT (UP TO 3 IMAGES) */}
              <div className="border border-border-warm/80 rounded-2xl p-3.5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-espresso text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-olive-deep" />
                    <span>Product Images (Max 3 Images)</span>
                  </label>
                  <span className="text-[10px] text-espresso-muted">Image 1 is Primary</span>
                </div>

                {/* Grid of 3 Image Slots */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Image Slot 1 */}
                  <div className="space-y-1 text-center">
                    <span className="text-[10px] font-bold text-espresso block">Image 1 (Main)</span>
                    <div className="relative h-20 rounded-xl overflow-hidden bg-parchment border border-border-warm">
                      <img
                        src={imagePreviewUrl1 || getImageUrl(editingProduct?.imageUrl ?? editingProduct?.image_url)}
                        alt="Slot 1"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'assets/logo.jpg'; }}
                      />
                    </div>
                    <label className="block py-1 px-1 bg-olive-tint text-olive-deep rounded-lg font-bold text-[10px] cursor-pointer border border-olive-leaf/30 truncate">
                      {selectedImageFile1 ? 'Changed' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setSelectedImageFile1(file);
                            setImagePreviewUrl1(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Image Slot 2 */}
                  <div className="space-y-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[10px] font-bold text-espresso">Image 2</span>
                      {(imagePreviewUrl2 || editingProduct?.imageUrl2 || editingProduct?.image_url_2) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImageFile2(null);
                            setImagePreviewUrl2(null);
                            setEditingProduct({ ...editingProduct, imageUrl2: null, image_url_2: null });
                          }}
                          className="text-red-600 font-bold text-[10px]"
                          title="Remove Image 2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="relative h-20 rounded-xl overflow-hidden bg-parchment border border-border-warm flex items-center justify-center">
                      {(imagePreviewUrl2 || editingProduct?.imageUrl2 || editingProduct?.image_url_2) ? (
                        <img
                          src={imagePreviewUrl2 || getImageUrl(editingProduct?.imageUrl2 ?? editingProduct?.image_url_2)}
                          alt="Slot 2"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'assets/logo.jpg'; }}
                        />
                      ) : (
                        <span className="text-[10px] text-espresso-muted italic">Optional</span>
                      )}
                    </div>
                    <label className="block py-1 px-1 bg-olive-tint text-olive-deep rounded-lg font-bold text-[10px] cursor-pointer border border-olive-leaf/30 truncate">
                      {selectedImageFile2 ? 'Changed' : (imagePreviewUrl2 || editingProduct?.imageUrl2 ? 'Replace' : '+ Upload')}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setSelectedImageFile2(file);
                            setImagePreviewUrl2(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Image Slot 3 */}
                  <div className="space-y-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[10px] font-bold text-espresso">Image 3</span>
                      {(imagePreviewUrl3 || editingProduct?.imageUrl3 || editingProduct?.image_url_3) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImageFile3(null);
                            setImagePreviewUrl3(null);
                            setEditingProduct({ ...editingProduct, imageUrl3: null, image_url_3: null });
                          }}
                          className="text-red-600 font-bold text-[10px]"
                          title="Remove Image 3"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="relative h-20 rounded-xl overflow-hidden bg-parchment border border-border-warm flex items-center justify-center">
                      {(imagePreviewUrl3 || editingProduct?.imageUrl3 || editingProduct?.image_url_3) ? (
                        <img
                          src={imagePreviewUrl3 || getImageUrl(editingProduct?.imageUrl3 ?? editingProduct?.image_url_3)}
                          alt="Slot 3"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'assets/logo.jpg'; }}
                        />
                      ) : (
                        <span className="text-[10px] text-espresso-muted italic">Optional</span>
                      )}
                    </div>
                    <label className="block py-1 px-1 bg-olive-tint text-olive-deep rounded-lg font-bold text-[10px] cursor-pointer border border-olive-leaf/30 truncate">
                      {selectedImageFile3 ? 'Changed' : (imagePreviewUrl3 || editingProduct?.imageUrl3 ? 'Replace' : '+ Upload')}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setSelectedImageFile3(file);
                            setImagePreviewUrl3(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* C. FLEXIBLE WEIGHT / QUANTITY OPTIONS SECTION */}
              <div className="border border-border-warm/80 rounded-2xl p-3.5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-espresso text-xs block">
                      Weight & Quantity Options
                    </label>
                    <span className="text-[10px] text-espresso-muted block">
                      Configure custom weights and prices per product (e.g. 250g → ₹150, 1kg → ₹520)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddWeightOption}
                    className="px-2.5 py-1 bg-olive-tint text-olive-deep rounded-lg font-bold text-xs border border-olive-leaf/30 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Option
                  </button>
                </div>

                {weightOptionError && (
                  <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                    ⚠️ {weightOptionError}
                  </div>
                )}

                {weightOptionsState.length === 0 ? (
                  <p className="text-[11px] text-espresso-muted italic bg-parchment p-2.5 rounded-xl border border-border-warm/40">
                    No custom weight options configured. The default unit label ({editingProduct?.unit || '500g Jar'}) and base price (₹{editingProduct?.price || 0}) will be used.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {weightOptionsState.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-parchment/60 p-2 rounded-xl border border-border-warm/60">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Unit (e.g. 250g, 1.5kg)"
                            value={opt.unit}
                            onChange={(e) => handleUpdateWeightOption(idx, 'unit', e.target.value)}
                            className="w-full p-2 rounded-lg border border-border-warm bg-white text-xs font-semibold focus:outline-none"
                            required
                          />
                        </div>

                        <div className="w-24 flex items-center gap-1">
                          <span className="text-xs font-bold text-espresso">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            value={opt.price || ''}
                            onChange={(e) => handleUpdateWeightOption(idx, 'price', e.target.value)}
                            className="w-full p-2 rounded-lg border border-border-warm bg-white text-xs font-bold focus:outline-none"
                            required
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveWeightOption(idx)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg font-bold"
                          title="Remove option"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* D. OPTIONAL VERIFIED NUTRITION INFORMATION SECTION */}
              <div className="border border-border-warm/80 rounded-2xl p-3.5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-espresso text-xs block">
                      Nutrition Information (Optional)
                    </label>
                    <span className="text-[10px] text-espresso-muted block">
                      Add verified lab/package nutrition info only
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNutritionForm(!showNutritionForm)}
                    className="px-2.5 py-1 bg-white text-espresso rounded-lg font-bold text-xs border border-border-warm flex items-center gap-1"
                  >
                    {showNutritionForm ? 'Hide' : '+ Add Info'}
                  </button>
                </div>

                {nutritionError && (
                  <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                    ⚠️ {nutritionError}
                  </div>
                )}

                {showNutritionForm && (
                  <div className="space-y-3 pt-2 border-t border-border-warm/40">
                    <div>
                      <label className="block text-[11px] font-semibold text-espresso mb-1">Serving Size</label>
                      <input
                        type="text"
                        placeholder="e.g. 100g or 1 Serving (25g)"
                        value={nutritionInfoState.serving_size ?? nutritionInfoState.servingSize ?? ''}
                        onChange={(e) => handleUpdateNutritionInfo('serving_size', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-border-warm bg-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-espresso">Energy (kcal)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="250"
                          value={nutritionInfoState.energy_kcal ?? nutritionInfoState.energyKcal ?? ''}
                          onChange={(e) => handleUpdateNutritionInfo('energy_kcal', e.target.value)}
                          className="w-full p-2 rounded-lg border border-border-warm bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-espresso">Protein (g)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="12.5"
                          value={nutritionInfoState.protein_g ?? nutritionInfoState.proteinG ?? ''}
                          onChange={(e) => handleUpdateNutritionInfo('protein_g', e.target.value)}
                          className="w-full p-2 rounded-lg border border-border-warm bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-espresso">Carbohydrates (g)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="5.0"
                          value={nutritionInfoState.carbohydrate_g ?? nutritionInfoState.carbohydrateG ?? ''}
                          onChange={(e) => handleUpdateNutritionInfo('carbohydrate_g', e.target.value)}
                          className="w-full p-2 rounded-lg border border-border-warm bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-espresso">Total Fat (g)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="18.0"
                          value={nutritionInfoState.total_fat_g ?? nutritionInfoState.totalFatG ?? ''}
                          onChange={(e) => handleUpdateNutritionInfo('total_fat_g', e.target.value)}
                          className="w-full p-2 rounded-lg border border-border-warm bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-espresso">Total Sugar (g)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="1.0"
                          value={nutritionInfoState.total_sugar_g ?? nutritionInfoState.totalSugarG ?? ''}
                          onChange={(e) => handleUpdateNutritionInfo('total_sugar_g', e.target.value)}
                          className="w-full p-2 rounded-lg border border-border-warm bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-espresso">Sodium (mg)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="450"
                          value={nutritionInfoState.sodium_mg ?? nutritionInfoState.sodiumMg ?? ''}
                          onChange={(e) => handleUpdateNutritionInfo('sodium_mg', e.target.value)}
                          className="w-full p-2 rounded-lg border border-border-warm bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-warm/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 border border-border-warm rounded-xl font-semibold text-xs text-espresso"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-olive-deep hover:bg-olive-leaf text-white rounded-xl font-bold text-xs shadow-warm-sm flex items-center gap-2"
                >
                  <span>{isSaving ? 'Saving Product...' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT PROMOTION MODAL */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso/60 backdrop-blur-xs p-0 sm:p-4 font-body">
          <div className="bg-parchment-card border-t-2 sm:border-2 border-border-warm rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-border-warm/60 mb-4">
              <h2 className="font-heading text-xl font-bold text-espresso flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rattan-gold" />
                <span>{editingPromotion?.id ? 'Edit Promo Banner' : 'Add Promo Banner'}</span>
              </h2>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="text-espresso-muted hover:text-espresso text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePromotion} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-espresso mb-1">Promotion Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Onam Special Offer"
                  value={editingPromotion?.title || ''}
                  onChange={(e) => setEditingPromotion({ ...editingPromotion, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border-warm bg-white text-sm focus:outline-none focus:ring-1 focus:ring-olive-leaf"
                />
              </div>

              <div>
                <label className="block font-semibold text-espresso mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Get 15% Off On Combo Orders"
                  value={editingPromotion?.subtitle || ''}
                  onChange={(e) => setEditingPromotion({ ...editingPromotion, subtitle: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border-warm bg-white text-xs focus:outline-none focus:ring-1 focus:ring-olive-leaf"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-espresso mb-1">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1"
                    value={editingPromotion?.displayOrder ?? editingPromotion?.display_order ?? 0}
                    onChange={(e) => setEditingPromotion({ ...editingPromotion, displayOrder: Number(e.target.value), display_order: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-border-warm bg-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-espresso mb-1">Status</label>
                  <select
                    value={editingPromotion?.active !== false ? 'Active' : 'Inactive'}
                    onChange={(e) => setEditingPromotion({ ...editingPromotion, active: e.target.value === 'Active' })}
                    className="w-full p-3 rounded-xl border border-border-warm bg-white font-semibold text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-espresso mb-1">Link Action</label>
                  <select
                    value={editingPromotion?.linkType || editingPromotion?.link_type || 'NONE'}
                    onChange={(e) => setEditingPromotion({ ...editingPromotion, linkType: e.target.value, link_type: e.target.value })}
                    className="w-full p-3 rounded-xl border border-border-warm bg-white font-semibold text-xs"
                  >
                    <option value="NONE">None</option>
                    <option value="WEBSITE">Website Link</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="CATEGORY">Category</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-espresso mb-1">Link Value</label>
                  <input
                    type="text"
                    placeholder="e.g. PICKLES or https://..."
                    value={editingPromotion?.linkValue || editingPromotion?.link_value || ''}
                    onChange={(e) => setEditingPromotion({ ...editingPromotion, linkValue: e.target.value, link_value: e.target.value })}
                    className="w-full p-3 rounded-xl border border-border-warm bg-white text-xs"
                  />
                </div>
              </div>

              {/* Promotion Poster Image Upload */}
              <div className="border border-border-warm/80 rounded-2xl p-3.5 bg-white space-y-2">
                <label className="block font-bold text-espresso text-xs">
                  Promotion Poster Banner Image *
                </label>

                {(promoImagePreviewUrl || editingPromotion?.imageUrl || editingPromotion?.image_url) && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden bg-parchment-deep border border-border-warm">
                    <img
                      src={promoImagePreviewUrl || getImageUrl(editingPromotion?.imageUrl ?? editingPromotion?.image_url)}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'assets/logo.jpg'; }}
                    />
                  </div>
                )}

                <label className="w-full py-3 px-4 border-2 border-dashed border-olive-leaf/40 hover:border-olive-leaf bg-olive-tint/40 rounded-xl font-bold text-xs text-olive-deep flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                  <Upload className="w-4 h-4" />
                  <span>{selectedPromoImageFile ? selectedPromoImageFile.name : 'Choose Poster Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setSelectedPromoImageFile(file);
                        setPromoImagePreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-warm/40">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-3 border border-border-warm rounded-xl font-semibold text-xs text-espresso"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-olive-deep hover:bg-olive-leaf text-white rounded-xl font-bold text-xs shadow-warm-sm flex items-center gap-2"
                >
                  <span>{isSaving ? 'Uploading & Saving...' : 'Save Promotion'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
