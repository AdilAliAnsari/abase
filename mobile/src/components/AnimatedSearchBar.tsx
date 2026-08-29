import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Search as SearchIcon, X as XIcon } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface AnimatedSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const AnimatedSearchBar: React.FC<AnimatedSearchBarProps> = ({ value, onChangeText }) => {
  const [isFocused, setIsFocused] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <div className="search-box-container" style={{ paddingLeft: 20, paddingRight: 20, marginBottom: 20, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .search-box-container {
                box-sizing: border-box;
              }
              .search-box {
                position: relative;
                display: flex;
                align-items: center;
                width: 100%;
                max-width: 480px;
                height: 48px;
                background: #1A1A24;
                border: 1px solid #1616a6ff;
                border-radius: 12px;
                padding: 0 16px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-sizing: border-box;
              }
              .search-box:focus-within {
                background: #1F1F2C;
                border-color: rgba(139, 92, 246, 0.6);
                box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
                transform: translateY(-1px);
              }
              .search-icon {
                width: 18px;
                height: 18px;
                fill: none;
                stroke: rgba(255, 255, 255, 0.4);
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
                margin-right: 12px;
                transition: stroke 0.3s ease;
              }
              .search-box:focus-within .search-icon {
                stroke: #8B5CF6;
              }
              .search-input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                color: #FFFFFF;
                font-size: 15px;
                font-weight: 500;
                width: 100%;
              }
              .search-input::placeholder {
                color: rgba(255, 255, 255, 0.35);
              }
              .clear-btn {
                background: transparent;
                border: none;
                outline: none;
                color: rgba(255, 255, 255, 0.4);
                font-size: 20px;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s ease;
              }
              .clear-btn:hover {
                color: #FFFFFF;
              }
            `,
          }}
        />
        <div className="search-box">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="22" y2="22" />
          </svg>
          <input
            type="text"
            className="search-input"
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="Search anything..."
            aria-label="Search"
          />
          {value && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => onChangeText('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.searchBox, isFocused && styles.searchBoxFocused]}>
        <SearchIcon size={18} color={isFocused ? colors.accent.purple : 'rgba(255, 255, 255, 0.4)'} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search anything..."
          placeholderTextColor="rgba(255, 255, 255, 0.35)"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn}>
            <XIcon size={18} color="rgba(255, 255, 255, 0.4)" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    height: 48,
    backgroundColor: '#1A1A24',
    borderWidth: 1,
    borderColor: '#2A2A38',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchBoxFocused: {
    backgroundColor: '#1F1F2C',
    borderColor: 'rgba(139, 92, 246, 0.6)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
});
