import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image as RNImage, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

const { width } = Dimensions.get('window');

interface Course {
  id: string;
  title: string;
  short_description?: string;
  thumbnail_url?: string;
  price?: number;
}

export default function HomeScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/admin/courses');
        setCourses(response.data.data || response.data || []); 
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => router.push(`/course/${item.id}` as any)}
    >
      <RNImage 
        source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/300x150.png?text=Course' }} 
        style={styles.courseImage} 
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.courseDesc} numberOfLines={2}>{item.short_description || 'No description available'}</Text>
        <View style={styles.courseFooter}>
          <Text style={styles.coursePrice}>{(item.price ?? 0) > 0 ? `₹${item.price}` : 'Free'}</Text>
          <View style={styles.exploreBtn}>
            <Text style={styles.exploreBtnText}>Explore</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Learner</Text>
          <Text style={styles.subtitle}>What would you like to learn today?</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={renderCourse}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No courses available right now.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  courseCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#334155',
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 6,
  },
  courseDesc: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 20,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10b981',
  },
  exploreBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  }
});
