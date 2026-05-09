/**
 * useEnrollment hook
 * - Checks if user is enrolled in a course
 * - Handles enroll / unenroll via API + local AsyncStorage cache
 * - Endpoint tries: POST /enrollments { course_id } (falls back to local-only on 404)
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/api';
import { auth } from '@/lib/firebase';

const STORAGE_KEY = 'enrolled_course_ids';

async function loadLocalIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveLocalIds(ids: string[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/** Returns the full set of enrolled course IDs (from API or local cache) */
export async function getEnrolledCourseIds(): Promise<string[]> {
  try {
    const res = await api.get('/enrollments');
    const data: any[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
    const ids = data.map((e: any) => String(e.course_id || e.course?._id || e.course?.id || e._id || ''));
    await saveLocalIds(ids);
    return ids;
  } catch {
    // API not available yet — fall back to local
    return loadLocalIds();
  }
}

export function useEnrollment(courseId: string) {
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    (async () => {
      const ids = await loadLocalIds();
      setEnrolled(ids.includes(courseId));
      setLoading(false);
    })();
  }, [courseId]);

  const enroll = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setEnrolling(true);
    try {
      // Try server first, but only if user is logged in
      if (auth.currentUser) {
        await api.post('/enrollments', { course_id: courseId });
      }
    } catch (e: any) {
      // If 404/501 (endpoint doesn't exist yet) or 401 (unauthorized due to guest fallback), proceed with local-only
      const status = e?.response?.status;
      if (status && status !== 404 && status !== 501 && status !== 405 && status !== 401) {
        setEnrolling(false);
        return { success: false, error: e?.response?.data?.message || 'Enrollment failed. Try again.' };
      }
    }
    // Persist locally regardless
    const ids = await loadLocalIds();
    if (!ids.includes(courseId)) {
      ids.push(courseId);
      await saveLocalIds(ids);
    }
    setEnrolled(true);
    setEnrolling(false);
    return { success: true };
  }, [courseId]);

  const unenroll = useCallback(async () => {
    try { await api.delete(`/enrollments/${courseId}`); } catch {}
    const ids = await loadLocalIds();
    await saveLocalIds(ids.filter(id => id !== courseId));
    setEnrolled(false);
  }, [courseId]);

  return { enrolled, loading, enrolling, enroll, unenroll };
}
