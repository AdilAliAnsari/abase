import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Volume2, VolumeX, Eye } from 'lucide-react-native';
import { useAccessibility } from '../context/AccessibilityContext';

export const AccessibilityFloatingBar: React.FC = () => {
  const { isBlindModeEnabled, toggleBlindMode, stopSpeech, isSpeaking } = useAccessibility();

  if (!isBlindModeEnabled) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        <View style={styles.leftGroup}>
          <View style={styles.pulseDot}>
            <Volume2 size={16} color="#000000" />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title}>Voice Assist (Blind Mode) Active</Text>
            <Text style={styles.subtitle}>
              {isSpeaking ? 'Speaking... (Double tap to open)' : 'Tap any item to hear details • Double-tap to open'}
            </Text>
          </View>
        </View>

        <View style={styles.actionsGroup}>
          {isSpeaking && (
            <TouchableOpacity
              style={styles.muteBtn}
              onPress={stopSpeech}
              activeOpacity={0.8}
            >
              <VolumeX size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.disableBtn}
            onPress={toggleBlindMode}
            activeOpacity={0.8}
          >
            <Text style={styles.disableText}>Turn Off</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 20 : 85,
    left: 12,
    right: 12,
    zIndex: 9999,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D0E15',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    maxWidth: 580,
    width: '100%',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  pulseDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#B8B8C2',
    fontSize: 10,
    fontWeight: '500',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  muteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disableBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  disableText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default AccessibilityFloatingBar;
