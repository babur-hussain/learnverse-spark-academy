import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import Markdown from 'react-native-markdown-display';
import { sendChatMessage, ChatMessage } from '@/lib/openrouter';
import api from '@/lib/api';
import { auth } from '@/lib/firebase';
import { Palette, BorderRadius, Typography, Spacing, Shadow } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUri?: string;
}

// ─── Auth Wall ────────────────────────────────────────────────────────────────

function LoginRequiredScreen() {
  const router = useRouter();

  const handleLoginPress = async () => {
    // Clear guest mode so layout doesn't auto-redirect back to tabs
    await AsyncStorage.removeItem('guestMode');
    router.push('/login' as any);
  };

  return (
    <SafeAreaView style={authStyles.container} edges={['top', 'bottom']}>
      <View style={authStyles.iconWrap}>
        <Ionicons name="lock-closed" size={48} color={Palette.primary} />
      </View>
      <Text style={authStyles.title}>Login Required</Text>
      <Text style={authStyles.subtitle}>
        Sign in to chat with Padhaai Wala and keep your entire conversation history
        synced across all your devices.
      </Text>
      <TouchableOpacity
        style={authStyles.loginBtn}
        onPress={handleLoginPress}
        activeOpacity={0.85}
      >
        <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={authStyles.loginBtnText}>Sign In to Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Main Chat Screen ─────────────────────────────────────────────────────────

export default function AIChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined); // undefined = loading

  // Chat state
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingDots = useRef(new Animated.Value(0)).current;

  // ── 1. Track Firebase auth state ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // ── 2. Load chat history from MongoDB when user is known ─────────────────
  useEffect(() => {
    if (!currentUser) return;

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        // Fetch existing sessions
        const sessionsRes = await api.get('/ai-chat/history');
        let sid: string;

        if (sessionsRes.data && sessionsRes.data.length > 0) {
          setSessions(sessionsRes.data);
          // Use the most recent session (already sorted by createdAt desc)
          sid = sessionsRes.data[0].id;
        } else {
          // Create a new session for this user
          const newSession = await api.post('/ai-chat/sessions', {
            title: 'Padhaai Wala Chat',
          });
          setSessions([newSession.data]);
          sid = newSession.data.id;
        }

        setSessionId(sid);

        // Fetch messages for this session
        const messagesRes = await api.get(`/ai-chat/sessions/${sid}/messages`);
        if (messagesRes.data && messagesRes.data.length > 0) {
          const loaded: DisplayMessage[] = messagesRes.data.map((m: any) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.createdAt),
          }));
          setMessages(loaded);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
        }
      } catch (err) {
        console.warn('Failed to load AI chat history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [currentUser]);

  const createNewSession = useCallback(async () => {
    setIsHistoryModalVisible(false);
    setHistoryLoading(true);
    try {
      const newSession = await api.post('/ai-chat/sessions', {
        title: 'New Chat',
      });
      setSessions((prev) => [newSession.data, ...prev]);
      setSessionId(newSession.data.id);
      setMessages([]);
    } catch (err) {
      console.warn('Failed to create new session:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const switchSession = useCallback(async (id: string) => {
    if (id === sessionId) {
      setIsHistoryModalVisible(false);
      return;
    }
    setIsHistoryModalVisible(false);
    setHistoryLoading(true);
    try {
      setSessionId(id);
      const messagesRes = await api.get(`/ai-chat/sessions/${id}/messages`);
      if (messagesRes.data && messagesRes.data.length > 0) {
        const loaded: DisplayMessage[] = messagesRes.data.map((m: any) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.createdAt),
        }));
        setMessages(loaded);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn('Failed to switch session:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [sessionId]);

  const deleteSession = useCallback((id: string) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat session? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/ai-chat/sessions/${id}`);
              setSessions(prev => prev.filter(s => s.id !== id));
              if (id === sessionId) {
                const currentSessions = sessions;
                const remaining = currentSessions.filter(s => s.id !== id);
                if (remaining.length > 0) {
                  switchSession(remaining[0].id);
                } else {
                  createNewSession();
                }
              }
            } catch (err) {
              Alert.alert("Error", "Could not delete the chat session.");
            }
          }
        }
      ]
    );
  }, [sessionId, sessions, switchSession, createNewSession]);

  // ── 3. Typing animation ────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingDots.setValue(0);
    }
  }, [isLoading]);

  // ── Image Picker ───────────────────────────────────────────────────────────
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take a photo.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // ── Audio Recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone permissions are required.');
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      setRecording(null);
      
      // MOCK Transcription
      Alert.alert('Voice Note', 'Transcribing voice is mocked in this version.');
      setInputText((prev) => prev + (prev ? ' ' : '') + 'Can you explain this topic in detail?');

    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // ── 4. Save message to MongoDB ─────────────────────────────────────────────
  const saveMessage = useCallback(
    async (role: 'user' | 'assistant', content: string) => {
      if (!sessionId) return;
      try {
        await api.post(`/ai-chat/sessions/${sessionId}/messages`, { role, content });
      } catch (err) {
        console.warn('Failed to save AI message to backend:', err);
      }
    },
    [sessionId]
  );

  // ── 5. Send message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if ((!text && !selectedImage) || isLoading) return;

    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      imageUri: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);
    scrollToBottom();

    saveMessage('user', text + (imageToSend ? ' [Image Attached]' : ''));

    try {
      const chatHistory: ChatMessage[] = messages
        .slice(-10)
        .map((m) => {
          if (m.imageUri) {
            return {
              role: m.role,
              content: [
                { type: 'text', text: m.content || 'Image' },
                { type: 'image_url', image_url: { url: m.imageUri } }
              ]
            }
          }
          return { role: m.role, content: m.content };
        });

      if (imageToSend) {
        chatHistory.push({
          role: 'user',
          content: [
            { type: 'text', text: text || 'Please describe this image.' },
            { type: 'image_url', image_url: { url: imageToSend } }
          ]
        });
      } else {
        chatHistory.push({ role: 'user', content: text });
      }

      const response = await sendChatMessage(chatHistory);

      const aiMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      scrollToBottom();

      // Persist AI response
      saveMessage('assistant', response);
    } catch (error: any) {
      const errorMessage: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      scrollToBottom();
    } finally {
      setIsLoading(false);
    }
  }, [inputText, selectedImage, isLoading, messages, scrollToBottom, saveMessage]);

  // ── 6. Render message ──────────────────────────────────────────────────────
  const preprocessMarkdown = (text: string) => {
    if (!text) return '';
    let processed = text.replace(/^(#+)([^#\s])/gm, '$1 $2');
    processed = processed.replace(/([^\n])\n(\*|-|\d+\.) /g, '$1\n\n$2 ');
    return processed;
  };

  const renderMessage = useCallback(({ item }: { item: DisplayMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.messageBubbleRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color="#FF6B35" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
            Shadow.sm,
          ]}
        >
          {!isUser && <Text style={styles.aiName}>Padhaai Wala</Text>}

          {item.imageUri && (
            <Image 
              source={{ uri: item.imageUri }} 
              style={styles.messageImage} 
              contentFit="cover" 
            />
          )}

          {isUser ? (
            item.content ? <Text style={[styles.messageText, styles.userMessageText]}>{item.content}</Text> : null
          ) : (
            <Markdown style={markdownStyles}>{preprocessMarkdown(item.content)}</Markdown>
          )}

          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  }, []);

  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    return (
      <View style={[styles.messageBubbleRow, styles.aiRow]}>
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={16} color="#FF6B35" />
        </View>
        <Animated.View
          style={[
            styles.messageBubble,
            styles.aiBubble,
            styles.typingBubble,
            { opacity: typingDots.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
          ]}
        >
          <View style={styles.typingDots}>
            <View style={[styles.dot, { backgroundColor: Palette.primary }]} />
            <View style={[styles.dot, { backgroundColor: Palette.primaryLight, marginHorizontal: 4 }]} />
            <View style={[styles.dot, { backgroundColor: Palette.primary }]} />
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="sparkles" size={48} color={Palette.primary} />
      </View>
      <Text style={styles.emptyTitle}>Hi! I'm Padhaai Wala 👋</Text>
      <Text style={styles.emptySubtitle}>
        Your AI study buddy. Ask me anything about your studies — Math, Science, English, Coding, and more!
      </Text>
      <View style={styles.suggestions}>
        {[
          'Explain photosynthesis',
          'Solve x² + 5x + 6 = 0',
          'Help with English essay',
          "What is Newton's 3rd law?",
        ].map((suggestion, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.suggestionChip, Shadow.sm]}
            onPress={() => setInputText(suggestion)}
          >
            <Ionicons name="bulb-outline" size={14} color={Palette.primary} />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderHistoryModal = () => (
    <Modal
      visible={isHistoryModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsHistoryModalVisible(false)}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: Palette.bgCard }} edges={['top']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chat History</Text>
          <TouchableOpacity onPress={() => setIsHistoryModalVisible(false)} style={styles.modalCloseBtn}>
            <Ionicons name="close" size={24} color={Palette.textPrimary} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.historyItem, item.id === sessionId && styles.historyItemActive]}
              onPress={() => switchSession(item.id)}
            >
              <View style={styles.historyItemContent}>
                <Ionicons name="chatbubble-outline" size={20} color={item.id === sessionId ? Palette.primary : Palette.textSecondary} />
                <View style={styles.historyItemTexts}>
                  <Text style={[styles.historyItemTitle, item.id === sessionId && { color: Palette.primary }]} numberOfLines={1}>
                    {item.title || 'Padhaai Wala Chat'}
                  </Text>
                  <Text style={styles.historyItemDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.historyDeleteBtn} onPress={() => deleteSession(item.id)}>
                <Ionicons name="trash-outline" size={18} color={Palette.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.historyEmptyText}>No previous chats found.</Text>
          }
        />
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.newChatBtn} onPress={createNewSession}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.newChatBtnText}>New Chat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // ── Guards ────────────────────────────────────────────────────────────────
  // Still resolving auth state
  if (currentUser === undefined) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </SafeAreaView>
    );
  }

  // Not logged in
  if (currentUser === null) {
    return <LoginRequiredScreen />;
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, Shadow.sm]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={18} color="#FF6B35" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Padhaai Wala</Text>
            <Text style={styles.headerSubtitle}>
              {historyLoading ? 'Loading history…' : isLoading ? 'Typing...' : 'AI Study Buddy'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.headerAction} onPress={() => setIsHistoryModalVisible(true)}>
          <Ionicons name="time-outline" size={22} color={Palette.textSecondary} />
        </TouchableOpacity>
      </View>

      {renderHistoryModal()}

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {historyLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Palette.primary} />
            <Text style={{ color: Palette.textSecondary, marginTop: 12, ...Typography.small }}>
              Loading your chat history…
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.emptyList,
            ]}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderTypingIndicator}
            onContentSizeChange={scrollToBottom}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input bar */}
        <View
          style={[
            styles.inputBarContainer,
            Shadow.md,
            { paddingBottom: Math.max(insets.bottom, Spacing.md) },
          ]}
        >
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} contentFit="cover" />
              <TouchableOpacity style={styles.imagePreviewRemove} onPress={() => setSelectedImage(null)}>
                <Ionicons name="close-circle" size={24} color={Palette.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color={Palette.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachBtn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color={Palette.textSecondary} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask Padhaai Wala anything..."
              placeholderTextColor={Palette.textMuted}
              multiline
              maxLength={2000}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            {inputText.trim() || selectedImage ? (
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  isLoading && styles.sendBtnDisabled,
                ]}
                onPress={sendMessage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.micBtn, isRecording && styles.micBtnRecording]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
              >
                <Ionicons name="mic" size={20} color={isRecording ? "#FFFFFF" : Palette.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Markdown Styles ──────────────────────────────────────────────────────────
const markdownStyles: any = {
  body: {
    color: Palette.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Typography.body?.fontFamily,
  },
  strong: {
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  em: {
    fontStyle: 'italic',
  },
  heading1: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginVertical: 12,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginVertical: 10,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.primary,
    marginVertical: 8,
  },
  paragraph: {
    marginVertical: 6,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  code_inline: {
    backgroundColor: Palette.bgSubtle,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: Palette.primary,
    borderWidth: 1,
    borderColor: Palette.border,
    overflow: 'hidden',
  },
  fence: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: Spacing.md,
    marginVertical: 8,
  },
  code_block: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: Spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#D4D4D4',
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: Palette.primary,
    paddingLeft: 10,
    marginVertical: 6,
    color: Palette.textSecondary,
    backgroundColor: Palette.bgSubtle,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  hr: {
    backgroundColor: Palette.border,
    height: 1,
    marginVertical: 12,
  },
};

// ─── Auth Wall Styles ─────────────────────────────────────────────────────────
const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing['2xl'],
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    ...Shadow.md,
  },
  loginBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 16,
  },
});

// ─── Chat Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgCard,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Palette.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    gap: Spacing.md,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    fontSize: 16,
  },
  headerSubtitle: {
    ...Typography.small,
    color: Palette.primary,
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatArea: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  emptyList: {
    flex: 1,
  },
  messageBubbleRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: SCREEN_WIDTH * 0.78,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  userBubble: {
    backgroundColor: Palette.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Palette.bgCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  typingBubble: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  aiName: {
    ...Typography.small,
    color: Palette.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  messageText: {
    ...Typography.body,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    ...Typography.small,
    marginTop: 6,
    fontSize: 10,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: Palette.textMuted,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing['2xl'],
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  suggestionText: {
    ...Typography.caption,
    color: Palette.textPrimary,
  },
  inputBarContainer: {
    backgroundColor: Palette.bgCard,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Palette.bgSubtle,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Palette.textPrimary,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Palette.textMuted,
    opacity: 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  modalTitle: {
    ...Typography.h3,
    color: Palette.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  historyList: {
    padding: Spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Palette.bgSubtle,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  historyItemActive: {
    backgroundColor: Palette.primaryLight + '20', // transparent primary
    borderColor: Palette.primary,
    borderWidth: 1,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  historyItemTexts: {
    flex: 1,
  },
  historyItemTitle: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
  },
  historyItemDate: {
    ...Typography.small,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  historyDeleteBtn: {
    padding: Spacing.sm,
  },
  historyEmptyText: {
    ...Typography.body,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  modalFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  newChatBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  imagePreviewContainer: {
    position: 'relative',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
    alignItems: 'flex-start',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
  },
  imagePreviewRemove: {
    position: 'absolute',
    top: 6,
    left: 90,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  attachBtn: {
    padding: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtnRecording: {
    backgroundColor: '#EF4444',
  },
});
