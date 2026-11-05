import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { colors } from './theme/colors';
import { BottomNavPill, TabKey } from './components/BottomNavPill';
import { HomeScreen } from './features/catalog/HomeScreen';
import { TrackingScreen } from './features/tracking/TrackingScreen';
import { RideBookingScreen } from './features/rides/RideBookingScreen';
import { SafetyScreen } from './features/safety/SafetyScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { CartScreen } from './features/cart/CartScreen';

export const AppNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Active Tab Screen */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && (
          <HomeScreen
            onNavigateToRide={() => setActiveTab('ride')}
            onNavigateToCart={() => setIsCartOpen(true)}
          />
        )}
        {activeTab === 'orders' && <TrackingScreen />}
        {activeTab === 'ride' && <RideBookingScreen />}
        {activeTab === 'safety' && <SafetyScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Cart Modal */}
      <Modal
        visible={isCartOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCartOpen(false)}
      >
        <CartScreen
          onClose={() => setIsCartOpen(false)}
          onCheckoutSuccess={() => {
            setIsCartOpen(false);
            setActiveTab('orders');
          }}
        />
      </Modal>

      {/* Bottom Navigation Pill (Matching Reference Image 2) */}
      <BottomNavPill activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  screenContainer: {
    flex: 1,
  },
});
