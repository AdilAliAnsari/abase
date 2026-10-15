import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, FileText, Zap, AlertCircle, Bell } from "lucide-react-native";
import DarkGradientBg from "../components/DarkGradientBg";
import api from "../services/api";

type AppNotification = {
  _id: string; title: string; message: string; type: "pdf" | "system";
  read: boolean; createdAt: string; pdf?: any;
};

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const result = await api.get<{ success: boolean; notifications: AppNotification[]; unreadCount: number }>("/api/notifications");
      setNotifications(result.notifications || []);
      setUnreadCount(result.unreadCount || 0);
    } catch (e: any) {
      setError(e?.message || "Could not load notifications. Please sign in and try again.");
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadNotifications(); }, [loadNotifications]));

  const markAllAsRead = async () => {
    try {
      await api.patch("/api/notifications/read-all", {});
      setNotifications(current => current.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e: any) { setError(e?.message || "Could not update notifications."); }
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

  return <DarkGradientBg><View style={styles.screenBg}><SafeAreaView style={styles.container} edges={["top"]}>
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><ArrowLeft size={20} color="#FFFFFF" /></TouchableOpacity>
      <View style={styles.headerTitleWrap}><Text style={styles.headerTitle}>Notifications & Alerts</Text><Text style={styles.headerSubtitle}>{unreadCount} unread • New study uploads</Text></View>
      <TouchableOpacity onPress={markAllAsRead} disabled={unreadCount === 0}><Text style={[styles.markReadText, unreadCount === 0 && { opacity: 0.4 }]}>Read All</Text></TouchableOpacity>
    </View>
    {loading ? <ActivityIndicator style={{ marginTop: 30 }} color="#69D900" /> : <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications(true)} tintColor="#69D900" />}>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {!notifications.length && !error && <View style={styles.empty}><Bell size={30} color="#69D900" /><Text style={styles.emptyText}>No notifications yet. New PDFs from distributors will appear here.</Text></View>}
      {notifications.map(n => <TouchableOpacity key={n._id} onPress={() => {
        if (n.type === "pdf") navigation.navigate("PDFLibrary");
        api.patch(`/api/notifications/${n._id}/read`, {}).catch(() => {});
        setNotifications(current => current.map(item => item._id === n._id ? { ...item, read: true } : item));
        if (!n.read) setUnreadCount(count => Math.max(0, count - 1));
      }} style={[styles.notifCard, !n.read && styles.notifCardUnread]}>
        <View style={styles.iconWrap}>{n.type === "pdf" ? <FileText size={18} color="#69D900" /> : n.type === "system" ? <Zap size={18} color="#A855F7" /> : <AlertCircle size={18} color="#FF9900" />}</View>
        <View style={styles.notifTextWrap}><View style={styles.notifHeaderRow}><Text style={styles.notifTitle}>{n.title}</Text>{!n.read && <View style={styles.unreadDot} />}</View><Text style={styles.notifDesc}>{n.message}</Text><Text style={styles.notifTime}>{timeAgo(n.createdAt)}</Text></View>
      </TouchableOpacity>)}
      <View style={{ height: 40 }} />
    </ScrollView>}
  </SafeAreaView></View></DarkGradientBg>;
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
