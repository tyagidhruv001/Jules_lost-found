import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile } from '../services/user.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false); // Background loading state
    const [initialLoading, setInitialLoading] = useState(true); // App-blocking initial check

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                try {
                    // Fetch user profile from Firestore
                    const profile = await getUserProfile(firebaseUser.uid);
                    if (profile) {
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            ...profile
                        });
                    } else {
                        // User exists in Firebase Auth but not in Firestore (edge case)
                        console.warn('User profile not found in Firestore');
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            role: 'student' // Default fallback
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
            setInitialLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const refreshUser = async () => {
        if (auth.currentUser) {
            setLoading(true);
            try {
                const profile = await getUserProfile(auth.currentUser.uid);
                if (profile) {
                    setUser({
                        uid: auth.currentUser.uid,
                        email: auth.currentUser.email,
                        ...profile
                    });
                }
            } catch (error) {
                console.error('Error refreshing user profile:', error);
            }
            setLoading(false);
        }
    };

    // ONLY block the entire app during the very first auth check
    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
                <style>{`
                    .spinner-aura {
                        position: absolute;
                        width: 150%;
                        height: 150%;
                        background: radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%);
                        animation: aura-spin 3s linear infinite;
                    }
                    @keyframes aura-spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
                <div className="relative flex items-center justify-center">
                    <div className="spinner-aura"></div>
                    <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin z-10 shadow-[0_0_15px_rgba(34,211,238,0.4)]"></div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            logout,
            refreshUser,
            isAuthenticated: !!user,
            role: user?.role || null
        }}>
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
