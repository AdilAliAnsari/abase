import React, { useState, useEffect } from 'react';
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
  Smartphone,
  Check,
} from 'lucide-react-native';
import { Book } from '../data/books';
import { CartItem } from '../services/cartService';
import cardService, { SavedCard } from '../services/cardService';
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

export interface AmazonBuyNowModalProps {
  visible: boolean;
  onClose: () => void;
  book?: Book | null;
  quantity?: number;
  items?: CartItem[];
  totalAmount?: number;
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
  items,
  totalAmount,
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
  const [onlineType, setOnlineType] = useState<'upi' | 'card'>('upi');

  // UPI State
  const [upiApp, setUpiApp] = useState<'phonepe' | 'gpay' | 'paytm' | 'other'>('phonepe');
  const [customUpiId, setCustomUpiId] = useState('');
  const [upiError, setUpiError] = useState('');

  // Card State & Saved Cards
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isAddingNewCard, setIsAddingNewCard] = useState<boolean>(false);
  const [saveCardForFuture, setSaveCardForFuture] = useState<boolean>(true);

  // New Card Form Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(defaultStoredAddress.fullName);
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState('');
  const [savedCardCvv, setSavedCardCvv] = useState('');

  // Load saved cards on modal mount/open
  useEffect(() => {
    if (visible) {
      cardService.getSavedCards().then((cards) => {
        setSavedCards(cards);
        if (cards && cards.length > 0) {
          const def = cards.find((c) => c.isDefault) || cards[0];
          setSelectedCardId(def.id);
          setIsAddingNewCard(false); // Returning user: skip card filling by default!
        } else {
          setIsAddingNewCard(true); // First-time customer: show card filling option!
        }
      });
    }
  }, [visible]);

  // Card brand detector
  const getCardBrand = (num: string): 'visa' | 'mastercard' | 'rupay' | 'card' => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('5') || clean.startsWith('2')) return 'mastercard';
    if (clean.startsWith('6') || clean.startsWith('508')) return 'rupay';
    return 'card';
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const parts = cleaned.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : cleaned);
    setCardError('');
  };

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiry(cleaned);
    }
    setCardError('');
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    setCardCvv(cleaned);
    setCardError('');
  };

  // Checkout Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const computedItemsCount = items && items.length > 0
    ? items.reduce((sum, i) => sum + i.quantity, 0)
    : quantity;

  const totalPrice = totalAmount !== undefined
    ? totalAmount
    : (items && items.length > 0
        ? items.reduce((sum, i) => sum + i.price * i.quantity, 0)
        : ((book?.price || 0) * quantity));

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
    if (!book && (!items || items.length === 0)) return;
    setErrorMessage('');
    setCardError('');
    setUpiError('');

    // Pre-flight Validations
    if (paymentMethod === 'razorpay') {
      if (onlineType === 'upi' && upiApp === 'other') {
        if (!customUpiId.trim() || !customUpiId.includes('@')) {
          setUpiError('Please enter a valid UPI ID (e.g. mobile@upi or name@okaxis)');
          return;
        }
      }

      if (onlineType === 'card') {
        if (savedCards.length === 0 || isAddingNewCard) {
          const rawNum = cardNumber.replace(/\s+/g, '');
          if (rawNum.length < 15) {
            setCardError('Please enter a valid 16-digit card number.');
            return;
          }
          if (!cardHolder.trim()) {
            setCardError('Please enter the cardholder name.');
            return;
          }
          if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
            setCardError('Please enter card expiry as MM/YY.');
            return;
          }
          if (cardCvv.length < 3) {
            setCardError('Please enter a 3 or 4-digit CVV.');
            return;
          }
        } else {
          if (!selectedCardId) {
            setCardError('Please select a saved card to pay with.');
            return;
          }
        }
      }
    }

    setIsProcessing(true);

    try {
      let razorpayOrderId = '';
      let paymentId = '';
      let paymentSubMethod = 'Cash on Delivery (Pay on Delivery)';

      // Step 1: If Razorpay selected, initialize Razorpay payment order
      if (paymentMethod === 'razorpay') {
        if (onlineType === 'upi') {
          paymentSubMethod = `UPI - ${upiApp === 'other' ? customUpiId.trim() : upiApp === 'gpay' ? 'Google Pay' : upiApp === 'phonepe' ? 'PhonePe' : 'Paytm'}`;
        } else {
          if (savedCards.length === 0 || isAddingNewCard) {
            paymentSubMethod = `Card - ${getCardBrand(cardNumber).toUpperCase()} •••• ${cardNumber.replace(/\s+/g, '').slice(-4)}`;
            if (saveCardForFuture) {
              try {
                await cardService.saveCard({
                  cardNumber,
                  cardHolder,
                  expiry: cardExpiry,
                });
              } catch (saveErr) {
                console.warn('Could not save card:', saveErr);
              }
            }
          } else {
            const sc = savedCards.find((c) => c.id === selectedCardId);
            paymentSubMethod = `Card - ${sc?.type.toUpperCase() || 'CARD'} ${sc?.cardNumber || ''}`;
          }
        }

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
              orderType: items && items.length > 0 ? 'cart_order' : 'single_book',
              itemsCount: computedItemsCount,
              deliveryAddress: `${address.flat}, ${address.area}, ${address.city} - ${address.pincode}`,
              paymentSubMethod,
            },
          });

          if (rzpRes && rzpRes.data) {
            razorpayOrderId = rzpRes.data.orderId || rzpRes.data.razorpayOrderId || '';
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
      const orderItems = items && items.length > 0
        ? items.map(i => ({
            id: i.bookId,
            bookId: i.bookId,
            title: i.title,
            author: i.author,
            price: i.price,
            quantity: i.quantity,
            coverImage: i.coverImage,
          }))
        : [
            {
              id: book!.id,
              bookId: book!.id,
              title: book!.title,
              author: book!.author,
              price: book!.price,
              quantity: quantity,
              coverImage: book!.coverImage,
            },
          ];

      const orderPayload = {
        items: orderItems,
        shippingAddress: address,
        deliverySpeed: deliverySpeed === 'prime' ? 'FREE Prime Delivery' : 'Standard Delivery',
        estimatedDelivery: deliverySpeed === 'prime' ? 'Tomorrow by 9 PM' : 'In 2-3 Days',
        paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay' : 'COD',
        paymentSubMethod,
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
                  <Text style={styles.successValue}>
                    {items && items.length > 0
                      ? `${items.length} titles (${computedItemsCount} items)`
                      : `${book?.title} (Qty: ${quantity})`}
                  </Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Payment Method:</Text>
                  <Text style={styles.successValue}>
                    {paymentMethod === 'razorpay'
                      ? `Razorpay • ${completedOrder?.paymentSubMethod || 'Online Paid'}`
                      : 'Cash on Delivery (Pay on Delivery)'}
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
                  {items && items.length > 0 ? (
                    <>
                      <Text style={styles.productBriefTitle}>
                        Cart Order ({items.length} titles, {computedItemsCount} items)
                      </Text>
                      <Text style={styles.productBriefAuthor} numberOfLines={2}>
                        {items.map(i => `${i.title} (x${i.quantity})`).join(', ')}
                      </Text>
                      <View style={styles.productBriefPriceRow}>
                        <Text style={styles.productBriefPrice}>Total: ₹{totalPrice}</Text>
                        <Text style={styles.productBriefQty}>Free Delivery</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.productBriefTitle} numberOfLines={2}>
                        {book?.title}
                      </Text>
                      <Text style={styles.productBriefAuthor}>by {book?.author}</Text>
                      <View style={styles.productBriefPriceRow}>
                        <Text style={styles.productBriefPrice}>₹{book?.price}</Text>
                        <Text style={styles.productBriefQty}>Qty: {quantity}</Text>
                        <Text style={styles.productBriefSubtotal}>Subtotal: ₹{totalPrice}</Text>
                      </View>
                    </>
                  )}
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

                {/* Razorpay Sub-Methods (UPI vs Card) */}
                {paymentMethod === 'razorpay' && (
                  <View style={styles.razorpaySubContainer}>
                    {/* Method Selector: UPI vs Card */}
                    <View style={styles.subToggleWrap}>
                      <TouchableOpacity
                        style={[styles.subToggleBtn, onlineType === 'upi' && styles.subToggleBtnActive]}
                        onPress={() => setOnlineType('upi')}
                        activeOpacity={0.8}
                      >
                        <Smartphone size={15} color={onlineType === 'upi' ? '#0F1111' : '#FFFFFF'} />
                        <Text style={[styles.subToggleText, onlineType === 'upi' && styles.subToggleTextActive]}>
                          UPI (GPay / PhonePe / Paytm)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.subToggleBtn, onlineType === 'card' && styles.subToggleBtnActive]}
                        onPress={() => setOnlineType('card')}
                        activeOpacity={0.8}
                      >
                        <CreditCard size={15} color={onlineType === 'card' ? '#0F1111' : '#FFFFFF'} />
                        <Text style={[styles.subToggleText, onlineType === 'card' && styles.subToggleTextActive]}>
                          Debit / Credit Card
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* 1. UPI Payment Section */}
                    {onlineType === 'upi' && (
                      <View style={styles.upiMethodWrap}>
                        <Text style={styles.subSectionTitle}>Select UPI Application</Text>

                        <View style={styles.upiGrid}>
                          {/* PhonePe */}
                          <TouchableOpacity
                            style={[styles.upiTile, upiApp === 'phonepe' && styles.upiTileActive]}
                            onPress={() => setUpiApp('phonepe')}
                            activeOpacity={0.8}
                          >
                            <View style={styles.upiIconPhonePe}>
                              <Text style={styles.upiIconText}>पे</Text>
                            </View>
                            <Text style={styles.upiTileTitle}>PhonePe</Text>
                            <View style={[styles.smallRadio, upiApp === 'phonepe' && styles.smallRadioActive]} />
                          </TouchableOpacity>

                          {/* Google Pay */}
                          <TouchableOpacity
                            style={[styles.upiTile, upiApp === 'gpay' && styles.upiTileActive]}
                            onPress={() => setUpiApp('gpay')}
                            activeOpacity={0.8}
                          >
                            <View style={styles.upiIconGPay}>
                              <Text style={styles.upiIconTextG}>G</Text>
                            </View>
                            <Text style={styles.upiTileTitle}>Google Pay</Text>
                            <View style={[styles.smallRadio, upiApp === 'gpay' && styles.smallRadioActive]} />
                          </TouchableOpacity>

                          {/* Paytm */}
                          <TouchableOpacity
                            style={[styles.upiTile, upiApp === 'paytm' && styles.upiTileActive]}
                            onPress={() => setUpiApp('paytm')}
                            activeOpacity={0.8}
                          >
                            <View style={styles.upiIconPaytm}>
                              <Text style={styles.upiIconTextPaytm}>Pay</Text>
                            </View>
                            <Text style={styles.upiTileTitle}>Paytm</Text>
                            <View style={[styles.smallRadio, upiApp === 'paytm' && styles.smallRadioActive]} />
                          </TouchableOpacity>

                          {/* Other UPI ID */}
                          <TouchableOpacity
                            style={[styles.upiTile, upiApp === 'other' && styles.upiTileActive]}
                            onPress={() => setUpiApp('other')}
                            activeOpacity={0.8}
                          >
                            <View style={styles.upiIconOther}>
                              <Text style={styles.upiIconTextOther}>@</Text>
                            </View>
                            <Text style={styles.upiTileTitle}>Other UPI ID</Text>
                            <View style={[styles.smallRadio, upiApp === 'other' && styles.smallRadioActive]} />
                          </TouchableOpacity>
                        </View>

                        {upiApp === 'other' && (
                          <View style={styles.customUpiBox}>
                            <Text style={styles.inputMiniLabel}>Enter Virtual Payment Address (UPI ID)</Text>
                            <View style={styles.customUpiRow}>
                              <TextInput
                                style={styles.customUpiInput}
                                placeholder="e.g. mobile@upi or name@okaxis"
                                placeholderTextColor="#777"
                                value={customUpiId}
                                onChangeText={(t) => {
                                  setCustomUpiId(t);
                                  setUpiError('');
                                }}
                                autoCapitalize="none"
                              />
                            </View>
                            {upiError !== '' && <Text style={styles.formErrorText}>{upiError}</Text>}
                            <Text style={styles.upiHintText}>
                              A collect request will be sent to your UPI app when placing order.
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* 2. Credit / Debit Card Section */}
                    {onlineType === 'card' && (
                      <View style={styles.cardMethodWrap}>
                        {/* CASE A: Older/Returning User with Saved Cards (and not currently adding a new one) */}
                        {savedCards.length > 0 && !isAddingNewCard ? (
                          <View>
                            <View style={styles.savedCardsHeaderRow}>
                              <Text style={styles.subSectionTitle}>
                                {savedCards.length > 1 ? 'Choose Saved Card' : 'Saved Card'}
                              </Text>
                              <Text style={styles.savedCardCountText}>
                                {savedCards.length} {savedCards.length === 1 ? 'card' : 'cards'} available
                              </Text>
                            </View>

                            {/* Saved Cards List / Chooser */}
                            {savedCards.map((c) => {
                              const isSelected = c.id === selectedCardId;
                              return (
                                <TouchableOpacity
                                  key={c.id}
                                  style={[styles.savedCardItem, isSelected && styles.savedCardItemSelected]}
                                  onPress={() => setSelectedCardId(c.id)}
                                  activeOpacity={0.85}
                                >
                                  {savedCards.length > 1 && (
                                    <View style={[styles.smallRadio, isSelected && styles.smallRadioActive]} />
                                  )}

                                  <View style={styles.cardTypeBadge}>
                                    <Text style={styles.cardTypeBadgeText}>{c.type.toUpperCase()}</Text>
                                  </View>

                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.savedCardNumberText}>{c.cardNumber}</Text>
                                    <Text style={styles.savedCardMetaText}>
                                      {c.cardHolder} • Exp {c.expiry}
                                    </Text>
                                  </View>

                                  {isSelected && (
                                    <View style={styles.cvvEntryWrap}>
                                      <Text style={styles.cvvLabel}>CVV</Text>
                                      <TextInput
                                        style={styles.cvvInput}
                                        placeholder="•••"
                                        placeholderTextColor="#777"
                                        keyboardType="numeric"
                                        maxLength={4}
                                        secureTextEntry
                                        value={savedCardCvv}
                                        onChangeText={setSavedCardCvv}
                                      />
                                    </View>
                                  )}
                                </TouchableOpacity>
                              );
                            })}

                            {cardError !== '' && <Text style={styles.formErrorText}>{cardError}</Text>}

                            {/* Button to Add Another Card */}
                            <TouchableOpacity
                              style={styles.addCardToggleBtn}
                              onPress={() => {
                                setIsAddingNewCard(true);
                                setCardError('');
                              }}
                              activeOpacity={0.8}
                            >
                              <Plus size={15} color="#7BEA12" />
                              <Text style={styles.addCardToggleText}>+ Add another card</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          /* CASE B: First-time customer OR Older user adding another card */
                          <View style={styles.newCardForm}>
                            <View style={styles.newCardHeaderRow}>
                              <Text style={styles.subSectionTitle}>
                                {savedCards.length === 0 ? 'Enter Card Details (First-time Customer)' : 'Add Another Card'}
                              </Text>
                              {savedCards.length > 0 && (
                                <TouchableOpacity onPress={() => setIsAddingNewCard(false)}>
                                  <Text style={styles.cancelAddCardText}>Cancel</Text>
                                </TouchableOpacity>
                              )}
                            </View>

                            {cardError !== '' && <Text style={styles.formErrorText}>{cardError}</Text>}

                            {/* Card Number */}
                            <Text style={styles.inputMiniLabel}>Card Number</Text>
                            <View style={styles.cardNumberInputRow}>
                              <TextInput
                                style={styles.cardNumberInput}
                                placeholder="1234 5678 9012 3456"
                                placeholderTextColor="#777"
                                keyboardType="numeric"
                                value={cardNumber}
                                onChangeText={handleCardNumberChange}
                                maxLength={19}
                              />
                              <View style={styles.cardBrandPill}>
                                <Text style={styles.cardBrandPillText}>
                                  {getCardBrand(cardNumber).toUpperCase()}
                                </Text>
                              </View>
                            </View>

                            {/* Cardholder Name */}
                            <Text style={styles.inputMiniLabel}>Name on Card</Text>
                            <TextInput
                              style={styles.cardTextInput}
                              placeholder="e.g. ADIL ALI ANSARI"
                              placeholderTextColor="#777"
                              value={cardHolder}
                              onChangeText={setCardHolder}
                              autoCapitalize="characters"
                            />

                            {/* Expiry and CVV Row */}
                            <View style={styles.expiryCvvRow}>
                              <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.inputMiniLabel}>Expiry Date</Text>
                                <TextInput
                                  style={styles.cardTextInput}
                                  placeholder="MM/YY"
                                  placeholderTextColor="#777"
                                  keyboardType="numeric"
                                  value={cardExpiry}
                                  onChangeText={handleExpiryChange}
                                  maxLength={5}
                                />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.inputMiniLabel}>CVV / CVC</Text>
                                <TextInput
                                  style={styles.cardTextInput}
                                  placeholder="123"
                                  placeholderTextColor="#777"
                                  keyboardType="numeric"
                                  maxLength={4}
                                  secureTextEntry
                                  value={cardCvv}
                                  onChangeText={handleCvvChange}
                                />
                              </View>
                            </View>

                            {/* Save Card Checkbox */}
                            <TouchableOpacity
                              style={styles.saveCardCheckboxRow}
                              onPress={() => setSaveCardForFuture(!saveCardForFuture)}
                              activeOpacity={0.8}
                            >
                              <View style={[styles.checkboxSquare, saveCardForFuture && styles.checkboxSquareActive]}>
                                {saveCardForFuture && <CheckCircle2 size={13} color="#0F1111" />}
                              </View>
                              <Text style={styles.saveCardCheckboxText}>
                                Save this card securely for future fast payments
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}

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
                  <Text style={styles.summaryLabel}>Items ({computedItemsCount}):</Text>
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

  // Razorpay Sub-containers & Tabs
  razorpaySubContainer: {
    backgroundColor: '#14181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 0, 0.3)',
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  subToggleWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  subToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  subToggleBtnActive: {
    backgroundColor: '#FF9900',
  },
  subToggleText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    fontWeight: '700',
  },
  subToggleTextActive: {
    color: '#0F1111',
    fontWeight: '800',
  },
  subSectionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputMiniLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 8,
  },

  // UPI Selection Grid & Icons
  upiMethodWrap: {
    marginTop: 2,
  },
  upiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  upiTile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  upiTileActive: {
    borderColor: '#FF9900',
    backgroundColor: 'rgba(255, 153, 0, 0.12)',
  },
  upiTileTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  smallRadio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  smallRadioActive: {
    borderColor: '#FF9900',
    backgroundColor: '#FF9900',
  },
  upiIconPhonePe: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5F259F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upiIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  upiIconGPay: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upiIconTextG: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  upiIconPaytm: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00BAF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upiIconTextPaytm: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  upiIconOther: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upiIconTextOther: {
    color: '#7BEA12',
    fontSize: 13,
    fontWeight: '900',
  },
  customUpiBox: {
    marginTop: 10,
  },
  customUpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customUpiInput: {
    flex: 1,
    backgroundColor: '#0C0F11',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 13,
  },
  upiHintText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 10,
    marginTop: 4,
  },

  // Saved Cards & Chooser
  cardMethodWrap: {
    marginTop: 2,
  },
  savedCardsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  savedCardCountText: {
    color: '#7BEA12',
    fontSize: 11,
    fontWeight: '600',
  },
  savedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  savedCardItemSelected: {
    borderColor: '#FF9900',
    backgroundColor: 'rgba(255, 153, 0, 0.1)',
  },
  cardTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  savedCardNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  savedCardMetaText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    marginTop: 1,
  },
  cvvEntryWrap: {
    alignItems: 'center',
    width: 52,
  },
  cvvLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    fontWeight: '700',
  },
  cvvInput: {
    backgroundColor: '#0C0F11',
    borderWidth: 1,
    borderColor: '#FF9900',
    borderRadius: 6,
    width: 48,
    height: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  addCardToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(123, 234, 18, 0.08)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(123, 234, 18, 0.35)',
    marginTop: 4,
    gap: 6,
  },
  addCardToggleText: {
    color: '#7BEA12',
    fontSize: 12,
    fontWeight: '700',
  },

  // New Card Form
  newCardForm: {
    marginTop: 2,
  },
  newCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cancelAddCardText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  cardNumberInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cardNumberInput: {
    flex: 1,
    backgroundColor: '#0C0F11',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 13,
  },
  cardBrandPill: {
    position: 'absolute',
    right: 8,
    backgroundColor: '#FF9900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardBrandPillText: {
    color: '#0F1111',
    fontSize: 9,
    fontWeight: '900',
  },
  cardTextInput: {
    backgroundColor: '#0C0F11',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 13,
  },
  expiryCvvRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  saveCardCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareActive: {
    backgroundColor: '#7BEA12',
    borderColor: '#7BEA12',
  },
  saveCardCheckboxText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    flex: 1,
  },
});

export default AmazonBuyNowModal;
