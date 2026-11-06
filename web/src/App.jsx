import React, { useState } from 'react';
import { Header } from './components/Header';
import { CustomerApp } from './components/customer/CustomerApp';
import { RetailerPortal } from './components/retailer/RetailerPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OnboardingKycModal } from './components/customer/OnboardingKycModal';
import { AuthModal } from './components/auth/AuthModal';
import { INITIAL_USER } from './data/mockData';
import { api } from './api/client';

export function App() {
  const [activeView, setActiveView] = useState('customer'); // 'customer', 'retailer', 'admin'
  const [isFrameMode, setIsFrameMode] = useState(true); // phone frame vs full desktop
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('boozer_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });
  const [isGlobalKycOpen, setIsGlobalKycOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  // Global Sign Out handler
  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('boozer_user');
    localStorage.removeItem('boozer_token');
    localStorage.removeItem('boozer_user_id');
    api.clearToken();
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  // Global Auth Success handler
  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    localStorage.setItem('boozer_user', JSON.stringify(authenticatedUser));
    if (authenticatedUser.role === 'RETAILER') {
      setActiveView('retailer');
    } else if (authenticatedUser.role === 'ADMIN') {
      setActiveView('admin');
    }
  };

  return (
    <div className="app-container">
      {/* Top Header Bar */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isFrameMode={isFrameMode}
        setIsFrameMode={setIsFrameMode}
        cartCount={3}
        onOpenCart={() => {}}
        onOpenKycModal={() => setIsGlobalKycOpen(true)}
        kycVerified={user?.kycStatus === 'VERIFIED'}
        user={user}
        onSignOut={handleSignOut}
        onOpenAuthModal={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main View Router */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeView === 'customer' && (
          <CustomerApp
            isFrameMode={isFrameMode}
            user={user}
            setUser={setUser}
            onSignOut={handleSignOut}
            onOpenAuthModal={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
          />
        )}

        {activeView === 'retailer' && (
          <RetailerPortal />
        )}

        {activeView === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Global KYC Modal */}
      {user && (
        <OnboardingKycModal
          isOpen={isGlobalKycOpen}
          onClose={() => setIsGlobalKycOpen(false)}
          user={user}
          onVerifyComplete={() => {
            const updated = { ...user, kycStatus: 'VERIFIED' };
            setUser(updated);
            localStorage.setItem('boozer_user', JSON.stringify(updated));
          }}
        />
      )}

      {/* Sign In & Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
        onSwitchView={(newView) => setActiveView(newView)}
      />
    </div>
  );
}

export default App;

