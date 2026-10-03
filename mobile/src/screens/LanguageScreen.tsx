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
  Globe,
  CheckCircle2,
  Tv,
  FileText,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';

interface LanguageScreenProps {
  navigation: any;
}

export const LanguageScreen: React.FC<LanguageScreenProps> = ({ navigation }) => {
  const [appLanguage, setAppLanguage] = useState('English');
  const [subtitleLanguage, setSubtitleLanguage] = useState('English (Auto-generated)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const languages = [
    { code: 'en', name: 'English', native: 'English', default: true },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
  ];

  const handleSelectLanguage = (lang: string) => {
    setAppLanguage(lang);
    setToastMessage(`App language set to ${lang}`);
    setTimeout(() => setToastMessage(null), 3000);
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
              <Text style={styles.headerTitle}>Language & Region</Text>
              <Text style={styles.headerSubtitle}>App interface and video subtitles</Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Primary Language */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Globe size={18} color="#69D900" />
                <Text style={styles.sectionTitle}>App Display Language</Text>
              </View>

              <View style={styles.langList}>
                {languages.map((l) => {
                  const selected = appLanguage === l.name;
                  return (
                    <TouchableOpacity
                      key={l.code}
                      style={[styles.langRow, selected && styles.langRowSelected]}
                      onPress={() => handleSelectLanguage(l.name)}
                    >
                      <View>
                        <Text style={[styles.langName, selected && styles.langNameSelected]}>
                          {l.name}
                        </Text>
                        <Text style={styles.langNative}>{l.native}</Text>
                      </View>
                      {selected && <CheckCircle2 size={18} color="#69D900" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Video Lecture Subtitles Preference */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Tv size={18} color="#00D2FF" />
                <Text style={styles.sectionTitle}>Video Subtitle Preference</Text>
              </View>

              <View style={styles.langList}>
                {['English (Auto-generated)', 'English (Standard)', 'Kannada Subtitles', 'Off'].map((sub) => {
                  const selected = subtitleLanguage === sub;
                  return (
                    <TouchableOpacity
                      key={sub}
                      style={[styles.langRow, selected && styles.langRowSelected]}
                      onPress={() => {
                        setSubtitleLanguage(sub);
                        setToastMessage(`Subtitles preference: ${sub}`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                    >
                      <Text style={[styles.langName, selected && styles.langNameSelected]}>
                        {sub}
                      </Text>
                      {selected && <CheckCircle2 size={18} color="#69D900" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

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
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },
  sectionCard: {
    backgroundColor: 'rgba(18, 22, 16, 0.8)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.18)',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  langList: { gap: 6 },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(27, 27, 41, 0.6)',
  },
  langRowSelected: {
    backgroundColor: 'rgba(105, 217, 0, 0.12)',
    borderWidth: 1,
    borderColor: '#69D900',
  },
  langName: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  langNameSelected: { color: '#69D900', fontWeight: '800' },
  langNative: { color: '#8D8D94', fontSize: 11, marginTop: 2 },
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

export default LanguageScreen;
