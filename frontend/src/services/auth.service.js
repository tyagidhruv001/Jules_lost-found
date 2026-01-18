import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Sign in with email and password
export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    ...userDoc.data()
                }
            };
        } else {
            throw new Error('User data not found');
        }
    } catch (error) {
        console.error('Login error:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
};

// Create new user account
export const registerUser = async (email, password, userData) => {
    try {
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, {
            displayName: userData.name
        });

        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name: userData.name,
            email: email,
            role: userData.role,
            identifier: userData.identifier, // Roll no or faculty ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                name: userData.name,
                role: userData.role,
                identifier: userData.identifier
            }
        };
    } catch (error) {
        console.error('Registration error:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
};

// Sign out
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to sign out');
    }
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in, get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists()) {
                callback({
                    uid: user.uid,
                    email: user.email,
                    ...userDoc.data()
                });
            } else {
                callback(null);
            }
        } else {
            // User is signed out
            callback(null);
        }
    });
};

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode) => {
    const errorMessages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already registered',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/network-request-failed': 'Network error, please try again',
        'auth/too-many-requests': 'Too many attempts, please try again later',
        'auth/invalid-credential': 'Invalid credentials provided'
    };

    return errorMessages[errorCode] || 'An error occurred during authentication';
};

export default {
    loginWithEmail,
    registerUser,
    logoutUser,
    onAuthChange
};
