import { useState, useEffect } from 'react';
import { Product, CartItem, Review, Promotion } from './types';
import { API_BASE_URL, REVIEWS_API_URL, PROMOTIONS_API_URL } from './config/constants';
import { BrandIntroModal } from './components/BrandIntroModal';
import { HeaderNav } from './components/HeaderNav';
import { BottomNav } from './components/BottomNav';
import { HeroSection } from './components/HeroSection';
import { CategorySection } from './components/CategorySection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { CartDrawer } from './components/CartDrawer';
import { ReviewCarousel } from './components/ReviewCarousel';
import { ContactSection } from './components/ContactSection';
import { ArrowLeft } from 'lucide-react';

type ScreenState = 'intro' | 'home' | 'pickles' | 'snacks' | 'product-detail' | 'cart';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(() => {
    // Check if deep link ?product=123 exists to skip intro directly to product
    const params = new URLSearchParams(window.location.search);
    const hasProductParam = params.has('product') || params.has('productId') || params.has('product_id');
    if (hasProductParam) return 'home';
    return sessionStorage.getItem('silvys_intro_seen') ? 'home' : 'intro';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('silvys_cart_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProductsFromBackend();
    fetchPromotionsFromBackend();
    fetchReviewsFromBackend();

    // Auto-poll backend every 3 seconds to reflect live admin updates
    const interval = setInterval(() => {
      fetchProductsFromBackend();
      fetchPromotionsFromBackend();
      fetchReviewsFromBackend();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Deep-linking: auto-open product detail screen when URL contains ?product=123
  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const prodParam = params.get('product') || params.get('productId') || params.get('product_id');
      if (prodParam) {
        const targetId = Number(prodParam);
        const found = products.find((p) => p.id === targetId);
        if (found) {
          setSelectedProduct(found);
          setCurrentScreen('product-detail');
        }
      }
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('silvys_cart_v4', JSON.stringify(cart));
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
      console.warn('Backend API connection offline:', err);
    }
  };

  const fetchPromotionsFromBackend = async () => {
    try {
      const res = await fetch(PROMOTIONS_API_URL);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data && data.success && Array.isArray(data.data) ? data.data : null);
        if (list) {
          setPromotions(list);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend Promotions API connection offline:', err);
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
      console.warn('Backend Reviews API connection offline:', err);
    }
  };

  const navigateToScreen = (screen: ScreenState) => {
    setCurrentScreen(screen);
    if (screen !== 'product-detail' && window.location.search) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const handleEnterKitchen = () => {
    sessionStorage.setItem('silvys_intro_seen', 'true');
    navigateToScreen('home');
  };

  // CART ADD METHOD: Identity MUST be product ID + selected unit
  const handleAddToCart = (
    product: Product,
    selectedUnit?: string,
    selectedPrice?: number,
    quantity: number = 1,
    overwrite: boolean = false
  ) => {
    const unitToUse = selectedUnit || product.unit || '500g';
    const priceToUse = selectedPrice !== undefined ? selectedPrice : product.price;
    const cartItemId = `${product.id}_${unitToUse}`;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prevCart.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: overwrite ? quantity : item.quantity + quantity }
            : item
        );
      }
      return [
        ...prevCart,
        {
          cartItemId,
          productId: product.id,
          name: product.name,
          malayalamName: product.malayalamName ?? product.malayalam_name ?? null,
          category: product.category,
          imageUrl: product.imageUrl ?? product.image_url ?? '',
          selectedUnit: unitToUse,
          selectedPrice: priceToUse,
          quantity,
        },
      ];
    });
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleOpenProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen('product-detail');
    const newUrl = `${window.location.pathname}?product=${product.id}`;
    window.history.pushState(null, '', newUrl);
  };

  const handleBackFromProductDetail = () => {
    navigateToScreen('home');
  };

  const totalCartBadgeCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // SCREEN 1: Full-Screen Logo Intro
  if (currentScreen === 'intro') {
    return <BrandIntroModal onEnter={handleEnterKitchen} />;
  }

  // SCREEN 4: Product Details Screen
  if (currentScreen === 'product-detail' && selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onBack={handleBackFromProductDetail}
        onAddToCart={(p, unit, price, qty) => {
          handleAddToCart(p, unit, price, qty, true);
          navigateToScreen('cart');
        }}
        cartCount={totalCartBadgeCount}
        onOpenCart={() => navigateToScreen('cart')}
      />
    );
  }

  // SCREEN 5: Cart Screen
  if (currentScreen === 'cart') {
    return (
      <div className="min-h-screen bg-parchment">
        <CartDrawer
          cart={cart}
          onBack={() => navigateToScreen('home')}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />
        <BottomNav
          currentScreen="cart"
          onNavigate={(screen) => navigateToScreen(screen)}
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
        onOpenCart={() => navigateToScreen('cart')}
        onGoHome={() => navigateToScreen('home')}
      />

      {/* SCREEN 2: Home Page */}
      {currentScreen === 'home' && (
        <main className="flex-grow space-y-4">
          {/* Hero Banner Section (Promotions Aware with Fallback) */}
          <HeroSection
            promotions={promotions}
            products={products}
            onExploreNow={() => navigateToScreen('pickles')}
            onSelectProduct={handleOpenProductDetails}
          />

          {/* Two Main Category Cards: PICKLES & SNACKS */}
          <CategorySection
            onSelectPickles={() => navigateToScreen('pickles')}
            onSelectSnacks={() => navigateToScreen('snacks')}
          />

          {/* Featured Customer Reviews Carousel (Display Only) */}
          <ReviewCarousel
            reviews={reviews}
          />

          {/* Homepage Contact Us Section */}
          <ContactSection />
        </main>
      )}

      {/* SCREEN 3: Pickles Category */}
      {currentScreen === 'pickles' && (
        <main className="flex-grow px-4 py-3 space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateToScreen('home')}
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
                onAddToCart={(_, p) => handleAddToCart(p, undefined, undefined, 1)}
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
              onClick={() => navigateToScreen('home')}
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
                onAddToCart={(_, p) => handleAddToCart(p, undefined, undefined, 1)}
                onOpenDetails={handleOpenProductDetails}
              />
            ))}
          </div>
        </main>
      )}

      {/* Fixed Mobile Bottom Navigation Bar */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={(screen) => navigateToScreen(screen)}
        cartCount={totalCartBadgeCount}
      />
    </div>
  );
}

