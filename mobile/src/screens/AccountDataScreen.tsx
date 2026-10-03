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
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Save,
  ShieldCheck,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';

interface AccountDataScreenProps {
  navigation: any;
}

export const AccountDataScreen: React.FC<AccountDataScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState('Adil Ali Ansari');
  const [usn, setUsn] = useState('1RV22CS042');
  const [college, setCollege] = useState('R.V. College of Engineering (VTU)');
  const [branch, setBranch] = useState('Computer Science & Engineering (CSE)');
  const [scheme, setScheme] = useState('2022 Scheme');
  const [semester, setSemester] = useState('5th Semester');
  const [email, setEmail] = useState('adilaliansari@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    setToastMessage('Account profile updated successfully!');
    setTimeout(() => setToastMessage(null), 3500);
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
              <Text style={styles.headerTitle}>Update Account Data</Text>
              <Text style={styles.headerSubtitle}>Student profile & academic details</Text>
            </View>
            <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave}>
              <Save size={16} color="#0B2405" />
              <Text style={styles.saveHeaderText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Student ID Card Banner */}
            <View style={styles.profileBadgeCard}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>AA</Text>
              </View>
              <View style={styles.profileBadgeText}>
                <Text style={styles.profileName}>{fullName}</Text>
                <Text style={styles.profileUsn}>USN: {usn}</Text>
                <View style={styles.academicPillRow}>
                  <View style={styles.vtuPill}>
                    <Text style={styles.vtuPillText}>{scheme}</Text>
                  </View>
                  <View style={styles.branchPill}>
                    <Text style={styles.branchPillText}>CSE • {semester}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Academic Information Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Academic Information</Text>

              <Text style={styles.inputLabel}>University Serial Number (USN)</Text>
              <View style={styles.inputWrap}>
                <GraduationCap size={16} color="#69D900" />
                <TextInput
                  style={styles.input}
                  value={usn}
                  onChangeText={setUsn}
                  placeholder="e.g. 1RV22CS042"
                  placeholderTextColor="#8D8D94"
                  autoCapitalize="characters"
                />
              </View>

              <Text style={styles.inputLabel}>Engineering College / Institution</Text>
              <View style={styles.inputWrap}>
                <Building2 size={16} color="#69D900" />
                <TextInput
                  style={styles.input}
                  value={college}
                  onChangeText={setCollege}
                  placeholder="e.g. RV College of Engineering"
                  placeholderTextColor="#8D8D94"
                />
              </View>

              <Text style={styles.inputLabel}>Branch / Department</Text>
              <View style={styles.inputWrap}>
                <BookOpen size={16} color="#69D900" />
                <TextInput
                  style={styles.input}
                  value={branch}
                  onChangeText={setBranch}
                  placeholder="e.g. CSE"
                  placeholderTextColor="#8D8D94"
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Curriculum Scheme</Text>
                  <TextInput
                    style={styles.inputPlain}
                    value={scheme}
                    onChangeText={setScheme}
                    placeholder="2022 Scheme"
                    placeholderTextColor="#8D8D94"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Current Semester</Text>
                  <TextInput
                    style={styles.inputPlain}
                    value={semester}
                    onChangeText={setSemester}
                    placeholder="5th Semester"
                    placeholderTextColor="#8D8D94"
                  />
                </View>
              </View>
            </View>

            {/* Personal Information Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal & Contact Details</Text>

              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrap}>
                <User size={16} color="#69D900" />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name"
                  placeholderTextColor="#8D8D94"
                />
              </View>

              <Text style={styles.inputLabel}>Student Email Address</Text>
              <View style={styles.inputWrap}>
                <Mail size={16} color="#69D900" />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="student@example.com"
                  placeholderTextColor="#8D8D94"
                  keyboardType="email-address"
                />
              </View>

              <Text style={styles.inputLabel}>Mobile Phone Number</Text>
              <View style={styles.inputWrap}>
                <Phone size={16} color="#69D900" />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#8D8D94"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.bigSaveBtn} onPress={handleSave}>
              <Save size={18} color="#0B2405" />
              <Text style={styles.bigSaveBtnText}>Save Profile Changes</Text>
            </TouchableOpacity>

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
  saveHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#69D900',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  saveHeaderText: { color: '#0B2405', fontSize: 12, fontWeight: '800' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },
  profileBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(18, 22, 16, 0.85)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#69D900',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: { color: '#0B2405', fontSize: 20, fontWeight: '900' },
  profileBadgeText: { flex: 1 },
  profileName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  profileUsn: { color: '#8D8D94', fontSize: 12, marginTop: 2 },
  academicPillRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  vtuPill: {
    backgroundColor: 'rgba(105, 217, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#69D900',
  },
  vtuPillText: { color: '#69D900', fontSize: 10, fontWeight: '700' },
  branchPill: {
    backgroundColor: 'rgba(27, 27, 41, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  branchPillText: { color: '#B8B8C2', fontSize: 10, fontWeight: '600' },
  formSection: {
    backgroundColor: 'rgba(18, 18, 24, 0.8)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  inputLabel: { color: '#B8B8C2', fontSize: 11, fontWeight: '600', marginBottom: 4, marginTop: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    gap: 8,
    height: 42,
  },
  input: { flex: 1, color: '#FFFFFF', fontSize: 13 },
  rowInputs: { flexDirection: 'row', gap: 10 },
  inputPlain: {
    height: 42,
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 13,
  },
  bigSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#69D900',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  bigSaveBtnText: { color: '#0B2405', fontSize: 14, fontWeight: '800' },
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

export default AccountDataScreen;
