import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import api from '@/lib/api';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function StationeryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        if (isMounted) {
          setProducts(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching products: ", error);
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNotifyMe = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to receive notifications.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') }
      ]);
      return;
    }

    setNotifying(true);
    try {
      await setDoc(doc(db, 'notify_stationery', user.uid), {
        email: user.email,
        name: user.displayName,
        requestedAt: serverTimestamp()
      }, { merge: true });
      
      setHasSubscribed(true);
      Alert.alert('Success! 🎉', "You're on the list. We'll notify you the moment new products arrive!");
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setNotifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF5EB', '#FFF8F0']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Stationery Shop</Text>
          <TouchableOpacity style={styles.cartBtn}>
            <Ionicons name="cart-outline" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Palette.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emojiText}>📦</Text>
          </View>
          <Text style={styles.emptyTitle}>Currently Sold Out ✨</Text>
          <Text style={styles.emptyDesc}>
            Whoops! Our inventory was completely cleared out by eager learners. 📚🎒
          </Text>
          
          <TouchableOpacity 
            style={[styles.notifyBtn, hasSubscribed && styles.notifyBtnSubscribed, Shadow.sm]} 
            onPress={handleNotifyMe}
            disabled={notifying || hasSubscribed}
            activeOpacity={0.8}
          >
            {notifying ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : hasSubscribed ? (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.notifyBtnText}>You'll be notified!</Text>
              </>
            ) : (
              <>
                <Ionicons name="notifications" size={20} color="#fff" />
                <Text style={styles.notifyBtnText}>Notify Me 🔔</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {products.map(product => (
              <View key={product.id} style={[styles.productCard, Shadow.sm]}>
                <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productPrice}>₹{product.price}</Text>
                  <TouchableOpacity style={styles.addBtn}>
                    <Text style={styles.addBtnText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingBottom: 16, paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  cartBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h2, color: Palette.textPrimary },
  
  // Empty State Styles
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing['2xl'] },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF0E5', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  emojiText: { fontSize: 48 },
  emptyTitle: { ...Typography.h2, color: Palette.textPrimary, marginBottom: Spacing.md, textAlign: 'center' },
  emptyDesc: { ...Typography.body, color: Palette.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing['2xl'] },
  notifyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: BorderRadius.full, gap: 8 },
  notifyBtnSubscribed: { backgroundColor: Palette.success },
  notifyBtnText: { ...Typography.button, color: '#fff', fontSize: 16 },

  // Products Grid
  scrollContent: { padding: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { width: '48%', backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, overflow: 'hidden' },
  productImage: { width: '100%', height: 150, backgroundColor: Palette.bgCardElevated },
  productInfo: { padding: Spacing.md },
  productName: { ...Typography.bodyBold, color: Palette.textPrimary, marginBottom: 4 },
  productPrice: { ...Typography.body, color: Palette.primary, fontWeight: '700', marginBottom: 12 },
  addBtn: { backgroundColor: `${Palette.primary}15`, paddingVertical: 8, borderRadius: BorderRadius.md, alignItems: 'center' },
  addBtnText: { ...Typography.small, color: Palette.primary, fontWeight: '700' },
});
