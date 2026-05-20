import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateCareerGuidance } from '@/lib/openrouter';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const TABS = [
  { id: 'aptitude', label: 'Aptitude', icon: 'clipboard' as const },
  { id: 'matches', label: 'Matches', icon: 'people' as const },
  { id: 'roadmap', label: 'Roadmap', icon: 'map' as const },
  { id: 'courses', label: 'Courses', icon: 'book' as const },
];

const APTITUDE_QUESTIONS = [
  "I enjoy solving complex mathematical problems and puzzles.",
  "I prefer working with machines, tools, or software rather than managing people.",
  "I am drawn to artistic activities like painting, designing, or creative writing.",
  "I like to understand how things work and frequently take things apart to see inside.",
  "I feel comfortable leading a team and making important decisions.",
  "I am highly organized and enjoy planning events or managing schedules.",
  "I find it easy to empathize with others and enjoy helping people with their problems.",
  "I am fascinated by science, biology, and how the human body works.",
  "I enjoy analyzing data and looking for patterns to draw conclusions.",
  "I prefer clear rules and structured environments over ambiguous situations.",
  "I am comfortable speaking in public and presenting ideas to a group.",
  "I enjoy debates and persuading others to see my point of view.",
  "I like working outdoors or being physically active rather than sitting at a desk.",
  "I am interested in financial markets, investing, and managing money.",
  "I pay close attention to details and rarely make careless mistakes.",
  "I enjoy learning new languages and exploring different cultures.",
  "I am interested in law, justice, and how society is governed.",
  "I often come up with original ideas and out-of-the-box solutions.",
  "I enjoy teaching others and sharing my knowledge.",
  "I am comfortable taking risks and trying new things, even if I might fail.",
  "I prefer working independently rather than as part of a team.",
  "I am interested in environmental issues and sustainability.",
  "I enjoy building things with my hands, such as crafting or carpentry.",
  "I am good at mediating conflicts and helping people resolve disagreements.",
  "I am fascinated by technology and keeping up with the latest gadgets and software."
];

const OPTIONS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

