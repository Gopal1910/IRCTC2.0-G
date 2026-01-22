import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    doc,
    Timestamp
} from 'firebase/firestore';
import { db } from './config';

export interface Notification {
    id?: string;
    userId: string;
    title: string;
    message: string;
    type: 'booking' | 'payment' | 'system' | 'alert';
    relatedBookingId?: string;
    isRead: boolean;
    createdAt: Date;
}

// Create notification
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, 'notifications'), {
            ...notification,
            createdAt: Timestamp.fromDate(new Date())
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Get user notifications
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate()
        } as Notification));
    } catch (error) {
        console.error('Error getting notifications:', error);
        throw error;
    }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            isRead: true
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
    try {
        const notifications = await getUserNotifications(userId);
        const unreadNotifications = notifications.filter(n => !n.isRead);

        const updatePromises = unreadNotifications.map(notification =>
            markNotificationAsRead(notification.id!)
        );

        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};