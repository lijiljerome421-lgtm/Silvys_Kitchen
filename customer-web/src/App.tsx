import { useState, useEffect } from 'react';
import { Product, CartItem, Review } from './types';
import { API_BASE_URL, REVIEWS_API_URL } from './config/constants';
import { BrandIntroModal } from './components/BrandIntroModal';
import { HeaderNav } from './components/HeaderNav';
import { BottomNav } from './components/BottomNav';
import { HeroSection } from './components/HeroSection';
import { CategorySection } from './components/CategorySection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { CartDrawer } from './components/CartDrawer';
import { ReviewCarousel } from './components/ReviewCarousel';
import { SubmitReviewModal } from './components/SubmitReviewModal';
import { ArrowLeft } from 'lucide-react';

type ScreenState = 'intro' | 'home' | 'pickles' | 'snacks' | 'product-detail' | 'cart';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(() => {
    return sessionStorage.getItem('silvys_intro_seen') ? 'home' : 'intro';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitReviewModalOpen, setIsSubmitReviewModalOpen] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('silvys_cart_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProductsFromBackend();
    fetchReviewsFromBackend();

    // Auto-poll backend every 3 seconds to reflect live admin updates immediately
    const interval = setInterval(() => {
      fetchProductsFromBackend();
      fetchReviewsFromBackend();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('silvys_cart_v3', JSON.stringify(cart));
  }, [cart]);

  const fetchProductsFromBackend = async () => {
    try {
      const res = await fetch(API_BASE_URL);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data && data.success && Array.isArray(data.data) ? data.data : null);
        if (list) {
          setProducts(list);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API connection offline, utilizing initial catalog:', err);
    }
  };

  const fetchReviewsFromBackend = async () => {
    try {
      const res = await fetch(REVIEWS_API_URL);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data && data.success && Array.isArray(data.data) ? data.data : null);
        if (list) {
          setReviews(list);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend Reviews API connection offline, utilizing fallback reviews:', err);
    }
  };

  const handleEnterKitchen = () => {
    sessionStorage.setItem('silvys_intro_seen', 'true');
    setCurrentScreen('home');
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleOpenProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen('product-detail');
  };

  const totalCartBadgeCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // SCREEN 1: Full-Screen Logo Intro
  if (currentScreen === 'intro') {
    return <BrandIntroModal onEnter={handleEnterKitchen} />;
  }

  // SCREEN 4: Product Details Screen (Screen 4 in Reference)
  if (currentScreen === 'product-detail' && selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onBack={() => setCurrentScreen('home')}
        onAddToCart={(p, qty) => {
          handleAddToCart(p, qty);
          setCurrentScreen('cart');
        }}
        cartCount={totalCartBadgeCount}
        onOpenCart={() => setCurrentScreen('cart')}
      />
    );
  }

  // SCREEN 5: Cart Screen (Screen 5 in Reference)
  if (currentScreen === 'cart') {
    return (
      <div className="min-h-screen bg-parchment">
        <CartDrawer
          cart={cart}
          onBack={() => setCurrentScreen('home')}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />
        <BottomNav
          currentScreen="cart"
          onNavigate={(screen) => setCurrentScreen(screen)}
          cartCount={totalCartBadgeCount}
        />
      </div>
    );
  }

  // Filtered Products for Pickles Screen / Snacks Screen
  const picklesList = products.filter(
    (p) => p.category?.toLowerCase() === 'pickles'
  );
  const snacksList = products.filter(
    (p) => p.category?.toLowerCase() === 'snacks'
  );

  return (
    <div className="min-h-screen flex flex-col bg-parchment text-espresso max-w-md mx-auto relative pb-20 shadow-2xl">
      {/* Compact Mobile Header */}
      <HeaderNav
        cartCount={totalCartBadgeCount}
        onOpenCart={() => setCurrentScreen('cart')}
        onGoHome={() => setCurrentScreen('home')}
      />

      {/* SCREEN 2: Home Page (Screen 2 in Reference) */}
      {currentScreen === 'home' && (
        <main className="flex-grow space-y-4">
          {/* Hero Banner Jar Photography */}
          <HeroSection
            products={products}
            onExploreNow={() => setCurrentScreen('pickles')}
            onSelectProduct={handleOpenProductDetails}
          />

          {/* Two Main Category Cards: PICKLES & SNACKS */}
          <CategorySection
            onSelectPickles={() => setCurrentScreen('pickles')}
            onSelectSnacks={() => setCurrentScreen('snacks')}
          />

          {/* Customer Reviews Paper Note Carousel */}
          <ReviewCarousel
            reviews={reviews}
            onOpenSubmitModal={() => setIsSubmitReviewModalOpen(true)}
          />
        </main>
      )}

      {/* SCREEN 3: Pickles Category (Screen 3 in Reference) */}
      {currentScreen === 'pickles' && (
        <main className="flex-grow px-4 py-3 space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen('home')}
              className="p-1.5 rounded-full hover:bg-parchment-deep text-espresso"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-heading text-2xl font-bold text-espresso">
                Pickles
              </h2>
              <p className="text-xs text-espresso-muted">
                Traditional homemade meat & fish pickles
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {picklesList.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(_, p) => handleAddToCart(p, 1)}
                onOpenDetails={handleOpenProductDetails}
              />
            ))}
          </div>
        </main>
      )}

      {/* SCREEN 3 (Alt): Snacks Category */}
      {currentScreen === 'snacks' && (
        <main className="flex-grow px-4 py-3 space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen('home')}
              className="p-1.5 rounded-full hover:bg-parchment-deep text-espresso"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-heading text-2xl font-bold text-espresso">
                Snacks
              </h2>
              <p className="text-xs text-espresso-muted">
                Traditional Kerala snacks for weddings, functions and special occasions
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {snacksList.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(_, p) => handleAddToCart(p, 1)}
                onOpenDetails={handleOpenProductDetails}
              />
            ))}
          </div>
        </main>
      )}

      {/* Fixed Mobile Bottom Navigation Bar */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        cartCount={totalCartBadgeCount}
      />

      {/* Customer Review Submission Modal */}
      <SubmitReviewModal
        isOpen={isSubmitReviewModalOpen}
        onClose={() => setIsSubmitReviewModalOpen(false)}
        products={products}
        onReviewSubmitted={fetchReviewsFromBackend}
      />
    </div>
  );
}
