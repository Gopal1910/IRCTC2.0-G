import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    deleteDoc
} from 'firebase/firestore';
import { db } from './config';

export interface Passenger {
    id: number;
    name: string;
    age: string;
    gender: string;
    berthType: string;
    compartment: string;
    seatNumber: string;
}

export interface Booking {
    id?: string;
    userId: string;
    trainId: number;
    trainName: string;
    trainNumber: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
    duration: string;
    class: string;
    fare: number;
    passengers: Passenger[];
    selectedSeats: number[];
    totalFare: number;
    bookingId: string;
    pnrNumber: string;
    bookingDate: Date;
    journeyDate: Date;
    status: 'confirmed' | 'cancelled' | 'pending' | 'refunded';
    paymentMethod: string;
    paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
    refundAmount?: number;
    refundDate?: Date;
    extended?: boolean;
    originalBookingId?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Generate unique booking ID
const generateBookingId = (): string => {
    return 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Generate unique PNR number
const generatePNRNumber = (): string => {
    return Math.random().toString().substr(2, 10);
};

// Save booking to Firestore
export const saveBooking = async (booking: Omit<Booking, 'id' | 'bookingId' | 'pnrNumber' | 'bookingDate' | 'status' | 'paymentStatus' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
        const bookingData = {
            ...booking,
            bookingId: generateBookingId(),
            pnrNumber: generatePNRNumber(),
            bookingDate: new Date(),
            status: 'confirmed' as const,
            paymentStatus: 'paid' as const,
            createdAt: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date())
        };

        const docRef = await addDoc(collection(db, 'bookings'), {
            ...bookingData,
            bookingDate: Timestamp.fromDate(bookingData.bookingDate),
            journeyDate: Timestamp.fromDate(bookingData.journeyDate),
        });

        return bookingData.bookingId;
    } catch (error) {
        console.error('Error saving booking:', error);
        throw new Error('Failed to save booking. Please try again.');
    }
};

// Get user's bookings
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
    try {
        const q = query(
            collection(db, 'bookings'),
            where('userId', '==', userId),
            orderBy('bookingDate', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                bookingDate: data.bookingDate?.toDate() || new Date(),
                journeyDate: data.journeyDate?.toDate() || new Date(),
                refundDate: data.refundDate?.toDate(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as Booking;
        });
    } catch (error) {
        console.error('Error getting bookings:', error);
        throw new Error('Failed to load bookings. Please try again.');
    }
};

// Get booking by PNR
export const getBookingByPNR = async (pnrNumber: string): Promise<Booking | null> => {
    try {
        const q = query(
            collection(db, 'bookings'),
            where('pnrNumber', '==', pnrNumber)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0];
        const data = doc.data();

        return {
            id: doc.id,
            ...data,
            bookingDate: data.bookingDate?.toDate() || new Date(),
            journeyDate: data.journeyDate?.toDate() || new Date(),
            refundDate: data.refundDate?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        } as Booking;
    } catch (error) {
        console.error('Error getting booking by PNR:', error);
        throw new Error('Failed to find booking. Please check the PNR number.');
    }
};

// Get booking by Booking ID
export const getBookingByBookingId = async (bookingId: string): Promise<Booking | null> => {
    try {
        const q = query(
            collection(db, 'bookings'),
            where('bookingId', '==', bookingId)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0];
        const data = doc.data();

        return {
            id: doc.id,
            ...data,
            bookingDate: data.bookingDate?.toDate() || new Date(),
            journeyDate: data.journeyDate?.toDate() || new Date(),
            refundDate: data.refundDate?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        } as Booking;
    } catch (error) {
        console.error('Error getting booking by ID:', error);
        throw new Error('Failed to find booking.');
    }
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, updates: Partial<Booking>): Promise<void> => {
    try {
        // First find the booking document by bookingId
        const q = query(
            collection(db, 'bookings'),
            where('bookingId', '==', bookingId)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            throw new Error('Booking not found');
        }

        const docRef = doc(db, 'bookings', querySnapshot.docs[0].id);

        const updateData: any = {
            ...updates,
            updatedAt: Timestamp.fromDate(new Date())
        };

        // Convert Date objects to Timestamp
        if (updates.refundDate) {
            updateData.refundDate = Timestamp.fromDate(updates.refundDate);
        }

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw new Error('Failed to update booking. Please try again.');
    }
};

