import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                fetchProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (sessionUser) => {
        console.log('Fetching profile for:', sessionUser.email);
        try {
            // 1. Try matching by auth_id
            let { data, error } = await supabase
                .from('users')
                .select('*, department:departments(name, unique_code)')
                .eq('auth_id', sessionUser.id)
                .maybeSingle();

            console.log('Match by auth_id result:', !!data);

            // 2. Fallback: Try matching by email (for newly migrated/seeded users)
            if (!data && !error) {
                console.log('Profile match by ID failed, attempting email fallback...', sessionUser.email);
                const { data: emailMatch, error: emailError } = await supabase
                    .from('users')
                    .select('*, department:departments(name, unique_code)')
                    .eq('email', sessionUser.email)
                    .maybeSingle();

                if (emailMatch) {
                    // LINK THE PROFILE: Update the record with the new auth_id
                    console.log('Found profile by email. Linking auth_id...');
                    const { data: updated, error: linkError } = await supabase
                        .from('users')
                        .update({ auth_id: sessionUser.id })
                        .eq('id', emailMatch.id)
                        .select('*, department:departments(name, unique_code)')
                        .single();

                    if (!linkError) {
                        data = updated;
                        console.log('Link successful.');
                    } else {
                        console.error('Link update failed:', linkError);
                    }
                } else {
                    console.warn('No profile found for email:', sessionUser.email);
                }
            }

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                console.log('Setting user state:', data?.role);
                setUser(data);
            }
        } catch (err) {
            console.error('Profile fetch crash:', err);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    const getAuthHeaders = () => {
        // Left for backward compatibility while migrating other APIs
        return {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
        };
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, login, logout, getAuthHeaders, supabase }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
