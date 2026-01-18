import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (uid) => {
        if (!uid) {
            setProfile(null);
            return;
        }
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single();
        setProfile(data);
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setProfile(null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const updateRole = async (newRole) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', user.id);

            if (error) throw error;

            // Update local state
            setProfile(prev => ({ ...prev, role: newRole }));
            return { data: newRole };
        } catch (error) {
            console.error('Error updating role:', error);
            return { error };
        }
    };

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
        role: profile?.role || null, // Changed default to null so we can detect "not set" for onboarding
        setRole: updateRole, // Expose as setRole to match usage in Profile.jsx
        profile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
