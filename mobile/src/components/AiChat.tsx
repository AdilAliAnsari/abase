/**
 * ABase AI Chat
 * React Native / Expo
 *
 * Background Pixel Stars (zero-lag 60fps retro twinkling stars & shooting stars)
 * + Sleek BorderBeam Chat Input interface
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import {
  AtSign,
  ChevronDown,
  ArrowUp,
  ArrowLeft,
  Sparkles,
  Bot,
  Code,
  BookOpen,
  Zap,
  BrainCircuit,
  Check,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { BorderBeam, BackgroundPixelStars } from "./ui";

/* ================= CONFIG ================= */

const API_BASE = "http://192.168.1.20:3000";
const CHAT_URL = `${API_BASE}/api/ai/chat`;
const HEALTH_URL = `${API_BASE}/api/ai/health`;

/* ========================================== */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface DisplayMessage extends ChatMessage {
  id: string;
  pending?: boolean;
}

const STARTER_CHIPS = [
  "Explain my app idea",
  "Write a poem about code",
  "Help me debug",
];

const MENTION_OPTIONS = [
  { id: "abase", label: "ABase System", icon: Sparkles, desc: "General assistant & app navigation" },
  { id: "code", label: "Code Assistant", icon: Code, desc: "Debug, write, and refactor code" },
  { id: "books", label: "Book Library", icon: BookOpen, desc: "Search & discuss books & authors" },
  { id: "fast", label: "Fast Reasoner", icon: Zap, desc: "Quick responses with 2B model" },
];

const AGENT_MODES = [
  { id: "Agent", label: "Agent", desc: "Autonomous task execution" },
  { id: "Chat", label: "Chat", desc: "Direct conversational AI" },
  { id: "Coder", label: "Coder", desc: "Full-stack code generator" },
  { id: "Research", label: "Research", desc: "Multi-step source explorer" },
];

const MODEL_MODES = [
  { id: "Auto", label: "Auto", desc: "Automatically selects optimal model" },
  { id: "Fast 2B", label: "Fast 2B", desc: "Lightning fast local inference" },
  { id: "Deep Think", label: "Deep Think", desc: "Multi-pass chain of thought" },
  { id: "Creative", label: "Creative", desc: "Expanded vocabulary & imagination" },
];

/* =========================================================
   AI CHAT MAIN COMPONENT
   ========================================================= */

