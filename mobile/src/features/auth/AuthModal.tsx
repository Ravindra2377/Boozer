import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { colors } from '../../theme';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {mode === 'login' ? (
          <LoginScreen
            onNavigateToRegister={() => setMode('signup')}
            onLoginSuccess={onClose}
            onClose={onClose}
          />
        ) : (
          <RegisterScreen
            onNavigateToLogin={() => setMode('login')}
            onRegisterSuccess={onClose}
            onClose={onClose}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
