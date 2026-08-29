import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AiChat from '../components/AiChat';
import AnimatedTabBar from '../components/AnimatedTabBar';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PlaceholderScreen({ name }: { name: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.primaryText, fontSize: 20, fontWeight: '700' }}>{name}</Text>
      <Text style={{ color: colors.secondaryText, marginTop: 8 }}>Coming Soon</Text>
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="AI"
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarStyle: {
          backgroundColor: colors.navBackground,
          borderTopWidth: 1,
          borderTopColor: colors.glassBorder,
          paddingBottom: 28,
          paddingTop: 10,
          height: 80,
        },
        tabBarActiveTintColor: colors.navActive,
        tabBarInactiveTintColor: colors.navIcon,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Search"
        component={() => <PlaceholderScreen name="Search" />}
      />
      <Tab.Screen
        name="AI"
        component={AiChat}
        options={{ tabBarLabel: 'AI' }}
      />
      <Tab.Screen
        name="Cart"
        component={() => <PlaceholderScreen name="Cart" />}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <RootStack.Navigator 
      screenOptions={{ 
        headerShown: false, 
        animation: 'slide_from_right', 
        contentStyle: { backgroundColor: 'transparent' } 
      }}
    >
      <RootStack.Screen name="MainTabs" component={TabNavigator} />
      <RootStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="SignUp" component={SignUpScreen} />
    </RootStack.Navigator>
  );
}