// Cancel booking and process refund
export const cancelBooking = async (bookingId: string, refundAmount: number): Promise<void> => {
    try {
        await updateBookingStatus(bookingId, {
            status: 'cancelled',
            paymentStatus: 'refunded',
            refundAmount: refundAmount,
            refundDate: new Date()
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw new Error('Failed to cancel booking. Please try again.');
    }
};

// Extend ticket (create new booking based on existing one)
export const extendTicket = async (originalBooking: Booking, newJourneyDate: Date): Promise<string> => {
    try {
        const extendedBooking: Omit<Booking, 'id' | 'bookingId' | 'pnrNumber' | 'bookingDate' | 'status' | 'paymentStatus' | 'createdAt' | 'updatedAt'> = {
            userId: originalBooking.userId,
            trainId: originalBooking.trainId,
            trainName: originalBooking.trainName,
            trainNumber: originalBooking.trainNumber,
            from: originalBooking.from,
            to: originalBooking.to,
            departure: originalBooking.departure,
            arrival: originalBooking.arrival,
            duration: originalBooking.duration,
            class: originalBooking.class,
            fare: originalBooking.fare,
            passengers: originalBooking.passengers,
            selectedSeats: originalBooking.selectedSeats,
            totalFare: originalBooking.totalFare,
            journeyDate: newJourneyDate,
            paymentMethod: originalBooking.paymentMethod,
            extended: true,
            originalBookingId: originalBooking.bookingId
        };

        return await saveBooking(extendedBooking);
    } catch (error) {
        console.error('Error extending ticket:', error);
        throw new Error('Failed to extend ticket. Please try again.');
    }
};

// Get refund history
export const getRefundHistory = async (userId: string): Promise<Booking[]> => {
    try {
        const q = query(
            collection(db, 'bookings'),
            where('userId', '==', userId),
            where('status', 'in', ['cancelled', 'refunded']),
            orderBy('refundDate', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                bookingDate: data.bookingDate?.toDate() || new Date(),
                journeyDate: data.journeyDate?.toDate() || new Date(),
                refundDate: data.refundDate?.toDate(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as Booking;
        });
    } catch (error) {
        console.error('Error getting refund history:', error);
        throw new Error('Failed to load refund history.');
    }
};

// Get upcoming journeys
export const getUpcomingJourneys = async (userId: string): Promise<Booking[]> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, 'bookings'),
            where('userId', '==', userId),
            where('journeyDate', '>=', Timestamp.fromDate(today)),
            where('status', '==', 'confirmed'),
            orderBy('journeyDate', 'asc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                bookingDate: data.bookingDate?.toDate() || new Date(),
                journeyDate: data.journeyDate?.toDate() || new Date(),
                refundDate: data.refundDate?.toDate(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as Booking;
        });
    } catch (error) {
        console.error('Error getting upcoming journeys:', error);
        throw new Error('Failed to load upcoming journeys.');
    }
};

// Get booking statistics
export const getBookingStats = async (userId: string) => {
    try {
        const bookings = await getUserBookings(userId);

        const totalBookings = bookings.length;
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
        const totalSpent = bookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, booking) => sum + booking.totalFare, 0);
        const totalRefunds = bookings
            .filter(b => b.status === 'cancelled' && b.refundAmount)
            .reduce((sum, booking) => sum + (booking.refundAmount || 0), 0);

        return {
            totalBookings,
            confirmedBookings,
            cancelledBookings,
            totalSpent,
            totalRefunds
        };
    } catch (error) {
        console.error('Error getting booking stats:', error);
        throw new Error('Failed to load booking statistics.');
    }
};

// Search bookings by train name or PNR
export const searchBookings = async (userId: string, searchTerm: string): Promise<Booking[]> => {
    try {
        const allBookings = await getUserBookings(userId);

        return allBookings.filter(booking =>
            booking.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.pnrNumber.includes(searchTerm) ||
            booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.to.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } catch (error) {
        console.error('Error searching bookings:', error);
        throw new Error('Failed to search bookings.');
    }
};

// Delete booking (admin only function)
export const deleteBooking = async (bookingId: string): Promise<void> => {
    try {
        const q = query(
            collection(db, 'bookings'),
            where('bookingId', '==', bookingId)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            throw new Error('Booking not found');
        }

        const docRef = doc(db, 'bookings', querySnapshot.docs[0].id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw new Error('Failed to delete booking.');
    }
};

// Get bookings by status
export const getBookingsByStatus = async (userId: string, status: Booking['status']): Promise<Booking[]> => {
    try {
        const q = query(
            collection(db, 'bookings'),
            where('userId', '==', userId),
            where('status', '==', status),
            orderBy('bookingDate', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                bookingDate: data.bookingDate?.toDate() || new Date(),
                journeyDate: data.journeyDate?.toDate() || new Date(),
                refundDate: data.refundDate?.toDate(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as Booking;
        });
    } catch (error) {
        console.error('Error getting bookings by status:', error);
        throw new Error(`Failed to load ${status} bookings.`);
    }
};

// Update passenger details
export const updatePassengerDetails = async (bookingId: string, passengerId: number, updates: Partial<Passenger>): Promise<void> => {
    try {
        const booking = await getBookingByBookingId(bookingId);
        if (!booking) {
            throw new Error('Booking not found');
        }

        const updatedPassengers = booking.passengers.map(passenger =>
            passenger.id === passengerId ? { ...passenger, ...updates } : passenger
        );

        await updateBookingStatus(bookingId, { passengers: updatedPassengers });
    } catch (error) {
        console.error('Error updating passenger details:', error);
        throw new Error('Failed to update passenger details.');
    }
};

// Calculate refund amount based on cancellation time
export const calculateRefundAmount = (booking: Booking): number => {
    const journeyDate = new Date(booking.journeyDate);
    const now = new Date();
    const hoursUntilJourney = (journeyDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilJourney > 48) {
        // Full refund minus small cancellation fee (90%)
        return Math.floor(booking.totalFare * 0.9);
    } else if (hoursUntilJourney > 24) {
        // 75% refund
        return Math.floor(booking.totalFare * 0.75);
    } else if (hoursUntilJourney > 12) {
        // 50% refund
        return Math.floor(booking.totalFare * 0.5);
    } else if (hoursUntilJourney > 4) {
        // 25% refund
        return Math.floor(booking.totalFare * 0.25);
    } else {
        // No refund if cancelled within 4 hours of journey
        return 0;
    }
};

// Check if booking can be cancelled
export const canCancelBooking = (booking: Booking): boolean => {
    if (booking.status !== 'confirmed') return false;

    const journeyDate = new Date(booking.journeyDate);
    const now = new Date();
    const hoursUntilJourney = (journeyDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can cancel up to 4 hours before journey
    return hoursUntilJourney > 4;
};

// Check if booking can be extended
export const canExtendBooking = (booking: Booking): boolean => {
    if (booking.status !== 'confirmed') return false;

    const journeyDate = new Date(booking.journeyDate);
    const now = new Date();

    // Can extend if journey is within next 30 days and not in past
    return journeyDate > now && journeyDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
};

// Export utility functions
export {
    generateBookingId,
    generatePNRNumber
};