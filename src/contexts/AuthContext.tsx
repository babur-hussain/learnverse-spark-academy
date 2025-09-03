import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { User, AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

// Define admin credentials
export const ADMIN_EMAIL = 'admin@sparkacademy.edu';
export const ADMIN_PASSWORD = 'AdminSparkAcademy2025!';

// Define role types
export type UserRole = 'admin' | 'teacher' | 'student';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email,
          avatar_url: currentSession.user.user_metadata?.avatar_url,
          user_metadata: currentSession.user.user_metadata
        });
      } else {
        setUser(null);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email,
          avatar_url: currentSession.user.user_metadata?.avatar_url,
          user_metadata: currentSession.user.user_metadata
        });
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Test Supabase connection
  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('user_roles').select('count').limit(1);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Supabase connection test successful');
      return { success: true };
    } catch (err) {
      console.error('Supabase connection test error:', err);
      return { success: false, error: err.message };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      
      // First test the connection
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        console.error('Connection test failed:', connectionTest.error);
        throw new Error('Unable to connect to authentication service. Please check your internet connection and try again.');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Supabase auth response:', { hasData: !!data, hasUser: !!data?.user, error });
      
      if (error) {
        console.error('Supabase auth error:', error);
        
        // Handle specific error cases with user-friendly messages
        let errorMessage = "Login failed. Please try again.";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Please check your email and confirm your account before signing in.";
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Too many login attempts. Please wait a moment before trying again.";
        } else if (error.message.includes('User not found')) {
          errorMessage = "No account found with this email address. Please sign up instead.";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Please enter a valid email address.";
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = "Password must be at least 6 characters long.";
        }
        
        const authError = new Error(errorMessage);
        (authError as any).originalMessage = error.message;
        (authError as any).supabaseError = error;
        throw authError;
      }

      if (data && data.user) {
        console.log('Login successful for user:', data.user.email);
        toast({
          title: "Login Successful",
          description: email === ADMIN_EMAIL 
            ? "Welcome, Administrator!" 
            : "Welcome back to Spark Academy!"
        });
        
        // Return success to prevent further error handling
        return { success: true, user: data.user };
      } else {
        console.warn('No user data returned from Supabase');
        throw new Error("Login failed - no user data received");
      }
          } catch (err: any) {
        console.error('Login function error:', err);
        
        // Special handling for admin account creation on first login
        if (email === ADMIN_EMAIL && (err.originalMessage?.includes('Invalid login credentials') || err.message?.includes('Invalid login credentials'))) {
          try {
            console.log('Attempting to create admin account...');
            
            // Generate a unique username for admin to avoid conflicts
            const adminUsername = `admin_${Date.now()}`;
            
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: ADMIN_EMAIL,
              password: ADMIN_PASSWORD,
              options: {
                data: {
                  username: adminUsername,
                  full_name: 'Administrator'
                }
              }
            });

            if (signUpError) {
              console.error('Admin signup error:', signUpError);
              throw signUpError;
            }

            console.log('Admin account created:', signUpData.user);

            // Add admin role to user_roles table
            if (signUpData.user) {
              const { error: roleError } = await supabase
                .from('user_roles')
                .insert({
                  user_id: signUpData.user.id,
                  role: 'admin'
                });
              
              if (roleError) {
                console.error('Error setting admin role:', roleError);
                throw new Error('Failed to set admin role');
              }
            }

            toast({
              title: "Admin Account Created",
              description: "Administrator account has been set up. Please sign in again."
            });
            
            // Now sign in with the newly created account
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email: ADMIN_EMAIL,
              password: ADMIN_PASSWORD
            });
            
            if (loginError) {
              console.error('Admin login after creation error:', loginError);
              throw loginError;
            }
            
            if (loginData.user) {
              toast({
                title: "Admin Login Successful",
                description: "Welcome, Administrator!"
              });
              return { success: true, user: loginData.user };
            }
            
          } catch (createErr: any) {
            console.error('Admin account creation failed:', createErr);
            toast({
              title: "Admin Account Creation Failed",
              description: createErr.message,
              variant: "destructive"
            });
            throw createErr;
          }
        } else {
          // Don't show toast here as the component will handle the error display
          throw err;
        }
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
          variant: "destructive"
        });
        return { error: "This email address is reserved." };
      }
      
      // Generate a unique username to avoid conflicts
      const uniqueUsername = userData.username ? 
        `${userData.username}_${Date.now().toString().slice(-5)}` : 
        `user_${Date.now().toString()}`;
      
      // Proceed with signup using the unique username
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: {
          data: {
            username: uniqueUsername,
            full_name: userData.full_name,
            avatar_url: ''
          },
        }
      });
      
      if (error) {
        // Check if error is because user already exists
        if (error.message.includes('already registered')) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive"
          });
          return { error: "Account already exists" };
        }
        
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
        return { error: error.message };
      }

      // Add user role to user_roles table
      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: userData.role
          });
        
        if (roleError) {
          console.error('Error setting user role:', roleError);
          toast({
            title: "Registration incomplete",
            description: "Your account was created but role assignment failed. Please contact support.",
            variant: "destructive"
          });
          return { error: "Role assignment failed", user: data.user };
        }
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created. Please check your email for verification.",
      });
      
      return { user: data.user };
    } catch (err: any) {
      console.error('Sign up error:', err);
      toast({
        title: "Registration failed",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (err) {
      console.error('Sign out error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Alias for logout for better component compatibility
  const signOut = logout;

  return (
    <AuthContext.Provider value={{ session, user, loading, login, signIn, signUp, logout, signOut, testConnection }}>
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
