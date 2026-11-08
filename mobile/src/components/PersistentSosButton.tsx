import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { colors } from '../theme/colors';

interface PersistentSosButtonProps {
  onSosTriggered?: () => void;
  style?: any;
}

export const PersistentSosButton: React.FC<PersistentSosButtonProps> = ({
  onSosTriggered,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  const holdAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Concentric safety pulse animation
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handlePressIn = () => {
    setIsHolding(true);
    Animated.timing(holdAnim, {
      toValue: 1,
      duration: 2000, // 2-second hold trigger
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setSosActive(true);
        if (onSosTriggered) onSosTriggered();
      }
    });
  };

  const handlePressOut = () => {
    setIsHolding(false);
    if (!sosActive) {
      Animated.timing(holdAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const progressWidth = holdAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <>
      {/* Floating Persistent Pill Button */}
      <View style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setModalVisible(true)}
          style={styles.floatingButton}
        >
          <View style={styles.innerDot} />
          <Text style={styles.buttonText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Modal with 2-Second Hold-to-Trigger */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.badgeRow}>
              <Text style={styles.emergencyTag}>EMERGENCY DISTRESS</Text>
            </View>

            <Text style={styles.modalTitle}>Emergency Assistance</Text>
            <Text style={styles.modalSubtitle}>
              Press and hold for 2 seconds to immediately broadcast your live GPS
              location and vehicle details to your trusted emergency contacts and 112 services.
            </Text>

            {/* Hold Button with Progress Ring */}
            <View style={styles.holdButtonContainer}>
              <Animated.View
                style={[styles.progressBar, { width: progressWidth }]}
              />
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                  styles.tactileHoldButton,
                  sosActive && styles.tactileHoldButtonActive,
                ]}
              >
                <Text style={styles.holdButtonText}>
                  {sosActive ? 'ALERT SENT' : isHolding ? 'HOLDING...' : 'HOLD FOR SOS'}
                </Text>
                <Text style={styles.holdSubtext}>
                  {sosActive ? 'Contacts notified via SMS' : 'Hold 2 seconds'}
                </Text>
              </TouchableOpacity>
            </View>

            {sosActive && (
              <View style={styles.alertSentBox}>
                <Text style={styles.alertSentTitle}>✓ Emergency Broadcast Active</Text>
                <Text style={styles.alertSentText}>
                  Live coordinates (17.4399° N, 78.3970° E) sent to Rahul Verma and Ananya Sen.
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSosActive(false);
                holdAnim.setValue(0);
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 18,
    zIndex: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(127, 29, 29, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.7)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.crimson,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 14, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#16161D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(214, 69, 69, 0.35)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  badgeRow: {
    marginBottom: 8,
  },
  emergencyTag: {
    color: colors.crimson,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalTitle: {
    color: colors.cream,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: colors.creamMuted,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  holdButtonContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.crimson,
    opacity: 0.35,
    height: '100%',
  },
  tactileHoldButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.crimsonDark,
    borderWidth: 2,
    borderColor: colors.crimson,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tactileHoldButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  holdButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  holdSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  alertSentBox: {
    marginTop: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  alertSentTitle: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 2,
  },
  alertSentText: {
    color: colors.cream,
    fontSize: 11,
    lineHeight: 15,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: colors.creamMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
