import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  PieChart,
  TrendingUp,
  Clock,
  BookOpen,
  FileText,
  Tv,
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StatisticsScreenProps {
  navigation: any;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ navigation }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('week');

  const stats = {
    studyHours: '42.5 hrs',
    pdfsRead: 18,
    videosWatched: 24,
    streakDays: 12,
    completionRate: '86%',
    topSubject: 'Data Structures (BCS304)',
  };

  const subjectBreakdown = [
    { subject: 'Data Structures & Applications', code: 'BCS304', hours: '14.2 hrs', percent: 34, color: '#69D900' },
    { subject: 'Database Management Systems', code: 'BCS501', hours: '11.8 hrs', percent: 28, color: '#00D2FF' },
    { subject: 'Operating Systems', code: 'BCS402', hours: '9.5 hrs', percent: 22, color: '#FF9900' },
    { subject: 'AI & Machine Learning', code: 'BAI502', hours: '7.0 hrs', percent: 16, color: '#A855F7' },
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 4.5, active: true },
    { day: 'Tue', hours: 6.0, active: true },
    { day: 'Wed', hours: 7.2, active: true },
    { day: 'Thu', hours: 5.8, active: true },
    { day: 'Fri', hours: 8.0, active: true },
    { day: 'Sat', hours: 6.5, active: true },
    { day: 'Sun', hours: 4.5, active: true },
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
              <Text style={styles.headerTitle}>Study Analytics & Stats</Text>
              <Text style={styles.headerSubtitle}>VTU Academic Learning Progress</Text>
            </View>
            <View style={styles.streakBadge}>
              <Flame size={15} color="#FF9900" fill="#FF9900" />
              <Text style={styles.streakText}>{stats.streakDays}d</Text>
            </View>
          </View>

          {/* Time Range Filter */}
          <View style={styles.filterRow}>
            {(['week', 'month', 'semester'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.filterChip, timeRange === r && styles.filterChipActive]}
                onPress={() => setTimeRange(r)}
              >
                <Text style={[styles.filterChipText, timeRange === r && styles.filterChipTextActive]}>
                  {r === 'week' ? 'This Week' : r === 'month' ? 'This Month' : '2022 Scheme Semester'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Overview Metric Cards Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}>
                  <Clock size={20} color="#69D900" />
                </View>
                <Text style={styles.metricValue}>{stats.studyHours}</Text>
                <Text style={styles.metricLabel}>Total Study Time</Text>
                <Text style={styles.metricTrend}>+14% from last week</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(0, 210, 255, 0.12)', borderColor: 'rgba(0, 210, 255, 0.3)' }]}>
                  <FileText size={20} color="#00D2FF" />
                </View>
                <Text style={styles.metricValue}>{stats.pdfsRead}</Text>
                <Text style={styles.metricLabel}>VTU Notes Read</Text>
                <Text style={[styles.metricTrend, { color: '#00D2FF' }]}>5 modules completed</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(168, 85, 247, 0.12)', borderColor: 'rgba(168, 85, 247, 0.3)' }]}>
                  <Tv size={20} color="#A855F7" />
                </View>
                <Text style={styles.metricValue}>{stats.videosWatched}</Text>
                <Text style={styles.metricLabel}>Lectures Watched</Text>
                <Text style={[styles.metricTrend, { color: '#A855F7' }]}>MX Player HD Streams</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(255, 153, 0, 0.12)', borderColor: 'rgba(255, 153, 0, 0.3)' }]}>
                  <Award size={20} color="#FF9900" />
                </View>
                <Text style={styles.metricValue}>{stats.completionRate}</Text>
                <Text style={styles.metricLabel}>Syllabus Covered</Text>
                <Text style={[styles.metricTrend, { color: '#FF9900' }]}>Exam Ready Grade A+</Text>
              </View>
            </View>

            {/* Weekly Learning Activity Chart */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Daily Learning Hours</Text>
                <Text style={styles.sectionSub}>Target: 6 hrs / day</Text>
              </View>

              <View style={styles.chartContainer}>
                {weeklyActivity.map((item, idx) => {
                  const maxHours = 8.0;
                  const heightPercent = (item.hours / maxHours) * 100;
                  return (
                    <View key={idx} style={styles.chartBarCol}>
                      <Text style={styles.barValue}>{item.hours}h</Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { height: `${heightPercent}%` },
                            item.hours >= 6 && styles.barFillTarget,
                          ]}
                        />
                      </View>
                      <Text style={styles.barDay}>{item.day}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Subject-Wise Time Distribution */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Subject-Wise Study Share</Text>
                <Text style={styles.sectionSub}>VTU 2022 Scheme</Text>
              </View>

              <View style={styles.subjectList}>
                {subjectBreakdown.map((sub, idx) => (
                  <View key={idx} style={styles.subjectItem}>
                    <View style={styles.subjectHeader}>
                      <View style={styles.subjectNameBox}>
                        <Text style={styles.subjectCodeBadge}>{sub.code}</Text>
                        <Text style={styles.subjectName}>{sub.subject}</Text>
                      </View>
                      <Text style={styles.subjectHours}>{sub.hours}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${sub.percent}%`, backgroundColor: sub.color }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Faculty Recommendations Banner */}
            <View style={styles.recommendationBanner}>
              <Zap size={18} color="#69D900" />
              <View style={{ flex: 1 }}>
                <Text style={styles.recTitle}>Prof. Ramesh Kumar's Tip</Text>
                <Text style={styles.recText}>
                  Focus on Graphs & AVL Trees in BCS304 module 4 — it holds 28 marks in upcoming VTU semester finals.
                </Text>
              </View>
            </View>

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
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 153, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9900',
  },
  streakText: { color: '#FF9900', fontSize: 12, fontWeight: '800' },
  filterRow: {
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
  filterChipActive: {
    backgroundColor: '#69D900',
    borderColor: '#7BEA12',
  },
  filterChipText: { color: '#B8B8C2', fontSize: 11, fontWeight: '600' },
  filterChipTextActive: { color: '#0B2405', fontWeight: '800' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: 'rgba(18, 22, 16, 0.75)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.18)',
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(105, 217, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  metricLabel: { color: '#8D8D94', fontSize: 11, marginTop: 2 },
  metricTrend: { color: '#69D900', fontSize: 10, fontWeight: '700', marginTop: 6 },
  sectionCard: {
    backgroundColor: 'rgba(18, 22, 16, 0.75)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.18)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  sectionSub: { color: '#69D900', fontSize: 11, fontWeight: '600' },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  chartBarCol: { alignItems: 'center', flex: 1, gap: 6 },
  barValue: { color: '#8D8D94', fontSize: 9, fontWeight: '600' },
  barTrack: {
    width: 14,
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: 'rgba(105, 217, 0, 0.4)',
    borderRadius: 7,
  },
  barFillTarget: {
    backgroundColor: '#69D900',
  },
  barDay: { color: '#B8B8C2', fontSize: 10, fontWeight: '600' },
  subjectList: { gap: 12 },
  subjectItem: { gap: 6 },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectNameBox: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  subjectCodeBadge: {
    backgroundColor: 'rgba(105, 217, 0, 0.15)',
    color: '#69D900',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  subjectName: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', flex: 1 },
  subjectHours: { color: '#B8B8C2', fontSize: 11, fontWeight: '700' },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(18, 18, 24, 0.85)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
  },
  recTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginBottom: 2 },
  recText: { color: '#B8B8C2', fontSize: 11, lineHeight: 16 },
});

export default StatisticsScreen;
