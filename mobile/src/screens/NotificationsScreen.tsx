import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  FileText,
  Tv,
  AlertCircle,
  Zap,
  ShoppingBag,
} from 'lucide-react-native';
import DarkGradientBg from '../components/DarkGradientBg';
import api from '../services/api';

type AppNotification = {
  _id: string; title: string; message: string; type: "pdf" | "system";
  read: boolean; createdAt: string; pdf?: any;
};

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  type: string;
  time: string;
  read: boolean;
  pdfId?: string;
}

const fallbackNotifications: NotificationItem[] = [
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
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(fallbackNotifications);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const res = await api.get<any>('/api/notifications');
      if (res && res.notifications && res.notifications.length > 0) {
        const mapped: NotificationItem[] = res.notifications.map((n: any) => ({
          id: n._id || n.id,
          title: n.title,
          desc: n.message,
          type: n.type === 'pdf_added' ? 'pdf' : n.type === 'order' ? 'order' : n.type || 'system',
          time: new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          read: Boolean(n.read),
          pdfId: n.pdfId?._id || n.pdfId,
        }));
        setNotifications(mapped);
      }
    } catch (err: any) {
      console.warn('Could not fetch live notifications, using fallback:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    try {
      await api.put('/api/notifications/read-all');
    } catch {}
  };

  const handleNotificationPress = async (item: NotificationItem) => {
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    try {
      if (item.id && !item.id.startsWith('notif-')) {
        await api.put(`/api/notifications/${item.id}/read`);
      }
    } catch {}

    // Navigate based on type
    if (item.type === 'pdf' || item.type === 'pdf_added' || item.pdfId) {
      navigation.navigate('PDFLibrary');
    } else if (item.type === 'order') {
      navigation.navigate('History');
    }
  };

  const timeAgo = (date: string) => {
    const ms = Math.max(0, Date.now() - new Date(date).getTime());
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchNotifications(true)}
                tintColor="#69D900"
                colors={['#69D900']}
              />
            }
          >
            {notifications.map((n) => (
              <TouchableOpacity
                key={n.id}
                style={[styles.notifCard, !n.read && styles.notifCardUnread]}
                onPress={() => handleNotificationPress(n)}
                activeOpacity={0.75}
              >
                <View style={styles.iconWrap}>
                  {n.type === 'pdf' || n.type === 'pdf_added' ? (
                    <FileText size={18} color="#69D900" />
                  ) : n.type === 'order' ? (
                    <ShoppingBag size={18} color="#FF9900" />
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
              </TouchableOpacity>
            ))}

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </DarkGradientBg>
  );
};

const styles = StyleSheet.create({
  screenBg: { flex: 1, backgroundColor: "transparent" }, container: { flex: 1, backgroundColor: "transparent" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(105, 217, 0, 0.15)", backgroundColor: "rgba(18, 18, 24, 0.85)", gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(27, 27, 41, 0.85)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
  headerTitleWrap: { flex: 1 }, headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" }, headerSubtitle: { color: "#69D900", fontSize: 11, fontWeight: "600" },
  markReadText: { color: "#69D900", fontSize: 12, fontWeight: "700" }, scrollView: { flex: 1 }, scrollContent: { padding: 16, gap: 12 },
  notifCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "rgba(18, 22, 16, 0.8)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.06)" },
  notifCardUnread: { borderColor: "rgba(105, 217, 0, 0.3)", backgroundColor: "rgba(18, 22, 16, 0.95)" },
  iconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(27, 27, 41, 0.85)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.08)" },
  notifTextWrap: { flex: 1 }, notifHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  notifTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", flex: 1 }, notifDesc: { color: "#B8B8C2", fontSize: 12, lineHeight: 17, marginTop: 4 },
  notifTime: { color: "#8D8D94", fontSize: 10, marginTop: 6 }, unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#69D900", marginLeft: 6 },
  errorText: { color: "#FF8888", padding: 16 }, empty: { marginTop: 70, alignItems: "center", padding: 24, gap: 12 }, emptyText: { color: "#B8B8C2", textAlign: "center", lineHeight: 20 },
});
export default NotificationsScreen;
