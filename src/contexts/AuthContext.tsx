import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, UserRole, BusinessApplication } from '@/types/database';

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  dbUser: User | null;
  businessApplication: BusinessApplication | null;
  hasBusinessProfile: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshBusinessApplication: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [businessApplication, setBusinessApplication] = useState<BusinessApplication | null>(null);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userError) throw userError;
      setDbUser(userData);

      // If business user, fetch business application status and profile
      if (userData?.role === 'business') {
        const { data: businessData } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (businessData) {
          // Check if business profile exists
          const { data: profileData } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('business_id', businessData.id)
            .maybeSingle();

          setHasBusinessProfile(!!profileData);

          // Get application status
          const { data: applicationData } = await supabase
            .from('business_applications')
            .select('*')
            .eq('business_id', businessData.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          setBusinessApplication(applicationData);
        } else {
          setHasBusinessProfile(false);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshBusinessApplication = async () => {
    if (!user || dbUser?.role !== 'business') return;
    
    const { data: businessData } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (businessData) {
      // Check if business profile exists
      const { data: profileData } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('business_id', businessData.id)
        .maybeSingle();

      setHasBusinessProfile(!!profileData);

      // Get application status
      const { data: applicationData } = await supabase
        .from('business_applications')
        .select('*')
        .eq('business_id', businessData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setBusinessApplication(applicationData);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setDbUser(null);
          setBusinessApplication(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      if (data.user) {
        // Insert into users table
        const { error: userInsertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            role: role
          });

        if (userInsertError) throw userInsertError;

        // Create role-specific record
        if (role === 'employee') {
          const { error: employeeError } = await supabase
            .from('employees')
            .insert({ user_id: data.user.id });
          if (employeeError) throw employeeError;
        } else if (role === 'business') {
          const { data: businessData, error: businessError } = await supabase
            .from('businesses')
            .insert({ user_id: data.user.id })
            .select()
            .single();
          if (businessError) throw businessError;

          // Create pending business application
          const { error: applicationError } = await supabase
            .from('business_applications')
            .insert({ 
              business_id: businessData.id,
              status: 'pending'
            });
          if (applicationError) throw applicationError;
        }

        // Auto-login after successful signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        // Fetch updated user data
        await fetchUserData(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setDbUser(null);
    setBusinessApplication(null);
    setHasBusinessProfile(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      dbUser,
      businessApplication,
      hasBusinessProfile,
      isLoading,
      signUp,
      signIn,
      signOut,
      refreshBusinessApplication
    }}>
      {children}
    </AuthContext.Provider>
  );
};
