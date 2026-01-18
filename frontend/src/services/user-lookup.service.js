import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Find user's email by identifier (roll no, faculty ID, mobile, or email)
 * @param {string} identifier - Roll no, faculty ID, mobile number, or email
 * @returns {Promise<string|null>} - User's email if found, null otherwise
 */
export const findUserEmail = async (identifier) => {
    try {
        const usersRef = collection(db, 'users');

        // Try different fields
        const possibleFields = ['email', 'identifier', 'mobile', 'universityEmail'];

        for (const field of possibleFields) {
            const q = query(usersRef, where(field, '==', identifier));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                return userData.email || userData.universityEmail;
            }
        }

        return null;
    } catch (error) {
        console.error('Error finding user email:', error);
        return null;
    }
};

export default {
    findUserEmail
};
