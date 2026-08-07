import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, ShoppingBag, User, BookOpen } from 'lucide-react-native';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PlaceholderScreen({ name }: { name: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>{name}</Text>
      <Text style={{ color: colors.text.secondary, marginTop: 8 }}>Coming Soon</Text>
    </View>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(15, 15, 20, 0.95)',
          borderTopWidth: 1,
          borderTopColor: colors.glassBorder,
          paddingBottom: 28,
          paddingTop: 10,
          height: 80,
        },
        tabBarActiveTintColor: colors.accent.orange,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <Home size={22} color={color} /> }} 
      />
      <Tab.Screen 
        name="Browse" 
        component={() => <PlaceholderScreen name="Browse" />} 
        options={{ tabBarIcon: ({ color }) => <BookOpen size={22} color={color} /> }} 
      />
      <Tab.Screen 
        name="Search" 
        component={() => <PlaceholderScreen name="Search" />} 
        options={{ tabBarIcon: ({ color }) => <Search size={22} color={color} /> }} 
      />
      <Tab.Screen 
        name="Cart" 
        component={() => <PlaceholderScreen name="Cart" />} 
        options={{ tabBarIcon: ({ color }) => <ShoppingBag size={22} color={color} /> }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={() => <PlaceholderScreen name="Profile" />} 
        options={{ tabBarIcon: ({ color }) => <User size={22} color={color} /> }} 
      />
    </Tab.Navigator>
  );
}