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
import { X, Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, User } from 'lucide-react-native';
import { colors } from '../theme/colors';

const ACCENT = '#7BEA12';
const ACCENT_GLOW = 'rgba(123, 234, 18, 0.35)';

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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Form states
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 3D Tilt state for Web
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Platform.OS !== 'web') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setCardTilt({
      rotateX: -Math.max(-8, Math.min(8, y / 20)),
      rotateY: Math.max(-8, Math.min(8, x / 20)),
    });
  };

  const handleMouseLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0 });
  };

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
    
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1200);
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
      }, 1200);
    }, 1200);
  };

  const GoogleSVG = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: 8, flexShrink: 0 }}>
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
    <svg viewBox="0 0 24 24" width="16" height="16" fill="#FFFFFF" style={{ marginRight: 8, flexShrink: 0 }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );

  if (Platform.OS === 'web') {
    return (
      <div className="signup-screen-root">
        {/* Background Ambient Glows (#7BEA12) */}
        <div className="bg-glow-top" />
        <div className="bg-glow-bottom" />
        <div className="bg-spot-left" />
        <div className="bg-spot-right" />

        {/* Subtle Noise Texture */}
        <div className="noise-overlay" />

        {/* Floating Card Wrapper with 3D Tilt */}
        <div
          className="card-3d-wrap"
          style={{
            transform: `perspective(1200px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Card Outer Glow */}
          <div className="card-glow-aura" />

          {/* Traveling Perimeter Light Beam */}
          <div className="beam-container">
            <div className="beam-top" />
            <div className="beam-right" />
            <div className="beam-bottom" />
            <div className="beam-left" />
            <div className="corner-dot tl" />
            <div className="corner-dot tr" />
            <div className="corner-dot br" />
            <div className="corner-dot bl" />
          </div>

          {/* Glass Card Container */}
          <div className="glass-card">
            {/* Close Button */}
            <button
              className="close-button"
              onClick={() => navigation.goBack()}
              aria-label="Close sign up screen"
            >
              <X size={18} color="#FFFFFF" />
            </button>

            {/* Inner Grid Motif */}
            <div className="inner-grid" />

            {/* Logo Section with Glowing Green Accent */}
            <div className="logo-badge-wrap">
              <div className="logo-badge">
                <span className="logo-symbol">📚</span>
                <div className="logo-glow" />
              </div>
            </div>

            <h1 className="card-title">Create Account</h1>
            <p className="card-subtitle">Join us today and discover endless stories</p>

            {/* Status Banners */}
            {error ? <div className="status-error">{error}</div> : null}
            {success ? <div className="status-success">✓ Account created! Redirecting to login...</div> : null}

            {/* Social Logins */}
            <div className="social-row">
              <button
                type="button"
                className="social-button google"
                onClick={() => handleSocialAuth('Google')}
                disabled={isLoading || success}
              >
                <GoogleSVG />
                <span>Google</span>
              </button>
              <button
                type="button"
                className="social-button github"
                onClick={() => handleSocialAuth('GitHub')}
                disabled={isLoading || success}
              >
                <GitHubSVG />
                <span>GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or sign up with email</span>
              <div className="divider-line" />
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignUp();
              }}
              className="auth-form"
            >
              {/* Full Name Input */}
              <div className="input-field">
                <label className="field-label">Full Name</label>
                <div className={`field-box ${focusedInput === 'name' ? 'focused' : ''}`}>
                  <span className="field-icon"><User size={16} color={focusedInput === 'name' ? ACCENT : '#8D8D94'} /></span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="Enter your name"
                    disabled={isLoading || success}
                    className="native-input"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="input-field">
                <label className="field-label">Email Address</label>
                <div className={`field-box ${focusedInput === 'email' ? 'focused' : ''}`}>
                  <span className="field-icon"><Mail size={16} color={focusedInput === 'email' ? ACCENT : '#8D8D94'} /></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="name@example.com"
                    disabled={isLoading || success}
                    className="native-input"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="input-field">
                <label className="field-label">Password</label>
                <div className={`field-box ${focusedInput === 'password' ? 'focused' : ''}`}>
                  <span className="field-icon"><Lock size={16} color={focusedInput === 'password' ? ACCENT : '#8D8D94'} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="At least 6 characters"
                    disabled={isLoading || success}
                    className="native-input"
                  />
                  <button
                    type="button"
                    className="toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} color="#8D8D94" /> : <Eye size={16} color="#8D8D94" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="input-field">
                <label className="field-label">Confirm Password</label>
                <div className={`field-box ${focusedInput === 'confirmPassword' ? 'focused' : ''}`}>
                  <span className="field-icon"><Lock size={16} color={focusedInput === 'confirmPassword' ? ACCENT : '#8D8D94'} /></span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="Re-enter password"
                    disabled={isLoading || success}
                    className="native-input"
                  />
                  <button
                    type="button"
                    className="toggle-eye"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} color="#8D8D94" /> : <Eye size={16} color="#8D8D94" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || success}
                className={`submit-button ${isLoading ? 'loading' : ''}`}
                style={{ marginTop: '4px' }}
              >
                {isLoading ? (
                  <div className="btn-spinner" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="arrow-icon"><ArrowRight size={16} color="#061A02" /></span>
                  </>
                )}
                <div className="button-sweep" />
              </button>

              {/* Login switch link */}
              <p className="switch-text">
                Already have an account?{' '}
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => navigation.navigate('Login')}
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>
        </div>

        <style>{`
          .signup-screen-root {
            position: fixed;
            inset: 0;
            background-color: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow-y: auto;
            overflow-x: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            z-index: 1000;
          }

          /* Ambient Glows */
          .bg-glow-top {
            position: absolute;
            top: -15vh;
            left: 50%;
            transform: translateX(-50%);
            width: 100vw;
            max-width: 900px;
            height: 55vh;
            background: radial-gradient(ellipse at center, rgba(123, 234, 18, 0.22) 0%, rgba(105, 217, 0, 0.08) 50%, transparent 75%);
            filter: blur(70px);
            pointer-events: none;
            animation: pulseGlow 7s ease-in-out infinite alternate;
          }

          .bg-glow-bottom {
            position: absolute;
            bottom: -15vh;
            left: 50%;
            transform: translateX(-50%);
            width: 85vw;
            max-width: 800px;
            height: 45vh;
            background: radial-gradient(ellipse at center, rgba(123, 234, 18, 0.18) 0%, transparent 70%);
            filter: blur(80px);
            pointer-events: none;
            animation: pulseGlow 9s ease-in-out infinite alternate-reverse;
          }

          .bg-spot-left {
            position: absolute;
            left: 10%;
            top: 30%;
            width: 320px;
            height: 320px;
            background: rgba(123, 234, 18, 0.06);
            border-radius: 50%;
            filter: blur(90px);
            pointer-events: none;
          }

          .bg-spot-right {
            position: absolute;
            right: 10%;
            bottom: 25%;
            width: 340px;
            height: 340px;
            background: rgba(123, 234, 18, 0.05);
            border-radius: 50%;
            filter: blur(90px);
            pointer-events: none;
          }

          .noise-overlay {
            position: absolute;
            inset: 0;
            opacity: 0.035;
            pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            background-size: 160px 160px;
          }

          @keyframes pulseGlow {
            0% { opacity: 0.7; transform: translateX(-50%) scale(0.96); }
            100% { opacity: 1; transform: translateX(-50%) scale(1.04); }
          }

          /* 3D Tilt Card */
          .card-3d-wrap {
            position: relative;
            width: 100%;
            max-width: 420px;
            transition: transform 0.15s cubic-bezier(0.2, 0, 0.4, 1);
            will-change: transform;
            z-index: 10;
            margin-top: auto;
            margin-bottom: auto;
          }

          .card-glow-aura {
            position: absolute;
            inset: -2px;
            border-radius: 24px;
            background: linear-gradient(135deg, rgba(123, 234, 18, 0.25), rgba(123, 234, 18, 0.05), rgba(123, 234, 18, 0.2));
            filter: blur(14px);
            opacity: 0.6;
            pointer-events: none;
            transition: opacity 0.4s ease;
          }
          .card-3d-wrap:hover .card-glow-aura {
            opacity: 0.9;
          }

          /* Traveling Perimeter Light Beam */
          .beam-container {
            position: absolute;
            inset: -1px;
            border-radius: 20px;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
          }

          .beam-top {
            position: absolute;
            top: 0;
            left: -50%;
            width: 50%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #7BEA12, #FFFFFF, #7BEA12, transparent);
            box-shadow: 0 0 10px #7BEA12;
            animation: beamTop 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }

          .beam-right {
            position: absolute;
            top: -50%;
            right: 0;
            width: 2px;
            height: 50%;
            background: linear-gradient(180deg, transparent, #7BEA12, #FFFFFF, #7BEA12, transparent);
            box-shadow: 0 0 10px #7BEA12;
            animation: beamRight 3s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.75s;
          }

          .beam-bottom {
            position: absolute;
            bottom: 0;
            right: -50%;
            width: 50%;
            height: 2px;
            background: linear-gradient(270deg, transparent, #7BEA12, #FFFFFF, #7BEA12, transparent);
            box-shadow: 0 0 10px #7BEA12;
            animation: beamBottom 3s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.5s;
          }

          .beam-left {
            position: absolute;
            bottom: -50%;
            left: 0;
            width: 2px;
            height: 50%;
            background: linear-gradient(0deg, transparent, #7BEA12, #FFFFFF, #7BEA12, transparent);
            box-shadow: 0 0 10px #7BEA12;
            animation: beamLeft 3s cubic-bezier(0.4, 0, 0.2, 1) infinite 2.25s;
          }

          @keyframes beamTop {
            0% { left: -50%; opacity: 0; }
            30% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
          @keyframes beamRight {
            0% { top: -50%; opacity: 0; }
            30% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes beamBottom {
            0% { right: -50%; opacity: 0; }
            30% { opacity: 1; }
            100% { right: 100%; opacity: 0; }
          }
          @keyframes beamLeft {
            0% { bottom: -50%; opacity: 0; }
            30% { opacity: 1; }
            100% { bottom: 100%; opacity: 0; }
          }

          .corner-dot {
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: #7BEA12;
            box-shadow: 0 0 6px #7BEA12;
            opacity: 0.6;
          }
          .corner-dot.tl { top: 2px; left: 2px; }
          .corner-dot.tr { top: 2px; right: 2px; }
          .corner-dot.br { bottom: 2px; right: 2px; }
          .corner-dot.bl { bottom: 2px; left: 2px; }

          /* Glass Card */
          .glass-card {
            position: relative;
            background: rgba(13, 17, 12, 0.72);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(123, 234, 18, 0.2);
            border-radius: 20px;
            padding: 30px 32px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75), 0 0 20px rgba(123, 234, 18, 0.08);
            box-sizing: border-box;
            z-index: 2;
            overflow: hidden;
          }

          .inner-grid {
            position: absolute;
            inset: 0;
            background-image: 
              linear-gradient(to right, rgba(123, 234, 18, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(123, 234, 18, 0.04) 1px, transparent 1px);
            background-size: 28px 28px;
            pointer-events: none;
            opacity: 0.6;
          }

          .close-button {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #FFFFFF;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 10;
          }
          .close-button:hover {
            background: rgba(123, 234, 18, 0.2);
            border-color: #7BEA12;
            transform: scale(1.05);
          }

          .logo-badge-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 12px;
          }
          .logo-badge {
            width: 44px;
            height: 44px;
            border-radius: 22px;
            background: rgba(123, 234, 18, 0.1);
            border: 1px solid rgba(123, 234, 18, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 0 0 16px rgba(123, 234, 18, 0.25);
          }
          .logo-symbol {
            font-size: 22px;
          }
          .logo-glow {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(123, 234, 18, 0.3) 0%, transparent 70%);
            pointer-events: none;
          }

          .card-title {
            color: #FFFFFF;
            font-size: 21px;
            font-weight: 700;
            text-align: center;
            margin: 0 0 4px 0;
            letter-spacing: -0.3px;
          }
          .card-subtitle {
            color: #A3A3B2;
            font-size: 12px;
            text-align: center;
            margin: 0 0 16px 0;
            line-height: 1.4;
          }

          /* Status Banners */
          .status-error {
            background: rgba(255, 69, 69, 0.15);
            border: 1px solid rgba(255, 69, 69, 0.35);
            color: #FF5E5E;
            padding: 8px 12px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 12px;
            text-align: center;
          }
          .status-success {
            background: rgba(123, 234, 18, 0.15);
            border: 1px solid #7BEA12;
            color: #7BEA12;
            padding: 8px 12px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 12px;
            text-align: center;
          }

          /* Social Buttons */
          .social-row {
            display: flex;
            gap: 10px;
            margin-bottom: 14px;
          }
          .social-button {
            flex: 1;
            height: 38px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
            color: #FFFFFF;
            transition: all 0.2s ease;
          }
          .social-button:hover {
            background: rgba(123, 234, 18, 0.12);
            border-color: rgba(123, 234, 18, 0.4);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          /* Divider */
          .divider {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 14px;
          }
          .divider-line {
            flex: 1;
            height: 1px;
            background: rgba(255, 255, 255, 0.08);
          }
          .divider-text {
            color: #737380;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* Auth Form */
          .auth-form {
            display: flex;
            flex-direction: column;
            gap: 11px;
          }
          .input-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
            text-align: left;
          }
          .field-label {
            color: #B8B8C2;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .field-box {
            display: flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            height: 42px;
            padding: 0 14px;
            transition: all 0.25s ease;
            gap: 10px;
            box-sizing: border-box;
          }
          .field-box.focused {
            background: rgba(123, 234, 18, 0.06);
            border-color: #7BEA12;
            box-shadow: 0 0 14px rgba(123, 234, 18, 0.25);
          }
          .field-icon {
            color: #8D8D94;
            flex-shrink: 0;
            transition: color 0.2s;
          }
          .field-box.focused .field-icon {
            color: #7BEA12;
          }
          .native-input {
            flex: 1;
            background: transparent !important;
            border: none !important;
            outline: none !important;
            color: #FFFFFF !important;
            font-size: 13px;
            height: 100%;
            min-width: 0;
            padding: 0;
            box-shadow: none !important;
          }
          .native-input::placeholder {
            color: #555562;
          }
          .toggle-eye {
            background: transparent;
            border: none;
            color: #8D8D94;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
          }
          .toggle-eye:hover {
            color: #7BEA12;
          }

          /* Submit Button */
          .submit-button {
            position: relative;
            width: 100%;
            height: 44px;
            border-radius: 22px;
            background: #7BEA12;
            border: 1px solid #91F232;
            color: #061A02;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            overflow: hidden;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 16px rgba(123, 234, 18, 0.35);
          }
          .submit-button:hover {
            background: #8BF227;
            transform: translateY(-1px);
            box-shadow: 0 0 24px rgba(123, 234, 18, 0.55);
          }
          .submit-button:disabled {
            opacity: 0.65;
            cursor: not-allowed;
            transform: none;
          }
          .arrow-icon {
            transition: transform 0.25s ease;
          }
          .submit-button:hover .arrow-icon {
            transform: translateX(3px);
          }
          .button-sweep {
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
            pointer-events: none;
          }
          .submit-button:hover .button-sweep {
            transform: translateX(100%);
          }

          .btn-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(0, 0, 0, 0.2);
            border-top-color: #000000;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Switch Link */
          .switch-text {
            color: #8D8D94;
            font-size: 12px;
            text-align: center;
            margin-top: 4px;
          }
          .switch-btn {
            background: transparent;
            border: none;
            color: #7BEA12;
            font-weight: 700;
            cursor: pointer;
            padding: 0;
            font-size: 12px;
            transition: opacity 0.2s;
          }
          .switch-btn:hover {
            text-decoration: underline;
            opacity: 0.85;
          }
        `}</style>
      </div>
    );
  }

  // Native UI (iOS / Android)
  return (
    <SafeAreaView style={styles.nativeRoot}>
      {/* Background Glows for Native */}
      <View style={styles.nativeTopGlow} pointerEvents="none" />
      <View style={styles.nativeBottomGlow} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.nativeContainer}
      >
        <ScrollView
          contentContainerStyle={styles.nativeScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.nativeHeader}>
            <TouchableOpacity
              style={styles.nativeBackBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.nativeHeaderTitle}>Create Account</Text>
            <View style={{ width: 38 }} />
          </View>

          {/* Glowing Card Surface */}
          <View style={styles.nativeCard}>
            {/* Logo */}
            <View style={styles.nativeLogoWrap}>
              <View style={styles.nativeLogoBadge}>
                <Text style={styles.nativeLogoEmoji}>📚</Text>
              </View>
            </View>

            <Text style={styles.nativeTitle}>Create Account</Text>
            <Text style={styles.nativeSubtitle}>Sign up below to access your custom digital shelf</Text>

            {/* Status Banners */}
            {error ? (
              <View style={styles.nativeErrorBanner}>
                <Text style={styles.nativeErrorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.nativeSuccessBanner}>
                <Text style={styles.nativeSuccessText}>✓ Account created! Redirecting to login...</Text>
              </View>
            ) : null}

            {/* Social Logins */}
            <View style={styles.nativeSocialRow}>
              <TouchableOpacity
                style={styles.nativeSocialBtn}
                onPress={() => handleSocialAuth('Google')}
                disabled={isLoading || success}
                activeOpacity={0.8}
              >
                <Text style={styles.nativeSocialBtnText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nativeSocialBtn}
                onPress={() => handleSocialAuth('GitHub')}
                disabled={isLoading || success}
                activeOpacity={0.8}
              >
                <Text style={styles.nativeSocialBtnText}>GitHub</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.nativeDivider}>
              <View style={styles.nativeDividerLine} />
              <Text style={styles.nativeDividerLabel}>or sign up with email</Text>
              <View style={styles.nativeDividerLine} />
            </View>

            {/* Full Name Field */}
            <View style={styles.nativeField}>
              <Text style={styles.nativeLabel}>Full Name</Text>
              <View style={[styles.nativeInputBox, focusedInput === 'name' && styles.nativeInputBoxFocused]}>
                <User size={16} color={focusedInput === 'name' ? ACCENT : '#8D8D94'} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.nativeInput}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter your name"
                  placeholderTextColor="#555562"
                  autoCapitalize="words"
                  editable={!isLoading && !success}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.nativeField}>
              <Text style={styles.nativeLabel}>Email Address</Text>
              <View style={[styles.nativeInputBox, focusedInput === 'email' && styles.nativeInputBoxFocused]}>
                <Mail size={16} color={focusedInput === 'email' ? ACCENT : '#8D8D94'} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.nativeInput}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="name@example.com"
                  placeholderTextColor="#555562"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading && !success}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.nativeField}>
              <Text style={styles.nativeLabel}>Password</Text>
              <View style={[styles.nativeInputBox, focusedInput === 'password' && styles.nativeInputBoxFocused]}>
                <Lock size={16} color={focusedInput === 'password' ? ACCENT : '#8D8D94'} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.nativeInput}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#555562"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading && !success}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 4 }}
                >
                  {showPassword ? (
                    <EyeOff size={16} color="#8D8D94" />
                  ) : (
                    <Eye size={16} color="#8D8D94" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.nativeField}>
              <Text style={styles.nativeLabel}>Confirm Password</Text>
              <View style={[styles.nativeInputBox, focusedInput === 'confirmPassword' && styles.nativeInputBoxFocused]}>
                <Lock size={16} color={focusedInput === 'confirmPassword' ? ACCENT : '#8D8D94'} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.nativeInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Re-enter password"
                  placeholderTextColor="#555562"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading && !success}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ padding: 4 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} color="#8D8D94" />
                  ) : (
                    <Eye size={16} color="#8D8D94" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.nativeSubmitBtn, (isLoading || success) && styles.nativeSubmitBtnDisabled, { marginTop: 6 }]}
              onPress={handleSignUp}
              disabled={isLoading || success}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={styles.nativeSubmitText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Switch to Sign In */}
            <View style={styles.nativeSwitchRow}>
              <Text style={styles.nativeSwitchMuted}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.nativeSwitchLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  nativeRoot: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  nativeTopGlow: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 220,
    backgroundColor: 'rgba(123, 234, 18, 0.12)',
    borderRadius: 110,
    transform: [{ scaleX: 1.5 }],
    opacity: 0.7,
  },
  nativeBottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 180,
    backgroundColor: 'rgba(123, 234, 18, 0.08)',
    borderRadius: 90,
    opacity: 0.6,
  },
  nativeContainer: {
    flex: 1,
  },
  nativeScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  nativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  nativeBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  nativeCard: {
    backgroundColor: 'rgba(13, 17, 12, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.22)',
    padding: 22,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  nativeLogoWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  nativeLogoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(123, 234, 18, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeLogoEmoji: {
    fontSize: 22,
  },
  nativeTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  nativeSubtitle: {
    color: '#8D8D94',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
  },
  nativeErrorBanner: {
    backgroundColor: 'rgba(255, 69, 69, 0.15)',
    borderColor: '#FF5E5E',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  nativeErrorText: {
    color: '#FF5E5E',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  nativeSuccessBanner: {
    backgroundColor: 'rgba(123, 234, 18, 0.15)',
    borderColor: ACCENT,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  nativeSuccessText: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  nativeSocialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  nativeSocialBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeSocialBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  nativeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  nativeDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  nativeDividerLabel: {
    color: '#737380',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  nativeField: {
    marginBottom: 12,
  },
  nativeLabel: {
    color: '#B8B8C2',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nativeInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
  },
  nativeInputBoxFocused: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(123, 234, 18, 0.06)',
  },
  nativeInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    height: '100%',
  },
  nativeSubmitBtn: {
    backgroundColor: ACCENT,
    borderColor: '#91F232',
    borderWidth: 1,
    borderRadius: 22,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  nativeSubmitBtnDisabled: {
    opacity: 0.6,
  },
  nativeSubmitText: {
    color: '#061A02',
    fontSize: 14,
    fontWeight: '700',
  },
  nativeSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  nativeSwitchMuted: {
    color: '#8D8D94',
    fontSize: 12,
  },
  nativeSwitchLink: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default SignUpScreen;
