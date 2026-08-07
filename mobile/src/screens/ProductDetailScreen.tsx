import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Animated, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, Share2, Star, ShoppingBag, Minus, Plus, BookOpen, Globe, Building2, FileText } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { Book } from '../data/books';

interface ProductDetailScreenProps {
  route: any;
  navigation: any;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ route, navigation }) => {
  const { book } = (route.params || {}) as { book: Book };
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const slideAnim = useRef(new Animated.Value(800)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const coverScale = useRef(new Animated.Value(0.8)).current;

  const accentColor = colors.accent[book.accent] || colors.accent.orange;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(coverScale, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out "${book.title}" by ${book.author} on Bookstore!` });
    } catch (error) { console.log(error); }
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const totalPrice = (book.price * quantity).toFixed(2);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['rgba(10,10,15,0.95)', colors.background]} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Details</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
          <Share2 size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.coverWrap}>
            <View style={[styles.coverGlow, { backgroundColor: `${accentColor}20` }]} />
            <Animated.View style={{ transform: [{ scale: coverScale }] }}>
              <Image source={{ uri: book.coverImage }} style={styles.cover} />
            </Animated.View>
            {book.badge && (
              <View style={[styles.badge, { backgroundColor: accentColor }]}>
                <Text style={styles.badgeText}>{book.badge}</Text>
              </View>
            )}
            <TouchableOpacity style={[styles.likeButton, liked && styles.likeButtonActive]} onPress={() => setLiked(!liked)}>
              <Heart size={18} color={liked ? '#ff4757' : colors.text.primary} fill={liked ? '#ff4757' : 'transparent'} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>by {book.author}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={16} color={star <= Math.floor(book.rating) ? colors.accent.orange : colors.text.muted} fill={star <= Math.floor(book.rating) ? colors.accent.orange : 'transparent'} />
              ))}
            </View>
            <Text style={styles.ratingText}>{book.rating}</Text>
            <Text style={styles.reviews}>({book.reviews.toLocaleString()} reviews)</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: accentColor }]}>${book.price}</Text>
            {book.originalPrice && <Text style={styles.originalPrice}>${book.originalPrice}</Text>}
            {book.originalPrice && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}% OFF</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <FileText size={16} color={colors.text.muted} />
                <Text style={styles.infoLabel}>Pages</Text>
                <Text style={styles.infoValue}>{book.pages}</Text>
              </View>
              <View style={styles.infoItem}>
                <Globe size={16} color={colors.text.muted} />
                <Text style={styles.infoLabel}>Language</Text>
                <Text style={styles.infoValue}>{book.language}</Text>
              </View>
              <View style={styles.infoItem}>
                <Building2 size={16} color={colors.text.muted} />
                <Text style={styles.infoLabel}>Publisher</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{book.publisher}</Text>
              </View>
              <View style={styles.infoItem}>
                <BookOpen size={16} color={colors.text.muted} />
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{book.category}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>

      <View style={styles.bottomBar}>
        <View style={styles.quantityWrap}>
          <TouchableOpacity style={styles.quantityBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Minus size={16} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityBtn} onPress={() => setQuantity(quantity + 1)}>
            <Plus size={16} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.addToCartBtn, { backgroundColor: addedToCart ? colors.success : accentColor }]} onPress={handleAddToCart} activeOpacity={0.8}>
          <ShoppingBag size={20} color="#FFF" />
          <Text style={styles.addToCartText}>{addedToCart ? 'Added!' : 'Add to Cart'}</Text>
          <Text style={styles.addToCartPrice}>${totalPrice}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12, zIndex: 10 },
  iconButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  headerTitle: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  coverWrap: { alignSelf: 'center', marginTop: 10, marginBottom: 24, position: 'relative' },
  coverGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: 20, left: '50%', marginLeft: -100, opacity: 0.8 },
  cover: { width: 180, height: 270, borderRadius: 16, borderWidth: 2, borderColor: colors.glassBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 15 },
  badge: { position: 'absolute', top: 12, right: -8, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, zIndex: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  likeButton: { position: 'absolute', bottom: 12, right: -8, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  likeButtonActive: { backgroundColor: 'rgba(255, 71, 87, 0.2)', borderColor: 'rgba(255, 71, 87, 0.4)' },
  title: { color: colors.text.primary, fontSize: 24, fontWeight: '800', letterSpacing: -0.5, lineHeight: 30, marginBottom: 6 },
  author: { color: colors.text.secondary, fontSize: 15, fontWeight: '500', marginBottom: 16 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  starsRow: { flexDirection: 'row', gap: 3 },
  ratingText: { color: colors.text.primary, fontSize: 15, fontWeight: '700' },
  reviews: { color: colors.text.muted, fontSize: 13 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  price: { fontSize: 28, fontWeight: '900', textShadowColor: 'currentColor', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  originalPrice: { color: colors.text.muted, fontSize: 18, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: 'rgba(46, 204, 113, 0.2)', borderWidth: 1, borderColor: 'rgba(46, 204, 113, 0.4)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: colors.success, fontSize: 11, fontWeight: '800' },
  section: { marginBottom: 24 },
  sectionTitle: { color: colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  description: { color: colors.text.secondary, fontSize: 14, lineHeight: 22 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoItem: { width: '47%', backgroundColor: colors.glass, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.glassBorder, gap: 6 },
  infoLabel: { color: colors.text.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { color: colors.text.primary, fontSize: 14, fontWeight: '700' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32, backgroundColor: 'rgba(10, 10, 10, 0.95)', borderTopWidth: 1, borderTopColor: colors.glassBorder, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.3, shadowRadius: 32, elevation: 20 },
  quantityWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.glass, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: colors.glassBorder },
  quantityBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  quantityText: { color: colors.text.primary, fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  addToCartBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  addToCartText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  addToCartPrice: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
});

export default ProductDetailScreen;