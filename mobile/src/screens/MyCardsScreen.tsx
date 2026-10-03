import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CreditCard,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Lock,
  Wallet,
  Sparkles,
  X,
  Building2,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MyCardsScreenProps {
  navigation: any;
}

interface CardItem {
  id: string;
  type: 'visa' | 'mastercard' | 'rupay' | 'upi';
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  isDefault: boolean;
  bgGradient: [string, string];
}

export const MyCardsScreen: React.FC<MyCardsScreenProps> = ({ navigation }) => {
  const [cards, setCards] = useState<CardItem[]>([
    {
      id: 'card-1',
      type: 'visa',
      cardNumber: '•••• •••• •••• 4289',
      cardHolder: 'ADIL ALI ANSARI',
      expiry: '08/28',
      isDefault: true,
      bgGradient: ['#0A4D68', '#088395'],
    },
    {
      id: 'card-2',
      type: 'mastercard',
      cardNumber: '•••• •••• •••• 9812',
      cardHolder: 'ADIL ALI ANSARI',
      expiry: '11/27',
      isDefault: false,
      bgGradient: ['#3A1078', '#4E31AA'],
    },
  ]);

  const [walletBalance, setWalletBalance] = useState('₹1,450.00');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newCvv, setNewCvv] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCard = () => {
    if (!newCardNumber || !newCardHolder) {
      showToast('Please enter card details');
      return;
    }
    const newCard: CardItem = {
      id: `card-${Date.now()}`,
      type: 'visa',
      cardNumber: `•••• •••• •••• ${newCardNumber.slice(-4) || '1234'}`,
      cardHolder: newCardHolder.toUpperCase(),
      expiry: newExpiry || '12/29',
      isDefault: false,
      bgGradient: ['#1B4D3E', '#2E8B57'],
    };
    setCards([...cards, newCard]);
    setIsAddModalOpen(false);
    setNewCardNumber('');
    setNewCardHolder('');
    setNewExpiry('');
    setNewCvv('');
    showToast('Payment card added successfully!');
  };

  const handleSetDefault = (id: string) => {
    setCards(
      cards.map((c) => ({
        ...c,
        isDefault: c.id === id,
      }))
    );
    showToast('Default card updated');
  };

  return (
    <DarkGradientBg>
      <View style={styles.screenBg}>
        <SafeAreaView style={styles.container} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>My Cards & Wallet</Text>
              <Text style={styles.headerSubtitle}>Payment methods for books & notes</Text>
            </View>
            <TouchableOpacity
              style={styles.addIconBtn}
              onPress={() => setIsAddModalOpen(true)}
            >
              <Plus size={18} color="#0B2405" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Student Wallet Pass Banner */}
            <View style={styles.walletCard}>
              <View style={styles.walletTop}>
                <View style={styles.walletTitleRow}>
                  <Wallet size={18} color="#69D900" />
                  <Text style={styles.walletTitle}>EduStore Student Wallet</Text>
                </View>
                <View style={styles.verifiedTag}>
                  <ShieldCheck size={12} color="#0B2405" />
                  <Text style={styles.verifiedTagText}>Encrypted</Text>
                </View>
              </View>

              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>{walletBalance}</Text>

              <View style={styles.walletActions}>
                <TouchableOpacity
                  style={styles.walletBtn}
                  onPress={() => showToast('Instant Recharge simulated')}
                >
                  <Text style={styles.walletBtnText}>+ Add Money</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.walletBtn, styles.walletBtnOutline]}
                  onPress={() => navigation.navigate('PurchaseHistory')}
                >
                  <Text style={styles.walletBtnOutlineText}>Passbook</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Saved Credit / Debit Cards Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Payment Cards</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(true)}>
                <Text style={styles.addCardLink}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {/* Render Cards */}
            <View style={styles.cardsList}>
              {cards.map((card) => (
                <View key={card.id} style={styles.cardWrapper}>
                  <LinearGradient
                    colors={card.bgGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardTop}>
                      <CreditCard size={24} color="#FFFFFF" />
                      <Text style={styles.cardType}>{card.type.toUpperCase()}</Text>
                    </View>

                    <Text style={styles.cardNumberText}>{card.cardNumber}</Text>

                    <View style={styles.cardBottom}>
                      <View>
                        <Text style={styles.cardLabel}>CARD HOLDER</Text>
                        <Text style={styles.cardValue}>{card.cardHolder}</Text>
                      </View>
                      <View>
                        <Text style={styles.cardLabel}>EXPIRES</Text>
                        <Text style={styles.cardValue}>{card.expiry}</Text>
                      </View>
                    </View>
                  </LinearGradient>

                  {/* Card Actions */}
                  <View style={styles.cardControlsRow}>
                    <TouchableOpacity
                      style={styles.defaultCheckRow}
                      onPress={() => handleSetDefault(card.id)}
                    >
                      <View style={[styles.checkbox, card.isDefault && styles.checkboxActive]} />
                      <Text style={styles.defaultText}>
                        {card.isDefault ? 'Default Payment Card' : 'Set as Default'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setCards(cards.filter((c) => c.id !== card.id));
                        showToast('Card removed');
                      }}
                    >
                      <Trash2 size={16} color="#8D8D94" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Student Discount Subscription Pass */}
            <View style={styles.passCard}>
              <Sparkles size={20} color="#69D900" />
              <View style={{ flex: 1 }}>
                <Text style={styles.passTitle}>VTU Student VIP All-Access Pass</Text>
                <Text style={styles.passSubtitle}>
                  Unlimited free downloads for all 2022 Scheme notes & video lectures
                </Text>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Add Card Modal */}
          <Modal
            visible={isAddModalOpen}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsAddModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Payment Card</Text>
                  <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                    <X size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="4532 •••• •••• 8912"
                  placeholderTextColor="#8D8D94"
                  keyboardType="numeric"
                  value={newCardNumber}
                  onChangeText={setNewCardNumber}
                />

                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Adil Ali Ansari"
                  placeholderTextColor="#8D8D94"
                  value={newCardHolder}
                  onChangeText={setNewCardHolder}
                />

                <View style={styles.rowInputs}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Expiry (MM/YY)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="08/28"
                      placeholderTextColor="#8D8D94"
                      value={newExpiry}
                      onChangeText={setNewExpiry}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="•••"
                      placeholderTextColor="#8D8D94"
                      secureTextEntry
                      keyboardType="numeric"
                      value={newCvv}
                      onChangeText={setNewCvv}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setIsAddModalOpen(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSubmitBtn}
                    onPress={handleAddCard}
                  >
                    <Text style={styles.modalSubmitText}>Save Card</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Toast */}
          {toastMessage && (
            <View style={styles.toast}>
              <CheckCircle2 size={16} color="#69D900" />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          )}
        </SafeAreaView>
      </View>
    </DarkGradientBg>
  );
};

