import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Dimensions, Modal, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';
import { Shimmer } from '@/components/ui/LoadingShimmer';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useEnrollment } from '@/hooks/useEnrollment';
import { auth } from '@/lib/firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Course {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  short_description?: string;
  banner_url?: string;
  thumbnail_url?: string;
  price?: number;
  instructor_name?: string;
}

interface ResourceNode {
  id?: string;
  _id?: string;
  name: string;
  title?: string;
  path: string;
  type: 'file' | 'folder' | string;
  url?: string;
  mime_type?: string;
}

const FILE_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  pdf: { icon: 'document-text', color: '#ef4444' },
  mp4: { icon: 'videocam', color: '#8b5cf6' },
  mov: { icon: 'videocam', color: '#8b5cf6' },
  jpg: { icon: 'image', color: '#ec4899' },
  jpeg: { icon: 'image', color: '#ec4899' },
  png: { icon: 'image', color: '#ec4899' },
  txt: { icon: 'document', color: '#64748b' },
  default: { icon: 'document', color: '#3b82f6' },
};

function getFileInfo(name: string, type: string) {
  if (type === 'folder') return { icon: 'folder' as keyof typeof Ionicons.glyphMap, color: '#3b82f6' };
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

// ─── Enrollment Confirmation Modal ──────────────────────────────────────────────
function EnrollModal({
  visible,
  course,
  enrolling,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  course: Course | null;
  enrolling: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!visible || !course) return null;
  const isPaid = course.price !== undefined && course.price > 0;

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          {/* Handle */}
          <View style={modal.handle} />

          <LinearGradient
            colors={isPaid ? ['#FF6B35', '#FFB84D'] : ['#10B981', '#34D399']}
            style={modal.iconBg}
          >
            <Ionicons name={isPaid ? 'card' : 'rocket'} size={28} color="#fff" />
          </LinearGradient>

          <Text style={modal.title}>{isPaid ? 'Enroll in Course' : 'Enroll for Free'}</Text>
          <Text style={modal.courseName} numberOfLines={2}>{course.title}</Text>

          {isPaid ? (
            <View style={modal.priceBanner}>
              <Text style={modal.priceLabel}>Course Price</Text>
              <Text style={modal.priceValue}>{'₹' + course.price}</Text>
            </View>
          ) : (
            <View style={[modal.priceBanner, { backgroundColor: '#10B98115' }]}>
              <Text style={[modal.priceLabel, { color: '#10B981' }]}>This course is</Text>
              <Text style={[modal.priceValue, { color: '#10B981' }]}>FREE 🎉</Text>
            </View>
          )}

          {isPaid ? (
            <Text style={modal.payNote}>
              {'Payment will be processed securely.\nYou get lifetime access after payment.'}
            </Text>
          ) : null}

          <View style={modal.btnRow}>
            <TouchableOpacity style={modal.cancelBtn} onPress={onCancel}>
              <Text style={modal.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[modal.confirmBtn, enrolling ? { opacity: 0.7 } : undefined]}
              onPress={onConfirm}
              disabled={enrolling}
            >
              <LinearGradient
                colors={isPaid ? ['#FF6B35', '#FFB84D'] : ['#10B981', '#34D399']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={modal.confirmGradient}
              >
                {enrolling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name={isPaid ? 'card-outline' : 'checkmark-circle'} size={18} color="#fff" />
                    <Text style={modal.confirmText}>{isPaid ? 'Pay ₹' + course.price : 'Enroll Now'}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const courseId = String(id);

  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<ResourceNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const { enrolled, loading: enrollLoading, enrolling, enroll } = useEnrollment(courseId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, resourceRes] = await Promise.all([
          api.get(`/admin/courses/${id}`),
          api.get('/admin/course_resources', { params: { course_id: id } })
        ]);
        const courseData = Array.isArray(courseRes.data)
          ? courseRes.data.find((c: any) => c.id === id || c._id === id)
          : courseRes.data;
        if (courseData) setCourse(courseData);
        if (resourceRes.data) setResources(Array.isArray(resourceRes.data) ? resourceRes.data : resourceRes.data?.data || []);
      } catch (error) {
        console.error('Error fetching course info:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleEnrollPress = () => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }
    setShowEnrollModal(true);
  };

  const handleConfirmEnroll = async () => {
    const result = await enroll();
    setShowEnrollModal(false);
    
    // Delay the alert slightly to allow the Modal to fully unmount.
    // This prevents the Android native crash: "Tried to show an alert while not attached to an Activity"
    setTimeout(() => {
      if (result.success) {
        Alert.alert(
          '🎉 Enrolled!',
          `You have successfully enrolled in "${course?.title}". All course materials are now unlocked.`,
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        Alert.alert('Enrollment Failed', result.error || 'Please try again.', [{ text: 'OK' }]);
      }
    }, 400);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Shimmer width="100%" height={280} borderRadius={0} />
        <View style={{ padding: 20 }}>
          <Shimmer width="80%" height={28} />
          <Shimmer width="60%" height={16} style={{ marginTop: 12 }} />
          <Shimmer width="100%" height={100} style={{ marginTop: 24 }} />
        </View>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.centered}>
        <Ionicons name="book-outline" size={48} color={Palette.textMuted} />
        <Text style={styles.emptyText}>Course not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackBtn}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPaid = course.price !== undefined && course.price > 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: course.banner_url || course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient colors={['rgba(15,23,42,0.2)', 'rgba(15,23,42,0.95)'] as any} style={styles.heroOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            {course.price !== undefined && (
              <View style={[styles.priceBadge, course.price === 0 && styles.freeBadge]}>
                <Text style={styles.priceText}>{course.price > 0 ? `₹${course.price}` : 'FREE'}</Text>
              </View>
            )}
            <Text style={styles.heroTitle}>{course.title}</Text>
            {!!course.instructor_name && (
              <Text style={styles.instructorText}>by {course.instructor_name}</Text>
            )}
          </View>
        </View>

        {/* Enroll / Enrolled Action Row */}
        <View style={styles.actionRow}>
          {enrollLoading ? (
            <View style={[styles.actionBtn, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator color={Palette.primary} />
            </View>
          ) : enrolled ? (
            <View style={[styles.actionBtn, Shadow.sm]}>
              <LinearGradient colors={['#10B981', '#34D399']} style={styles.actionBtnGradient}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Enrolled ✓</Text>
              </LinearGradient>
            </View>
          ) : (
            <TouchableOpacity style={[styles.actionBtn, Shadow.sm]} onPress={handleEnrollPress} activeOpacity={0.85}>
              <LinearGradient colors={Palette.gradientPrimary as any} style={styles.actionBtnGradient}>
                <Ionicons name={isPaid ? 'card' : 'rocket'} size={18} color="#fff" />
                <Text style={styles.actionBtnText}>{isPaid ? `Enroll for ₹${course.price}` : 'Enroll for Free'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtnOutline, Shadow.sm]} activeOpacity={0.8}>
            <Ionicons name="heart-outline" size={20} color={Palette.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtnOutline, Shadow.sm]} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={20} color={Palette.primary} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Course</Text>
          <Text style={styles.description}>{course.description || course.short_description || 'No description provided.'}</Text>
        </View>

        {/* Stats */}
        <View style={styles.infoRow}>
          <View style={[styles.infoCard, Shadow.sm]}>
            <Ionicons name="document-text" size={22} color={Palette.primary} />
            <Text style={styles.infoValue}>{resources.length}</Text>
            <Text style={styles.infoLabel}>Resources</Text>
          </View>
          <View style={[styles.infoCard, Shadow.sm]}>
            <Ionicons name="videocam" size={22} color={Palette.warning} />
            <Text style={styles.infoValue}>{resources.filter(r => r.type === 'video').length}</Text>
            <Text style={styles.infoLabel}>Videos</Text>
          </View>
          <View style={[styles.infoCard, Shadow.sm]}>
            <Ionicons name="layers" size={22} color={Palette.success} />
            <Text style={styles.infoValue}>{resources.filter(r => r.type !== 'video').length}</Text>
            <Text style={styles.infoLabel}>Documents</Text>
          </View>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Resources</Text>

          {!enrolled ? (
            // Locked state — blur hint
            <TouchableOpacity style={styles.lockedCard} onPress={handleEnrollPress} activeOpacity={0.85}>
              <LinearGradient colors={['#FF6B3520', '#FFB84D10']} style={styles.lockedGradient}>
                <Ionicons name="lock-closed" size={40} color={Palette.primary} />
                <Text style={styles.lockedTitle}>Content Locked</Text>
                <Text style={styles.lockedDesc}>
                  {resources.length > 0
                    ? `Enroll to unlock ${resources.length} files & resources`
                    : 'Enroll to access all course materials'}
                </Text>
                <View style={styles.unlockBtn}>
                  <LinearGradient colors={Palette.gradientPrimary as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.unlockGradient}>
                    <Ionicons name={isPaid ? 'card-outline' : 'rocket'} size={16} color="#fff" />
                    <Text style={styles.unlockText}>{isPaid ? `Unlock for ₹${course.price}` : 'Unlock Free'}</Text>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : resources.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="folder-open-outline" size={48} color={Palette.textMuted} />
              <Text style={styles.emptyText}>No files or resources yet</Text>
            </View>
          ) : (
            <View style={styles.resourceGrid}>
              {resources.map((item, index) => {
                const title = item.title || item.name || `Resource ${index + 1}`;
                const { icon, color } = getFileInfo(title, item.type);
                return (
                  <TouchableOpacity
                    key={item.id || item._id || index}
                    style={[styles.resourceCard, Shadow.sm]}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (item.url) {
                        router.push({
                          pathname: '/resource-viewer' as any,
                          params: { url: item.url, title: title, type: item.mime_type || item.type || 'document' }
                        });
                      }
                    }}
                  >
                    <View style={[styles.resourceIconContainer, { backgroundColor: `${color}15` }]}>
                      <Ionicons name={icon} size={32} color={color} />
                    </View>
                    <Text style={styles.resourceName} numberOfLines={2}>{title}</Text>
                    {!!item.url && (
                      <View style={styles.viewOnlineTag}>
                        <Text style={styles.viewOnlineText}>Open File</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Enrollment Modal */}
      <EnrollModal
        visible={showEnrollModal}
        course={course}
        enrolling={enrolling}
        onConfirm={handleConfirmEnroll}
        onCancel={() => setShowEnrollModal(false)}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  centered: { flex: 1, backgroundColor: Palette.bg, justifyContent: 'center', alignItems: 'center' },
  heroContainer: { width: '100%', height: 280, position: 'relative' },
  heroImage: { width: '100%', height: '100%', backgroundColor: Palette.bgCardElevated },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  backBtn: {
    position: 'absolute', top: 52, left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.xl },
  priceBadge: {
    alignSelf: 'flex-start', backgroundColor: Palette.primary,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.sm, marginBottom: 8,
  },
  freeBadge: { backgroundColor: Palette.success },
  priceText: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  heroTitle: { ...Typography.h1, color: '#fff', fontSize: 26 },
  instructorText: { ...Typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  actionRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg, gap: Spacing.md,
  },
  actionBtn: { flex: 1, borderRadius: BorderRadius.md, overflow: 'hidden' },
  actionBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 8,
  },
  actionBtnText: { ...Typography.button, color: '#fff', fontSize: 15 },
  actionBtnOutline: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    backgroundColor: Palette.bgCard, borderWidth: 1, borderColor: Palette.border,
    justifyContent: 'center', alignItems: 'center',
  },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.h3, color: Palette.textPrimary, marginBottom: Spacing.md },
  description: { ...Typography.body, color: Palette.textSecondary, lineHeight: 24 },
  infoRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.md, marginBottom: Spacing.xl },
  infoCard: { flex: 1, backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center' },
  infoValue: { ...Typography.h2, color: Palette.textPrimary, fontSize: 22, marginTop: 4 },
  infoLabel: { ...Typography.small, color: Palette.textMuted, marginTop: 2 },
  resourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  resourceCard: {
    width: (SCREEN_WIDTH - 56) / 2, backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg, padding: Spacing.lg,
    alignItems: 'center', justifyContent: 'center', minHeight: 130,
  },
  resourceIconContainer: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
  },
  resourceName: { ...Typography.caption, color: Palette.textPrimary, textAlign: 'center', fontWeight: '500' },
  viewOnlineTag: {
    marginTop: 6, backgroundColor: `${Palette.primary}15`,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.sm,
  },
  viewOnlineText: { ...Typography.small, color: Palette.primary, fontWeight: '600', fontSize: 10 },

  // Locked state
  lockedCard: { borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: `${Palette.primary}30` },
  lockedGradient: { padding: Spacing['3xl'], alignItems: 'center' },
  lockedTitle: { ...Typography.h3, color: Palette.textPrimary, marginTop: 12, marginBottom: 8 },
  lockedDesc: { ...Typography.body, color: Palette.textSecondary, textAlign: 'center', lineHeight: 22 },
  unlockBtn: { marginTop: 20, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  unlockGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 28, paddingVertical: 12,
  },
  unlockText: { ...Typography.bodyBold, color: '#fff' },

  emptySection: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyText: { ...Typography.body, color: Palette.textMuted, marginTop: 12 },
  goBackBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: Palette.primary, borderRadius: BorderRadius.md },
  goBackText: { ...Typography.button, color: '#fff' },
});

// ─── Modal Styles ──────────────────────────────────────────────────────────────
const modal = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 40, alignItems: 'center',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e2e8f0', marginBottom: 24,
  },
  iconBg: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { ...Typography.h3, color: Palette.textPrimary, marginBottom: 6 },
  courseName: {
    ...Typography.body, color: Palette.textSecondary,
    textAlign: 'center', marginBottom: 20, paddingHorizontal: 8,
  },
  priceBanner: {
    backgroundColor: '#FF6B3515', borderRadius: 14, width: '100%',
    paddingVertical: 14, alignItems: 'center', marginBottom: 16,
  },
  priceLabel: { ...Typography.caption, color: Palette.textMuted },
  priceValue: { ...Typography.h2, color: Palette.primary, marginTop: 2 },
  payNote: {
    ...Typography.small, color: Palette.textMuted,
    textAlign: 'center', lineHeight: 18, marginBottom: 24,
  },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: BorderRadius.xl,
    backgroundColor: '#f1f5f9', alignItems: 'center',
  },
  cancelText: { ...Typography.bodyBold, color: Palette.textSecondary },
  confirmBtn: { flex: 2, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  confirmGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 8,
  },
  confirmText: { ...Typography.bodyBold, color: '#fff', fontSize: 15 },
});