export default function CareerGuidanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('aptitude');
  
  // Quiz State
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [careerMatches, setCareerMatches] = useState<any[]>([]);
  const [roadmapSteps, setRoadmapSteps] = useState<any[]>([]);
  const [hasCompletedTest, setHasCompletedTest] = useState(false);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      let savedMatchesStr = await AsyncStorage.getItem('careerMatches');
      let savedRoadmapStr = await AsyncStorage.getItem('roadmapSteps');
      
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'career', 'guidance');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.matches && data.roadmap) {
              savedMatchesStr = JSON.stringify(data.matches);
              savedRoadmapStr = JSON.stringify(data.roadmap);
              
              // Sync to local storage
              await AsyncStorage.setItem('careerMatches', savedMatchesStr);
              await AsyncStorage.setItem('roadmapSteps', savedRoadmapStr);
            }
          }
        } catch (dbError) {
          console.error('Failed to load career data from Firestore', dbError);
        }
      }

      if (savedMatchesStr && savedRoadmapStr) {
        setCareerMatches(JSON.parse(savedMatchesStr));
        setRoadmapSteps(JSON.parse(savedRoadmapStr));
        setHasCompletedTest(true);
      }
    } catch (e) {
      console.error('Failed to load career data', e);
    }
  };

  const startTest = () => {
    setIsTestRunning(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswer = async (option: string) => {
    const newAnswers = { ...answers, [APTITUDE_QUESTIONS[currentQuestionIndex]]: option };
    setAnswers(newAnswers);

    if (currentQuestionIndex < APTITUDE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Finished
      setIsTestRunning(false);
      setIsGenerating(true);
      
      try {
        const result = await generateCareerGuidance(newAnswers);
        
        if (result.matches && result.roadmap) {
          setCareerMatches(result.matches);
          setRoadmapSteps(result.roadmap);
          setHasCompletedTest(true);
          
          await AsyncStorage.setItem('careerMatches', JSON.stringify(result.matches));
          await AsyncStorage.setItem('roadmapSteps', JSON.stringify(result.roadmap));
          
          const user = auth.currentUser;
          if (user) {
            try {
              const docRef = doc(db, 'users', user.uid, 'career', 'guidance');
              await setDoc(docRef, { matches: result.matches, roadmap: result.roadmap }, { merge: true });
            } catch (dbError) {
              console.error('Failed to save career data to Firestore', dbError);
            }
          }
          
          setActiveTab('matches');
        } else {
          Alert.alert('Error', 'Unexpected AI response format.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to generate career guidance. Please try again.');
        console.error(error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const renderAptitudeTab = () => {
    if (isGenerating) {
      return (
        <View style={styles.generatingContainer}>
          <ActivityIndicator size="large" color={Palette.primary} />
          <Text style={styles.generatingTitle}>Analyzing Your Profile...</Text>
          <Text style={styles.generatingDesc}>Our AI is matching your interests with the best career paths and building your personalized roadmap. This may take up to 15 seconds.</Text>
        </View>
      );
    }

    if (isTestRunning) {
      const progress = ((currentQuestionIndex) / APTITUDE_QUESTIONS.length) * 100;
      return (
        <View style={styles.quizContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Question {currentQuestionIndex + 1} of {APTITUDE_QUESTIONS.length}</Text>
            <TouchableOpacity onPress={() => setIsTestRunning(false)}>
              <Ionicons name="close" size={24} color={Palette.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          
          <Text style={styles.questionText}>{APTITUDE_QUESTIONS[currentQuestionIndex]}</Text>
          
          <View style={styles.optionsContainer}>
            {OPTIONS.map((option, index) => (
              <TouchableOpacity key={index} style={styles.optionBtn} onPress={() => handleAnswer(option)}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    return (
      <View>
        <View style={[styles.ctaCard, Shadow.md]}>
          <LinearGradient colors={Palette.gradientPrimary as any} style={styles.ctaGradient}>
            <Ionicons name="clipboard" size={40} color="#fff" />
            <Text style={styles.ctaTitle}>Take Career Aptitude Test</Text>
            <Text style={styles.ctaDesc}>Discover your ideal career path based on your interests and skills with our AI.</Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={startTest}>
              <Text style={styles.ctaBtnText}>{hasCompletedTest ? 'Retake Test' : 'Start Test'}</Text>
              <Ionicons name="arrow-forward" size={16} color={Palette.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>How It Works</Text>
        {['Answer 25 questions about your interests', 'Get AI-powered career recommendations', 'Follow personalized career roadmap'].map((step, i) => (
          <View key={i} style={[styles.stepRow, Shadow.sm]}>
            <LinearGradient colors={Palette.gradientPrimary as any} style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </LinearGradient>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderEmptyState = (message: string) => (
    <View style={styles.emptySection}>
      <Ionicons name="lock-closed-outline" size={48} color={Palette.textMuted} />
      <Text style={styles.emptyText}>{message}</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={() => setActiveTab('aptitude')}>
        <Text style={styles.emptyBtnText}>Take Aptitude Test</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FFF5EB', '#FFF8F0']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Career Guidance</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)} activeOpacity={0.8}>
              {activeTab === tab.id ? (
                <LinearGradient colors={Palette.gradientPrimary as any} style={styles.tabPill}>
                  <Ionicons name={tab.icon} size={14} color="#fff" />
                  <Text style={styles.tabTextActive}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabPillInactive}>
                  <Ionicons name={tab.icon} size={14} color={Palette.textMuted} />
                  <Text style={styles.tabText}>{tab.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {activeTab === 'aptitude' && renderAptitudeTab()}

        {activeTab === 'matches' && (
          <View>
            <Text style={styles.sectionTitle}>Your Career Matches</Text>
            {!hasCompletedTest ? renderEmptyState("Complete the aptitude test to unlock your AI career matches") : (
              careerMatches.map((career: any) => (
                <TouchableOpacity key={career.id} style={[styles.matchCard, Shadow.sm]} activeOpacity={0.85}>
                  <View style={[styles.matchIcon, { backgroundColor: `${career.color}15` }]}>
                    <Ionicons name={career.icon} size={24} color={career.color} />
                  </View>
                  <View style={styles.matchContent}>
                    <Text style={styles.matchTitle}>{career.title}</Text>
                    <View style={styles.skillsRow}>
                      {career.skills.map((s: string) => (
                        <View key={s} style={styles.skillBadge}><Text style={styles.skillText}>{s}</Text></View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.matchPercent}>
                    <Text style={[styles.matchPercentText, { color: career.color }]}>{career.match}%</Text>
                    <Text style={styles.matchPercentLabel}>Match</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'roadmap' && (
          <View>
            <Text style={styles.sectionTitle}>Your Career Roadmap</Text>
            {!hasCompletedTest ? renderEmptyState("Complete the aptitude test to generate your personalized roadmap") : (
              roadmapSteps.map((step: any, i: number) => (
                <View key={step.step} style={styles.roadmapRow}>
                  <View style={styles.roadmapTimeline}>
                    <View style={[styles.roadmapDot, step.done && styles.roadmapDotDone]}>
                      {step.done && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    {i < roadmapSteps.length - 1 && <View style={[styles.roadmapLine, step.done && styles.roadmapLineDone]} />}
                  </View>
                  <View style={[styles.roadmapCard, Shadow.sm]}>
                    <Text style={styles.roadmapTitle}>{step.title}</Text>
                    <Text style={styles.roadmapDesc}>{step.desc}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'courses' && (
          <View>
            <Text style={styles.sectionTitle}>Recommended Courses</Text>
            <View style={styles.emptySection}>
              <Ionicons name="school-outline" size={48} color={Palette.textMuted} />
              <Text style={styles.emptyText}>No exact course matches right now. Keep exploring!</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingBottom: 16, paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h2, color: Palette.textPrimary },
  tabsRow: { gap: 10 },
  tabPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, gap: 6 },
  tabPillInactive: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Palette.bgCard, borderWidth: 1, borderColor: Palette.border, gap: 6 },
  tabTextActive: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  tabText: { ...Typography.caption, color: Palette.textSecondary },
  scrollContent: { padding: Spacing.xl, paddingBottom: 40 },
  sectionTitle: { ...Typography.h3, color: Palette.textPrimary, marginBottom: Spacing.lg, marginTop: Spacing.xl },
  ctaCard: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  ctaGradient: { padding: Spacing['3xl'], alignItems: 'center' },
  ctaTitle: { ...Typography.h2, color: '#fff', marginTop: Spacing.lg, textAlign: 'center' },
  ctaDesc: { ...Typography.body, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 8, marginBottom: Spacing.xl },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.md, gap: 8 },
  ctaBtnText: { ...Typography.button, color: Palette.primary },
  stepRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.lg },
  stepNumber: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { ...Typography.bodyBold, color: '#fff', fontSize: 16 },
  stepText: { ...Typography.body, color: Palette.textPrimary, flex: 1 },
  matchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  matchIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  matchContent: { flex: 1 },
  matchTitle: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 15 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  skillBadge: { backgroundColor: Palette.bgCardElevated, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm },
  skillText: { ...Typography.small, color: Palette.textMuted, fontSize: 10 },
  matchPercent: { alignItems: 'center', marginLeft: 8 },
  matchPercentText: { ...Typography.h2, fontSize: 22 },
  matchPercentLabel: { ...Typography.small, color: Palette.textMuted },
  roadmapRow: { flexDirection: 'row', marginBottom: 4 },
  roadmapTimeline: { width: 32, alignItems: 'center' },
  roadmapDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: Palette.bgCardElevated, borderWidth: 2, borderColor: Palette.border, justifyContent: 'center', alignItems: 'center' },
  roadmapDotDone: { backgroundColor: Palette.success, borderColor: Palette.success },
  roadmapLine: { width: 2, flex: 1, backgroundColor: Palette.border },
  roadmapLineDone: { backgroundColor: Palette.success },
  roadmapCard: { flex: 1, backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginLeft: Spacing.md, marginBottom: Spacing.md },
  roadmapTitle: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 14 },
  roadmapDesc: { ...Typography.caption, color: Palette.textSecondary, marginTop: 4 },
  emptySection: { alignItems: 'center', paddingVertical: Spacing['3xl'], backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  emptyText: { ...Typography.body, color: Palette.textMuted, marginTop: 12, textAlign: 'center', marginBottom: Spacing.lg },
  emptyBtn: { backgroundColor: Palette.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.md },
  emptyBtnText: { ...Typography.button, color: '#fff' },
  quizContainer: { backgroundColor: Palette.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadow.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  progressText: { ...Typography.caption, color: Palette.textSecondary },
  progressBarBg: { height: 6, backgroundColor: Palette.bgCardElevated, borderRadius: 3, marginBottom: Spacing.xl },
  progressBarFill: { height: 6, backgroundColor: Palette.primary, borderRadius: 3 },
  questionText: { ...Typography.h2, color: Palette.textPrimary, marginBottom: Spacing['2xl'], textAlign: 'center' },
  optionsContainer: { gap: Spacing.md },
  optionBtn: { backgroundColor: Palette.bg, borderWidth: 1, borderColor: Palette.border, padding: Spacing.lg, borderRadius: BorderRadius.md, alignItems: 'center' },
  optionText: { ...Typography.body, color: Palette.textPrimary },
  generatingContainer: { alignItems: 'center', paddingVertical: Spacing['3xl'], backgroundColor: Palette.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadow.md },
  generatingTitle: { ...Typography.h3, color: Palette.textPrimary, marginTop: Spacing.xl, marginBottom: 8 },
  generatingDesc: { ...Typography.body, color: Palette.textSecondary, textAlign: 'center', lineHeight: 22 }
});
