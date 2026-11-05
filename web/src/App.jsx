import React, { useState } from 'react';
import { Header } from './components/Header';
import { CustomerApp } from './components/customer/CustomerApp';
import { RetailerPortal } from './components/retailer/RetailerPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OnboardingKycModal } from './components/customer/OnboardingKycModal';
import { INITIAL_USER } from './data/mockData';

export function App() {
  const [activeView, setActiveView] = useState('customer'); // 'customer', 'retailer', 'admin'
  const [isFrameMode, setIsFrameMode] = useState(true); // phone frame vs full desktop
  const [user, setUser] = useState(INITIAL_USER);
  const [isGlobalKycOpen, setIsGlobalKycOpen] = useState(false);

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
        kycVerified={user.kycStatus === 'VERIFIED'}
      />

      {/* Main View Router */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeView === 'customer' && (
          <CustomerApp isFrameMode={isFrameMode} />
        )}

        {activeView === 'retailer' && (
          <RetailerPortal />
        )}

        {activeView === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Global KYC Modal */}
      <OnboardingKycModal
        isOpen={isGlobalKycOpen}
        onClose={() => setIsGlobalKycOpen(false)}
        user={user}
        onVerifyComplete={() => {
          setUser({ ...user, kycStatus: 'VERIFIED' });
        }}
      />
    </div>
  );
}

export default App;
