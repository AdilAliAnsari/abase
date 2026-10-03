import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Mail,
  Search,
  CheckCheck,
  Send,
  GraduationCap,
  BadgeCheck,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';

interface InboxScreenProps {
  navigation: any;
}

export const InboxScreen: React.FC<InboxScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const messages = [
    {
      id: 'msg-1',
      sender: 'Prof. Ramesh Kumar',
      role: 'Dept of CSE, RVCE',
      avatarText: 'RK',
      subject: 'Clarification on BCS304 AVL Tree Rotations',
      preview: 'Hello Adil, for double rotations (RL and LR), remember the intermediate pivot node...',
      time: '10:45 AM',
      unread: true,
      verified: true,
    },
    {
      id: 'msg-2',
      sender: 'Dr. Ananya Sharma',
      role: 'HOD DBMS, BMSCE',
      avatarText: 'AS',
      subject: 'BCS501 2022 Scheme Model Question Solutions',
      preview: 'I have updated Module 3 SQL queries in the Drive PDF. You can download the refreshed copy.',
      time: 'Yesterday',
      unread: false,
      verified: true,
    },
    {
      id: 'msg-3',
      sender: 'VTU Exam Academic Desk',
      role: 'Official Notification',
      avatarText: 'VTU',
      subject: 'Submission of 5th Sem Mini Project Synopsis',
      preview: 'Please submit your BCS601 project synopses before the end of the month.',
      time: '2 days ago',
      unread: false,
      verified: true,
    },
  ];

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
              <Text style={styles.headerTitle}>Faculty Messages & Inbox</Text>
              <Text style={styles.headerSubtitle}>Direct communication with lecturers</Text>
            </View>
          </View>

          {/* Search bar */}
          <View style={styles.searchWrap}>
            <Search size={16} color="#8D8D94" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search faculty messages, doubts & subjects..."
              placeholderTextColor="#8D8D94"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <TouchableOpacity
                key={msg.id}
                style={[styles.msgCard, msg.unread && styles.msgCardUnread]}
                activeOpacity={0.8}
                onPress={() => setSelectedChat(msg.id === selectedChat ? null : msg.id)}
              >
                <View style={styles.msgTopRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{msg.avatarText}</Text>
                  </View>

                  <View style={styles.senderInfo}>
                    <View style={styles.senderNameRow}>
                      <Text style={styles.senderName}>{msg.sender}</Text>
                      {msg.verified && <BadgeCheck size={13} color="#69D900" />}
                    </View>
                    <Text style={styles.senderRole}>{msg.role}</Text>
                  </View>

                  <Text style={styles.msgTime}>{msg.time}</Text>
                </View>

                <Text style={styles.msgSubject}>{msg.subject}</Text>
                <Text style={styles.msgPreview}>{msg.preview}</Text>

                {selectedChat === msg.id && (
                  <View style={styles.replyBox}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder={`Reply to ${msg.sender}...`}
                      placeholderTextColor="#8D8D94"
                      value={replyText}
                      onChangeText={setReplyText}
                    />
                    <TouchableOpacity
                      style={styles.sendBtn}
                      onPress={() => {
                        setReplyText('');
                        setSelectedChat(null);
                      }}
                    >
                      <Send size={15} color="#0B2405" />
                    </TouchableOpacity>
                  </View>
                )}
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.18)',
    gap: 8,
    height: 42,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 13 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 4, gap: 12 },
  msgCard: {
    backgroundColor: 'rgba(18, 22, 16, 0.8)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  msgCardUnread: {
    borderColor: 'rgba(105, 217, 0, 0.35)',
    backgroundColor: 'rgba(18, 22, 16, 0.95)',
  },
  msgTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(105, 217, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#69D900',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#69D900', fontSize: 13, fontWeight: '800' },
  senderInfo: { flex: 1 },
  senderNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  senderName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  senderRole: { color: '#8D8D94', fontSize: 11 },
  msgTime: { color: '#8D8D94', fontSize: 10 },
  msgSubject: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  msgPreview: { color: '#B8B8C2', fontSize: 12, lineHeight: 17 },
  replyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  replyInput: {
    flex: 1,
    height: 38,
    backgroundColor: 'rgba(27, 27, 41, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#FFFFFF',
    fontSize: 12,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#69D900',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InboxScreen;
