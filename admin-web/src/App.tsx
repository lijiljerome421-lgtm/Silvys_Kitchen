import React, { useState, useEffect } from 'react';
import { Product, Review } from './types';
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
  Search
} from 'lucide-react';

const BACKEND_HOST = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8080'
  : `${window.location.protocol}//${window.location.hostname}:8080`;

const API_BASE_URL = `${BACKEND_HOST}/api/products`;
const LOGIN_API_URL = `${BACKEND_HOST}/api/admin/login`;
const REVIEWS_ADMIN_API = `${BACKEND_HOST}/api/admin/reviews`;

const getImageUrl = (url: string | undefined): string => {
  if (!url) return 'assets/logo.jpg';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${BACKEND_HOST}${url}`;
  }
  return url;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!sessionStorage.getItem('silvy_admin_token');
  });
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('silvy123');

  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'HIDDEN'>('ALL');

  // Product Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
      loadReviews();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('silvy_admin_token', data.token || 'token_123');
        setIsAuthenticated(true);
        return;
      }
    } catch (err) {
      console.warn('Backend login API offline, using local credentials:', err);
    }

    if (username === 'admin' && password === 'silvy123') {
      sessionStorage.setItem('silvy_admin_token', 'silvy_admin_token_demo');
      setIsAuthenticated(true);
    } else {
      alert('Invalid admin credentials! Use admin / silvy123');
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/all`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API connection offline:', err);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch(REVIEWS_ADMIN_API);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReviews(data);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend Reviews API offline:', err);
    }
  };

  const handleToggleStock = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}/toggle-availability`, { method: 'PATCH' });
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
      const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

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

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;

    setIsSaving(true);

    let savedProduct: Product | null = null;

    try {
      if (editingProduct.id) {
        const res = await fetch(`${API_BASE_URL}/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingProduct),
        });
        if (res.ok) {
          savedProduct = await res.json();
        } else {
          const errText = await res.text();
          throw new Error(`Failed to update product (${res.status}): ${errText}`);
        }
      } else {
        const newProd = {
          name: editingProduct.name || '',
          malayalamName: editingProduct.malayalamName || '',
          category: editingProduct.category || 'Pickles',
          price: Number(editingProduct.price) || 0,
          unit: editingProduct.unit || '500g Jar',
          preparationTime: editingProduct.preparationTime || 'Made in small batches',
          description: editingProduct.description || '',
          imageUrl: editingProduct.imageUrl || '',
          available: editingProduct.available !== false,
          featured: !!editingProduct.featured,
        };
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProd),
        });
        if (res.ok) {
          savedProduct = await res.json();
        } else {
          const errText = await res.text();
          throw new Error(`Failed to create product (${res.status}): ${errText}`);
        }
      }

      const targetId = savedProduct?.id || editingProduct.id;

      if (targetId && selectedImageFile) {
        const compressedBlob = await compressImageFile(selectedImageFile);
        const formData = new FormData();
        formData.append('file', compressedBlob, selectedImageFile.name || 'image.jpg');

        const imgRes = await fetch(`${API_BASE_URL}/${targetId}/image`, {
          method: 'POST',
          body: formData,
        });

        if (!imgRes.ok) {
          const errText = await imgRes.text();
          throw new Error(`Failed to upload image (${imgRes.status}): ${errText}`);
        }
      }

      // Re-fetch products directly from Spring Boot backend DB to guarantee 100% sync
      await loadProducts();
    } catch (err: any) {
      console.error('Error saving product to backend DB:', err);
      alert(`Could not connect or save to Spring Boot backend database: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
      setEditingProduct(null);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  // Review Admin Actions
  const handleApproveReview = async (id: number) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: true } : r))
    );
    try {
      await fetch(`${REVIEWS_ADMIN_API}/${id}/approve`, { method: 'PATCH' });
    } catch (err) {}
  };

  const handleHideReview = async (id: number) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: false } : r))
    );
    try {
      await fetch(`${REVIEWS_ADMIN_API}/${id}/hide`, { method: 'PATCH' });
    } catch (err) {}
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review note?')) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`${REVIEWS_ADMIN_API}/${id}`, { method: 'DELETE' });
    } catch (err) {}
  };

  // Login Screen
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
      (p.malayalamName && p.malayalamName.includes(searchTerm));
    const matchesCat =
      selectedCategory === 'All' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === 'PENDING') return r.approved === false;
    if (reviewFilter === 'APPROVED') return r.approved === true;
    if (reviewFilter === 'HIDDEN') return r.approved === false;
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
          onClick={() => {
            sessionStorage.removeItem('silvy_admin_token');
            setIsAuthenticated(false);
          }}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </header>

      {/* Mobile Navigation Tabs (Products / Reviews) */}
      <div className="bg-parchment-deep border-b border-border-warm/60 px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex gap-2 flex-grow">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'products'
                ? 'bg-olive-deep text-white shadow-xs'
                : 'bg-white text-espresso border border-border-warm/60 hover:bg-parchment'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 relative transition-all ${
              activeTab === 'reviews'
                ? 'bg-olive-deep text-white shadow-xs'
                : 'bg-white text-espresso border border-border-warm/60 hover:bg-parchment'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reviews</span>
            {pendingReviewCount > 0 && (
              <span className="bg-red-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {pendingReviewCount}
              </span>
            )}
          </button>
        </div>
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

          {/* Product Mobile Cards List */}
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-10 bg-parchment-card rounded-2xl border border-dashed border-border-warm/80">
                <p className="text-xs text-espresso-muted">No products found matching filters.</p>
              </div>
            ) : (
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-parchment-card border border-border-warm/80 rounded-2xl p-3.5 shadow-warm-xs space-y-3"
                >
                  <div className="flex gap-3 items-center">
                    <img
                      src={getImageUrl(p.imageUrl)}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded-xl border border-border-warm/50 bg-white shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'assets/logo.jpg';
                      }}
                    />

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
                      {p.malayalamName && (
                        <span className="text-xs text-espresso-muted font-normal block font-malayalam truncate">
                          {p.malayalamName}
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
                        onClick={() => {
                          setEditingProduct(p);
                          setSelectedImageFile(null);
                          setImagePreviewUrl(null);
                          setIsModalOpen(true);
                        }}
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
              ))
            )}
          </div>
        </main>
      )}

      {/* TAB 2: REVIEWS MANAGEMENT */}
      {activeTab === 'reviews' && (
        <main className="p-4 flex-grow space-y-4">
          {/* Review Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: `All (${reviews.length})` },
              { id: 'PENDING', label: `Pending (${pendingReviewCount})` },
              { id: 'APPROVED', label: `Approved (${reviews.filter(r => r.approved).length})` },
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
                <p className="text-xs text-espresso-muted">No reviews in this status filter.</p>
              </div>
            ) : (
              filteredReviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-parchment-card border border-border-warm/80 rounded-2xl p-4 shadow-warm-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-espresso">
                          {r.customerName}
                        </span>
                        {r.productName && (
                          <span className="text-[10px] text-olive-deep font-semibold bg-olive-tint px-2 py-0.5 rounded-full border border-olive-leaf/20 truncate max-w-[130px]">
                            {r.productName}
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

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        r.approved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {r.approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-espresso italic bg-white p-3 rounded-xl border border-border-warm/40 font-serif leading-relaxed">
                    "{r.reviewText}"
                  </p>

                  {/* Quick Action Buttons for Phone Admin */}
                  <div className="pt-2 border-t border-border-warm/40 flex items-center justify-end gap-2">
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
              ))
            )}
          </div>
        </main>
      )}

      {/* Sticky Fixed Bottom Floating Add Product Button for Mobile Admin */}
      {activeTab === 'products' && (
        <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-20">
          <button
            onClick={() => {
              setEditingProduct({ available: true, featured: false, category: 'Pickles' });
              setSelectedImageFile(null);
              setImagePreviewUrl(null);
              setIsModalOpen(true);
            }}
            className="pointer-events-auto w-full bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white py-3.5 rounded-2xl font-bold text-sm shadow-warm-lg flex items-center justify-center gap-2 border border-white/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>+ Add Product</span>
          </button>
        </div>
      )}

      {/* Add / Edit Product Mobile Drawer / Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso/60 backdrop-blur-xs p-0 sm:p-4 font-body">
          <div className="bg-parchment-card border-t-2 sm:border-2 border-border-warm rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto shadow-2xl">
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

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
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
                  value={editingProduct?.malayalamName || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, malayalamName: e.target.value })}
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
                  <label className="block font-semibold text-espresso mb-1">Price (₹) *</label>
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
                  <label className="block font-semibold text-espresso mb-1">Weight / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. 500g Jar"
                    value={editingProduct?.unit || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full p-3 rounded-xl border border-border-warm bg-white text-xs focus:outline-none focus:ring-1 focus:ring-olive-leaf"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-espresso mb-1">Availability</label>
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

              {/* Deployment-Safe Phone Image Upload Section */}
              <div className="border border-border-warm/80 rounded-2xl p-3 bg-white space-y-2">
                <label className="block font-bold text-espresso text-xs">
                  Product Image (Database Upload)
                </label>

                {/* Preview Image */}
                {(imagePreviewUrl || editingProduct?.imageUrl) && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden bg-parchment-deep border border-border-warm">
                    <img
                      src={imagePreviewUrl || getImageUrl(editingProduct?.imageUrl)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'assets/logo.jpg';
                      }}
                    />
                    <span className="absolute bottom-1 right-1 bg-espresso/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                      Preview
                    </span>
                  </div>
                )}

                {/* Phone File Picker Input */}
                <label className="w-full py-3 px-4 border-2 border-dashed border-olive-leaf/40 hover:border-olive-leaf bg-olive-tint/40 rounded-xl font-bold text-xs text-olive-deep flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                  <Upload className="w-4 h-4" />
                  <span>{selectedImageFile ? selectedImageFile.name : 'Choose Image from Gallery / File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
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
                  <span>{isSaving ? 'Uploading & Saving...' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
