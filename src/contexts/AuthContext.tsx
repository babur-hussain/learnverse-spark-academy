import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from '@/integrations/firebase/config';
import { User, AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/integrations/api/client';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

// Define admin credentials
export const ADMIN_EMAIL = 'admin@sparkacademy.edu';
export const ADMIN_PASSWORD = 'AdminSparkAcademy2025!';

// Define role types
export type UserRole = 'admin' | 'teacher' | 'student';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up the Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || undefined,
          avatar_url: firebaseUser.photoURL || undefined,
          user_metadata: {
            username: firebaseUser.displayName || undefined,
            full_name: firebaseUser.displayName || undefined,
            avatar_url: firebaseUser.photoURL || undefined,
          },
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      console.log('Login successful for user:', firebaseUser.email);
      toast({
        title: "Login Successful",
        description: email === ADMIN_EMAIL
          ? "Welcome, Administrator!"
          : "Welcome back to Spark Academy!",
      });

      return { success: true, user: firebaseUser };
    } catch (err: any) {
      console.error('Login function error:', err);

      let errorMessage = "Login failed. Please try again.";

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many login attempts. Please wait a moment before trying again.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      }

      // Special handling for admin account creation on first login
      if (email === ADMIN_EMAIL && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
        try {
          console.log('Attempting to create admin account...');

          const adminCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
          const adminUser = adminCredential.user;

          await updateProfile(adminUser, {
            displayName: 'Administrator',
          });

          // Register admin role in backend
          try {
            await apiClient.post('/api/users/register', {
              uid: adminUser.uid,
              email: ADMIN_EMAIL,
              username: `admin_${Date.now()}`,
              full_name: 'Administrator',
              role: 'admin',
            });
          } catch (apiErr) {
            console.warn('Failed to register admin role in backend:', apiErr);
          }

          toast({
            title: "Admin Account Created",
            description: "Administrator account has been set up.",
          });

          return { success: true, user: adminUser };
        } catch (createErr: any) {
          console.error('Admin account creation failed:', createErr);
          toast({
            title: "Admin Account Creation Failed",
            description: createErr.message,
            variant: "destructive",
          });
          throw createErr;
        }
      }

      const authError = new Error(errorMessage);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  // Alias for login for better component compatibility
  const signIn = login;

  const signUp = async (
    email: string,
    password: string,
    userData: {
      username?: string;
      full_name?: string;
      role: UserRole;
    }
  ): Promise<{ error?: string; user?: any } | undefined> => {
    try {
      setLoading(true);
      // Block registration with admin email
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        toast({
          title: "Registration failed",
          description: "This email address is reserved.",
          variant: "destructive",
        });
        return { error: "This email address is reserved." };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase profile
      const uniqueUsername = userData.username
        ? `${userData.username}_${Date.now().toString().slice(-5)}`
        : `user_${Date.now().toString()}`;

      await updateProfile(firebaseUser, {
        displayName: userData.full_name || uniqueUsername,
      });

      // Register user in backend (MongoDB) with role
      try {
        await apiClient.post('/api/users/register', {
          uid: firebaseUser.uid,
          email,
          username: uniqueUsername,
          full_name: userData.full_name,
          role: userData.role,
        });
      } catch (apiErr: any) {
        console.error('Error registering user in backend:', apiErr);
        toast({
          title: "Registration incomplete",
          description: "Your account was created but profile setup failed. Please contact support.",
          variant: "destructive",
        });
        return { error: "Backend registration failed", user: firebaseUser };
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
      });

      return { user: firebaseUser };
    } catch (err: any) {
      console.error('Sign up error:', err);

      let errorMessage = err.message || "An unexpected error occurred";

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }

      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (err) {
      console.error('Sign out error:', err);
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Register user in backend (MongoDB) if they are new, or just to sync
      // We default to 'student' role for Google sign-ups, or the backend can handle it
      try {
        await apiClient.post('/api/users/register', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: `user_${firebaseUser.uid.slice(0, 5)}`,
          full_name: firebaseUser.displayName,
          role: 'student',
        });
      } catch (apiErr) {
        console.warn('Failed to register/sync Google user in backend:', apiErr);
      }

      toast({
        title: "Login Successful",
        description: "Welcome to Spark Academy!",
      });

      return { success: true, user: firebaseUser };
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      toast({
        title: "Google Sign-In Failed",
        description: err.message || "An error occurred during Google sign-in.",
        variant: "destructive",
      });
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Alias for logout for better component compatibility
  const signOut = logout;

  return (
    <AuthContext.Provider value={{ user, loading, login, signIn, signUp, logout, signOut, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