export default function AiChat({ navigation: propNavigation }: { navigation?: any }) {
  const hookNavigation = useNavigation<any>();
  const navigation = propNavigation || hookNavigation;

  const handleGoBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate("HomeTab");
    }
  };

  const [status, setStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Selected modes & mention state
  const [agentMode, setAgentMode] = useState("Agent");
  const [modelMode, setModelMode] = useState("Auto");
  const [activeMention, setActiveMention] = useState<string | null>(null);

  // Selector modal state
  const [modalType, setModalType] = useState<"mention" | "agent" | "model" | null>(null);

  const listRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  const idCounter = useRef(0);

  const nextId = () => `m${idCounter.current++}`;

  /* Backend health check */
  useEffect(() => {
    let cancelled = false;

    fetch(HEALTH_URL)
      .then((response) => response.json())
      .then(() => {
        if (!cancelled) setStatus("online");
      })
      .catch(() => {
        if (!cancelled) setStatus("offline");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* Send message */
  const send = async (overrideText?: string) => {
    const rawText = (overrideText ?? input).trim();
    if (!rawText || sending) return;

    const fullText = activeMention
      ? `@${activeMention} ${rawText}`
      : rawText;

    setInput("");
    setActiveMention(null);

    const userMsg: DisplayMessage = {
      id: nextId(),
      role: "user",
      content: fullText,
    };

    const aiMsg: DisplayMessage = {
      id: nextId(),
      role: "assistant",
      content: "",
      pending: true,
    };

    const history: ChatMessage[] = [
      ...messages.map(({ role, content }): ChatMessage => ({ role, content })),
      { role: "user" as const, content: fullText },
    ].slice(-10);

    setMessages((previous) => [...previous, userMsg, aiMsg]);
    setSending(true);

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          stream: false,
          agentMode,
          modelMode,
        }),
      });

      const json = await response.json();
      const answer: string =
        json?.data?.choices?.[0]?.message?.content ?? "(empty response)";

      setMessages((previous) =>
        previous.map((message) =>
          message.id === aiMsg.id
            ? { ...message, content: answer, pending: false }
            : message
        )
      );
    } catch {
      setMessages((previous) =>
        previous.map((message) =>
          message.id === aiMsg.id
            ? {
                ...message,
                pending: false,
                content: `Couldn't reach the backend at ${API_BASE}.`,
              }
            : message
        )
      );
    } finally {
      setSending(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <View style={styles.root}>
      {/* 21st.dev BACKGROUND PIXEL STARS (Zero-lag, 60fps) */}
      <BackgroundPixelStars backgroundColor="#05030D" />

      {/* Subtle translucent dark overlay for contrast */}
      <View pointerEvents="none" style={styles.darkOverlay} />

      <KeyboardAvoidingView
        style={StyleSheet.absoluteFill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleGoBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back to main page"
          >
            <ArrowLeft size={19} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.orb} />
          <View>
            <Text style={styles.title}>ABase AI</Text>
            <Text style={styles.subtitle}>2B LLM · 4K Context</Text>
          </View>

          <View
            style={[
              styles.statusPill,
              status === "online" && styles.statusOnline,
              status === "offline" && styles.statusOffline,
            ]}
          >
            <Text style={styles.statusText}>
              {status === "connecting"
                ? "connecting…"
                : status === "online"
                ? "● online"
                : "● offline"}
            </Text>
          </View>
        </View>

        {/* ================= HERO OR MESSAGES ================= */}
        {messages.length === 0 ? (
          <View style={styles.hero}>
            <View style={styles.sparkleIconContainer}>
              <Sparkles size={26} color="#B19EEF" />
            </View>
            <Text style={styles.heroTitle}>Build anything</Text>
            <Text style={styles.heroSub}>
              Your own LLM assistant with intelligent agent modes & quick actions.
            </Text>

            <View style={styles.chipsRow}>
              {STARTER_CHIPS.map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={styles.chip}
                  onPress={() => send(chip)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(message) => message.id}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 16,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bubble,
                  item.role === "user" ? styles.bubbleUser : styles.bubbleAi,
                ]}
              >
                {item.pending && item.content === "" ? (
                  <ActivityIndicator size="small" color="#B19EEF" />
                ) : (
                  <Text style={styles.bubbleText}>{item.content}</Text>
                )}
              </View>
            )}
          />
        )}

        {/* ================= BORDER BEAM CHAT INPUT ================= */}
        <View style={styles.composerWrapper}>
          <BorderBeam
            size="md"
            colorVariant="colorful"
            duration={4.5}
            borderWidth={1.5}
            borderRadius={22}
            containerStyle={styles.borderBeamContainer}
            style={styles.borderBeamInner}
          >
            <View style={styles.chatInputCard}>
              {/* TOP ACTION BAR: @ Mention & Active Badges */}
              <View style={styles.inputTopRow}>
                <TouchableOpacity
                  style={[
                    styles.chipBtn,
                    activeMention ? styles.chipBtnActive : null,
                  ]}
                  onPress={() => setModalType("mention")}
                  activeOpacity={0.7}
                >
                  <AtSign
                    size={13}
                    color={activeMention ? "#FF9FFC" : "#808388"}
                    strokeWidth={1.75}
                  />
                  {activeMention && (
                    <Text style={styles.activeMentionText}>
                      {activeMention}
                    </Text>
                  )}
                </TouchableOpacity>

                {activeMention && (
                  <TouchableOpacity
                    onPress={() => setActiveMention(null)}
                    style={styles.clearMentionBtn}
                  >
                    <Text style={styles.clearMentionText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* MAIN TEXT INPUT AREA */}
              <TextInput
                ref={textInputRef}
                style={styles.inputField}
                placeholder="Build anything, ask questions, or code..."
                placeholderTextColor="#5E5E6E"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => send()}
                multiline
                textAlignVertical="top"
              />

              {/* BOTTOM TOOLBAR: Mode selectors & Up Arrow Send */}
              <View style={styles.inputBottomRow}>
                {/* Agent Chip */}
                <TouchableOpacity
                  style={styles.chipBtn}
                  onPress={() => setModalType("agent")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipBtnText}>{agentMode}</Text>
                  <ChevronDown
                    size={12}
                    color="#8B9099"
                    style={{ transform: [{ rotate: "0deg" }] }}
                  />
                </TouchableOpacity>

                {/* Auto / Execution Mode Chip */}
                <TouchableOpacity
                  style={styles.chipBtn}
                  onPress={() => setModalType("model")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipBtnText}>{modelMode}</Text>
                  <ChevronDown
                    size={12}
                    color="#8B9099"
                    style={{ transform: [{ rotate: "0deg" }] }}
                  />
                </TouchableOpacity>

                {/* Send Button with ArrowUp */}
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    hasText && !sending ? styles.sendBtnActive : null,
                    sending ? styles.sendBtnSending : null,
                  ]}
                  onPress={() => send()}
                  disabled={!hasText || sending}
                  activeOpacity={0.75}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ArrowUp
                      size={15}
                      color={hasText ? "#FFFFFF" : "#7E7E8E"}
                      strokeWidth={2.2}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </BorderBeam>
        </View>

        {/* ================= POPUP MODALS FOR CHIPS ================= */}
        <Modal
          visible={modalType !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setModalType(null)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalType(null)}
          >
            <Pressable
              style={styles.modalSheet}
              onPress={(e) => e.stopPropagation()}
            >
              {modalType === "mention" && (
                <View>
                  <Text style={styles.modalHeading}>Mention Context (@)</Text>
                  <Text style={styles.modalSubheading}>
                    Tag a specialized assistant or database context
                  </Text>
                  <View style={styles.optionsList}>
                    {MENTION_OPTIONS.map((item) => {
                      const IconComponent = item.icon;
                      const isSelected = activeMention === item.label;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.optionItem,
                            isSelected && styles.optionItemSelected,
                          ]}
                          onPress={() => {
                            setActiveMention(item.label);
                            setModalType(null);
                          }}
                        >
                          <View style={styles.optionIconBox}>
                            <IconComponent size={16} color="#B19EEF" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.optionTitle}>{item.label}</Text>
                            <Text style={styles.optionDesc}>{item.desc}</Text>
                          </View>
                          {isSelected && <Check size={16} color="#00E5FF" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {modalType === "agent" && (
                <View>
                  <Text style={styles.modalHeading}>Select Agent Mode</Text>
                  <Text style={styles.modalSubheading}>
                    Configure how the AI handles your prompts
                  </Text>
                  <View style={styles.optionsList}>
                    {AGENT_MODES.map((mode) => {
                      const isSelected = agentMode === mode.label;
                      return (
                        <TouchableOpacity
                          key={mode.id}
                          style={[
                            styles.optionItem,
                            isSelected && styles.optionItemSelected,
                          ]}
                          onPress={() => {
                            setAgentMode(mode.label);
                            setModalType(null);
                          }}
                        >
                          <View style={styles.optionIconBox}>
                            <Bot size={16} color="#FF9FFC" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.optionTitle}>{mode.label}</Text>
                            <Text style={styles.optionDesc}>{mode.desc}</Text>
                          </View>
                          {isSelected && <Check size={16} color="#00E5FF" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {modalType === "model" && (
                <View>
                  <Text style={styles.modalHeading}>Execution Mode</Text>
                  <Text style={styles.modalSubheading}>
                    Tune speed vs cognitive depth
                  </Text>
                  <View style={styles.optionsList}>
                    {MODEL_MODES.map((m) => {
                      const isSelected = modelMode === m.label;
                      return (
                        <TouchableOpacity
                          key={m.id}
                          style={[
                            styles.optionItem,
                            isSelected && styles.optionItemSelected,
                          ]}
                          onPress={() => {
                            setModelMode(m.label);
                            setModalType(null);
                          }}
                        >
                          <View style={styles.optionIconBox}>
                            <BrainCircuit size={16} color="#00E5FF" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.optionTitle}>{m.label}</Text>
                            <Text style={styles.optionDesc}>{m.desc}</Text>
                          </View>
                          {isSelected && <Check size={16} color="#00E5FF" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const CHIP_BASE = {
  borderRadius: 36,
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.06)",
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#05030D",
  },

  darkOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.32)",
  },

  /* ================= HEADER ================= */

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 56 : 46,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  orb: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#7B61FF",
    shadowColor: "#B19EEF",
    shadowOpacity: 0.85,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  subtitle: {
    color: "#B8B2D4",
    fontSize: 11,
    letterSpacing: 1,
  },

  statusPill: {
    marginLeft: "auto",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(177, 158, 239, 0.4)",
    backgroundColor: "rgba(30, 20, 55, 0.55)",
  },

  statusOnline: {
    borderColor: "rgba(0, 255, 170, 0.5)",
  },

  statusOffline: {
    borderColor: "rgba(255, 80, 80, 0.5)",
  },

  statusText: {
    color: "#E5E1F4",
    fontSize: 11,
  },

  /* ================= HERO ================= */

  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  sparkleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(123, 97, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(177, 158, 239, 0.3)",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
    textShadowColor: "rgba(177, 158, 239, 0.45)",
    textShadowRadius: 20,
  },

  heroSub: {
    color: "#D0CBE3",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 22,
    textAlign: "center",
    maxWidth: 320,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },

  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(177, 158, 239, 0.35)",
    backgroundColor: "rgba(30, 20, 55, 0.48)",
  },

  chipText: {
    color: "#E9E5F7",
    fontSize: 12,
  },

  /* ================= BUBBLES ================= */

  bubble: {
    maxWidth: "82%",
    padding: 14,
    borderRadius: 17,
    marginBottom: 12,
  },

  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(82, 39, 255, 0.78)",
    borderBottomRightRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(177, 158, 239, 0.25)",
  },

  bubbleAi: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },

  bubbleText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    lineHeight: 21,
  },

  /* ================= BORDER BEAM CHAT COMPOSER ================= */

  composerWrapper: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
  },

  borderBeamContainer: {
    width: "100%",
    maxWidth: 580,
    alignSelf: "center",
    shadowColor: "#7B61FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  borderBeamInner: {
    backgroundColor: "#161424",
  },

  chatInputCard: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    minHeight: 124,
    justifyContent: "space-between",
  },

  inputTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  chipBtn: {
    ...CHIP_BASE,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 25,
    paddingHorizontal: 8,
  },

  chipBtnActive: {
    backgroundColor: "rgba(255, 159, 252, 0.15)",
    borderColor: "rgba(255, 159, 252, 0.4)",
  },

  activeMentionText: {
    fontSize: 11,
    color: "#FF9FFC",
    fontWeight: "600",
  },

  clearMentionBtn: {
    padding: 2,
  },

  clearMentionText: {
    color: "#808388",
    fontSize: 12,
  },

  chipBtnText: {
    fontSize: 12,
    lineHeight: 14,
    color: "#CACCD2",
    fontWeight: "500",
  },

  inputField: {
    fontSize: 13.5,
    lineHeight: 19,
    color: "#FFFFFF",
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },

  inputBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },

  sendBtn: {
    ...CHIP_BASE,
    width: 28,
    height: 28,
    marginLeft: "auto",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },

  sendBtnActive: {
    backgroundColor: "#5227FF",
    borderColor: "rgba(177, 158, 239, 0.6)",
    shadowColor: "#5227FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },

  sendBtnSending: {
    opacity: 0.8,
  },

  /* ================= MODALS & SHEETS ================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },

  modalSheet: {
    backgroundColor: "#1B192E",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },

  modalHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  modalSubheading: {
    fontSize: 12,
    color: "#9E9EAF",
    marginBottom: 14,
  },

  optionsList: {
    gap: 8,
  },

  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },

  optionItemSelected: {
    backgroundColor: "rgba(123, 97, 255, 0.16)",
    borderColor: "rgba(123, 97, 255, 0.5)",
  },

  optionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },

  optionDesc: {
    fontSize: 11,
    color: "#8E8EA0",
  },
});
