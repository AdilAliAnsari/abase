import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/* ================= CONFIG — point this at YOUR backend ================= */
const API_BASE = "http://192.168.1.20:3000";
const CHAT_URL = `${API_BASE}/api/ai/chat`;
const HEALTH_URL = `${API_BASE}/api/ai/health`;
/* ========================================================================= */

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

export default function AiChat() {
  const [status, setStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<FlatList>(null);
  const idCounter = useRef(0);
  const nextId = () => `m${idCounter.current++}`;

  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glow]);

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

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;

    setInput("");

    const userMsg: DisplayMessage = { id: nextId(), role: "user", content: text };
    const aiMsg: DisplayMessage = { id: nextId(), role: "assistant", content: "", pending: true };

    const history: ChatMessage[] = [
      ...messages.map(({ role, content }) => ({ role, content })),
      { role: "user", content: text },
    ].slice(-10);

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setSending(true);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, stream: false }),
      });

      const json = await res.json();
      const answer: string =
        json?.data?.choices?.[0]?.message?.content ?? "(empty response)";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsg.id ? { ...msg, content: answer, pending: false } : msg
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsg.id
            ? {
                ...msg,
                pending: false,
                content: `Couldn't reach the backend at ${API_BASE}. Check your LAN IP and that the server is running.`,
              }
            : msg
        )
      );
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  };

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.55],
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#06060f", "#120c26", "#06060f"]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.glowBlob, { opacity: glowOpacity }]} />

      <View style={styles.header}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AA</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>ABase AI</Text>
          <Text style={styles.subtitle}>2B LLM · 4K Context</Text>
        </View>

        <View style={[styles.statusPill, status === "online" && styles.statusOnline]}>
          <Text style={styles.statusText}>
            {status === "connecting"
              ? "connecting…"
              : status === "online"
                ? "● online"
                : "● offline"}
          </Text>
        </View>
      </View>

      {messages.length === 0 ? (
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Ask anything</Text>
          <Text style={styles.heroSub}>Your own LLM, running on your own backend.</Text>

          <View style={styles.chipsRow}>
            {STARTER_CHIPS.map((chip) => (
              <TouchableOpacity key={chip} style={styles.chip} onPress={() => send(chip)}>
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.bubbleUser : styles.bubbleAi,
              ]}
            >
              {item.pending && item.content === "" ? (
                <ActivityIndicator size="small" color="#69D900" />
              ) : (
                <Text style={styles.bubbleText}>{item.content}</Text>
              )}
            </View>
          )}
        />
      )}

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Message ABase AI…"
          placeholderTextColor="#8a8ab0"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send()}
          multiline
        />

        <TouchableOpacity style={styles.sendBtn} onPress={() => send()} disabled={sending}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#06060f",
  },
  glowBlob: {
    position: "absolute",
    top: -80,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#69D900",
    opacity: 0.3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 56,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  aiBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#69D900",
    borderWidth: 2,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#69D900",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  aiBadgeText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9a9ac0",
    fontSize: 11,
    letterSpacing: 1,
  },
  statusPill: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(105,217,0,0.4)",
    backgroundColor: "rgba(105,217,0,0.12)",
  },
  statusOnline: {
    borderColor: "rgba(105,217,0,0.6)",
  },
  statusText: {
    color: "#cfcfe8",
    fontSize: 11,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroSub: {
    color: "#b9b9d8",
    fontSize: 13,
    marginBottom: 20,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(105,217,0,0.4)",
    backgroundColor: "rgba(105,217,0,0.08)",
  },
  chipText: {
    color: "#e0e0f5",
    fontSize: 12,
  },
  bubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "#69D900",
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 21,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 14,
    paddingBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    maxHeight: 120,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#69D900",
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: {
    color: "#fff",
    fontSize: 18,
  },
});
