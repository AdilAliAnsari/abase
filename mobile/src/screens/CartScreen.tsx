import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';
import { useCart } from '../context/CartContext';
import { CartItem } from '../services/cartService';

const ACCENT = '#7BEA12';
const ACCENT_GLOW = 'rgba(123, 234, 18, 0.35)';

interface CartScreenProps {
  navigation: any;
}

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const {
    items,
    totalCount,
    totalAmount,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  } = useCart();

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoAppliedCode, setPromoAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');

  // Checkout modal state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Apply Coupon
  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      setPromoError('Please enter a coupon code');
      return;
    }

    if (code === 'STUDENT10' || code === 'VTU10') {
      setAppliedDiscount(0.10); // 10%
      setPromoAppliedCode(code);
      setPromoCode('');
    } else if (code === 'SAVE20' || code === 'FIRSTBUY') {
      setAppliedDiscount(0.20); // 20%
      setPromoAppliedCode(code);
      setPromoCode('');
    } else {
      setPromoError('Invalid coupon. Try "STUDENT10" or "VTU10"');
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(0);
    setPromoAppliedCode(null);
  };

  // Calculations
  const discountAmount = Math.round(totalAmount * appliedDiscount * 100) / 100;
  const finalTotal = Math.max(0, Math.round((totalAmount - discountAmount) * 100) / 100);

  // Confirm clear cart
  const handleConfirmClear = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove all books from your cart?')) {
        clearCart();
      }
    } else {
      Alert.alert(
        'Clear Cart',
        'Are you sure you want to remove all books from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear All', style: 'destructive', onPress: clearCart },
        ]
      );
    }
  };

  // Checkout action
  const handleProceedCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutSuccess(true);
      clearCart();
    }, 1500);
  };

  return (
    <DarkGradientBg>
      <View style={styles.screenBg}>
        <SafeAreaView style={styles.container} edges={['top']}>
          {/* Top Bar */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Shopping Cart</Text>
              <Text style={styles.headerSubtitle}>
                {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
              </Text>
            </View>

            {items.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleConfirmClear}
                activeOpacity={0.7}
                accessibilityLabel="Clear cart"
              >
                <Trash2 size={18} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Body Content */}
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={ACCENT} />
              <Text style={styles.loadingText}>Syncing cart with backend...</Text>
            </View>
          ) : items.length === 0 ? (
            /* Empty Cart View */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <ShoppingBag size={52} color={ACCENT} />
              </View>
              <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
              <Text style={styles.emptySubtitle}>
                Looks like you haven't added any books or study materials yet. Explore our catalog to find what you need!
              </Text>

              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
                activeOpacity={0.8}
              >
                <BookOpen size={18} color="#000000" style={{ marginRight: 8 }} />
                <Text style={styles.exploreBtnText}>Explore Books</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Cart Items & Order Summary */
            <ScrollView
              style={styles.scrollList}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Items Card List */}
              <View style={styles.itemsListSection}>
                {items.map((item: CartItem) => {
                  const itemSubtotal = Math.round(item.price * item.quantity * 100) / 100;
                  return (
                    <View key={item.bookId} style={styles.cartCard}>
                      {/* Book Cover Thumbnail */}
                      <View style={styles.coverWrap}>
                        {item.coverImage ? (
                          <Image
                            source={{ uri: item.coverImage }}
                            style={styles.coverImg}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.coverPlaceholder}>
                            <BookOpen size={24} color="#69D900" />
                          </View>
                        )}
                      </View>

                      {/* Book Information */}
                      <View style={styles.cardInfo}>
                        {item.category && (
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{item.category}</Text>
                          </View>
                        )}

                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemAuthor} numberOfLines={1}>
                          by {item.author}
                        </Text>

                        {/* Price Row */}
                        <View style={styles.priceRow}>
                          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <Text style={styles.originalPrice}>
                              ${item.originalPrice.toFixed(2)}
                            </Text>
                          )}
                          <Text style={styles.subtotalText}>
                            Total: <Text style={styles.subtotalValue}>${itemSubtotal.toFixed(2)}</Text>
                          </Text>
                        </View>

                        {/* Quantity Stepper & Remove Button */}
                        <View style={styles.actionRow}>
                          <View style={styles.stepperWrap}>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.bookId, item.quantity - 1);
                                } else {
                                  removeFromCart(item.bookId);
                                }
                              }}
                              activeOpacity={0.7}
                            >
                              <Minus size={14} color="#FFFFFF" />
                            </TouchableOpacity>

                            <Text style={styles.quantityText}>{item.quantity}</Text>

                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() => updateQuantity(item.bookId, item.quantity + 1)}
                              activeOpacity={0.7}
                            >
                              <Plus size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            style={styles.removeItemBtn}
                            onPress={() => removeFromCart(item.bookId)}
                            activeOpacity={0.7}
                          >
                            <Trash2 size={16} color="#FF6B6B" />
                            <Text style={styles.removeItemText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Promo Code Box */}
              <View style={styles.promoSection}>
                <View style={styles.promoHeader}>
                  <Tag size={16} color={ACCENT} />
                  <Text style={styles.promoTitle}>Have a Coupon / Promo Code?</Text>
                </View>

                {promoAppliedCode ? (
                  <View style={styles.appliedPromoBox}>
                    <View style={styles.appliedPromoLeft}>
                      <CheckCircle2 size={16} color={ACCENT} />
                      <Text style={styles.appliedPromoText}>
                        <Text style={{ fontWeight: '700' }}>{promoAppliedCode}</Text> applied (
                        {(appliedDiscount * 100).toFixed(0)}% OFF)
                      </Text>
                    </View>
                    <TouchableOpacity onPress={handleRemovePromo} style={styles.removePromoBtn}>
                      <Text style={styles.removePromoText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.promoInputRow}>
                    <TextInput
                      style={styles.promoInput}
                      placeholder="e.g. STUDENT10"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={promoCode}
                      onChangeText={setPromoCode}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={styles.applyPromoBtn}
                      onPress={handleApplyPromo}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.applyPromoBtnText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {promoError ? <Text style={styles.promoErrorText}>{promoError}</Text> : null}
              </View>

              {/* Order Summary Card */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryHeading}>Order Summary</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal ({totalCount} items)</Text>
                  <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
                </View>

                {appliedDiscount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: ACCENT }]}>
                      Academic Discount ({(appliedDiscount * 100).toFixed(0)}%)
                    </Text>
                    <Text style={[styles.summaryValue, { color: ACCENT }]}>
                      -${discountAmount.toFixed(2)}
                    </Text>
                  </View>
                )}

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery</Text>
                  <Text style={[styles.summaryValue, { color: ACCENT, fontWeight: '700' }]}>
                    FREE (Instant Digital)
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRowTotal}>
                  <Text style={styles.totalLabel}>Grand Total</Text>
                  <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
                </View>

                {/* Checkout Button */}
                <TouchableOpacity
                  style={[styles.checkoutBtn, isCheckingOut && { opacity: 0.7 }]}
                  onPress={handleProceedCheckout}
                  disabled={isCheckingOut}
                  activeOpacity={0.85}
                >
                  {isCheckingOut ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <>
                      <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                      <ArrowRight size={18} color="#000000" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </TouchableOpacity>

                {/* Security Guarantee Badge */}
                <View style={styles.securityRow}>
                  <ShieldCheck size={16} color={ACCENT} />
                  <Text style={styles.securityText}>
                    100% Secure Checkout • Safe Transactions Guaranteed
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Checkout Success Modal */}
          <Modal visible={checkoutSuccess} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.successIconWrap}>
                  <CheckCircle2 size={48} color={ACCENT} />
                </View>
                <Text style={styles.modalTitle}>Order Placed Successfully!</Text>
                <Text style={styles.modalSubtitle}>
                  Your selected books and study notes have been processed. Digital download links are active in your account.
                </Text>

                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => {
                    setCheckoutSuccess(false);
                    navigation.navigate('MainTabs', { screen: 'HomeTab' });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalBtnText}>Back to Home</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: ACCENT,
    marginTop: 2,
    fontWeight: '600',
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(123, 234, 18, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.3)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 28,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  exploreBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },

  // Cart List Scroll
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  itemsListSection: {
    marginBottom: 16,
  },

  // Cart Item Card
  cartCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 26, 20, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.15)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  coverWrap: {
    width: 85,
    height: 115,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(105, 217, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryBadgeText: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 2,
  },
  itemAuthor: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.55)',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  originalPrice: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textDecorationLine: 'line-through',
  },
  subtotalText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 'auto',
  },
  subtotalValue: {
    color: ACCENT,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  removeItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeItemText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },

  // Promo Section
  promoSection: {
    backgroundColor: 'rgba(22, 26, 20, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.15)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    height: 42,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  applyPromoBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  applyPromoBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  promoErrorText: {
    color: '#FF6B6B',
    fontSize: 11,
    marginTop: 6,
  },
  appliedPromoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(123, 234, 18, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  appliedPromoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appliedPromoText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  removePromoBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  removePromoText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },

  // Order Summary Card
  summaryCard: {
    backgroundColor: 'rgba(22, 26, 20, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  summaryHeading: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: ACCENT,
    fontSize: 22,
    fontWeight: '800',
  },
  checkoutBtn: {
    flexDirection: 'row',
    backgroundColor: ACCENT,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 12,
  },
  checkoutBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  securityText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#161914',
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.35)',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(123, 234, 18, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalBtn: {
    width: '100%',
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default CartScreen;
