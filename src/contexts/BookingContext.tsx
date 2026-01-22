import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Booking, saveBooking, getUserBookings, updateBookingStatus } from '@/firebase/bookings';
import { Notification, createNotification, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/firebase/notifications';

interface BookingContextType {
    bookings: Booking[];
    notifications: Notification[];
    createBooking: (booking: Omit<Booking, 'id' | 'bookingId' | 'pnrNumber' | 'bookingDate' | 'status' | 'paymentStatus'>) => Promise<string>;
    cancelBooking: (bookingId: string) => Promise<void>;
    loadBookings: () => Promise<void>;
    loadNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    loading: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const generateBookingId = (): string => {
        return 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
    };

    const generatePNRNumber = (): string => {
        return Math.random().toString().substr(2, 10);
    };

    const createBooking = async (bookingData: Omit<Booking, 'id' | 'bookingId' | 'pnrNumber' | 'bookingDate' | 'status' | 'paymentStatus'>): Promise<string> => {
        if (!currentUser) throw new Error('User must be logged in to create booking');

        setLoading(true);
        try {
            const booking: Omit<Booking, 'id'> = {
                ...bookingData,
                userId: currentUser.uid,
                bookingId: generateBookingId(),
                pnrNumber: generatePNRNumber(),
                bookingDate: new Date(),
                status: 'confirmed',
                paymentStatus: 'paid'
            };

            const bookingId = await saveBooking(booking);

            // Create notification
            await createNotification({
                userId: currentUser.uid,
                title: 'Booking Confirmed!',
                message: `Your booking ${booking.bookingId} for ${booking.trainName} has been confirmed.`,
                type: 'booking',
                relatedBookingId: bookingId,
                isRead: false
            });

            // Reload bookings and notifications
            await loadBookings();
            await loadNotifications();

            return booking.bookingId;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (bookingId: string): Promise<void> => {
        setLoading(true);
        try {
            await updateBookingStatus(bookingId, 'cancelled');

            // Reload bookings
            await loadBookings();
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const loadBookings = async (): Promise<void> => {
        if (!currentUser) return;

        setLoading(true);
        try {
            const userBookings = await getUserBookings(currentUser.uid);
            setBookings(userBookings);
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadNotifications = async (): Promise<void> => {
        if (!currentUser) return;

        try {
            const userNotifications = await getUserNotifications(currentUser.uid);
            setNotifications(userNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const markAsRead = async (notificationId: string): Promise<void> => {
        try {
            await markNotificationAsRead(notificationId);
            await loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    };

    const markAllAsRead = async (): Promise<void> => {
        if (!currentUser) return;

        try {
            await markAllNotificationsAsRead(currentUser.uid);
            await loadNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (currentUser) {
            loadBookings();
            loadNotifications();
        }
    }, [currentUser]);

    const value: BookingContextType = {
        bookings,
        notifications,
        createBooking,
        cancelBooking,
        loadBookings,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        loading
    };

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
};