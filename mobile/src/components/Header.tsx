import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Platform, Modal, Animated, Image } from 'react-native';
import { Menu, X, Home, PieChart, CreditCard, Clock, Mail, Bell, User, Globe, Key, ChevronLeft, ChevronRight, Search, ShoppingCart, ShieldCheck, Database, Tag, Volume2 } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const { user, isAuthenticated, logout, setRole } = useAuth();
  const { t } = useTranslation();
  const isDistributor = user?.role === 'distributor';
  const [menuOpen, setMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigation = useNavigation<any>();
  const { totalCount } = useCart();
  const { isBlindModeEnabled, toggleBlindMode } = useAccessibility();

  const getInitials = () => {
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'AA';
  };

  const rawAvatar =
    user?.profileImage ||
    (user as any)?.avatar ||
    (user as any)?.avatarUrl ||
    (user as any)?.imageUrl ||
    (user as any)?.picture ||
    (user as any)?.photoURL;

  // Filter out Clerk's default auto-generated initial SVGs (e.g. lime green circle with "AA")
  // and generic dicebear avatars so the app cleanly uses the sleek monochrome white initial avatar badge!
  const isPlaceholderAvatar = (url?: string) => {
    if (!url || typeof url !== 'string') return true;
    const trimmed = url.trim();
    if (!trimmed) return true;
    if (trimmed.includes('img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdC')) return true;
    if (trimmed.includes('api.dicebear.com')) return true;
    return false;
  };

  const userAvatar = isPlaceholderAvatar(rawAvatar) ? '' : rawAvatar;

  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [userAvatar]);

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
                style={{ width: 21, height: 21, fill: 'none', stroke: isFocused ? '#FFFFFF' : '#fff', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}
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
            <button
              className="header-icon cart-header-btn"
              type="button"
              onClick={() => navigation.navigate('Cart')}
              aria-label="Shopping Cart"
            >
              <svg viewBox="0 0 24 24">
                <path d="M3 4h2l2.5 11h10l3-8H6" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="17" cy="19" r="1.5" />
              </svg>
              {totalCount > 0 && (
                <span className="cart-badge-count">{totalCount > 99 ? '99+' : totalCount}</span>
              )}
            </button>
            {/* PROFILE */}
            <button
              className="profile"
              type="button"
              onClick={() => navigation.navigate(isAuthenticated ? 'AccountData' : 'Login')}
              title={user ? `${user.name || user.username} (${user.email})` : 'Sign In'}
            >
              {userAvatar && !avatarError ? (
                <img
                  src={userAvatar}
                  alt={user?.name || user?.username || 'Profile'}
                  className="profile-img"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                getInitials()
              )}
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
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Menu Title */}
          <h2 className="menu-title">{t.mainMenu || 'Main Menu'}</h2>

          {/* Active Account Identity Card */}
          <div className="active-user-card">
            {userAvatar && !avatarError ? (
              <img
                src={userAvatar}
                alt={user ? (user.name || user.username) : 'User'}
                className="active-user-avatar-img"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="active-user-avatar">{getInitials()}</div>
            )}
            <div className="active-user-info">
              <div className="active-user-name">
                {user ? (user.name || user.username) : 'Guest User'}
              </div>
              <div className="active-user-email">
                {user ? user.email : 'Not signed in'}
              </div>
              {user && (
                <div className="active-user-badge">
                  <span
                    className="active-badge-dot"
                    style={{ backgroundColor: '#FFFFFF' }}
                  />
                  {isDistributor ? 'Distributor ID Active' : 'Consumer Account'} • {user.provider ? (user.provider.charAt(0).toUpperCase() + user.provider.slice(1)) : 'Active'}
                </div>
              )}
            </div>
          </div>
          <div className="active-user-actions">
            {user ? (
              <>
                <button
                  type="button"
                  className="active-action-btn switch-btn"
                  onClick={async () => {
                    const nextRole = isDistributor ? 'consumer' : 'distributor';
                    await setRole(nextRole);
                  }}
                  title="Toggle Distributor / Consumer mode for this ID"
                >
                  {isDistributor ? (t.actAsConsumer || 'Act as Consumer') : (t.actAsDistributor || 'Act as Distributor')}
                </button>
                <button
                  type="button"
                  className="active-action-btn logout-btn"
                  onClick={async () => {
                    await logout();
                    setMenuOpen(false);
                    navigation.navigate('Login');
                  }}
                >
                  {t.signOut || 'Sign Out'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="active-action-btn login-btn"
                onClick={() => { setMenuOpen(false); navigation.navigate('Login'); }}
              >
                {t.signIn || 'Sign In / Choose ID'}
              </button>
            )}
          </div>

          {/* Verification Banner */}
          <div
            className="verify-banner"
            onClick={() => { setMenuOpen(false); navigation.navigate('VerifyEmail'); }}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            <div className="verify-left">
              <div className="envelope-circle">
                <span className="orange-dot"></span>
                <svg className="envelope-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: '#000000', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 18, height: 18 }}>
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className="verify-text">
                <div className="verify-title">Verify email for</div>
                <div className="verify-subtitle">safe transactions</div>
              </div>
            </div>
            <div className="verify-right">
              <svg className="chevron-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.4)', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 16, height: 16 }}>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>

          {/* Grid Cards (2x2) */}
          <div className="nav-grid">
            <button
              className="grid-card active"
              onClick={() => { setMenuOpen(false); navigation.navigate('MainTabs', { screen: 'HomeTab' }); }}
            >
              <svg className="grid-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: '#ffffff', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 22, height: 22 }}>
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
              <span>{t.home || 'Home'}</span>
            </button>
            <button
              className="grid-card"
              onClick={() => { setMenuOpen(false); navigation.navigate('Statistics'); }}
            >
              <svg className="grid-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.75)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 22, height: 22 }}>
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
              <span>{t.statistics || 'Statistics'}</span>
            </button>
            <button
              className="grid-card"
              onClick={() => { setMenuOpen(false); navigation.navigate('MyCards'); }}
            >
              <svg className="grid-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.75)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 22, height: 22 }}>
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
              <span>{t.myCards || 'My Cards'}</span>
            </button>
            <button
              className="grid-card"
              onClick={() => { setMenuOpen(false); navigation.navigate('PurchaseHistory'); }}
            >
              <svg className="grid-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.75)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 22, height: 22 }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{t.history || 'History'}</span>
            </button>
          </div>

          {/* DISTRIBUTOR PORTAL & DATABASE SECTION (Hidden for regular consumers, shown ONLY for distributor ID) */}
          {isDistributor && (
            <>
              <div className="menu-section-header" style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🛡️</span>
                <span>{t.distributorPortal || 'Distributor Hub'}</span>
              </div>
              <div className="list-items">
                <button
                  className="list-item distributor-hub-btn"
                  onClick={() => { setMenuOpen(false); navigation.navigate('Distributor'); }}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                >
                  <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: '#FFFFFF', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    {t.tagEditor || 'Tag & Price Manager (Max ₹1000)'}
                  </span>
                </button>
                <button
                  className="list-item distributor-db-btn"
                  onClick={() => { setMenuOpen(false); navigation.navigate('Distributor'); }}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                >
                  <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: '#FFFFFF', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    {t.database || 'Consumer & Distributor DB'}
                  </span>
                </button>
              </div>
            </>
          )}

          {/* Store Section */}
          <div className="menu-section-header">{t.store || 'Store'}</div>
          <div className="list-items">
            <button
              className="list-item"
              onClick={() => { setMenuOpen(false); navigation.navigate('Cart'); }}
            >
              <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: '#FFFFFF', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                <path d="M3 4h2l2.5 11h10l3-8H6" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="17" cy="19" r="1.5" />
              </svg>
              <span>{t.myCart || 'My Cart'} {totalCount > 0 ? `(${totalCount})` : ''}</span>
            </button>
          </div>

          {/* Messages Section */}
          <div className="menu-section-header">{t.messages || 'Messages'}</div>
          <div className="list-items">
            <button
              className="list-item"
              onClick={() => { setMenuOpen(false); navigation.navigate('Inbox'); }}
            >
              <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>{t.inbox || 'Inbox'}</span>
            </button>
            <button
              className="list-item"
              onClick={() => { setMenuOpen(false); navigation.navigate('Notifications'); }}
            >
              <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>{t.notifications || 'Notifications'}</span>
            </button>
          </div>

          {/* Account & Security Section */}
          <div className="menu-section-header">{t.accountAndSecurity || 'Account and Security'}</div>
          <div className="list-items">
            <button
              className="list-item"
              onClick={() => { setMenuOpen(false); navigation.navigate('AccountData'); }}
            >
              <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{t.updateAccountData || 'Update Account Data'}</span>
            </button>
            <button
              className="list-item"
              onClick={() => { setMenuOpen(false); navigation.navigate('Language'); }}
            >
              <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>{t.language || 'Language'}</span>
            </button>
            <button
              className="list-item"
              onClick={() => { setMenuOpen(false); navigation.navigate('ChangePassword'); }}
            >
              <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                <path d="m21 2-2 2" />
                <circle cx="7.5" cy="16.5" r="5.5" />
                <path d="m11.4 12.6 7-7" />
                <path d="M16 8.5H19V5.5" />
              </svg>
              <span>{t.changePassword || 'Change Password'}</span>
            </button>
          </div>

          {/* Accessibility & Voice Assistance Section */}
          <div className="menu-section-header">Accessibility & Voice Assist</div>
          <div className="list-items">
            <button
              className="list-item"
              onClick={() => { toggleBlindMode(); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg className="list-icon" viewBox="0 0 24 24" style={{ fill: 'none', stroke: isBlindModeEnabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', width: 20, height: 20 }}>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                <span>Text-to-Speech (Blind Mode)</span>
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 800,
                  backgroundColor: isBlindModeEnabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
                  color: isBlindModeEnabled ? '#000000' : '#8D8D94',
                }}
              >
                {isBlindModeEnabled ? 'ON' : 'OFF'}
              </span>
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
            stroke: #FFFFFF;
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
            position: relative;
          }
          .cart-badge-count {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #FFFFFF;
            color: #000000;
            font-size: 11px;
            font-weight: 800;
            min-width: 18px;
            height: 18px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
            box-shadow: 0 2px 8px rgba(255, 255, 255, 0.4);
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
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            background-color: #171722;
            color: white;
            font-weight: 700;
            cursor: pointer;
            transition: 0.3s ease;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
          }
          .profile:hover {
            transform: scale(1.08);
            box-shadow: 0 0 20px rgba(0, 183, 255, 0.6);
          }
          .profile-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
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
            margin: 0 0 16px 0;
            letter-spacing: -0.5px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            text-align: left;
          }
          .active-user-card {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 12px;
            margin-bottom: 10px;
          }
          .active-user-avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FFFFFF, #D1D5DB);
            color: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            font-weight: 800;
            flex-shrink: 0;
          }
          .active-user-avatar-img {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #FFFFFF;
            flex-shrink: 0;
          }
          .active-user-info {
            flex: 1;
            min-width: 0;
            text-align: left;
          }
          .active-user-name {
            color: #FFFFFF;
            font-size: 14px;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .active-user-email {
            color: #8D8D94;
            font-size: 11px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 2px;
          }
          .active-user-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: #FFFFFF;
            font-size: 10px;
            font-weight: 700;
            margin-top: 4px;
          }
          .active-badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #FFFFFF;
            box-shadow: 0 0 6px #FFFFFF;
          }
          .active-user-actions {
            display: flex;
            gap: 8px;
            margin-bottom: 18px;
          }
          .active-action-btn {
            flex: 1;
            height: 32px;
            border-radius: 16px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
          }
          .active-action-btn.switch-btn {
            background: rgba(255, 255, 255, 0.1);
            color: #FFFFFF;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
          .active-action-btn.switch-btn:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          .active-action-btn.logout-btn {
            background: rgba(255, 69, 58, 0.12);
            color: #FF453A;
            border: 1px solid rgba(255, 69, 58, 0.3);
          }
          .active-action-btn.logout-btn:hover {
            background: rgba(255, 69, 58, 0.25);
          }
          .active-action-btn.login-btn {
            background: #FFFFFF;
            color: #000000;
            border: 1px solid #FFFFFF;
            height: 36px;
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
            background: #FFFFFF;
            border: 2px solid #18181A;
            border-radius: 50%;
            box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
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
            background-color: #FFFFFF;
            border-color: #FFFFFF;
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
            stroke: #000000 !important;
          }
          .grid-card.active span {
            color: #000000 !important;
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
          <TouchableOpacity
            style={styles.nativeCartBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Cart')}
          >
            <ShoppingCart size={21} color="#FFF" />
            {totalCount > 0 && (
              <View style={styles.nativeBadge}>
                <Text style={styles.nativeBadgeText}>{totalCount > 99 ? '99+' : totalCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate(isAuthenticated ? 'AccountData' : 'Login')}
          >
            {userAvatar && !avatarError ? (
              <Image
                source={{ uri: userAvatar }}
                style={styles.nativeProfileImg}
                resizeMode="cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.nativeProfileGradient}>
                <Text style={styles.nativeProfileText}>{getInitials()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.nativeSearchContainer}>
        <View style={styles.nativeSearchBoxWrapper}>
          {/* Subtle rotating halo border */}
          <Animated.View style={[styles.nativeRotatingGradient, { transform: [{ rotate: spin }] }]}>
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 24,
                  borderWidth: 1.5,
                  borderColor: 'rgba(255, 255, 255, 0.35)',
                },
              ]}
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
            <Text style={styles.nativeDrawerTitle}>{t.mainMenu || 'Main Menu'}</Text>

            {/* Native Active User Card */}
            <View style={styles.nativeUserCard}>
              {userAvatar && !avatarError ? (
                <Image
                  source={{ uri: userAvatar }}
                  style={styles.nativeUserAvatarImg}
                  resizeMode="cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <View style={styles.nativeUserAvatar}>
                  <Text style={styles.nativeUserAvatarText}>{getInitials()}</Text>
                </View>
              )}
              <View style={styles.nativeUserInfo}>
                <Text style={styles.nativeUserName} numberOfLines={1}>
                  {user ? (user.name || user.username) : 'Guest User'}
                </Text>
                <Text style={styles.nativeUserEmail} numberOfLines={1}>
                  {user ? user.email : 'Not signed in'}
                </Text>
                {user && (
                  <View style={styles.nativeUserBadgeRow}>
                    <View
                      style={[
                        styles.nativeBadgeDot,
                        { backgroundColor: '#FFFFFF' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.nativeUserBadgeText,
                        { color: '#FFFFFF' },
                      ]}
                    >
                      {isDistributor ? 'Distributor ID Active' : 'Consumer Account'} • {user.provider ? (user.provider.charAt(0).toUpperCase() + user.provider.slice(1)) : 'Active'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.nativeUserActionsRow}>
              {user ? (
                <>
                  <TouchableOpacity
                    style={styles.nativeSwitchBtn}
                    onPress={async () => {
                      const nextRole = isDistributor ? 'consumer' : 'distributor';
                      await setRole(nextRole);
                    }}
                  >
                    <Text style={styles.nativeSwitchBtnText}>
                      {isDistributor ? (t.actAsConsumer || 'Act as Consumer') : (t.actAsDistributor || 'Act as Distributor')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nativeLogoutBtn}
                    onPress={async () => {
                      await logout();
                      setMenuOpen(false);
                      navigation.navigate('Login');
                    }}
                  >
                    <Text style={styles.nativeLogoutBtnText}>{t.signOut || 'Sign Out'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.nativeLoginBtn}
                  onPress={() => { setMenuOpen(false); navigation.navigate('Login'); }}
                >
                  <Text style={styles.nativeLoginBtnText}>{t.signIn || 'Sign In / Choose ID'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verification Banner */}
            <TouchableOpacity
              style={styles.nativeVerifyBanner}
              activeOpacity={0.8}
              onPress={() => {
                setMenuOpen(false);
                navigation.navigate('VerifyEmail');
              }}
            >
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
                <TouchableOpacity
                  style={styles.nativeGridCardActiveWrapper}
                  activeOpacity={0.8}
                  onPress={() => {
                    setMenuOpen(false);
                    navigation.navigate('MainTabs', { screen: 'HomeTab' });
                  }}
                >
                  <View style={styles.nativeGridCardActiveGradient}>
                    <Home size={22} color="#000000" />
                    <Text style={styles.nativeGridCardTextActive}>{t.home || 'Home'}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nativeGridCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    setMenuOpen(false);
                    navigation.navigate('Statistics');
                  }}
                >
                  <PieChart size={22} color="rgba(255, 255, 255, 0.75)" />
                  <Text style={styles.nativeGridCardText}>{t.statistics || 'Statistics'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nativeGridCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    setMenuOpen(false);
                    navigation.navigate('MyCards');
                  }}
                >
                  <CreditCard size={22} color="rgba(255, 255, 255, 0.75)" />
                  <Text style={styles.nativeGridCardText}>{t.myCards || 'My Cards'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nativeGridCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    setMenuOpen(false);
                    navigation.navigate('PurchaseHistory');
                  }}
                >
                  <Clock size={22} color="rgba(255, 255, 255, 0.75)" />
                  <Text style={styles.nativeGridCardText}>{t.history || 'History'}</Text>
                </TouchableOpacity>
              </View>

              {/* DISTRIBUTOR PORTAL & DATABASE SECTION (Hidden for regular consumers) */}
              {isDistributor && (
                <>
                  <Text style={[styles.nativeSectionHeader, { color: '#FFFFFF' }]}>
                    🛡️ {t.distributorPortal || 'Distributor Hub'}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.nativeListItem,
                      {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setMenuOpen(false);
                      navigation.navigate('Distributor');
                    }}
                  >
                    <Tag size={20} color="#FFFFFF" style={styles.nativeListIcon} />
                    <Text style={[styles.nativeListItemText, { color: '#FFFFFF', fontWeight: '700' }]}>
                      {t.tagEditor || 'Tag & Price Manager (Max ₹1000)'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.nativeListItem,
                      {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        marginTop: 6,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setMenuOpen(false);
                      navigation.navigate('Distributor');
                    }}
                  >
                    <Database size={20} color="#FFFFFF" style={styles.nativeListIcon} />
                    <Text style={[styles.nativeListItemText, { color: '#FFFFFF', fontWeight: '700' }]}>
                      {t.database || 'Consumer & Distributor DB'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Store Section */}
              <Text style={styles.nativeSectionHeader}>{t.store || 'Store'}</Text>
              <TouchableOpacity
                style={styles.nativeListItem}
                activeOpacity={0.8}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('Cart');
                }}
              >
                <ShoppingCart size={20} color="#FFFFFF" style={styles.nativeListIcon} />
                <Text style={styles.nativeListItemText}>
                  {t.myCart || 'My Cart'} {totalCount > 0 ? `(${totalCount})` : ''}
                </Text>
              </TouchableOpacity>

              {/* Messages Section */}
              <Text style={styles.nativeSectionHeader}>{t.messages || 'Messages'}</Text>
              <TouchableOpacity
                style={styles.nativeListItem}
                activeOpacity={0.8}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('Inbox');
                }}
              >
                <Mail size={20} color="rgba(255, 255, 255, 0.5)" style={styles.nativeListIcon} />
                <Text style={styles.nativeListItemText}>{t.inbox || 'Inbox'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nativeListItem}
                activeOpacity={0.8}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('Notifications');
                }}
              >
                <Bell size={20} color="rgba(255, 255, 255, 0.5)" style={styles.nativeListIcon} />
                <Text style={styles.nativeListItemText}>{t.notifications || 'Notifications'}</Text>
              </TouchableOpacity>

              {/* Account & Security Section */}
              <Text style={styles.nativeSectionHeader}>{t.accountAndSecurity || 'Account and Security'}</Text>
              <TouchableOpacity
                style={styles.nativeListItem}
                activeOpacity={0.8}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('AccountData');
                }}
              >
                <User size={20} color="rgba(255, 255, 255, 0.5)" style={styles.nativeListIcon} />
                <Text style={styles.nativeListItemText}>{t.updateAccountData || 'Update Account Data'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nativeListItem}
                activeOpacity={0.8}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('Language');
                }}
              >
                <Globe size={20} color="rgba(255, 255, 255, 0.5)" style={styles.nativeListIcon} />
                <Text style={styles.nativeListItemText}>{t.language || 'Language'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nativeListItem}
                activeOpacity={0.8}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('ChangePassword');
                }}
              >
                <Key size={20} color="rgba(255, 255, 255, 0.5)" style={styles.nativeListIcon} />
                <Text style={styles.nativeListItemText}>{t.changePassword || 'Change Password'}</Text>
              </TouchableOpacity>

              {/* Accessibility & Voice Assistance Section */}
              <Text style={styles.nativeSectionHeader}>Accessibility & Voice Assist</Text>
              <TouchableOpacity
                style={[styles.nativeListItem, { justifyContent: 'space-between' }]}
                activeOpacity={0.8}
                onPress={() => {
                  toggleBlindMode();
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                  <Volume2
                    size={20}
                    color={isBlindModeEnabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
                    style={styles.nativeListIcon}
                  />
                  <Text style={styles.nativeListItemText}>Text-to-Speech (Blind Mode)</Text>
                </View>
                <View
                  style={{
                    backgroundColor: isBlindModeEnabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: isBlindModeEnabled ? '#000000' : '#8D8D94',
                      fontSize: 11,
                      fontWeight: '800',
                    }}
                  >
                    {isBlindModeEnabled ? 'ON' : 'OFF'}
                  </Text>
                </View>
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
  nativeCartBtn: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#171722',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  nativeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0A0A0E',
  },
  nativeBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
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
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeProfileImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#1E1E2E',
  },
  nativeProfileText: {
    color: '#000000',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
  },
  nativeGridCardTextActive: {
    color: '#000000',
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
  nativeUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161922',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  nativeUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  nativeUserAvatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginRight: 10,
    backgroundColor: '#161922',
  },
  nativeUserAvatarText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  nativeUserInfo: {
    flex: 1,
  },
  nativeUserName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  nativeUserEmail: {
    color: '#8D8D94',
    fontSize: 11,
    marginTop: 1,
  },
  nativeUserBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  nativeBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  nativeUserBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  nativeUserActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  nativeSwitchBtn: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeSwitchBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  nativeLogoutBtn: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeLogoutBtnText: {
    color: '#FF453A',
    fontSize: 11,
    fontWeight: '700',
  },
  nativeLoginBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeLoginBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
});

export default Header;