import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

interface AccessibilityContextType {
  isBlindModeEnabled: boolean;
  isSpeaking: boolean;
  selectedItemId: string | null;
  toggleBlindMode: () => Promise<void>;
  setBlindMode: (enabled: boolean) => Promise<void>;
  speak: (text: string, onDone?: () => void) => void;
  stopSpeech: () => void;
  handleAccessiblePress: (itemId: string, textToRecite: string, onActivate: () => void) => void;
}

const STORAGE_KEY = '@abase_blind_tts_enabled';

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBlindModeEnabled, setIsBlindModeEnabled] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedTimerRef = useRef<any>(null);
  const lastPressTimeRef = useRef<{ [key: string]: number }>({});

  // Load saved preference
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          setIsBlindModeEnabled(stored === 'true');
        }
      } catch (err) {
        console.warn('AccessibilityProvider: Failed to load preference:', err);
      }
    })();
  }, []);

  const stopSpeech = useCallback(() => {
    try {
      Speech.stop();
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } catch {
      // safe fallback
    }
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (!text || text.trim() === '') return;
    stopSpeech();
    setIsSpeaking(true);

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';
        utterance.onend = () => {
          setIsSpeaking(false);
          onDone?.();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        Speech.speak(text, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.95,
          onDone: () => {
            setIsSpeaking(false);
            onDone?.();
          },
          onStopped: () => {
            setIsSpeaking(false);
          },
          onError: () => {
            setIsSpeaking(false);
          },
        });
      }
    } catch (err) {
      console.warn('Speech error:', err);
      setIsSpeaking(false);
    }
  }, [stopSpeech]);

  const setBlindMode = useCallback(async (enabled: boolean) => {
    setIsBlindModeEnabled(enabled);
    setSelectedItemId(null);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    } catch {
      // storage ignore
    }

    if (enabled) {
      speak('Text-to-speech voice assistance for the blind is now enabled. Tap any card or button once to hear all details recited. Double click or tap again to open.');
    } else {
      speak('Text-to-speech voice assistance is now turned off. Returning to normal single-tap navigation.');
      stopSpeech();
    }
  }, [speak, stopSpeech]);

  const toggleBlindMode = useCallback(async () => {
    await setBlindMode(!isBlindModeEnabled);
  }, [isBlindModeEnabled, setBlindMode]);

  /**
   * Accessible Press Handler:
   * - When Blind Mode is OFF: Executes onActivate() immediately (normal single tap).
   * - When Blind Mode is ON:
   *     - First tap: Recites all details out loud using TTS and selects the item.
   *     - Double tap / second tap on the same item (within 4 seconds): Executes onActivate()!
   */
  const handleAccessiblePress = useCallback(
    (itemId: string, textToRecite: string, onActivate: () => void) => {
      if (!isBlindModeEnabled) {
        onActivate();
        return;
      }

      const now = Date.now();
      const lastTime = lastPressTimeRef.current[itemId] || 0;
      const isDoubleTap = selectedItemId === itemId && (now - lastTime < 4000);

      if (isDoubleTap) {
        // Double click confirmed! Stop recitation and activate the target action
        if (selectedTimerRef.current) clearTimeout(selectedTimerRef.current);
        setSelectedItemId(null);
        stopSpeech();
        speak('Opening');
        onActivate();
        return;
      }

      // First tap: Select item and recite full text
      setSelectedItemId(itemId);
      lastPressTimeRef.current[itemId] = now;
      if (selectedTimerRef.current) clearTimeout(selectedTimerRef.current);
      selectedTimerRef.current = setTimeout(() => {
        setSelectedItemId(null);
      }, 5000);

      const promptText = `${textToRecite}. Double click to open.`;
      speak(promptText);
    },
    [isBlindModeEnabled, selectedItemId, speak, stopSpeech]
  );

  return (
    <AccessibilityContext.Provider
      value={{
        isBlindModeEnabled,
        isSpeaking,
        selectedItemId,
        toggleBlindMode,
        setBlindMode,
        speak,
        stopSpeech,
        handleAccessiblePress,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext;
