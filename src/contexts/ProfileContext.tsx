import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { UserProfile, saveUserProfile, getUserProfile, createInitialProfile } from '@/firebase/profile';

interface ProfileContextType {
    profile: UserProfile | null;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async (): Promise<void> => {
        if (!currentUser) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            const userProfile = await getUserProfile(currentUser.uid);
            if (!userProfile) {
                // Create initial profile if doesn't exist
                await createInitialProfile(currentUser);
                const newProfile = await getUserProfile(currentUser.uid);
                setProfile(newProfile);
            } else {
                setProfile(userProfile);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
        if (!currentUser || !profile) return;

        try {
            const updatedProfile = { ...profile, ...updates };
            await saveUserProfile(updatedProfile);
            setProfile(updatedProfile);
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const refreshProfile = async (): Promise<void> => {
        await loadProfile();
    };

    useEffect(() => {
        loadProfile();
    }, [currentUser]);

    const value: ProfileContextType = {
        profile,
        updateProfile,
        loading,
        refreshProfile
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};