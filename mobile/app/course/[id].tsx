import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image as RNImage, Dimensions, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../lib/api';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

interface Course {
  id: string;
  title: string;
  description: string;
  banner_url?: string;
  thumbnail_url?: string;
}

interface ResourceNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  url?: string;
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<ResourceNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, resourceRes] = await Promise.all([
          api.get('/admin/courses', { params: { id } }),
          api.get('/admin/course_resources', { params: { course_id: id } })
        ]);
        
        const courseData = Array.isArray(courseRes.data) ? courseRes.data.find((c: any) => c.id === id) : courseRes.data;
        if(courseData) setCourse(courseData);

        if (resourceRes.data) setResources(resourceRes.data);
      } catch (error) {
        console.error('Error fetching course info:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const normalize = (p: string) => p.replace(/\\/g, '/').replace(/(^\/|\/$)/g, '');
  const normCurrent = normalize(currentPath);
  const children = resources.filter(n => {
    const nodeParent = normalize(n.path.split('/').slice(0, -1).join('/'));
    return nodeParent === normCurrent;
  });
  const isRoot = !currentPath;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Course not found.</Text>
      </View>
    );
  }

  const renderResource = ({ item }: { item: ResourceNode }) => {
    const isFolder = item.type === 'folder';
    return (
      <TouchableOpacity 
        style={styles.resourceCard}
        onPress={() => {
          if (isFolder) setCurrentPath(item.path);
          else if (item.url) Linking.openURL(item.url);
        }}
      >
        <IconSymbol 
          name={isFolder ? "folder.fill" : "doc.text.fill"} 
          size={40} 
          color={isFolder ? "#3b82f6" : "#ef4444"} 
        />
        <Text style={styles.resourceName} numberOfLines={2}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.headerImageContainer}>
        <RNImage 
          source={{ uri: course.banner_url || course.thumbnail_url || 'https://via.placeholder.com/600x300.png?text=Course' }} 
          style={styles.headerImage} 
        />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerOverlay}>
          <Text style={styles.courseTitle}>{course.title}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>About Course</Text>
        <Text style={styles.description}>{course.description || "No description provided."}</Text>

        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 8 }]}>Course Resources</Text>
        {!isRoot && (
          <TouchableOpacity style={styles.folderBackBtn} onPress={() => setCurrentPath(currentPath.split('/').slice(0, -1).join('/'))}>
            <IconSymbol name="arrow.up.backward" size={16} color="#3b82f6" />
            <Text style={styles.folderBackText}>Go Back</Text>
          </TouchableOpacity>
        )}
        
        {children.length === 0 ? (
          <Text style={styles.emptyText}>No files or folders found here.</Text>
        ) : (
          <View style={styles.gridContainer}>
            {children.map(item => (
              <View key={item.path} style={styles.gridItem}>
                {renderResource({ item })}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a'
  },
  headerImageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1e293b'
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)'
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 22,
  },
  folderBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignSelf: 'flex-start',
    borderRadius: 8
  },
  folderBackText: {
    color: '#3b82f6',
    marginLeft: 6,
    fontWeight: '600'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  resourceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    height: 120,
    justifyContent: 'center'
  },
  resourceName: {
    marginTop: 10,
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '500'
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
  }
});
