import { useSyncExternalStore } from 'react';
import api from '@/lib/api';
import { auth } from '@/lib/firebase';
import { getEnrolledCourseIds } from '@/hooks/useEnrollment';

export interface Resource {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  url?: string;
  mime_type?: string;
  type?: string;
  course_title?: string;
  course_id?: string;
  created_at?: string;
  updated_at?: string;
  size?: number;
}

export interface Course {
  id?: string;
  _id?: string;
  title: string;
  subject?: string;
  thumbnail_url?: string;
  resource_count?: number;
}

interface NotesState {
  courses: Course[];
  resourcesMap: Record<string, Resource[]>;
  loading: boolean;
  loadingMore: boolean;
  visibleCourseCount: number;
}

let state: NotesState = {
  courses: [],
  resourcesMap: {},
  loading: true,
  loadingMore: false,
  visibleCourseCount: 2,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const notesStore = {
  getState() {
    return state;
  },
  setState(partial: Partial<NotesState>) {
    state = { ...state, ...partial };
    notify();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useNotesStore() {
  return useSyncExternalStore(notesStore.subscribe, notesStore.getState);
}

export const notesActions = {
  async fetchProfileAndCourses(silent = false) {
    if (!silent) notesStore.setState({ loading: true });
    try {
      const isGuest = !auth.currentUser;
      
      const [coursesRes] = await Promise.allSettled([
        api.get('/admin/courses'),
      ]);

      const allCourses: Course[] = coursesRes.status === 'fulfilled'
        ? (Array.isArray(coursesRes.value.data) ? coursesRes.value.data : coursesRes.value.data?.data || [])
        : [];

      if (isGuest) {
        notesStore.setState({ courses: [], resourcesMap: {}, loading: false });
        return;
      }

      const enrolledIds = await getEnrolledCourseIds();
      const enrolledCourses = allCourses.filter(c => enrolledIds.includes(String(c.id || c._id || '')));
      
      if (enrolledCourses.length > 0) {
        notesStore.setState({ courses: enrolledCourses, visibleCourseCount: 2 });
        await this.fetchResourcesForCourses(enrolledCourses.slice(0, 2));
      } else {
        notesStore.setState({ courses: [], resourcesMap: {} });
      }
    } catch (e) {
      console.error('Notes fetch error:', e);
    } finally {
      notesStore.setState({ loading: false });
    }
  },

  async fetchResourcesForCourses(courseList: Course[]) {
    const results = await Promise.allSettled(
      courseList.map(c => 
        api.get('/admin/course_resources', { params: { course_id: c.id || c._id, limit: 100 } })
          .then(r => {
            const items = Array.isArray(r.data) ? r.data : r.data?.data || [];
            return {
              courseId: String(c.id || c._id),
              resources: items.map((item: Resource) => ({
                ...item,
                id: item.id || item._id || String(Math.random()),
                course_title: c.title,
                course_id: String(c.id || c._id),
              })).sort((a: Resource, b: Resource) => 
                new Date(b.updated_at || b.created_at || 0).getTime() -
                new Date(a.updated_at || a.created_at || 0).getTime()
              )
            };
          })
      )
    );

    const newMap: Record<string, Resource[]> = {};
    results.forEach(res => {
      if (res.status === 'fulfilled') {
        newMap[res.value.courseId] = res.value.resources;
      }
    });

    const currentState = notesStore.getState();
    notesStore.setState({ resourcesMap: { ...currentState.resourcesMap, ...newMap } });
  },

  async handleLoadMore() {
    const currentState = notesStore.getState();
    if (currentState.loadingMore || currentState.visibleCourseCount >= currentState.courses.length) return;
    
    notesStore.setState({ loadingMore: true });
    const nextCount = currentState.visibleCourseCount + 2;
    const nextCourses = currentState.courses.slice(currentState.visibleCourseCount, nextCount);
    
    await this.fetchResourcesForCourses(nextCourses);
    notesStore.setState({ visibleCourseCount: nextCount, loadingMore: false });
  }
};

export function getExt(resource: Resource): string {
  const name = resource.title || resource.name || '';
  const url = resource.url || '';
  return (name.split('.').pop() || url.split('?')[0].split('.').pop() || '').toLowerCase();
}

export function getFileCategory(ext: string): string {
  if (['mp4', 'mov', 'mkv', 'webm', 'avi'].includes(ext)) return 'Videos';
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'Audio';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'Images';
  if (ext === 'pdf') return 'PDFs';
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'Documents';
  if (['ppt', 'pptx'].includes(ext)) return 'Presentations';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Spreadsheets';
  return 'Other Files';
}
