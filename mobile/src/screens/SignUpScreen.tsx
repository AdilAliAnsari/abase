import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface SignUpScreenProps {
  navigation: any;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Form states
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = () => {
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email or username');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    // Simulate API sign up
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      
      // Navigate to Login after success
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    }, 1500);
  };

  const handleSocialAuth = (provider: string) => {
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigation.navigate('MainTabs');
      }, 1500);
    }, 1200);
  };

  // Inline Brand SVGs
  const GoogleSVG = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: 8, flexShrink: 0 }}>
      <path
        fill="#EA4335"
        d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.355 0 3.39 2.673 1.482 6.545l3.784 3.22z"
      />
      <path
        fill="#34A853"
        d="M16.04 15.345c-1.073.727-2.427 1.164-4.04 1.164-3.073 0-5.673-2.073-6.6-4.909L1.582 14.8C3.518 18.727 7.51 21.418 12 21.418c3.073 0 5.855-1.127 7.927-3.091l-3.887-2.982z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.273c0-.818-.082-1.6-.218-2.364H12v4.51h6.464c-.29 1.482-1.145 2.736-2.427 3.564l3.886 2.982c2.264-2.09 3.564-5.173 3.564-8.692z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 12c0-.682.118-1.336.318-1.964L1.936 6.8C1.227 8.355.818 10.127.818 12s.41 3.645 1.118 5.2l3.782-2.964A7.226 7.226 0 0 1 5.4 12z"
      />
    </svg>
  );

  const GitHubSVG = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF" style={{ marginRight: 8, flexShrink: 0 }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );

  if (Platform.OS === 'web') {
    return (
      <div className="login-page">
        <div className="login-card">
          <button 
            className="close-web-btn" 
            onClick={() => navigation.goBack()}
            aria-label="Close register page"
          >
            <X size={20} color={colors.primaryText} />
          </button>
          
          <div className="logo-section">
            <span className="logo-book">📚</span>
            <span className="logo-title">EduStore</span>
          </div>

          <h2 className="welcome-text">Create Account</h2>
          <p className="subtitle-text">Join us today to access and manage your books</p>

          {error ? <div className="error-banner">{error}</div> : null}
          {success ? <div className="success-banner">✓ Sign up successful! Opening login...</div> : null}

          {/* Social Logins */}
          <div className="social-wrap">
            <button 
              type="button" 
              className="social-btn google-btn"
              onClick={() => handleSocialAuth('Google')}
              disabled={isLoading || success}
            >
              <GoogleSVG />
              <span>Google</span>
            </button>
            <button 
              type="button" 
              className="social-btn github-btn"
              onClick={() => handleSocialAuth('GitHub')}
              disabled={isLoading || success}
            >
              <GitHubSVG />
              <span>GitHub</span>
            </button>
          </div>

          <div className="divider-row">
            <span className="divider-line"></span>
            <span className="divider-text">or sign up with email</span>
            <span className="divider-line"></span>
          </div>

          {/* Name Field */}
          <div className="form-group">
            <label className="input-label">Full Name</label>
            <div className={`input-wrapper ${nameFocused ? 'focused' : ''}`}>
              <User size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                placeholder="Enter full name"
                disabled={isLoading || success}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="input-label">Email Address</label>
            <div className={`input-wrapper ${emailFocused ? 'focused' : ''}`}>
              <Mail size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="Enter email address"
                disabled={isLoading || success}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="input-label">Password</label>
            <div className={`input-wrapper ${passwordFocused ? 'focused' : ''}`}>
              <Lock size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Choose password"
                disabled={isLoading || success}
              />
              <button 
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label className="input-label">Confirm Password</label>
            <div className={`input-wrapper ${confirmPasswordFocused ? 'focused' : ''}`}>
              <Lock size={18} />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                placeholder="Re-enter password"
                disabled={isLoading || success}
              />
              <button 
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="button"
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
            onClick={handleSignUp}
            disabled={isLoading || success}
            style={{ marginTop: '10px' }}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className="signup-footer">
            Already have an account? <span className="signup-link" onClick={() => navigation.navigate('Login')}>Sign In</span>
          </div>
        </div>

        <style>{`
          .login-page {
            position: fixed;
            inset: 0;
            background-color: ${colors.background};
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            z-index: 1000;
            overflow-y: auto;
          }
          .login-card {
            width: 100%;
            max-width: 420px;
            background-color: ${colors.surface};
            border: 1px solid ${colors.border};
            border-radius: 16px;
            padding: 30px 40px;
            box-sizing: border-box;
            position: relative;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            margin-top: auto;
            margin-bottom: auto;
          }
          .close-web-btn {
            position: absolute;
            top: 24px;
            right: 24px;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
          }
          .close-web-btn:hover {
            background-color: rgba(255, 255, 255, 0.05);
          }
          .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 16px;
          }
          .logo-book {
            font-size: 28px;
          }
          .logo-title {
            color: ${colors.primaryText};
            font-size: 24px;
            font-weight: 800;
          }
          .welcome-text {
            color: ${colors.primaryText};
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 6px 0;
            text-align: center;
          }
          .subtitle-text {
            color: ${colors.secondaryText};
            font-size: 13px;
            margin: 0 0 20px 0;
            text-align: center;
            line-height: 1.4;
          }
          .social-wrap {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
          }
          .social-btn {
            flex: 1;
            height: 40px;
            border-radius: 10px;
            border: 1px solid ${colors.border};
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            outline: none;
          }
          .google-btn {
            background-color: #FFFFFF;
            color: #1F1F29;
          }
          .google-btn:hover {
            background-color: #F0F0F5;
            box-shadow: 0 3px 8px rgba(255,255,255,0.08);
          }
          .github-btn {
            background-color: #1B1B29;
            color: #FFFFFF;
            border-color: #2A2A3A;
          }
          .github-btn:hover {
            background-color: #242436;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          }
          .divider-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 18px;
          }
          .divider-line {
            flex: 1;
            height: 1px;
            background-color: ${colors.border};
          }
          .divider-text {
            color: ${colors.mutedText};
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .error-banner {
            background-color: rgba(255, 69, 69, 0.15);
            border: 1px solid ${colors.danger};
            color: ${colors.danger};
            padding: 10px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
          }
          .success-banner {
            background-color: rgba(105, 217, 0, 0.15);
            border: 1px solid ${colors.accentGreen};
            color: ${colors.accentGreen};
            padding: 10px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 14px;
            text-align: left;
          }
          .input-label {
            color: ${colors.secondaryText};
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .input-wrapper {
            display: flex;
            align-items: center;
            background-color: ${colors.controlBackground};
            border: 1px solid ${colors.border};
            border-radius: 12px;
            padding: 0 16px;
            height: 44px;
            box-sizing: border-box;
            transition: border-color 0.2s, box-shadow 0.2s;
            gap: 12px;
          }
          .input-wrapper.focused {
            border-color: ${colors.accentGreen};
            box-shadow: 0 0 12px ${colors.accentGreenGlow};
          }
          .input-wrapper svg {
            color: ${colors.iconMuted};
            flex-shrink: 0;
          }
          .input-wrapper input {
            flex: 1;
            background: transparent !important;
            border: none !important;
            outline: none !important;
            color: ${colors.primaryText} !important;
            font-size: 14px;
            height: 100%;
            min-width: 0;
            padding: 0;
            margin: 0;
            box-shadow: none !important;
          }
          .input-wrapper input::placeholder {
            color: ${colors.mutedText};
          }
          .eye-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: ${colors.iconMuted};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
          }
          .eye-btn:hover {
            color: ${colors.icon};
          }
          .submit-btn {
            width: 100%;
            height: 46px;
            background-color: ${colors.buttonBackground};
            border: 1px solid ${colors.accentGreenDark};
            color: ${colors.buttonText};
            font-size: 14px;
            font-weight: 700;
            border-radius: 23px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            outline: none;
          }
          .submit-btn:hover {
            background-color: ${colors.buttonHover};
            transform: translateY(-1px);
            box-shadow: 0 4px 12px ${colors.accentGreenGlow};
          }
          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .signup-footer {
            margin-top: 20px;
            color: ${colors.secondaryText};
            font-size: 13px;
            text-align: center;
          }
          .signup-link {
            color: ${colors.accentGreen};
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s;
            cursor: pointer;
          }
          .signup-link:hover {
            color: ${colors.accentGreenHover};
          }
        `}</style>
      </div>
    );
  }

  // Native UI
  return (
    <SafeAreaView style={styles.screenBg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={22} color={colors.primaryText} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoLogo}>📚</Text>
            <Text style={styles.logoText}>EduStore</Text>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Join us today</Text>
            <Text style={styles.subtitleText}>Sign up below to access your custom digital shelf</Text>
          </View>

          {/* Status Banners */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>✓ Sign up successful! Redirecting...</Text>
            </View>
          ) : null}

          {/* Social Logins */}
          <View style={styles.nativeSocialRow}>
            <TouchableOpacity 
              style={[styles.nativeSocialBtn, styles.nativeGoogleBtn]}
              onPress={() => handleSocialAuth('Google')}
              disabled={isLoading || success}
              activeOpacity={0.8}
            >
              <Text style={styles.nativeGoogleText}>Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.nativeSocialBtn, styles.nativeGithubBtn]}
              onPress={() => handleSocialAuth('GitHub')}
              disabled={isLoading || success}
              activeOpacity={0.8}
            >
              <Text style={styles.nativeGithubText}>GitHub</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nativeDividerRow}>
            <View style={styles.nativeLine} />
            <Text style={styles.nativeDividerText}>Or sign up with email</Text>
            <View style={styles.nativeLine} />
          </View>

          {/* Inputs Group */}
          <View style={styles.form}>
            {/* Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWrapper, nameFocused && styles.inputWrapperFocused]}>
                <User size={18} color={colors.iconMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.mutedText}
                  autoCapitalize="words"
                  editable={!isLoading && !success}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                <Mail size={18} color={colors.iconMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="Enter email address"
                  placeholderTextColor={colors.mutedText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading && !success}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                <Lock size={18} color={colors.iconMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Choose password"
                  placeholderTextColor={colors.mutedText}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading && !success}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  {showPassword ? (
                    <EyeOff size={18} color={colors.iconMuted} />
                  ) : (
                    <Eye size={18} color={colors.iconMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrapper, confirmPasswordFocused && styles.inputWrapperFocused]}>
                <Lock size={18} color={colors.iconMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  placeholder="Confirm password"
                  placeholderTextColor={colors.mutedText}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading && !success}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                  {showConfirmPassword ? (
                    <EyeOff size={18} color={colors.iconMuted} />
                  ) : (
                    <Eye size={18} color={colors.iconMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, (isLoading || success) && styles.submitButtonDisabled, { marginTop: 12 }]}
              onPress={handleSignUp}
              disabled={isLoading || success}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.buttonText} />
              ) : (
                <Text style={styles.submitButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenBg: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginVertical: 14,
  },
  logoLogo: {
    fontSize: 32,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryText,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
  },
  nativeSocialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  nativeSocialBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  nativeGoogleBtn: {
    backgroundColor: '#FFFFFF',
  },
  nativeGoogleText: {
    color: '#1F1F29',
    fontWeight: '700',
    fontSize: 13,
  },
  nativeGithubBtn: {
    backgroundColor: '#1B1B29',
    borderColor: '#2A2A3A',
  },
  nativeGithubText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  nativeDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  nativeLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  nativeDividerText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.mutedText,
    letterSpacing: 0.5,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 69, 69, 0.15)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: 'rgba(105, 217, 0, 0.15)',
    borderWidth: 1,
    borderColor: colors.accentGreen,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  successBannerText: {
    color: colors.accentGreen,
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.controlBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: colors.accentGreen,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: colors.primaryText,
    fontSize: 14,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: colors.buttonBackground,
    borderColor: colors.accentGreenDark,
    borderWidth: 1,
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.buttonText,
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.secondaryText,
    fontSize: 13,
  },
  footerLink: {
    color: colors.accentGreen,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SignUpScreen;
