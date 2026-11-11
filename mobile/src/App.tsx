import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './i18n/LanguageContext';

const TransparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer theme={TransparentTheme}>
              <StatusBar style="light" />
              <AppNavigator />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
