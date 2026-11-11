import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Animated, Share, Platform } from 'react-native';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShoppingBag,
  Minus,
  Plus,
  BookOpen,
  Globe,
  Building2,
  FileText,
  Zap,
  MapPin,
  ShieldCheck,
  Lock,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { Book } from '../data/books';
import bookService from '../services/bookService';
import DarkGradientBg from '../components/DarkGradientBg';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../i18n/LanguageContext';
import AmazonBuyNowModal from '../components/AmazonBuyNowModal';

interface ProductDetailScreenProps {
  route: any;
  navigation: any;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ route, navigation }) => {
  const { addToCart, totalCount } = useCart();
  const { t } = useTranslation();
  const initialBook = (route.params?.book || {}) as Book;
  const bookId = initialBook?.id || route.params?.id || route.params?.bookId;
  const [book, setBook] = useState<Book>(initialBook);

  useEffect(() => {
    if (bookId) {
      bookService.getBookById(String(bookId)).then((fresh) => {
        if (fresh) setBook(fresh);
      });
    }
  }, [bookId]);

  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(800)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const coverScale = useRef(new Animated.Value(0.8)).current;

  // Web body background override for details page
  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleEl = document.getElementById('amazon-body-style');
      if (styleEl) {
        styleEl.innerHTML = `body { background-color: #000000 !important; }`;
      }
    }
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(coverScale, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out "${book?.title}" by ${book?.author} on Bookstore!` });
    } catch (error) { console.log(error); }
  };

  const handleAddToCart = async () => {
    if (book) {
      setAddedToCart(true);
      await addToCart(book, quantity);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const totalPrice = ((book?.price || 0) * quantity);
  const hasDiscount = !!book?.originalPrice && book.originalPrice > (book?.price || 0);
  const discountPercent = hasDiscount ? Math.round(((book.originalPrice! - book.price) / book.originalPrice!) * 100) : 0;

  return (
    <DarkGradientBg>
      <View style={styles.screenBg}>
        <View style={styles.container}>
        
        {/* Header bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Share2 size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
              <ShoppingBag size={18} color="#7BEA12" />
              {totalCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{totalCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Cover Photo Wrap */}
            <View style={styles.coverWrap}>
              <Animated.View style={{ transform: [{ scale: coverScale }] }}>
                <Image source={{ uri: book?.coverImage }} style={styles.cover} resizeMode="contain" />
              </Animated.View>
              {book?.badge && (
                <View style={[
                  styles.badge,
                  book.badge === 'BESTSELLER' ? styles.badgeBestseller : styles.badgeNew,
                ]}>
                  <Text style={styles.badgeText}>{book.badge}</Text>
                </View>
              )}
              <TouchableOpacity style={[styles.likeButton, liked && styles.likeButtonActive]} onPress={() => setLiked(!liked)}>
                <Heart size={18} color={liked ? '#ff4757' : '#FFFFFF'} fill={liked ? '#ff4757' : 'transparent'} />
              </TouchableOpacity>
            </View>

            {/* Book Info */}
            <Text style={styles.title}>{book?.title}</Text>
            <Text style={styles.author}>by <Text style={styles.authorNameLink}>{book?.author}</Text></Text>

            {/* Ratings */}
            <View style={styles.ratingRow}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    color={star <= Math.floor(book?.rating || 0) ? '#FF9900' : '#333344'} 
                    fill={star <= Math.floor(book?.rating || 0) ? '#FF9900' : 'transparent'} 
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{book?.rating}</Text>
              <Text style={styles.reviews}>{(book?.reviews || 0).toLocaleString()} ratings</Text>
            </View>

            {/* Pricing in INR (₹) */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{book?.price}</Text>
              {hasDiscount && (
                <>
                  <Text style={styles.originalPrice}>M.R.P.: ₹{book?.originalPrice}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>Save {discountPercent}%</Text>
                  </View>
                </>
              )}
            </View>

            {/* Dynamic Distributor Delivery & Prime Tag */}
            <View style={styles.primeDeliveryBadge}>
              {book?.isPrime !== false && <Text style={styles.primeLabel}>prime</Text>}
              <Text style={styles.primeDeliveryText}>
                {book?.deliveryTag || t.freeDeliveryTomorrow || 'FREE delivery Tomorrow'}
              </Text>
            </View>

            {/* Amazon Shipping & Location Box */}
            <View style={styles.amazonDeliveryBox}>
              <View style={styles.deliverToRow}>
                <MapPin size={14} color="#69D900" />
                <Text style={styles.deliverToText}>
                  Deliver to <Text style={styles.deliverToBold}>Adil - Bengaluru 560038</Text>
                </Text>
              </View>
              <Text style={styles.inStockText}>In Stock</Text>
              <Text style={styles.sellerText}>
                Ships from <Text style={styles.sellerBold}>Abase India</Text> • Sold by <Text style={styles.sellerBold}>{book?.author || 'Official Publisher'}</Text>
              </Text>
              <View style={styles.secureRow}>
                <ShieldCheck size={14} color="#FF9900" />
                <Text style={styles.secureText}>Amazon A-to-z Guarantee • Secure transaction</Text>
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.description || 'Description'}</Text>
              <Text style={styles.description}>{book?.description}</Text>
            </View>

            <View style={styles.sectionDivider} />

            {/* Specifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.productDetails || 'Product Details'}</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <FileText size={16} color="#69D900" />
                  <Text style={styles.infoLabel}>{t.pages || 'Length'}</Text>
                  <Text style={styles.infoValue}>{book?.pages} pages</Text>
                </View>
                <View style={styles.infoItem}>
                  <Globe size={16} color="#69D900" />
                  <Text style={styles.infoLabel}>{t.language || 'Language'}</Text>
                  <Text style={styles.infoValue}>{book?.language}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Building2 size={16} color="#69D900" />
                  <Text style={styles.infoLabel}>{t.publisher || 'Publisher'}</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>{book?.publisher}</Text>
                </View>
                <View style={styles.infoItem}>
                  <BookOpen size={16} color="#69D900" />
                  <Text style={styles.infoLabel}>{t.category || 'Category'}</Text>
                  <Text style={styles.infoValue}>{book?.category}</Text>
                </View>
              </View>
            </View>

            <View style={{ height: 140 }} />
          </ScrollView>
        </Animated.View>

        {/* Bottom Sticky Action Bar: Quantity + Add to Cart + Amazon Buy Now */}
        <View style={styles.bottomBar}>
          <View style={styles.quantityWrap}>
            <TouchableOpacity style={styles.quantityBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus size={13} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityBtn} onPress={() => setQuantity(quantity + 1)}>
              <Plus size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity 
            style={[styles.addToCartBtn, addedToCart && styles.addToCartBtnAdded]} 
            onPress={handleAddToCart} 
            activeOpacity={0.8}
          >
            <ShoppingBag size={16} color={addedToCart ? '#FFF' : '#0B2405'} />
            <Text style={[styles.addToCartText, addedToCart && styles.addToCartTextAdded]}>
              {addedToCart ? (t.added || 'Added!') : (t.addToCart || 'Add to Cart')}
            </Text>
          </TouchableOpacity>

          {/* Amazon Buy Now Button */}
          <TouchableOpacity 
            style={styles.buyNowBtn} 
            onPress={() => setIsBuyNowOpen(true)} 
            activeOpacity={0.85}
          >
            <Zap size={16} color="#0F1111" />
            <Text style={styles.buyNowText}>
              Buy Now • ₹{totalPrice}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amazon Checkout Modal */}
        <AmazonBuyNowModal
          visible={isBuyNowOpen}
          onClose={() => setIsBuyNowOpen(false)}
          book={book}
          quantity={quantity}
          onSuccess={(order) => {
            console.log('Order successfully placed:', order);
          }}
        />

        </View>
      </View>
    </DarkGradientBg>
  );
};

const styles = StyleSheet.create({
  screenBg: { 
    flex: 1, 
    backgroundColor: 'transparent',
  },
  container: { 
    flex: 1, 
    backgroundColor: 'transparent',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: Platform.OS === 'ios' ? 50 : 16, 
    paddingBottom: 12, 
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(105, 217, 0, 0.12)',
    backgroundColor: 'rgba(18, 18, 24, 0.75)',
    zIndex: 10,
  },
  iconButton: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    backgroundColor: 'rgba(27, 27, 41, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.15)',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  headerTitle: { 
    color: colors.primaryText, 
    fontSize: 15, 
    fontWeight: '700',
  },
  content: { 
    flex: 1,
  },
  scrollContent: { 
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  coverWrap: { 
    alignSelf: 'center', 
    marginTop: 6, 
    marginBottom: 20, 
    position: 'relative',
    width: 200,
    height: 260,
    backgroundColor: 'rgba(18, 22, 16, 0.55)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  cover: { 
    width: 170, 
    height: 230,
  },
  badge: { 
    position: 'absolute', 
    top: 10, 
    left: 10, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 4, 
    zIndex: 3,
  },
  badgeBestseller: {
    backgroundColor: '#C45500',
  },
  badgeNew: {
    backgroundColor: '#007600',
  },
  badgeText: { 
    color: '#FFF', 
    fontSize: 8, 
    fontWeight: '800', 
    letterSpacing: 0.5,
  },
  likeButton: { 
    position: 'absolute', 
    bottom: 10, 
    right: 10, 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: 'rgba(27, 27, 41, 0.85)', 
    borderWidth: 1, 
    borderColor: 'rgba(105, 217, 0, 0.2)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  likeButtonActive: { 
    backgroundColor: 'rgba(255, 71, 87, 0.2)', 
    borderColor: 'rgba(255, 71, 87, 0.4)',
  },
  title: { 
    color: colors.primaryText, 
    fontSize: 20, 
    fontWeight: '600', 
    lineHeight: 25, 
    marginBottom: 4,
  },
  author: { 
    color: colors.secondaryText, 
    fontSize: 13, 
    fontWeight: '500', 
    marginBottom: 14,
  },
  authorNameLink: {
    color: '#69D900',
    fontWeight: '600',
  },
  ratingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginBottom: 14,
  },
  starsRow: { 
    flexDirection: 'row', 
    gap: 1.5,
  },
  ratingText: { 
    color: colors.primaryText, 
    fontSize: 13, 
    fontWeight: '700',
  },
  reviews: { 
    color: '#69D900', 
    fontSize: 13,
  },
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'baseline', 
    gap: 8, 
    marginBottom: 10,
  },
  price: { 
    fontSize: 26, 
    fontWeight: '700', 
    color: colors.primaryText,
  },
  originalPrice: { 
    color: colors.mutedText, 
    fontSize: 13, 
    textDecorationLine: 'line-through',
  },
  discountBadge: { 
    backgroundColor: 'rgba(255, 69, 69, 0.15)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 69, 69, 0.3)', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 4,
  },
  discountText: { 
    color: colors.danger, 
    fontSize: 11, 
    fontWeight: '700',
  },
  primeDeliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  primeLabel: {
    color: '#69D900',
    fontWeight: '900',
    fontSize: 14,
    fontStyle: 'italic',
  },
  primeDeliveryText: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  amazonDeliveryBox: {
    backgroundColor: 'rgba(27, 27, 41, 0.65)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.15)',
    marginBottom: 16,
    gap: 6,
  },
  deliverToRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliverToText: {
    color: '#B8B8C2',
    fontSize: 12,
  },
  deliverToBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inStockText: {
    color: '#69D900',
    fontSize: 14,
    fontWeight: '800',
  },
  sellerText: {
    color: '#8D8D94',
    fontSize: 11,
  },
  sellerBold: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  secureText: {
    color: '#FF9900',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(105, 217, 0, 0.1)',
    marginVertical: 14,
  },
  section: { 
    marginBottom: 6,
  },
  sectionTitle: { 
    color: colors.primaryText, 
    fontSize: 15, 
    fontWeight: '700', 
    marginBottom: 8,
  },
  description: { 
    color: colors.secondaryText, 
    fontSize: 13, 
    lineHeight: 20,
  },
  infoGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10,
  },
  infoItem: { 
    width: '48%', 
    backgroundColor: 'rgba(18, 22, 16, 0.55)', 
    borderRadius: 10, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(105, 217, 0, 0.12)', 
    gap: 4,
  },
  infoLabel: { 
    color: colors.mutedText, 
    fontSize: 10, 
    fontWeight: '600', 
    textTransform: 'uppercase', 
  },
  infoValue: { 
    color: colors.primaryText, 
    fontSize: 13, 
    fontWeight: '700',
  },
  bottomBar: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    paddingBottom: Platform.OS === 'ios' ? 26 : 10, 
    backgroundColor: 'rgba(18, 18, 24, 0.95)', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255, 153, 0, 0.25)', 
    gap: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -2 }, 
    shadowOpacity: 0.35, 
    shadowRadius: 10, 
    elevation: 12,
  },
  quantityWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: 'rgba(27, 27, 41, 0.8)', 
    borderRadius: 18, 
    padding: 2, 
    borderWidth: 1, 
    borderColor: 'rgba(105, 217, 0, 0.2)', 
  },
  quantityBtn: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  quantityText: { 
    color: colors.primaryText, 
    fontSize: 13, 
    fontWeight: '700', 
    minWidth: 16, 
    textAlign: 'center',
  },
  addToCartBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#69D900', 
    borderColor: '#7BEA12', 
    borderWidth: 1, 
  },
  addToCartBtnAdded: { 
    backgroundColor: '#067D62', 
    borderColor: '#056B54', 
  },
  addToCartText: { 
    color: '#0B2405', 
    fontSize: 12, 
    fontWeight: '800', 
  },
  addToCartTextAdded: { 
    color: '#FFFFFF', 
  },
  buyNowBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFA41C',
    borderColor: '#FF9900',
    borderWidth: 1,
    shadowColor: '#FFA41C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buyNowText: {
    color: '#0F1111',
    fontSize: 12,
    fontWeight: '900',
  },
  headerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#7BEA12',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  headerBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default ProductDetailScreen;