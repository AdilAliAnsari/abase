import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clock,
  FileText,
  Tv,
  BookOpen,
  Download,
  Receipt,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HistoryScreenProps {
  navigation: any;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'video' | 'book'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const orders = [
    {
      id: 'ORD-98214',
      title: 'Data Structures & Applications (BCS304) — Complete 2022 Scheme Notes',
      itemType: 'pdf',
      author: 'Prof. Ramesh Kumar',
      date: 'Today, 04:30 PM',
      price: '₹49.00',
      status: 'Downloaded',
      invoiceId: 'INV-2024-001',
    },
    {
      id: 'ORD-97452',
      title: 'Database Management Systems (BCS501) — Video Masterclass',
      itemType: 'video',
      author: 'Dr. Ananya Sharma',
      date: 'Yesterday, 11:15 AM',
      price: '₹199.00',
      status: 'Active Access',
      invoiceId: 'INV-2024-002',
    },
    {
      id: 'ORD-95120',
      title: 'Operating Systems Solved Question Bank (BCS402)',
      itemType: 'pdf',
      author: 'Prof. S. N. Murthy',
      date: '28 Sep 2024',
      price: '₹49.00',
      status: 'Downloaded',
      invoiceId: 'INV-2024-003',
    },
    {
      id: 'ORD-93041',
      title: 'The Design of Everyday Things (Physical Edition)',
      itemType: 'book',
      author: 'Don Norman',
      date: '24 Sep 2024',
      price: '₹499.00',
      status: 'Delivered',
      invoiceId: 'INV-2024-004',
    },
  ];

  const filteredOrders = orders.filter(
    (o) => filterType === 'all' || o.itemType === filterType
  );

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
              <Text style={styles.headerTitle}>Order & Study History</Text>
              <Text style={styles.headerSubtitle}>Purchased notes, lectures & books</Text>
            </View>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterBar}>
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'pdf', label: 'VTU Notes' },
              { key: 'video', label: 'Video Courses' },
              { key: 'book', label: 'Books' },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, filterType === f.key && styles.filterChipActive]}
                onPress={() => setFilterType(f.key as any)}
              >
                <Text style={[styles.filterChipText, filterType === f.key && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderIdBox}>
                    {order.itemType === 'pdf' ? (
                      <FileText size={16} color="#69D900" />
                    ) : order.itemType === 'video' ? (
                      <Tv size={16} color="#00D2FF" />
                    ) : (
                      <BookOpen size={16} color="#FF9900" />
                    )}
                    <Text style={styles.orderIdText}>{order.id}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <CheckCircle2 size={12} color="#0B2405" />
                    <Text style={styles.statusBadgeText}>{order.status}</Text>
                  </View>
                </View>

                <Text style={styles.orderTitle}>{order.title}</Text>
                <Text style={styles.orderAuthor}>By {order.author}</Text>

                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.orderDate}>{order.date}</Text>
                    <Text style={styles.orderPrice}>{order.price}</Text>
                  </View>

                  <View style={styles.actionBtns}>
                    <TouchableOpacity
                      style={styles.receiptBtn}
                      onPress={() => showToast(`Receipt ${order.invoiceId} downloaded`)}
                    >
                      <Receipt size={14} color="#B8B8C2" />
                      <Text style={styles.receiptBtnText}>Invoice</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.reDownloadBtn}
                      onPress={() => {
                        if (order.itemType === 'video') {
                          navigation.navigate('Video');
                        } else {
                          showToast(`Accessing "${order.title}"`);
                        }
                      }}
                    >
                      <Text style={styles.reDownloadBtnText}>
                        {order.itemType === 'video' ? 'Watch Now' : 'View Drive'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <View style={{ height: 40 }} />
          </ScrollView>

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
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(27, 27, 41, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: { backgroundColor: '#69D900', borderColor: '#7BEA12' },
  filterChipText: { color: '#B8B8C2', fontSize: 11, fontWeight: '600' },
  filterChipTextActive: { color: '#0B2405', fontWeight: '800' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  orderCard: {
    backgroundColor: 'rgba(18, 22, 16, 0.8)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.18)',
    gap: 8,
  },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderIdBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderIdText: { color: '#B8B8C2', fontSize: 12, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#69D900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: { color: '#0B2405', fontSize: 10, fontWeight: '800' },
  orderTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', lineHeight: 19 },
  orderAuthor: { color: '#69D900', fontSize: 12, fontWeight: '600' },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
    marginTop: 4,
  },
  orderDate: { color: '#8D8D94', fontSize: 11 },
  orderPrice: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginTop: 2 },
  actionBtns: { flexDirection: 'row', gap: 8 },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(27, 27, 41, 0.8)',
  },
  receiptBtnText: { color: '#B8B8C2', fontSize: 11, fontWeight: '600' },
  reDownloadBtn: {
    backgroundColor: '#69D900',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reDownloadBtnText: { color: '#0B2405', fontSize: 11, fontWeight: '800' },
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

export default HistoryScreen;
