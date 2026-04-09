import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import api from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !fullName)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await api.post('/users/register', {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          full_name: fullName,
          role: 'student'
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      await AsyncStorage.removeItem('guestMode'); // Erase guest mode if logging in standard
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(isSignUp ? 'Registration Failed' : 'Login Failed', error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('guestMode', 'true');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Skip Failed', 'Failed to store guest session mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>LearnVerse</Text>
        <Text style={styles.subtitle}>{isSignUp ? "Create your new account" : "Welcome back to Spark Academy"}</Text>
        
        {isSignUp && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#9ca3af"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signupLink}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.signupText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={styles.signupHighlight}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f8fafc',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  signupLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  signupHighlight: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748b',
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  skipText: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '500',
  }
});
