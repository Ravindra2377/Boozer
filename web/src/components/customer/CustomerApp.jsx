import React, { useState, useEffect } from 'react';
import {
  Home, Package, Car, ShieldCheck, User, RefreshCw
} from 'lucide-react';
import { CatalogScreen } from './CatalogScreen';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { OrderTrackingScreen } from './OrderTrackingScreen';
import { RideBookingScreen } from './RideBookingScreen';
import { SafetyCentreScreen } from './SafetyCentreScreen';
import { ProfileScreen } from './ProfileScreen';
import { OnboardingKycModal } from './OnboardingKycModal';
import { SplashScreen } from './SplashScreen';
import {
  MOCK_RETAILER, MOCK_PRODUCTS, INITIAL_USER, ORDER_STATE_MACHINE_STEPS
} from '../../data/mockData';
import { api } from '../../api/client';

export function CustomerApp({
  isFrameMode,
  user: propUser,
  setUser: propSetUser,
  onSignOut,
  onOpenAuthModal
}) {
  const [showSplash, setShowSplash] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'orders', 'ride', 'safety', 'profile'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [cart, setCart] = useState([
    { product: MOCK_PRODUCTS[0], quantity: 1 },
    { product: MOCK_PRODUCTS[1], quantity: 2 }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [internalUser, setInternalUser] = useState(INITIAL_USER);

  const user = propUser !== undefined ? propUser : internalUser;
  const setUser = propSetUser || setInternalUser;

  // Sync products and user from API (with automatic fallback to mockData)
  useEffect(() => {
    let mounted = true;
    api.getProducts().then((data) => {
      if (mounted && data && data.length > 0) {
        setProducts(data);
      }
    });
    api.getProfile().then((userData) => {
      if (mounted && userData) {
        setUser((prev) => ({
          ...INITIAL_USER,
          ...prev,
          ...userData,
          activeRideCredit: userData?.activeRideCredit ?? prev?.activeRideCredit ?? 150.00,
          deliveryAddress: userData?.deliveryAddress ?? prev?.deliveryAddress ?? INITIAL_USER.deliveryAddress,
          calculatedAge: userData?.calculatedAge ?? prev?.calculatedAge ?? 29,
          documentType: userData?.documentType ?? prev?.documentType ?? INITIAL_USER.documentType,
          maskedDocNumber: userData?.maskedDocNumber ?? prev?.maskedDocNumber ?? INITIAL_USER.maskedDocNumber,
        }));
      }
    });
    return () => { mounted = false; };
  }, []);

  // Active Order state
  const [order, setOrder] = useState({
    id: "ord-4819",
    orderNumber: "BZ-20261105-4819",
    status: "DISPATCHED",
    totalAmount: 2999.00,
    ageCheckAtDoorVerified: false
  });

  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const handleAddToCart = (product) => {
    const existing = cart.find((i) => i.product.id === product.id);
    if (existing) {
      setCart(cart.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter((i) => i.product.id !== productId));
    } else {
      setCart(cart.map((i) => i.product.id === productId ? { ...i, quantity: newQty } : i));
    }
  };

  const handleCheckoutSuccess = async () => {
    const total = cart.reduce((acc, i) => acc + (i.product.priceLegalMrp || 0) * i.quantity, 0);
    const newOrder = await api.createOrder({
      items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      totalInr: total,
    });

    setCart([]);
    setOrder({
      id: newOrder.id,
      orderNumber: newOrder.orderNumber,
      status: newOrder.status || "ACCEPTED",
      totalAmount: total,
      ageCheckAtDoorVerified: false
    });
    setActiveTab('orders');
  };

  const handleAdvanceOrderState = async () => {
    const currentIndex = ORDER_STATE_MACHINE_STEPS.findIndex((s) => s.key === order.status);
    if (currentIndex < ORDER_STATE_MACHINE_STEPS.length - 1) {
      const nextStatus = ORDER_STATE_MACHINE_STEPS[currentIndex + 1].key;
      const ageVerified = nextStatus === 'AGE_CHECKED' || nextStatus === 'DELIVERED';
      await api.transitionOrder(order.id, nextStatus, ageVerified);
      setOrder({
        ...order,
        status: nextStatus,
        ageCheckAtDoorVerified: ageVerified
      });
    }
  };

  return (
    <div className="main-content-viewport">
      <div className={`device-frame-container ${!isFrameMode ? 'device-frame-expanded' : ''}`}>
        {/* Cinematic Splash Screen or Main Content */}
        {showSplash ? (
          <SplashScreen onGetStarted={() => setShowSplash(false)} />
        ) : (
          <>
            {/* 5-Tab Router matching user blueprint & Reference Image 2 */}
            {activeTab === 'home' && (
              <CatalogScreen
                retailer={MOCK_RETAILER}
                products={products}
                cart={cart}
                onAddToCart={handleAddToCart}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onNavigateToRides={() => setActiveTab('ride')}
              />
            )}

            {activeTab === 'orders' && (
              <OrderTrackingScreen
                order={order}
                city={user?.city || "Hyderabad"}
                isFrameMode={isFrameMode}
                onNavigateToRides={() => setActiveTab('ride')}
                onAdvanceOrderState={handleAdvanceOrderState}
              />
            )}

            {activeTab === 'ride' && (
              <RideBookingScreen
                user={user}
                isFrameMode={isFrameMode}
                onOpenSos={() => setActiveTab('safety')}
              />
            )}

            {activeTab === 'safety' && (
              <SafetyCentreScreen />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                user={user}
                onOpenKycModal={() => setIsKycModalOpen(true)}
                onSignOut={onSignOut}
                onOpenAuthModal={onOpenAuthModal}
              />
            )}

            {/* Bottom Navigation Pill Bar (Matching Reference Image 2 exactly!) */}
            <div className="bottom-nav-pill-container">
              <nav className="bottom-nav-pill">
                <button
                  className={`nav-tab-item ${activeTab === 'home' ? 'active' : ''}`}
                  onClick={() => setActiveTab('home')}
                >
                  <Home size={20} />
                  <span>Home</span>
                </button>

                <button
                  className={`nav-tab-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <Package size={20} />
                  <span>Orders</span>
                </button>

                <button
                  className={`nav-tab-item ${activeTab === 'ride' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ride')}
                >
                  <Car size={20} />
                  <span>Ride</span>
                </button>

                <button
                  className={`nav-tab-item ${activeTab === 'safety' ? 'active' : ''}`}
                  onClick={() => setActiveTab('safety')}
                >
                  <ShieldCheck size={20} />
                  <span>Safety</span>
                </button>

                <button
                  className={`nav-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={20} />
                  <span>Profile</span>
                </button>
              </nav>
            </div>
          </>
        )}

        {/* Modals & Overlays */}
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onClearCart={() => setCart([])}
          onCheckoutSuccess={handleCheckoutSuccess}
          user={user}
        />

        <OnboardingKycModal
          isOpen={isKycModalOpen}
          onClose={() => setIsKycModalOpen(false)}
          user={user}
          onVerifyComplete={(verifiedRecord) => {
            const baseUser = user || INITIAL_USER;
            const updated = {
              ...baseUser,
              kycStatus: 'VERIFIED',
              documentType: verifiedRecord?.docType || baseUser?.documentType || 'Driving Licence',
              maskedDocNumber: verifiedRecord?.docNumberMasked || baseUser?.maskedDocNumber || 'TS-092015XXXX4819',
              calculatedAge: verifiedRecord?.calculatedAge || baseUser?.calculatedAge || 29,
              kycProvider: 'DIGILOCKER',
            };
            setUser(updated);
            localStorage.setItem('boozer_user', JSON.stringify(updated));
          }}
        />
      </div>
    </div>
  );
}
