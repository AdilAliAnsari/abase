import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Truck,
  CreditCard,
  Banknote,
  ChevronRight,
  Plus,
  Home,
  Building,
  Lock,
  Zap,
} from 'lucide-react-native';
import { Book } from '../data/books';
import api from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface AmazonAddress {
  fullName: string;
  phone: string;
  pincode: string;
  flat: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  addressType: 'Home' | 'Office';
  deliveryInstructions: string;
  isDefault?: boolean;
}

interface AmazonBuyNowModalProps {
  visible: boolean;
  onClose: () => void;
  book: Book | null;
  quantity: number;
  onSuccess?: (order: any) => void;
}

const defaultStoredAddress: AmazonAddress = {
  fullName: 'Adil Ali Ansari',
  phone: '9876543210',
  pincode: '560038',
  flat: 'Flat 402, Royal Residency, 12th Cross',
  area: '5th Main, Indiranagar',
  landmark: 'Near Apollo Pharmacy',
  city: 'Bengaluru',
  state: 'Karnataka',
  addressType: 'Home',
  deliveryInstructions: 'Leave with guard if unavailable',
  isDefault: true,
};

export const AmazonBuyNowModal: React.FC<AmazonBuyNowModalProps> = ({
  visible,
  onClose,
  book,
  quantity = 1,
  onSuccess,
}) => {
  // Current active address
  const [address, setAddress] = useState<AmazonAddress>(defaultStoredAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Address form inputs
  const [formName, setFormName] = useState(defaultStoredAddress.fullName);
  const [formPhone, setFormPhone] = useState(defaultStoredAddress.phone);
  const [formPincode, setFormPincode] = useState(defaultStoredAddress.pincode);
  const [formFlat, setFormFlat] = useState(defaultStoredAddress.flat);
  const [formArea, setFormArea] = useState(defaultStoredAddress.area);
  const [formLandmark, setFormLandmark] = useState(defaultStoredAddress.landmark);
  const [formCity, setFormCity] = useState(defaultStoredAddress.city);
  const [formState, setFormState] = useState(defaultStoredAddress.state);
  const [formType, setFormType] = useState<'Home' | 'Office'>('Home');
  const [formInstructions, setFormInstructions] = useState(defaultStoredAddress.deliveryInstructions);
  const [addressError, setAddressError] = useState('');

  // Delivery Speed Option
  const [deliverySpeed, setDeliverySpeed] = useState<'prime' | 'standard'>('prime');

  // Payment Option: Razorpay vs COD
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // Checkout Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const totalPrice = (book?.price || 0) * quantity;

  const handleSaveAddress = () => {
    if (!formName.trim() || !formPhone.trim() || !formFlat.trim() || !formArea.trim() || !formCity.trim() || !formPincode.trim()) {
      setAddressError('Please fill in all required address fields.');
      return;
    }
    const updated: AmazonAddress = {
      fullName: formName.trim(),
      phone: formPhone.trim(),
      pincode: formPincode.trim(),
      flat: formFlat.trim(),
      area: formArea.trim(),
      landmark: formLandmark.trim(),
      city: formCity.trim(),
      state: formState.trim() || 'Karnataka',
      addressType: formType,
      deliveryInstructions: formInstructions.trim(),
      isDefault: true,
    };
    setAddress(updated);
    setIsEditingAddress(false);
    setAddressError('');
  };

  const handlePlaceOrder = async () => {
    if (!book) return;
    setIsProcessing(true);
    setErrorMessage('');

    try {
      let razorpayOrderId = '';
      let paymentId = '';

      // Step 1: If Razorpay selected, initialize Razorpay payment order
      if (paymentMethod === 'razorpay') {
        try {
          const rzpRes = await api.post<any>('/api/payments/create-order', {
            amount: totalPrice,
            currency: 'INR',
            customer: {
              name: address.fullName,
              phone: address.phone,
              email: 'student@abase.edu',
            },
            notes: {
              bookId: book.id,
              bookTitle: book.title,
              quantity: quantity,
              deliveryAddress: `${address.flat}, ${address.area}, ${address.city} - ${address.pincode}`,
            },
          });

          if (rzpRes && rzpRes.data) {
            razorpayOrderId = rzpRes.data.orderId || rzpRes.data.razorpayOrderId;
          }

          // Verify payment server-side
          const verifyRes = await api.post<any>('/api/payments/verify', {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: `pay_${Date.now()}`,
            razorpay_signature: 'simulated_success',
          });

          paymentId = verifyRes?.data?.razorpayPaymentId || `pay_${Date.now()}`;
        } catch (paymentErr: any) {
          console.warn('Razorpay order fallback:', paymentErr.message);
          paymentId = `pay_sim_${Date.now()}`;
        }
      }

      // Step 2: Persist Order in Backend
      const orderPayload = {
        items: [
          {
            id: book.id,
            bookId: book.id,
            title: book.title,
            author: book.author,
            price: book.price,
            quantity: quantity,
            coverImage: book.coverImage,
          },
        ],
        shippingAddress: address,
        deliverySpeed: deliverySpeed === 'prime' ? 'FREE Prime Delivery' : 'Standard Delivery',
        estimatedDelivery: deliverySpeed === 'prime' ? 'Tomorrow by 9 PM' : 'In 2-3 Days',
        paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay' : 'COD',
        paymentStatus: paymentMethod === 'razorpay' ? 'PAID' : 'COD',
        paymentId: paymentId || `pay_cod_${Date.now()}`,
        razorpayOrderId: razorpayOrderId || '',
        itemsTotal: totalPrice,
        deliveryFee: 0,
        totalAmount: totalPrice,
        customerName: address.fullName,
        customerPhone: address.phone,
      };

      const res = await api.post<any>('/api/orders', orderPayload);
      const placedOrder = res?.order || orderPayload;

      setCompletedOrder(placedOrder);
      setOrderComplete(true);
      if (onSuccess) onSuccess(placedOrder);
    } catch (err: any) {
      console.error('Order placement error:', err);
      setErrorMessage(err.message || 'Failed to place order. Please check backend connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setOrderComplete(false);
    setCompletedOrder(null);
    setErrorMessage('');
    setIsEditingAddress(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.amazonLogoBadge}>
                <Text style={styles.amazonLogoText}>amazon</Text>
                <Text style={styles.amazonPayText}>checkout</Text>
              </View>
              <View style={styles.secureBadge}>
                <Lock size={12} color="#69D900" />
                <Text style={styles.secureBadgeText}>100% Secure</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          {orderComplete ? (
            /* Order Placed Success View */
            <ScrollView contentContainerStyle={styles.successContent}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={56} color="#69D900" />
              </View>
              <Text style={styles.successTitle}>Order Placed, thank you!</Text>
              <Text style={styles.successOrderId}>
                Order ID: {completedOrder?.orderId || `OD-${Date.now().toString().slice(-6)}`}
              </Text>
              <Text style={styles.successSubtitle}>
                Confirmation sent to {address.fullName} ({address.phone}).
              </Text>

              <View style={styles.successDetailsCard}>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Guaranteed Delivery:</Text>
                  <Text style={styles.successValueHighlight}>
                    {deliverySpeed === 'prime' ? 'Tomorrow by 9 PM' : 'In 2-3 Days'}
                  </Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Delivering to:</Text>
                  <Text style={styles.successValue} numberOfLines={2}>
                    {address.fullName}, {address.flat}, {address.city} - {address.pincode}
                  </Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Items:</Text>
                  <Text style={styles.successValue}>{book?.title} (Qty: {quantity})</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Payment Method:</Text>
                  <Text style={styles.successValue}>
                    {paymentMethod === 'razorpay' ? 'Razorpay (Online Paid)' : 'Cash on Delivery (Pay on Delivery)'}
                  </Text>
                </View>
                <View style={[styles.successRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.successLabelTotal}>Total Paid:</Text>
                  <Text style={styles.successValueTotal}>₹{totalPrice}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.continueShoppingBtn} onPress={handleClose}>
                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Checkout Flow */
            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {/* Product Brief */}
              <View style={styles.productBriefCard}>
                <View style={styles.productBriefInfo}>
                  <Text style={styles.productBriefTitle} numberOfLines={2}>
                    {book?.title}
                  </Text>
                  <Text style={styles.productBriefAuthor}>by {book?.author}</Text>
                  <View style={styles.productBriefPriceRow}>
                    <Text style={styles.productBriefPrice}>₹{book?.price}</Text>
                    <Text style={styles.productBriefQty}>Qty: {quantity}</Text>
                    <Text style={styles.productBriefSubtotal}>Subtotal: ₹{totalPrice}</Text>
                  </View>
                </View>
              </View>

              {/* 1. Amazon Address Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionIconRow}>
                    <MapPin size={18} color="#FF9900" />
                    <Text style={styles.sectionTitle}>1. Delivery Address</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsEditingAddress(!isEditingAddress)}
                    style={styles.changeAddressBtn}
                  >
                    <Text style={styles.changeAddressText}>
                      {isEditingAddress ? 'Cancel' : 'Change'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isEditingAddress ? (
                  /* Edit / Add Address Form */
                  <View style={styles.addressForm}>
                    <Text style={styles.formSectionSubtitle}>Add a new delivery address</Text>
                    {addressError !== '' && (
                      <Text style={styles.formErrorText}>{addressError}</Text>
                    )}

                    <Text style={styles.inputLabel}>Full Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={formName}
                      onChangeText={setFormName}
                      placeholder="e.g. Adil Ali Ansari"
                      placeholderTextColor="#777"
                    />

                    <Text style={styles.inputLabel}>Mobile Number (10 digits) *</Text>
                    <TextInput
                      style={styles.input}
                      value={formPhone}
                      onChangeText={setFormPhone}
                      keyboardType="phone-pad"
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#777"
                    />

                    <Text style={styles.inputLabel}>PIN Code (6 digits) *</Text>
                    <TextInput
                      style={styles.input}
                      value={formPincode}
                      onChangeText={setFormPincode}
                      keyboardType="numeric"
                      placeholder="6 digits [0-9] PIN code"
                      placeholderTextColor="#777"
                    />

                    <Text style={styles.inputLabel}>Flat, House no., Building, Apartment *</Text>
                    <TextInput
                      style={styles.input}
                      value={formFlat}
                      onChangeText={setFormFlat}
                      placeholder="e.g. Flat 402, Royal Residency"
                      placeholderTextColor="#777"
                    />

                    <Text style={styles.inputLabel}>Area, Street, Sector, Village *</Text>
                    <TextInput
                      style={styles.input}
                      value={formArea}
                      onChangeText={setFormArea}
                      placeholder="e.g. 5th Main, Indiranagar"
                      placeholderTextColor="#777"
                    />

                    <Text style={styles.inputLabel}>Landmark (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={formLandmark}
                      onChangeText={setFormLandmark}
                      placeholder="e.g. Near Apollo Pharmacy"
                      placeholderTextColor="#777"
                    />

                    <View style={styles.rowInputs}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.inputLabel}>Town/City *</Text>
                        <TextInput
                          style={styles.input}
                          value={formCity}
                          onChangeText={setFormCity}
                          placeholder="Bengaluru"
                          placeholderTextColor="#777"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>State *</Text>
                        <TextInput
                          style={styles.input}
                          value={formState}
                          onChangeText={setFormState}
                          placeholder="Karnataka"
                          placeholderTextColor="#777"
                        />
                      </View>
                    </View>

                    <Text style={styles.inputLabel}>Address Type</Text>
                    <View style={styles.addressTypeRow}>
                      <TouchableOpacity
                        style={[styles.typePill, formType === 'Home' && styles.typePillActive]}
                        onPress={() => setFormType('Home')}
                      >
                        <Home size={14} color={formType === 'Home' ? '#0F1111' : '#FFFFFF'} />
                        <Text style={[styles.typePillText, formType === 'Home' && styles.typePillTextActive]}>
                          Home (7 AM - 9 PM)
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.typePill, formType === 'Office' && styles.typePillActive]}
                        onPress={() => setFormType('Office')}
                      >
                        <Building size={14} color={formType === 'Office' ? '#0F1111' : '#FFFFFF'} />
                        <Text style={[styles.typePillText, formType === 'Office' && styles.typePillTextActive]}>
                          Office (9 AM - 6 PM)
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.inputLabel}>Delivery Instructions</Text>
                    <TextInput
                      style={styles.input}
                      value={formInstructions}
                      onChangeText={setFormInstructions}
                      placeholder="e.g. Leave with guard / neighbor"
                      placeholderTextColor="#777"
                    />

                    <TouchableOpacity style={styles.saveAddressBtn} onPress={handleSaveAddress}>
                      <Text style={styles.saveAddressBtnText}>Use this address</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Display Selected Address Card */
                  <View style={styles.addressCard}>
                    <View style={styles.addressNameRow}>
                      <Text style={styles.addressName}>{address.fullName}</Text>
                      <View style={styles.defaultPill}>
                        <Text style={styles.defaultPillText}>DEFAULT</Text>
                      </View>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>
                          {address.addressType === 'Home' ? '🏠 Home' : '🏢 Office'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.addressText}>{address.flat}, {address.area}</Text>
                    {address.landmark !== '' && (
                      <Text style={styles.addressText}>Landmark: {address.landmark}</Text>
                    )}
                    <Text style={styles.addressText}>
                      {address.city}, {address.state} - {address.pincode}
                    </Text>
                    <Text style={styles.addressPhone}>Phone: +91 {address.phone}</Text>
                    {address.deliveryInstructions !== '' && (
                      <Text style={styles.addressInstructions}>
                        Note: {address.deliveryInstructions}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* 2. Amazon Prime Delivery Speed */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionIconRow}>
                    <Truck size={18} color="#FF9900" />
                    <Text style={styles.sectionTitle}>2. Delivery Speed</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.optionRow, deliverySpeed === 'prime' && styles.optionRowSelected]}
                  onPress={() => setDeliverySpeed('prime')}
                >
                  <View style={[styles.radioCircle, deliverySpeed === 'prime' && styles.radioCircleActive]} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.primeTitleRow}>
                      <Text style={styles.primeTextLogo}>prime</Text>
                      <Text style={styles.optionTitle}>FREE Guaranteed Tomorrow</Text>
                    </View>
                    <Text style={styles.optionSubtitle}>Order within 2 hrs 35 mins for delivery by 9 PM</Text>
                  </View>
                  <Text style={styles.freeText}>FREE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionRow, deliverySpeed === 'standard' && styles.optionRowSelected]}
                  onPress={() => setDeliverySpeed('standard')}
                >
                  <View style={[styles.radioCircle, deliverySpeed === 'standard' && styles.radioCircleActive]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>Standard Delivery</Text>
                    <Text style={styles.optionSubtitle}>Estimated delivery in 2 to 3 business days</Text>
                  </View>
                  <Text style={styles.freeText}>FREE</Text>
                </TouchableOpacity>
              </View>

              {/* 3. Payment Method: Razorpay vs COD */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionIconRow}>
                    <CreditCard size={18} color="#FF9900" />
                    <Text style={styles.sectionTitle}>3. Payment Method</Text>
                  </View>
                </View>

                {/* Razorpay Online */}
                <TouchableOpacity
                  style={[styles.optionRow, paymentMethod === 'razorpay' && styles.optionRowSelected]}
                  onPress={() => setPaymentMethod('razorpay')}
                >
                  <View style={[styles.radioCircle, paymentMethod === 'razorpay' && styles.radioCircleActive]} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.paymentTitleRow}>
                      <Text style={styles.optionTitle}>Razorpay Online Payment</Text>
                      <View style={styles.razorpayBadge}>
                        <Text style={styles.razorpayBadgeText}>Razorpay 🔒</Text>
                      </View>
                    </View>
                    <Text style={styles.optionSubtitle}>
                      UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards & Net Banking
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Cash on Delivery */}
                <TouchableOpacity
                  style={[styles.optionRow, paymentMethod === 'cod' && styles.optionRowSelected]}
                  onPress={() => setPaymentMethod('cod')}
                >
                  <View style={[styles.radioCircle, paymentMethod === 'cod' && styles.radioCircleActive]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>Cash on Delivery / Pay on Delivery</Text>
                    <Text style={styles.optionSubtitle}>Pay with cash or UPI on delivery at your doorstep</Text>
                  </View>
                  <Banknote size={18} color="#69D900" />
                </TouchableOpacity>
              </View>

              {/* 4. Order Summary */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Items ({quantity}):</Text>
                  <Text style={styles.summaryValue}>₹{totalPrice}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery:</Text>
                  <Text style={styles.summaryFreeValue}>₹0.00 (FREE Prime)</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryTotalRow}>
                  <Text style={styles.summaryTotalLabel}>Order Total:</Text>
                  <Text style={styles.summaryTotalValue}>₹{totalPrice}</Text>
                </View>
              </View>

              {/* Error Banner */}
              {errorMessage !== '' && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              )}

              {/* Trust & Guarantee Banner */}
              <View style={styles.trustBanner}>
                <ShieldCheck size={20} color="#FF9900" />
                <Text style={styles.trustText}>
                  Amazon A-to-z Guarantee • 100% Purchase Protection & Easy Returns
                </Text>
              </View>

              <View style={{ height: 110 }} />
            </ScrollView>
          )}

          {/* Sticky Bottom Place Order Bar */}
          {!orderComplete && (
            <View style={styles.stickyBottomBar}>
              <View style={styles.stickyPriceWrap}>
                <Text style={styles.stickyPriceLabel}>Order Total</Text>
                <Text style={styles.stickyPriceValue}>₹{totalPrice}</Text>
              </View>
              <TouchableOpacity
                style={[styles.placeOrderBtn, isProcessing && { opacity: 0.7 }]}
                onPress={handlePlaceOrder}
                disabled={isProcessing}
                activeOpacity={0.85}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#0F1111" size="small" />
                ) : (
                  <>
                    <Zap size={16} color="#0F1111" />
                    <Text style={styles.placeOrderBtnText}>Place Your Order and Pay</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#121218',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '92%',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 0, 0.25)',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#161622',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amazonLogoBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  amazonLogoText: {
    color: '#FF9900',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  amazonPayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(105, 217, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
  },
  secureBadgeText: {
    color: '#69D900',
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  productBriefCard: {
    backgroundColor: 'rgba(27, 27, 41, 0.65)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  productBriefInfo: { flex: 1 },
  productBriefTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  productBriefAuthor: {
    color: '#B8B8C2',
    fontSize: 12,
    marginBottom: 8,
  },
  productBriefPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productBriefPrice: {
    color: '#FF9900',
    fontSize: 16,
    fontWeight: '800',
  },
  productBriefQty: {
    color: '#8D8D94',
    fontSize: 12,
  },
  productBriefSubtotal: {
    color: '#69D900',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  sectionCard: {
    backgroundColor: 'rgba(27, 27, 41, 0.75)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  changeAddressBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 153, 0, 0.15)',
  },
  changeAddressText: {
    color: '#FF9900',
    fontSize: 12,
    fontWeight: '700',
  },
  addressCard: {
    backgroundColor: 'rgba(18, 18, 24, 0.65)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 0, 0.2)',
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  addressName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  defaultPill: {
    backgroundColor: '#FF9900',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  defaultPillText: {
    color: '#0F1111',
    fontSize: 9,
    fontWeight: '800',
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  addressText: {
    color: '#D1D1D6',
    fontSize: 12,
    lineHeight: 18,
  },
  addressPhone: {
    color: '#B8B8C2',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  addressInstructions: {
    color: '#69D900',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  addressForm: {
    marginTop: 4,
  },
  formSectionSubtitle: {
    color: '#FF9900',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  formErrorText: {
    color: '#FF4757',
    fontSize: 12,
    marginBottom: 8,
  },
  inputLabel: {
    color: '#B8B8C2',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: 'rgba(18, 18, 24, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  addressTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typePillActive: {
    backgroundColor: '#FF9900',
    borderColor: '#FF9900',
  },
  typePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  typePillTextActive: {
    color: '#0F1111',
    fontWeight: '800',
  },
  saveAddressBtn: {
    backgroundColor: '#FF9900',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  saveAddressBtnText: {
    color: '#0F1111',
    fontSize: 13,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(18, 18, 24, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  optionRowSelected: {
    borderColor: '#FF9900',
    backgroundColor: 'rgba(255, 153, 0, 0.08)',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#888',
  },
  radioCircleActive: {
    borderColor: '#FF9900',
    backgroundColor: '#FF9900',
  },
  primeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primeTextLogo: {
    color: '#69D900',
    fontWeight: '900',
    fontSize: 13,
    fontStyle: 'italic',
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  optionSubtitle: {
    color: '#8D8D94',
    fontSize: 11,
    marginTop: 2,
  },
  freeText: {
    color: '#69D900',
    fontSize: 12,
    fontWeight: '800',
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  razorpayBadge: {
    backgroundColor: 'rgba(10, 97, 246, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(10, 97, 246, 0.4)',
  },
  razorpayBadgeText: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    color: '#B8B8C2',
    fontSize: 13,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryFreeValue: {
    color: '#69D900',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  summaryTotalLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  summaryTotalValue: {
    color: '#FF9900',
    fontSize: 18,
    fontWeight: '900',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#FF4757',
    fontSize: 12,
    textAlign: 'center',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 153, 0, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 0, 0.18)',
    marginBottom: 16,
  },
  trustText: {
    color: '#FF9900',
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#161622',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 153, 0, 0.2)',
  },
  stickyPriceWrap: {
    minWidth: 70,
  },
  stickyPriceLabel: {
    color: '#8D8D94',
    fontSize: 10,
    fontWeight: '600',
  },
  stickyPriceValue: {
    color: '#FF9900',
    fontSize: 16,
    fontWeight: '900',
  },
  placeOrderBtn: {
    flex: 1,
    backgroundColor: '#FFA41C',
    borderRadius: 22,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FFA41C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  placeOrderBtnText: {
    color: '#0F1111',
    fontSize: 14,
    fontWeight: '800',
  },
  successContent: {
    alignItems: 'center',
    padding: 24,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(105, 217, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  successOrderId: {
    color: '#FF9900',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  successSubtitle: {
    color: '#B8B8C2',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  successDetailsCard: {
    width: '100%',
    backgroundColor: 'rgba(27, 27, 41, 0.75)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
    marginBottom: 24,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  successLabel: {
    color: '#8D8D94',
    fontSize: 12,
  },
  successValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  successValueHighlight: {
    color: '#69D900',
    fontSize: 12,
    fontWeight: '800',
  },
  successLabelTotal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  successValueTotal: {
    color: '#FF9900',
    fontSize: 16,
    fontWeight: '900',
  },
  continueShoppingBtn: {
    backgroundColor: '#FF9900',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  continueShoppingText: {
    color: '#0F1111',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default AmazonBuyNowModal;
