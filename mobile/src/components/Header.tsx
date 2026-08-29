import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Platform, Modal, Animated } from 'react-native';
import { Menu, X, Home, PieChart, CreditCard, Clock, Mail, Bell, User, Globe, Key, ChevronLeft, ChevronRight, Search } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigation = useNavigation<any>();

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    rotateAnim.setValue(0);
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
        easing: (t) => t,
      })
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const search = searchQuery !== undefined ? searchQuery : localSearch;
  const setSearch = (text: string) => {
    if (onSearchChange) {
      onSearchChange(text);
    } else {
      setLocalSearch(text);
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  if (Platform.OS === 'web') {
    return (
      <>
        <header className="header">
          {/* LEFT SIDE */}
          <div className="header-left">
            {/* SIDE MENU BUTTON */}
            <button
              className={`menu-btn ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open menu"
            >
              <span />
              <span />
              <span />
            </button>
            {/* LOGO */}
            <div className="logo" onClick={() => setSearch("")}>
              <span className="logo-book">📚</span>
              <span>EduStore</span>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="search-box-wrap">
            <div className="search-box">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                style={{ width: 21, height: 21, fill: 'none', stroke: isFocused ? 'rgb(0, 183, 255)' : '#fff', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search anything..."
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              {search.length > 0 && (
                <button
                  className="clear-btn"
                  onClick={clearSearch}
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="header-right">
            {/* CART */}
            <button className="header-icon" type="button">
              <svg viewBox="0 0 24 24">
                <path d="M3 4h2l2.5 11h10l3-8H6" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="17" cy="19" r="1.5" />
              </svg>
            </button>
            {/* PROFILE */}
            <button className="profile" type="button" onClick={() => navigation.navigate('Login')}>
              AA
            </button>
          </div>
        </header>

        {menuOpen && (
          <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
        )}

        <aside className={`side-menu ${menuOpen ? "open" : ""}`}>
          {/* Close Chevron Button */}
          <button
            className="close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg className="close-chevron" viewBox="0 0 24 24" style={{ fill: 'none', stroke: '#ffffff', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          {/* Menu Title */}
          <h2 className="menu-title">Main Menu</h2>

          {/* Verification Banner */}
          <div className="verify-banner">
            <div className="verify-left">
              <div className="envelope-circle">
                <span className="orange-dot"></span>
                <svg className="envelope-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: '#000000', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 18, height: 18 }}>
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div className="verify-text">
                <div className="verify-title">Verify email for</div>
                <div className="verify-subtitle">safe transactions</div>
              </div>
            </div>
            <div className="verify-right">
              <svg className="chevron-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.4)', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 16, height: 16 }}>
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>

          {/* Grid Cards (2x2) */}
          <div className="nav-grid">
            <button className="grid-card active" onClick={() => { setMenuOpen(false); }}>
              <svg className="grid-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: '#ffffff', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 22, height: 22 }}>
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <path d="M9 22V12h6v10"/>
              </svg>
              <span>Home</span>
            </button>
            <button className="grid-card">
              <svg className="grid-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.75)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 22, height: 22 }}>
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                <path d="M22 12A10 10 0 0 0 12 2v10z"/>
              </svg>
              <span>Statistics</span>
            </button>
            <button className="grid-card">
              <svg className="grid-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.75)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 22, height: 22 }}>
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <line x1="2" x2="22" y1="10" y2="10"/>
              </svg>
              <span>My Cards</span>
            </button>
            <button className="grid-card">
              <svg className="grid-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.75)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 22, height: 22 }}>
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>History</span>
            </button>
          </div>

          {/* Messages Section */}
          <div className="menu-section-header">Messages</div>
          <div className="list-items">
            <button className="list-item">
              <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <span>Inbox</span>
            </button>
            <button className="list-item">
              <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span>Notifications</span>
            </button>
          </div>

          {/* Account & Security Section */}
          <div className="menu-section-header">Account and Security</div>
          <div className="list-items">
            <button className="list-item">
              <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Update Account Data</span>
            </button>
            <button className="list-item">
              <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                <path d="M2 12h20"/>
              </svg>
              <span>Language</span>
            </button>
            <button className="list-item">
              <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                <path d="m21 2-2 2"/>
                <circle cx="7.5" cy="16.5" r="5.5"/>
                <path d="m11.4 12.6 7-7"/>
                <path d="M16 8.5H19V5.5"/>
              </svg>
              <span>Change Password</span>
            </button>
          </div>
        </aside>

        <style>{`
          .header {
            width: 100%;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 28px;
            box-sizing: border-box;
            background: transparent;
            border-bottom: none;
            position: relative;
            z-index: 100;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .menu-btn {
            width: 46px;
            height: 46px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
            border: none;
            border-radius: 14px;
            background: #171722;
            cursor: pointer;
            transition: 0.3s ease;
          }
          .menu-btn span {
            width: 20px;
            height: 2px;
            background: #fff;
            border-radius: 10px;
            transition: 0.3s ease;
          }
          .menu-btn:hover {
            background: #6469f2;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(100, 105, 242, 0.35);
          }
          .menu-btn.active {
            background: #6469f2;
          }
          .menu-btn.active span:nth-child(1) {
            transform: translateY(7px) rotate(45deg);
          }
          .menu-btn.active span:nth-child(2) {
            opacity: 0;
          }
          .menu-btn.active span:nth-child(3) {
            transform: translateY(-7px) rotate(-45deg);
          }
          .logo {
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
            font-size: 20px;
            font-weight: 700;
            cursor: pointer;
            user-select: none;
          }
          .logo-book {
            font-size: 22px;
          }
          .search-box-wrap {
            position: relative;
            width: 280px;
            height: 50px;
            border-radius: 30px;
            padding: 2px;
            background: #1616a6ff;
            overflow: hidden;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            z-index: 10;
            transition: width 0.4s ease, transform 0.3s ease;
          }
          .search-box-wrap:hover {
            width: 360px;
            transform: translateY(-2px);
          }
          /* The spinning gradient border */
          .search-box-wrap::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background-image: radial-gradient(at 49% 30%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),
                              radial-gradient(at 14% 26%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),
                              radial-gradient(at 0% 64%, hsl(189, 99%, 26%) 0px, transparent 85%),
                              radial-gradient(at 41% 94%, hsl(189, 97%, 36%) 0px, transparent 85%),
                              radial-gradient(at 100% 99%, hsl(188, 94%, 13%) 0px, transparent 85%);
            animation: rotate-border 6s linear infinite;
            z-index: 1;
          }
          .search-box-wrap:focus-within {
            box-shadow: 0 0 25px rgba(255, 48, 255, 0.75), 0 0 45px rgba(0, 183, 255, 0.5);
          }
          .search-box {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0 14px;
            box-sizing: border-box;
            background: #1E1E2E;
            border-radius: 28px;
            border: none !important;
          }
          .search-icon {
            width: 21px;
            height: 21px;
            flex-shrink: 0;
            fill: none;
            stroke: #fff;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            transition: 0.3s ease;
          }
          .search-box-wrap:hover .search-icon {
            stroke: rgb(0, 183, 255);
            transform: scale(1.1);
          }
          .search-box input {
            flex: 1;
            min-width: 0;
            height: 36px;
            margin: 0;
            padding: 0;
            border: none !important;
            outline: none !important;
            background: transparent !important;
            color: white !important;
            font-size: 15px;
            font-family: Arial, sans-serif;
            box-shadow: none !important;
          }
          .search-box input::placeholder {
            color: #888;
            opacity: 1;
          }
          .clear-btn {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: none;
            background: transparent;
            color: #888;
            font-size: 22px;
            cursor: pointer;
            transition: 0.2s ease;
          }
          .clear-btn:hover {
            color: white;
            transform: scale(1.15);
          }
          .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .header-icon {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 13px;
            background: #171722;
            cursor: pointer;
            transition: 0.3s ease;
          }
          .header-icon:hover {
            background: #6469f2;
            transform: translateY(-2px);
          }
          .header-icon svg {
            width: 21px;
            height: 21px;
            fill: none;
            stroke: white;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .profile {
            width: 44px;
            height: 44px;
            border: 2px solid rgb(0, 183, 255);
            border-radius: 50%;
            background-color: #171722;
            color: white;
            font-weight: 700;
            cursor: pointer;
            transition: 0.3s ease;
          }
          .profile:hover {
            transform: scale(1.08);
            box-shadow: 0 0 20px rgba(0, 183, 255, 0.6);
          }
          .menu-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.55);
            backdrop-filter: blur(3px);
            z-index: 150;
            animation: fadeIn 0.25s ease;
          }
          .side-menu {
            position: fixed;
            top: 0;
            left: 0;
            width: 320px;
            height: 100vh;
            box-sizing: border-box;
            padding: 24px;
            background: #000000;
            border-right: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 10px 0 40px rgba(0, 0, 0, 0.6);
            transform: translateX(-100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 200;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
          }
          .side-menu.open {
            transform: translateX(0);
          }
          .close-btn {
            width: 42px;
            height: 42px;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.3s ease;
            margin-bottom: 20px;
          }
          .close-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: scale(1.05);
          }
          .close-chevron {
            width: 20px;
            height: 20px;
            fill: none;
            stroke: #ffffff;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .menu-title {
            color: #ffffff;
            font-size: 28px;
            font-weight: 800;
            margin: 0 0 24px 0;
            letter-spacing: -0.5px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            text-align: left;
          }
          .verify-banner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #18181A;
            border-radius: 24px;
            padding: 16px;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.04);
            cursor: pointer;
            transition: transform 0.2s ease, background-color 0.2s ease;
          }
          .verify-banner:hover {
            background: #202022;
            transform: scale(1.02);
          }
          .verify-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .envelope-circle {
            position: relative;
            width: 40px;
            height: 40px;
            background: #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .orange-dot {
            position: absolute;
            top: 0;
            right: 0;
            width: 10px;
            height: 10px;
            background: #FF5A2B;
            border: 2px solid #18181A;
            border-radius: 50%;
          }
          .envelope-icon {
            width: 18px;
            height: 18px;
            fill: none;
            stroke: #000000;
            stroke-width: 2.2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .verify-text {
            display: flex;
            flex-direction: column;
            text-align: left;
          }
          .verify-title {
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            line-height: 1.3;
          }
          .verify-subtitle {
            color: rgba(255, 255, 255, 0.5);
            font-size: 11px;
            font-weight: 500;
          }
          .chevron-icon {
            width: 16px;
            height: 16px;
            fill: none;
            stroke: rgba(255, 255, 255, 0.4);
            stroke-width: 2.2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .nav-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 28px;
          }
          .grid-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: space-between;
            background: #18181A;
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 20px;
            padding: 16px;
            height: 96px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-sizing: border-box;
            text-align: left;
          }
          .grid-card:hover {
            background: #202022;
            transform: translateY(-2px);
          }
          .grid-card.active {
            background-image: radial-gradient(at 41% 94%, hsl(189, 97%, 36%) 0px, transparent 85%);
            background-color: #12b3d6;
            border-color: rgba(255, 255, 255, 0.25);
          }
          .grid-icon {
            width: 22px;
            height: 22px;
            fill: none;
            stroke: rgba(255, 255, 255, 0.75);
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .grid-card.active .grid-icon {
            stroke: #ffffff;
          }
          .grid-card.active span {
            color: #ffffff !important;
          }
          .grid-card span {
            color: rgba(255, 255, 255, 0.85);
            font-size: 13px;
            font-weight: 600;
          }
          .menu-section-header {
            color: rgba(255, 255, 255, 0.35);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            text-align: left;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin-top: 10px;
          }
          .list-items {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-bottom: 24px;
          }
          .list-item {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            height: 48px;
            background: transparent;
            border: none;
            padding: 0 8px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-weight: 600;
            text-align: left;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.2s ease;
          }
          .list-item:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
            transform: translateX(4px);
          }
          .list-icon {
            width: 20px;
            height: 20px;
            fill: none;
            stroke: rgba(255, 255, 255, 0.5);
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            transition: stroke 0.2s ease;
          }
          .list-item:hover .list-icon {
            stroke: #ffffff;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes rotate-border {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @media (max-width: 750px) {
            .header-right { display: none; }
          }
          @media (max-width: 500px) {
            .search-box-wrap { width: 50px; height: 46px; padding: 2px; }
            .search-box-wrap:hover { width: 190px; }
            .search-box input {
              width: 0;
              opacity: 0;
              pointer-events: none;
              transition: width 0.4s ease, opacity 0.3s ease;
            }
            .search-box-wrap:hover input {
              width: 100%;
              opacity: 1;
              pointer-events: auto;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <View style={styles.nativeHeaderContainer}>
      {/* Top Header Bar */}
      <View style={styles.nativeBar}>
        {/* Menu button */}
        <TouchableOpacity style={styles.nativeIconBtn} onPress={() => setMenuOpen(true)}>
          <Menu size={22} color="#FFF" />
        </TouchableOpacity>
        
        {/* Logo */}
        <View style={styles.nativeLogo}>
          <Text style={styles.nativeLogoText}>📚 EduStore</Text>
        </View>

        {/* Right side items */}
        <View style={styles.nativeRight}>
          <TouchableOpacity style={styles.nativeIconBtn}>
            <Menu size={21} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Login')}>
            <LinearGradient
              colors={['rgb(0, 183, 255)', 'rgb(0, 72, 102)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nativeProfileGradient}
            >
              <Text style={styles.nativeProfileText}>AA</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.nativeSearchContainer}>
        <View style={styles.nativeSearchBoxWrapper}>
          {/* Rotating gradient background */}
          <Animated.View style={[styles.nativeRotatingGradient, { transform: [{ rotate: spin }] }]}>
            <LinearGradient
              colors={['rgb(0, 183, 255)', 'rgb(0, 72, 102)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Static search box on top */}
          <View style={styles.nativeSearchBox}>
            <Search size={18} color={isFocused ? "#ffffff" : "rgba(255, 255, 255, 0.4)"} style={styles.nativeSearchIcon} />
            <TextInput
              style={styles.nativeSearchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search anything..."
              placeholderTextColor="rgba(255, 255, 255, 0.35)"
              autoCapitalize="none"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.nativeClearBtn}>
                <X size={18} color="rgba(255, 255, 255, 0.4)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Side Menu Drawer overlay (Fizzie Dribbble Style) */}
      <Modal
        visible={menuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.nativeOverlay}
            activeOpacity={1}
            onPress={() => setMenuOpen(false)}
          />
          <View style={styles.nativeDrawer}>
            {/* Close Chevron Button */}
            <TouchableOpacity style={styles.nativeCloseBtn} onPress={() => setMenuOpen(false)}>
              <ChevronLeft size={22} color="#FFF" />
            </TouchableOpacity>

            {/* Menu Title */}
            <Text style={styles.nativeDrawerTitle}>Main Menu</Text>

            {/* Verification Banner */}
            <TouchableOpacity style={styles.nativeVerifyBanner} activeOpacity={0.9}>
              <View style={styles.nativeVerifyLeft}>
                <View style={styles.nativeEnvelopeCircle}>
                  <View style={styles.nativeOrangeDot} />
                  <Mail size={18} color="#000" />
                </View>
                <View style={styles.nativeVerifyTextContainer}>
                  <Text style={styles.nativeVerifyTitle}>Verify email for</Text>
                  <Text style={styles.nativeVerifySubtitle}>safe transactions</Text>
                </View>
              </View>
              <ChevronRight size={18} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>

            {/* Scrollable lists */}
            <ScrollView style={styles.nativeDrawerScroll} showsVerticalScrollIndicator={false}>
              {/* Navigation Grid (2x2) */}
              <View style={styles.nativeGrid}>
                <TouchableOpacity style={styles.nativeGridCardActiveWrapper} activeOpacity={0.8} onPress={() => { setMenuOpen(false); }}>
                  <LinearGradient
                    colors={['hsl(189, 97%, 36%)', 'rgba(18, 179, 214, 0.25)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.nativeGridCardActiveGradient}
                  >
                    <Home size={22} color="#FFF" />
                    <Text style={styles.nativeGridCardTextActive}>Home</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nativeGridCard}>
                  <PieChart size={22} color="rgba(255, 255, 255, 0.75)" />
                  <Text style={styles.nativeGridCardText}>Statistics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nativeGridCard}>
                  <CreditCard size={22} color="rgba(255, 255, 255, 0.75)" />
                  <Text style={styles.nativeGridCardText}>My Cards</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nativeGridCard}>
                  <Clock size={22} color="rgba(255, 255, 255, 0.75)" />
                  <Text style={styles.nativeGridCardText}>History</Text>
                </TouchableOpacity>
              </View>

              {/* Messages Section */}
              <Text style={styles.nativeSectionHeader}>Messages</Text>
              <TouchableOpacity style={styles.nativeListItem}>
                <Mail size={20} color="rgba(255, 255, 255, 0.5)" style={styles.nativeListIcon} />
                <Text style={styles.nativeListItemText}>Inbox</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nativeListItem}>
                <Bell size={20} color="rgba(255, 255, 255, 0.5)" style={styles.nativeListIcon} />
                <Text style={styles.nativeListItemText}>Notifications</Text>
              </TouchableOpacity>

              {/* Account & Security Section */}
              <Text style={styles.nativeSectionHeader}>Account and Security</Text>
              <TouchableOpacity style={styles.nativeListItem}>
                <User size={20} color="rgba(255, 255, 255, 0.5)" style={styles.nativeListIcon} />
                <Text style={styles.nativeListItemText}>Update Account Data</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nativeListItem}>
                <Globe size={20} color="rgba(255, 255, 255, 0.5)" style={styles.nativeListIcon} />
                <Text style={styles.nativeListItemText}>Language</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nativeListItem}>
                <Key size={20} color="rgba(255, 255, 255, 0.5)" style={styles.nativeListIcon} />
                <Text style={styles.nativeListItemText}>Change Password</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeHeaderContainer: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  nativeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
    paddingHorizontal: 16,
  },
  nativeIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#171722',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nativeLogoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  nativeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nativeProfileGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgb(0, 183, 255)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeProfileText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  nativeSearchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  nativeSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#1E1E2E',
    borderRadius: 22,
    paddingHorizontal: 14,
  },
  nativeSearchIcon: {
    marginRight: 8,
  },
  nativeSearchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    height: '100%',
  },
  nativeClearBtn: {
    padding: 4,
  },
  nativeSearchBoxWrapper: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    padding: 2,
  },
  nativeRotatingGradient: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 999,
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  nativeOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  nativeDrawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 320,
    backgroundColor: '#000000',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    paddingTop: 50,
    flexDirection: 'column',
  },
  nativeCloseBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  nativeDrawerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  nativeVerifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#18181A',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  nativeVerifyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nativeEnvelopeCircle: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeOrangeDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5A2B',
    borderWidth: 2,
    borderColor: '#18181A',
  },
  nativeVerifyTextContainer: {
    flexDirection: 'column',
  },
  nativeVerifyTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  nativeVerifySubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '500',
  },
  nativeDrawerScroll: {
    flex: 1,
  },
  nativeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  nativeGridCard: {
    width: '47%',
    height: 96,
    backgroundColor: '#18181A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nativeGridCardActiveWrapper: {
    width: '47%',
    height: 96,
    borderRadius: 20,
    overflow: 'hidden',
  },
  nativeGridCardActiveGradient: {
    width: '100%',
    height: '100%',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nativeGridCardTextActive: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  nativeGridCardText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  nativeSectionHeader: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 10,
  },
  nativeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  nativeListIcon: {
    marginRight: 12,
  },
  nativeListItemText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Header;