import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  setDoc,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  preferences?: {
    seatPreference: 'Lower' | 'Middle' | 'Upper' | 'Side Lower' | 'Side Upper' | 'No Preference';
    mealPreference: 'Vegetarian' | 'Non-Vegetarian' | 'No Preference';
    notificationEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Create or update user profile
export const saveUserProfile = async (profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const profileRef = doc(db, 'profiles', profile.uid);
    await setDoc(profileRef, {
      ...profile,
      updatedAt: Timestamp.fromDate(new Date())
    }, { merge: true });
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const profileRef = doc(db, 'profiles', uid);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

// Create initial profile after signup
export const createInitialProfile = async (user: any): Promise<void> => {
  try {
    const profile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: 'Male',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      preferences: {
        seatPreference: 'No Preference',
        mealPreference: 'No Preference',
        notificationEnabled: true
      }
    };
    
    await saveUserProfile(profile);
  } catch (error) {
    console.error('Error creating initial profile:', error);
    throw error;
  }
};