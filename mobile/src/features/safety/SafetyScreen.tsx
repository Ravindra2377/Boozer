import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';

export const SafetyScreen: React.FC = () => {
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Rahul Verma', phone: '+91 98765 00001', rel: 'Partner' },
    { id: '2', name: 'Ananya Sen', phone: '+91 98765 00002', rel: 'Best Friend' },
  ]);

  const [sosActive, setSosActive] = useState(false);

  const handleTriggerSos = () => {
    setSosActive(true);
    Alert.alert(
      'Emergency SOS Dispatched',
      'SMS with live GPS coordinates broadcasted to Rahul Verma and Ananya Sen.'
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.safetyTag}>
          <Text style={styles.safetyTagText}>SAFETY & CARE</Text>
        </View>
        <Text style={styles.title}>Emergency Assistance</Text>
        <Text style={styles.subtitle}>
          One-tap distress broadcast, live location sharing, and responsible drinking guidelines.
        </Text>
      </View>

      {/* SOS Hero Trigger Box */}
      <View style={styles.sosCard}>
        <Text style={styles.sosCardTag}>EMERGENCY DISTRESS</Text>
        <Text style={styles.sosCardTitle}>Hold for Emergency SOS</Text>
        <Text style={styles.sosCardDesc}>
          Sends an urgent distress alert with your live GPS coordinates to your trusted contacts.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleTriggerSos}
          style={[styles.bigSosButton, sosActive && styles.bigSosButtonActive]}
        >
          <Text style={styles.sosButtonIcon}>{sosActive ? '✓' : '!'}</Text>
          <Text style={styles.sosButtonText}>{sosActive ? 'ALERT SENT' : 'SOS'}</Text>
          <Text style={styles.sosButtonSub}>{sosActive ? 'Help alerted' : 'Tap for Emergency'}</Text>
        </TouchableOpacity>
      </View>

      {/* Trusted Emergency Contacts */}
      <View style={styles.contactsCard}>
        <View style={styles.contactsHeader}>
          <Text style={styles.contactsTitle}>Trusted Contacts ({contacts.length})</Text>
          <TouchableOpacity
            onPress={() =>
              Alert.prompt
                ? Alert.prompt('Add Contact', 'Enter contact name and phone')
                : Alert.alert('Add Contact', 'Contact picker will open on device.')
            }
          >
            <Text style={styles.addContactText}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>

        {contacts.map((c) => (
          <View key={c.id} style={styles.contactItem}>
            <View style={styles.contactAvatar}>
              <Text style={{ color: colors.gold, fontWeight: '800' }}>{c.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{c.name}</Text>
              <Text style={styles.contactPhone}>{c.rel} · {c.phone}</Text>
            </View>
            <View style={styles.sosRecipientBadge}>
              <Text style={styles.sosRecipientText}>SOS Recipient</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Responsible Drinking Guidelines */}
      <View style={styles.guidelinesCard}>
        <Text style={styles.guidelinesTitle}>Responsible Consumption Guidelines</Text>
        <Text style={styles.bulletItem}>• Always use your included ₹150 ride voucher to book a safe ride home.</Text>
        <Text style={styles.bulletItem}>• Never drive under the influence of alcohol (BAC legal limit in India: 0.03%).</Text>
        <Text style={styles.bulletItem}>• Alternate alcoholic beverages with water to stay hydrated.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  contentContainer: {
    padding: 18,
    paddingTop: 54,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 16,
  },
  safetyTag: {
    backgroundColor: 'rgba(214, 69, 69, 0.12)',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  safetyTagText: {
    color: colors.crimson,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.cream,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.creamMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  sosCard: {
    backgroundColor: '#191518',
    borderWidth: 1,
    borderColor: 'rgba(214, 69, 69, 0.35)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  sosCardTag: {
    color: colors.crimson,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sosCardTitle: {
    color: colors.cream,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  sosCardDesc: {
    color: colors.creamMuted,
    fontSize: 11.5,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  bigSosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.crimson,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigSosButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  sosButtonIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sosButtonSub: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9.5,
    marginTop: 2,
  },
  contactsCard: {
    backgroundColor: colors.cardGlass,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactsTitle: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '800',
  },
  addContactText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 10,
  },
  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(231, 161, 61, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactName: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '700',
  },
  contactPhone: {
    color: colors.creamMuted,
    fontSize: 11,
  },
  sosRecipientBadge: {
    backgroundColor: 'rgba(36, 141, 120, 0.15)',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  sosRecipientText: {
    color: colors.tealNoir,
    fontSize: 9.5,
    fontWeight: '700',
  },
  guidelinesCard: {
    backgroundColor: '#14101F',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    padding: 14,
  },
  guidelinesTitle: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  bulletItem: {
    color: colors.creamMuted,
    fontSize: 11.5,
    lineHeight: 18,
    marginBottom: 4,
  },
});