const styles = StyleSheet.create({
  screenBg: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(105, 217, 0, 0.15)',
    backgroundColor: 'rgba(18, 18, 24, 0.85)',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  headerSubtitle: { color: '#69D900', fontSize: 11, fontWeight: '600' },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#69D900',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  walletCard: {
    backgroundColor: 'rgba(18, 22, 16, 0.85)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#69D900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: { color: '#0B2405', fontSize: 9, fontWeight: '800' },
  balanceLabel: { color: '#8D8D94', fontSize: 11 },
  balanceAmount: { color: '#69D900', fontSize: 26, fontWeight: '900', marginVertical: 4 },
  walletActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  walletBtn: {
    flex: 1,
    backgroundColor: '#69D900',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  walletBtnText: { color: '#0B2405', fontSize: 13, fontWeight: '800' },
  walletBtnOutline: {
    backgroundColor: 'rgba(27, 27, 41, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.3)',
  },
  walletBtnOutlineText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  addCardLink: { color: '#69D900', fontSize: 13, fontWeight: '700' },
  cardsList: { gap: 14 },
  cardWrapper: {
    backgroundColor: 'rgba(18, 18, 24, 0.85)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardGradient: {
    padding: 18,
    height: 160,
    justifyContent: 'space-between',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardType: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  cardNumberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    marginVertical: 10,
  },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 9, fontWeight: '700' },
  cardValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  cardControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(27, 27, 41, 0.5)',
  },
  defaultCheckRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8D8D94',
  },
  checkboxActive: { backgroundColor: '#69D900', borderColor: '#69D900' },
  defaultText: { color: '#B8B8C2', fontSize: 12 },
  passCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(18, 22, 16, 0.8)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
  },
  passTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  passSubtitle: { color: '#8D8D94', fontSize: 11, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#121218',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  inputLabel: { color: '#B8B8C2', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  modalInput: {
    height: 42,
    backgroundColor: 'rgba(27, 27, 41, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 12,
  },
  rowInputs: { flexDirection: 'row', gap: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  modalCancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  modalCancelText: { color: '#B8B8C2', fontSize: 13 },
  modalSubmitBtn: {
    backgroundColor: '#69D900',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSubmitText: { color: '#0B2405', fontSize: 13, fontWeight: '800' },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(18, 18, 24, 0.95)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#69D900',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 8,
  },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});

export default MyCardsScreen;
