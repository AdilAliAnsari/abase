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
  Mail,
  CheckCircle2,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import DarkGradientBg from '../components/DarkGradientBg';

interface VerifyEmailScreenProps {
  navigation: any;
}

export const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('adilaliansari@example.com');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendOtp = () => {
    setIsSent(true);
    showToast(`Verification code sent to ${email}`);
  };

  const handleVerify = () => {
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      showToast('Please enter the complete 6-digit OTP code');
      return;
    }
    setIsVerified(true);
    showToast('Email verified successfully! Safe transactions enabled.');
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);
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
              <Text style={styles.headerTitle}>Verify Student Email</Text>
              <Text style={styles.headerSubtitle}>Safe transactions & 1-click downloads</Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Email Verification Card */}
            <View style={styles.verifyCard}>
              <View style={styles.envelopeIconWrap}>
                <View style={styles.orangeDot} />
                <Mail size={36} color="#69D900" />
              </View>

              <Text style={styles.cardTitle}>
                {isVerified ? 'Email Verified Successfully!' : 'Verify Email for Safe Transactions'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isVerified
                  ? 'Your student account is authenticated with VTU academic verification.'
                  : 'We will send a 6-digit verification code to your college registered email address.'}
              </Text>

              {isVerified ? (
                <View style={styles.verifiedSuccessBox}>
                  <CheckCircle2 size={24} color="#69D900" />
                  <View>
                    <Text style={styles.verifiedText}>{email}</Text>
                    <Text style={styles.verifiedStatus}>Verified Student Status • Safe Purchases Active</Text>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.emailBox}>
                    <Text style={styles.emailLabel}>Registered Email</Text>
                    <TextInput
                      style={styles.emailInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="student@example.com"
                      placeholderTextColor="#8D8D94"
                      keyboardType="email-address"
                    />
                  </View>

                  {!isSent ? (
                    <TouchableOpacity style={styles.sendOtpBtn} onPress={handleSendOtp}>
                      <Send size={16} color="#0B2405" />
                      <Text style={styles.sendOtpBtnText}>Send Verification Code</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <Text style={styles.otpLabel}>Enter 6-Digit OTP</Text>
                      <View style={styles.otpRow}>
                        {otp.map((digit, idx) => (
                          <TextInput
                            key={idx}
                            style={[styles.otpBox, !!digit && styles.otpBoxFilled]}
                            keyboardType="numeric"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleOtpChange(text, idx)}
                          />
                        ))}
                      </View>

                      <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
                        <ShieldCheck size={18} color="#0B2405" />
                        <Text style={styles.verifyBtnText}>Confirm & Verify</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.resendBtn}
                        onPress={() => showToast('New code resent')}
                      >
                        <Text style={styles.resendText}>Didn't receive code? Resend</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>

            {/* Benefits Banner */}
            <View style={styles.benefitsCard}>
              <Sparkles size={18} color="#69D900" />
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>Why verify your email?</Text>
                <Text style={styles.benefitItem}>• Instant access to verified VTU lecturer notes</Text>
                <Text style={styles.benefitItem}>• Secure digital wallet & card payment protection</Text>
                <Text style={styles.benefitItem}>• Receive exam schedules & new scheme alerts</Text>
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
  verifyCard: {
    backgroundColor: 'rgba(18, 22, 16, 0.85)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.25)',
  },
  envelopeIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(105, 217, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(105, 217, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  orangeDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5A2B',
  },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  cardSubtitle: { color: '#8D8D94', fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  emailBox: { width: '100%', marginBottom: 14 },
  emailLabel: { color: '#B8B8C2', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  emailInput: {
    height: 42,
    backgroundColor: 'rgba(27, 27, 41, 0.85)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 13,
  },
  sendOtpBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#69D900',
    paddingVertical: 12,
    borderRadius: 10,
  },
  sendOtpBtnText: { color: '#0B2405', fontSize: 13, fontWeight: '800' },
  otpLabel: { color: '#B8B8C2', fontSize: 12, fontWeight: '600', marginBottom: 10 },
  otpRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  otpBox: {
    width: 44,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(27, 27, 41, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  otpBoxFilled: { borderColor: '#69D900', backgroundColor: 'rgba(105, 217, 0, 0.1)' },
  verifyBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#69D900',
    paddingVertical: 12,
    borderRadius: 10,
  },
  verifyBtnText: { color: '#0B2405', fontSize: 13, fontWeight: '800' },
  resendBtn: { marginTop: 14 },
  resendText: { color: '#69D900', fontSize: 12, fontWeight: '600' },
  verifiedSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(105, 217, 0, 0.12)',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#69D900',
    width: '100%',
  },
  verifiedText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  verifiedStatus: { color: '#69D900', fontSize: 11, marginTop: 2 },
  benefitsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(18, 18, 24, 0.8)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  benefitTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  benefitItem: { color: '#8D8D94', fontSize: 11, lineHeight: 18 },
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

export default VerifyEmailScreen;
