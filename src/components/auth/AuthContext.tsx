
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface SignupData {
  email: string;
  password: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (data: SignupData) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => null,
  signup: async () => null,
  logout: () => {},
  loading: true,
  updateUser: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to convert Supabase session data to our User type
  const extractUserFromSession = async (session: Session | null): Promise<User | null> => {
    if (!session) return null;
    
    try {
      // Get additional user info from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, avatar_url, role')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return null;
      }
      
      // Return the combined user data
      return {
        id: session.user.id,
        name: profileData?.name || session.user.email?.split('@')[0] || 'Anonymous',
        email: session.user.email || '',
        avatar: profileData?.avatar_url,
        role: profileData?.role || 'member',
      };
    } catch (error) {
      console.error("Error processing user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Set loading to true when starting auth initialization
        setLoading(true);
        
        // Check current session first
        const { data: { session } } = await supabase.auth.getSession();
        const userData = await extractUserFromSession(session);
        setUser(userData);
        setLoading(false);
        
        // Set up auth subscription
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event);
            const userData = await extractUserFromSession(session);
            setUser(userData);
          }
        );
        
        // Clean up subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return null;
      }
      
      const userData = await extractUserFromSession(data.session);
      
      if (userData) {
        setUser(userData);
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${userData.name}!`,
        });
        return userData;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    return null;
  };

  const signup = async (data: SignupData): Promise<User | null> => {
    const { email, password, name } = data;
    
    try {
      setLoading(true);
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (authError) {
        toast({
          title: "Signup failed",
          description: authError.message,
          variant: "destructive",
        });
        return null;
      }
      
      // If we need to wait for email confirmation, show a different message
      if (authData.user && !authData.session) {
        toast({
          title: "Verification required",
          description: "Please check your email to verify your account before logging in.",
        });
        return null;
      }
      
      // If auto sign-in is enabled, we'll have a session
      const userData = await extractUserFromSession(authData.session);
      
      if (userData) {
        setUser(userData);
        toast({
          title: "Account created successfully",
          description: `Welcome, ${userData.name}!`,
        });
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      signup, 
      logout, 
      loading,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
