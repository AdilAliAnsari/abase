import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { X, UserPlus, Check, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { SavedAccount } from '../services/storageService';

const ACCENT = '#7BEA12';
const ACCENT_GLOW = 'rgba(123, 234, 18, 0.35)';

import clerkService from '../services/clerkService';

export interface AccountPickerModalProps {
  visible: boolean;
  provider: 'google' | 'github';
  savedAccounts: SavedAccount[];
  mode?: 'signin' | 'signup';
  onClose: () => void;
  onSelectAccount: (account: SavedAccount) => Promise<void>;
  onSubmitNewId: (params: {
    provider: 'google' | 'github';
    identifier: string;
    name?: string;
  }) => Promise<void>;
  onRemoveAccount?: (id: string) => void;
}

export const AccountPickerModal: React.FC<AccountPickerModalProps> = ({
  visible,
  provider,
  savedAccounts,
  mode = 'signin',
  onClose,
  onSelectAccount,
  onSubmitNewId,
  onRemoveAccount,
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Filter saved accounts by current provider (or show all social accounts)
  const providerAccounts = savedAccounts.filter(
    acc => acc.provider === provider || acc.email?.toLowerCase().includes(provider)
  );

  const isGoogle = provider === 'google';
  const providerTitle = isGoogle ? 'Google' : 'GitHub';

  const handleSelect = async (account: SavedAccount) => {
    setError('');
    setSelectedId(account.id);
    setIsLoading(true);
    try {
      await onSelectAccount(account);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with this ID. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedId(null);
    }
  };

  const handleCreateNew = async () => {
    setError('');
    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setError(`Please enter your ${isGoogle ? 'Google Email/ID' : 'GitHub Username/ID'}`);
      return;
    }

    if (isGoogle && !trimmedId.includes('@')) {
      // Auto-append @gmail.com if just username entered
      setIdentifier(`${trimmedId}@gmail.com`);
    }

    const finalId = isGoogle && !trimmedId.includes('@') ? `${trimmedId}@gmail.com` : trimmedId;

    setIsLoading(true);
    try {
      await onSubmitNewId({
        provider,
        identifier: finalId,
        name: displayName.trim() || undefined,
      });
      setIdentifier('');
      setDisplayName('');
      setShowNewForm(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate ID. Please check and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchClerkOAuth = async () => {
    setError('');
    setIsLoading(true);
    try {
      await clerkService.startOAuth(provider);
      onClose();
    } catch (err: any) {
      setError(err?.message || `Failed to initiate Clerk ${providerTitle} authentication`);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Colored SVG
  const GoogleLogo = () => (
    <View style={styles.logoWrap}>
      {Platform.OS === 'web' ? (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.355 0 3.39 2.673 1.482 6.545l3.784 3.22z"
          />
          <path
            fill="#34A853"
            d="M16.04 15.345c-1.073.727-2.427 1.164-4.04 1.164-3.073 0-5.673-2.073-6.6-4.909L1.582 14.8C3.518 18.727 7.51 21.418 12 21.418c3.073 0 5.855-1.127 7.927-3.091l-3.887-2.982z"
          />
          <path
            fill="#4A90E2"
            d="M19.91 3l-3.887 2.982C17.09 6.727 17.5 7.818 17.5 9c0 .727-.109 1.436-.318 2.1H12v4.8h6.818C18.236 17.945 15.39 20 12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8c2.091 0 3.991.818 5.418 2.145L19.91 3z"
          />
          <path
            fill="#FBBC05"
            d="M1.482 6.545L5.266 9.765C6.19 6.927 8.79 4.909 11.864 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.355 0 3.39 2.673 1.482 6.545z"
          />
        </svg>
      ) : (
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#4285F4' }}>G</Text>
      )}
    </View>
  );

  // GitHub Icon
  const GitHubLogo = () => (
    <View style={styles.logoWrap}>
      {Platform.OS === 'web' ? (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#FFFFFF">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ) : (
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFFFFF' }}>GH</Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {isGoogle ? <GoogleLogo /> : <GitHubLogo />}
              <View>
                <Text style={styles.modalTitle}>
                  {mode === 'signup' ? `Sign up with ${providerTitle}` : `Sign in with ${providerTitle}`}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Choose an ID to record and sign in permanently
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Existing Saved IDs Section */}
            {providerAccounts.length > 0 && !showNewForm ? (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionLabel}>
                    Recorded Permanent IDs ({providerAccounts.length})
                  </Text>
                  <View style={styles.permanentBadge}>
                    <ShieldCheck size={12} color={ACCENT} />
                    <Text style={styles.permanentBadgeText}>Saved</Text>
                  </View>
                </View>

                {providerAccounts.map((account) => {
                  const isThisSelected = selectedId === account.id;
                  const initial = (account.name || account.username || account.email || 'U')[0].toUpperCase();

                  return (
                    <TouchableOpacity
                      key={account.id}
                      style={[styles.accountCard, isThisSelected && styles.accountCardActive]}
                      onPress={() => handleSelect(account)}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      <View style={styles.accountAvatar}>
                        {account.avatar ? (
                          <Image source={{ uri: account.avatar }} style={styles.avatarImg} />
                        ) : (
                          <Text style={styles.avatarInitial}>{initial}</Text>
                        )}
                      </View>

                      <View style={styles.accountInfo}>
                        <View style={styles.accountNameRow}>
                          <Text style={styles.accountName}>{account.name || account.username}</Text>
                          <View style={styles.providerTag}>
                            <Text style={styles.providerTagText}>{account.provider.toUpperCase()}</Text>
                          </View>
                        </View>
                        <Text style={styles.accountEmail} numberOfLines={1}>
                          {account.email || `@${account.username}`}
                        </Text>
                        <Text style={styles.lastUsedText}>Permanent Account • Ready</Text>
                      </View>

                      <View style={styles.accountAction}>
                        {isThisSelected ? (
                          <ActivityIndicator size="small" color={ACCENT} />
                        ) : (
                          <View style={styles.selectArrow}>
                            <ArrowRight size={16} color={ACCENT} />
                          </View>
                        )}
                        {onRemoveAccount && !isLoading && (
                          <TouchableOpacity
                            style={styles.trashBtn}
                            onPress={(e) => {
                              e.stopPropagation?.();
                              onRemoveAccount(account.id);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Trash2 size={13} color="#666" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {/* If no accounts or user pressed 'Add another account' */}
            {(!providerAccounts.length || showNewForm) ? (
              <View style={styles.newFormBox}>
                <View style={styles.formHeaderRow}>
                  <Text style={styles.newFormTitle}>
                    {isGoogle ? 'Enter Google Email / Account ID' : 'Enter GitHub Username / ID'}
                  </Text>
                  {providerAccounts.length > 0 && (
                    <TouchableOpacity onPress={() => setShowNewForm(false)}>
                      <Text style={styles.cancelLinkText}>Back to Saved IDs</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Direct Clerk OAuth Launch Button */}
                <TouchableOpacity
                  style={styles.clerkOAuthBtn}
                  onPress={handleLaunchClerkOAuth}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Sparkles size={16} color="#7BEA12" style={{ marginRight: 8 }} />
                  <Text style={styles.clerkOAuthBtnText}>
                    1-Tap Authorize with Clerk {providerTitle}
                  </Text>
                </TouchableOpacity>

                <View style={styles.orDivider}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>OR SPECIFY ID MANUALLY</Text>
                  <View style={styles.orLine} />
                </View>

                <Text style={styles.inputHelp}>
                  {isGoogle
                    ? 'Enter your Google email (e.g. name@gmail.com). We will record this ID permanently.'
                    : 'Enter your GitHub username or handle. We will record this ID permanently.'}
                </Text>

                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder={isGoogle ? 'e.g. adil.developer@gmail.com' : 'e.g. adil-ansari'}
                    placeholderTextColor="#555"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType={isGoogle ? 'email-address' : 'default'}
                  />
                </View>

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Your Display Name (Optional)</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Adil Ansari"
                    placeholderTextColor="#555"
                    value={displayName}
                    onChangeText={setDisplayName}
                  />
                </View>

                <View style={styles.permanencyNote}>
                  <Check size={14} color={ACCENT} />
                  <Text style={styles.permanencyNoteText}>
                    This ID will be saved as your permanent record and kept signed in.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
                  onPress={handleCreateNew}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#0B2405" />
                  ) : (
                    <>
                      <Sparkles size={16} color="#0B2405" style={{ marginRight: 8 }} />
                      <Text style={styles.submitBtnText}>
                        Sign in with this {providerTitle} ID
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.useAnotherBtn}
                onPress={() => setShowNewForm(true)}
                activeOpacity={0.8}
              >
                <UserPlus size={16} color={ACCENT} style={{ marginRight: 8 }} />
                <Text style={styles.useAnotherText}>
                  Use another {providerTitle} ID / Register new account
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Footer note */}
          <View style={styles.footerNoteWrap}>
            <ShieldCheck size={13} color="#666" />
            <Text style={styles.footerNote}>
              Permanent identity linking & secure auto-session enabled
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    backgroundColor: '#12141C',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  logoWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1C1F2B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollArea: {
    maxHeight: 380,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  permanentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(123, 234, 18, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.3)',
  },
  permanentBadgeText: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: '700',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191C27',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  accountCardActive: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(123, 234, 18, 0.08)',
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#272B3C',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(123, 234, 18, 0.4)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: '700',
  },
  accountInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  providerTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  providerTagText: {
    color: '#AAA',
    fontSize: 8,
    fontWeight: '700',
  },
  accountEmail: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 1,
  },
  lastUsedText: {
    color: ACCENT,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  accountAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(123, 234, 18, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashBtn: {
    padding: 6,
  },
  useAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.35)',
    backgroundColor: 'rgba(123, 234, 18, 0.06)',
    marginTop: 4,
  },
  useAnotherText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: '600',
  },
  newFormBox: {
    backgroundColor: '#191C27',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  newFormTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelLinkText: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '600',
  },
  inputHelp: {
    color: '#777',
    fontSize: 11,
    marginBottom: 12,
    lineHeight: 16,
  },
  inputLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrap: {
    backgroundColor: '#0E1017',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  permanencyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 16,
  },
  permanencyNoteText: {
    color: '#9E9EA5',
    fontSize: 11,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: '#0B2405',
    fontSize: 13,
    fontWeight: '700',
  },
  footerNoteWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  footerNote: {
    color: '#666',
    fontSize: 10,
  },
  clerkOAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(123, 234, 18, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(123, 234, 18, 0.4)',
    borderRadius: 14,
    height: 44,
    marginBottom: 14,
    marginTop: 6,
  },
  clerkOAuthBtnText: {
    color: '#7BEA12',
    fontSize: 13,
    fontWeight: '700',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  orText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default AccountPickerModal;
