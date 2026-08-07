import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { ShoppingBag, Star } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { Book } from '../data/books';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'featured' | 'horizontal';
  onPress?: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, variant = 'default', onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-200)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.8)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const imageTranslateY = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;

  const accentColor = colors.accent[book.accent] || colors.accent.orange;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, friction: 8 }),
      Animated.spring(translateY, { toValue: -5, useNativeDriver: true, friction: 8 }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
    ]).start();
  };

  const startShineAnimation = () => {
    shineAnim.setValue(-200);
    Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 400,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const handleHoverIn = () => {
    Animated.parallel([
      Animated.timing(glowOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(badgeOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(imageTranslateY, { toValue: -5, useNativeDriver: true, friction: 8 }),
      Animated.spring(imageScale, { toValue: 1.03, useNativeDriver: true, friction: 8 }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();
    startShineAnimation();
  };

  const handleHoverOut = () => {
    Animated.parallel([
      Animated.timing(glowOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.spring(badgeScale, { toValue: 0.8, useNativeDriver: true, friction: 6 }),
      Animated.timing(badgeOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.spring(imageTranslateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
      Animated.spring(imageScale, { toValue: 1, useNativeDriver: true, friction: 8 }),
      Animated.spring(buttonScale, { toValue: 0.9, useNativeDriver: true, friction: 6 }),
    ]).start();
    shineAnim.setValue(-200);
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress?.(book)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.featuredCard, { transform: [{ scale: scaleAnim }, { translateY: translateY }] }]}>
          <Animated.View style={[styles.cardGlow, { opacity: glowOpacity, backgroundColor: `${accentColor}30` }]} />
          <Animated.View style={[styles.cardShine, { transform: [{ translateX: shineAnim }] }]} />
          {book.badge && (
            <Animated.View style={[styles.badge, { backgroundColor: accentColor, opacity: badgeOpacity, transform: [{ scale: badgeScale }] }]}>
              <Text style={styles.badgeText}>{book.badge}</Text>
            </Animated.View>
          )}
          <Animated.View style={[styles.featuredImageContainer, { borderColor: accentColor, transform: [{ translateY: imageTranslateY }, { scale: imageScale }] }]}>
            <Image source={{ uri: book.coverImage }} style={styles.featuredImage} />
            <View style={[styles.imageOverlay, { backgroundColor: `${accentColor}15` }]} />
          </Animated.View>
          <View style={styles.cardContent}>
            <Text style={styles.featuredTitle} numberOfLines={2}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: accentColor }]}>${book.price}</Text>
              {book.originalPrice && <Text style={styles.originalPrice}>${book.originalPrice}</Text>}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress?.(book)} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.horizontalCard, { transform: [{ scale: scaleAnim }, { translateX: translateY }] }]}>
          <Animated.View style={[styles.hCardGlow, { opacity: glowOpacity, backgroundColor: `${accentColor}20` }]} />
          <Animated.View style={[styles.cardShine, { transform: [{ translateX: shineAnim }] }]} />
          <View style={[styles.hImageContainer, { borderLeftColor: accentColor }]}>
            <Image source={{ uri: book.coverImage }} style={styles.hImage} />
          </View>
          <View style={styles.hInfo}>
            <View>
              <Text style={styles.hTitle} numberOfLines={2}>{book.title}</Text>
              <Text style={styles.author}>{book.author}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Star size={14} color={colors.accent.orange} fill={colors.accent.orange} />
              <Text style={styles.ratingText}>{book.rating}</Text>
              <Text style={styles.reviewsText}>({book.reviews.toLocaleString()})</Text>
            </View>
            <View style={styles.hFooter}>
              <Text style={[styles.price, { color: accentColor }]}>${book.price}</Text>
              <Animated.View style={[styles.hAddButton, { backgroundColor: `${accentColor}30`, borderColor: `${accentColor}50`, transform: [{ scale: buttonScale }] }]}>
                <ShoppingBag size={16} color={accentColor} />
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress?.(book)} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.card, { width: CARD_WIDTH, transform: [{ scale: scaleAnim }, { translateY: translateY }] }]}>
        <Animated.View style={[styles.cardGlow, { opacity: glowOpacity, backgroundColor: `${accentColor}30` }]} />
        <Animated.View style={[styles.cardShine, { transform: [{ translateX: shineAnim }] }]} />
        {book.badge && (
          <Animated.View style={[styles.badge, { backgroundColor: accentColor, opacity: badgeOpacity, transform: [{ scale: badgeScale }] }]}>
            <Text style={styles.badgeText}>{book.badge}</Text>
          </Animated.View>
        )}
        <Animated.View style={[styles.imageContainer, { borderColor: accentColor, transform: [{ translateY: imageTranslateY }, { scale: imageScale }] }]}>
          <Image source={{ uri: book.coverImage }} style={styles.image} />
          <View style={[styles.imageOverlay, { backgroundColor: `${accentColor}10` }]} />
        </Animated.View>
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
          <View style={styles.footer}>
            <Text style={[styles.price, { color: accentColor }]}>${book.price}</Text>
            <Animated.View style={[styles.addButton, { backgroundColor: `${accentColor}25`, borderColor: `${accentColor}40`, transform: [{ scale: buttonScale }] }]}>
              <ShoppingBag size={14} color={accentColor} />
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 20, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, overflow: 'hidden', marginRight: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 32, elevation: 10 },
  featuredCard: { width: CARD_WIDTH * 1.3, borderRadius: 20, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, overflow: 'hidden', marginRight: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 32, elevation: 10 },
  horizontalCard: { flexDirection: 'row', borderRadius: 20, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, padding: 14, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 32, elevation: 10 },
  cardGlow: { position: 'absolute', top: -20, left: -20, right: -20, height: '60%', borderRadius: 20, zIndex: 0 },
  hCardGlow: { position: 'absolute', inset: 0, borderRadius: 20, zIndex: 0 },
  cardShine: { position: 'absolute', top: 0, left: 0, width: 100, height: '200%', backgroundColor: 'rgba(255,255,255,0.08)', transform: [{ skewX: '-20deg' }], zIndex: 1 },
  badge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, zIndex: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  imageContainer: { width: '100%', aspectRatio: 2 / 3, borderRadius: 16, borderWidth: 2, overflow: 'hidden', marginBottom: 14, position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 32, elevation: 8 },
  featuredImageContainer: { width: '100%', aspectRatio: 3 / 4, borderRadius: 20, borderWidth: 3, overflow: 'hidden', marginBottom: 16, position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 32, elevation: 8 },
  image: { width: '100%', height: '100%' },
  featuredImage: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', inset: 0 },
  cardContent: { paddingHorizontal: 4 },
  title: { color: colors.text.primary, fontSize: 14, fontWeight: '700', marginBottom: 4, lineHeight: 20 },
  featuredTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '800', marginBottom: 6, lineHeight: 24 },
  author: { color: colors.text.secondary, fontSize: 12, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 17, fontWeight: '800', textShadowColor: 'currentColor', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  originalPrice: { color: colors.text.muted, fontSize: 14, textDecorationLine: 'line-through', marginLeft: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  addButton: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  hImageContainer: { width: 75, height: 110, borderRadius: 12, overflow: 'hidden', borderLeftWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 6 },
  hImage: { width: '100%', height: '100%' },
  hInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  hTitle: { color: colors.text.primary, fontSize: 15, fontWeight: '700', lineHeight: 22 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  ratingText: { color: colors.text.primary, fontSize: 13, fontWeight: '700' },
  reviewsText: { color: colors.text.muted, fontSize: 12 },
  hFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8 },
  hAddButton: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
});

export default BookCard;