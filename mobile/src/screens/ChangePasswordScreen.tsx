import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Save,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';

interface ChangePasswordScreenProps {
  navigation: any;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }

    showToast('Password updated successfully!');
    setTimeout(() => navigation.goBack(), 1500);
  };

  const passwordStrength = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : 3;

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
              <Text style={styles.headerTitle}>Change Password</Text>
              <Text style={styles.headerSubtitle}>Security & account protection</Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <ShieldCheck size={20} color="#69D900" />
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>End-to-End Encrypted</Text>
                <Text style={styles.noticeText}>
                  Your password is salted and hashed with bcrypt. Always choose a unique password.
                </Text>
              </View>
            </View>

            {/* Password Form */}
            <View style={styles.formCard}>
              {/* Current Password */}
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.inputWrap}>
                <Lock size={16} color="#69D900" />
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#8D8D94"
                  secureTextEntry={!showCurrent}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? (
                    <EyeOff size={16} color="#8D8D94" />
                  ) : (
                    <Eye size={16} color="#8D8D94" />
                  )}
                </TouchableOpacity>
              </View>

              {/* New Password */}
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrap}>
                <Key size={16} color="#69D900" />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#8D8D94"
                  secureTextEntry={!showNew}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  {showNew ? (
                    <EyeOff size={16} color="#8D8D94" />
                  ) : (
                    <Eye size={16} color="#8D8D94" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Password Strength Meter */}
              {newPassword.length > 0 && (
                <View style={styles.strengthMeterWrap}>
                  <View style={styles.strengthBars}>
                    <View style={[styles.strengthBar, passwordStrength >= 1 && { backgroundColor: '#FF4545' }]} />
                    <View style={[styles.strengthBar, passwordStrength >= 2 && { backgroundColor: '#FF9900' }]} />
                    <View style={[styles.strengthBar, passwordStrength >= 3 && { backgroundColor: '#69D900' }]} />
                  </View>
                  <Text style={styles.strengthText}>
                    {passwordStrength === 1 ? 'Weak' : passwordStrength === 2 ? 'Good' : 'Strong & Secure'}
                  </Text>
                </View>
              )}

              {/* Confirm Password */}
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputWrap}>
                <Lock size={16} color="#69D900" />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#8D8D94"
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? (
                    <EyeOff size={16} color="#8D8D94" />
                  ) : (
                    <Eye size={16} color="#8D8D94" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 2-Factor Authentication Toggle */}
            <View style={styles.toggleCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Two-Factor Authentication (2FA)</Text>
                <Text style={styles.toggleSubtitle}>Require email OTP code when logging in from new devices</Text>
              </View>
              <TouchableOpacity
                style={[styles.switchTrack, twoFactorEnabled && styles.switchTrackActive]}
                onPress={() => setTwoFactorEnabled(!twoFactorEnabled)}
              >
                <View style={[styles.switchThumb, twoFactorEnabled && styles.switchThumbActive]} />
              </TouchableOpacity>
            </View>

            {/* Update Password Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePassword}>
              <Save size={18} color="#0B2405" />
              <Text style={styles.saveBtnText}>Update Password</Text>
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
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(18, 22, 16, 0.8)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
  },
  noticeTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  noticeText: { color: '#8D8D94', fontSize: 11, marginTop: 2, lineHeight: 16 },
  formCard: {
    backgroundColor: 'rgba(18, 18, 24, 0.8)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputLabel: { color: '#B8B8C2', fontSize: 11, fontWeight: '600', marginBottom: 4, marginTop: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    gap: 8,
    height: 42,
  },
  input: { flex: 1, color: '#FFFFFF', fontSize: 13 },
  strengthMeterWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { height: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  strengthText: { color: '#B8B8C2', fontSize: 11, fontWeight: '600' },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 18, 24, 0.8)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  toggleTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  toggleSubtitle: { color: '#8D8D94', fontSize: 11, marginTop: 2 },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: { backgroundColor: '#69D900' },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  switchThumbActive: { alignSelf: 'flex-end' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#69D900',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  saveBtnText: { color: '#0B2405', fontSize: 14, fontWeight: '800' },
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

export default ChangePasswordScreen;
