import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  FileText,
  Tv,
  AlertCircle,
  Zap,
  Trash2,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';

interface NotificationsScreenProps {
  navigation: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New 2022 Scheme Module Notes Uploaded',
      desc: 'Prof. Ramesh Kumar just uploaded BCS304 Module 5 Graph Algorithms notes & solved papers.',
      type: 'pdf',
      time: '15 mins ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'VTU Exam Timetable Released',
      desc: '3rd & 5th Semester examination schedule has been officially published for CSE & ISE branches.',
      type: 'alert',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Video Lecture Download Complete',
      desc: '"Database Management Systems Crash Course" is ready for offline playback in MX Player.',
      type: 'video',
      time: 'Yesterday',
      read: true,
    },
    {
      id: 'notif-4',
      title: 'Email Verification Reminder',
      desc: 'Verify your student email address to enable fast 1-click downloads and digital access passes.',
      type: 'system',
      time: '3 days ago',
      read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
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
              <Text style={styles.headerTitle}>Notifications & Alerts</Text>
              <Text style={styles.headerSubtitle}>Exam updates, new uploads & alerts</Text>
            </View>
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markReadText}>Read All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {notifications.map((n) => (
              <View
                key={n.id}
                style={[styles.notifCard, !n.read && styles.notifCardUnread]}
              >
                <View style={styles.iconWrap}>
                  {n.type === 'pdf' ? (
                    <FileText size={18} color="#69D900" />
                  ) : n.type === 'video' ? (
                    <Tv size={18} color="#00D2FF" />
                  ) : n.type === 'alert' ? (
                    <AlertCircle size={18} color="#FF9900" />
                  ) : (
                    <Zap size={18} color="#A855F7" />
                  )}
                </View>

                <View style={styles.notifTextWrap}>
                  <View style={styles.notifHeaderRow}>
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    {!n.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifDesc}>{n.desc}</Text>
                  <Text style={styles.notifTime}>{n.time}</Text>
                </View>
              </View>
            ))}

            <View style={{ height: 40 }} />
          </ScrollView>
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
  markReadText: { color: '#69D900', fontSize: 12, fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(18, 22, 16, 0.8)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  notifCardUnread: {
    borderColor: 'rgba(105, 217, 0, 0.3)',
    backgroundColor: 'rgba(18, 22, 16, 0.95)',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  notifTextWrap: { flex: 1 },
  notifHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#69D900', marginLeft: 6 },
  notifDesc: { color: '#B8B8C2', fontSize: 12, lineHeight: 17, marginTop: 4 },
  notifTime: { color: '#8D8D94', fontSize: 10, marginTop: 6 },
});

export default NotificationsScreen;
