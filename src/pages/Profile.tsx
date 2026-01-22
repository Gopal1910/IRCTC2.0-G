import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useBooking } from "@/contexts/BookingContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Ticket,
    RefreshCw,
    Clock,
    Download,
    Printer,
    Calendar as CalendarIcon,
    ArrowRight,
    Edit,
    Save,
    X
} from "lucide-react";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Profile = () => {
    const { currentUser, logout } = useAuth();
    const { profile, updateProfile, loading: profileLoading } = useProfile();
    const { bookings, cancelBooking, extendTicket, loadBookings, loading: bookingsLoading } = useBooking();

    const [activeTab, setActiveTab] = useState("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [newJourneyDate, setNewJourneyDate] = useState("");
    const [refundHistory, setRefundHistory] = useState<any[]>([]);

    useEffect(() => {
        if (profile) {
            setEditForm({
                displayName: profile.displayName || "",
                phoneNumber: profile.phoneNumber || "",
                dateOfBirth: profile.dateOfBirth || "",
                gender: profile.gender || "Male",
                address: profile.address || {
                    street: "",
                    city: "",
                    state: "",
                    pincode: "",
                    country: "India"
                },
                preferences: profile.preferences || {
                    seatPreference: "No Preference",
                    mealPreference: "No Preference",
                    notificationEnabled: true
                }
            });
        }
    }, [profile]);

    useEffect(() => {
        if (bookings.length > 0) {
            const refunds = bookings.filter(b => b.status === 'cancelled' || b.status === 'refunded');
            setRefundHistory(refunds);
        }
    }, [bookings]);

    const handleSaveProfile = async () => {
        try {
            await updateProfile(editForm);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking) return;

        try {
            const refundAmount = Math.floor(selectedBooking.totalFare * 0.8); // 80% refund
            await cancelBooking(selectedBooking.id!, refundAmount);
            await loadBookings();
            setIsCancelDialogOpen(false);
            setSelectedBooking(null);
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking. Please try again.');
        }
    };

    const handleExtendTicket = async () => {
        if (!selectedBooking || !newJourneyDate) return;

        try {
            await extendTicket(selectedBooking, new Date(newJourneyDate));
            await loadBookings();
            setIsExtendDialogOpen(false);
            setSelectedBooking(null);
            setNewJourneyDate("");
        } catch (error) {
            console.error('Error extending ticket:', error);
            alert('Failed to extend ticket. Please try again.');
        }
    };

    const downloadTicket = async (booking: any) => {
        // Implementation similar to BookTickets page
        const ticketContent = document.getElementById(`ticket-${booking.bookingId}`);
        if (!ticketContent) return;

        const canvas = await html2canvas(ticketContent, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`ticket-${booking.pnrNumber}.pdf`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-500';
            case 'cancelled': return 'bg-red-500';
            case 'pending': return 'bg-yellow-500';
            case 'refunded': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <Sidebar />

            <main className="ml-0 lg:ml-64 pt-20 px-4 sm:px-6 md:px-8 pb-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">My Profile</h1>
                        <p className="text-muted-foreground">Manage your account and travel history</p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="bookings">Ticket History</TabsTrigger>
                            <TabsTrigger value="refunds">Refund History</TabsTrigger>
                            <TabsTrigger value="preferences">Preferences</TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="space-y-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>
                                            Manage your personal details and contact information
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant={isEditing ? "outline" : "default"}
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                                        {isEditing ? "Cancel" : "Edit Profile"}
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="displayName">Full Name</Label>
                                            <Input
                                                id="displayName"
                                                value={editForm.displayName || ""}
                                                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                value={currentUser?.email || ""}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber">Phone Number</Label>
                                            <Input
                                                id="phoneNumber"
                                                value={editForm.phoneNumber || ""}
                                                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                            <Input
                                                id="dateOfBirth"
                                                type="date"
                                                value={editForm.dateOfBirth || ""}
                                                onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <select
                                                id="gender"
                                                value={editForm.gender || "Male"}
                                                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                                disabled={!isEditing}
                                                className="w-full px-3 py-2 border rounded-md"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSaveProfile}>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Address Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Address Information</CardTitle>
                                    <CardDescription>
                                        Your primary address for delivery and communication
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="street">Street Address</Label>
                                            <Input
                                                id="street"
                                                value={editForm.address?.street || ""}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    address: { ...editForm.address, street: e.target.value }
                                                })}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={editForm.address?.city || ""}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    address: { ...editForm.address, city: e.target.value }
                                                })}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="state">State</Label>
                                            <Input
                                                id="state"
                                                value={editForm.address?.state || ""}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    address: { ...editForm.address, state: e.target.value }
                                                })}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="pincode">PIN Code</Label>
                                            <Input
                                                id="pincode"
                                                value={editForm.address?.pincode || ""}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    address: { ...editForm.address, pincode: e.target.value }
                                                })}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Bookings Tab */}
                        <TabsContent value="bookings" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ticket History</CardTitle>
                                    <CardDescription>
                                        Your recent and upcoming train bookings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {bookingsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : bookings.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No bookings found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {bookings.map((booking) => (
                                                <div key={booking.id} className="border rounded-lg p-4">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                                        <div>
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <h3 className="font-semibold text-lg">{booking.trainName}</h3>
                                                                <Badge className={getStatusColor(booking.status)}>
                                                                    {booking.status.toUpperCase()}
                                                                </Badge>
                                                                {booking.extended && (
                                                                    <Badge variant="outline" className="bg-blue-100">
                                                                        Extended
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                #{booking.trainNumber} • {booking.class} Class
                                                            </p>
                                                            <p className="text-sm">
                                                                {booking.from} <ArrowRight className="w-4 h-4 inline mx-1" /> {booking.to}
                                                            </p>
                                                        </div>
                                                        <div className="text-right mt-2 md:mt-0">
                                                            <p className="text-2xl font-bold text-accent">₹{booking.totalFare}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                PNR: {booking.pnrNumber}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                                        <div className="flex items-center">
                                                            <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                                            <span>Journey: {format(booking.journeyDate, 'MMM dd, yyyy')}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                                            <span>Departure: {booking.departure}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <User className="w-4 h-4 mr-2 text-muted-foreground" />
                                                            <span>{booking.passengers.length} Passenger(s)</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => downloadTicket(booking)}
                                                        >
                                                            <Download className="w-4 h-4 mr-1" />
                                                            Download
                                                        </Button>

                                                        {booking.status === 'confirmed' && new Date(booking.journeyDate) > new Date() && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setSelectedBooking(booking);
                                                                        setIsExtendDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <RefreshCw className="w-4 h-4 mr-1" />
                                                                    Extend Ticket
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                                    onClick={() => {
                                                                        setSelectedBooking(booking);
                                                                        setIsCancelDialogOpen(true);
                                                                    }}
                                                                >
                                                                    Cancel Booking
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Hidden ticket content for download */}
                                                    <div id={`ticket-${booking.bookingId}`} className="hidden">
                                                        {/* Ticket content similar to BookTickets page */}
                                                        <div className="p-6 border-2 border-green-500 rounded-lg space-y-6 bg-white text-black">
                                                            <div className="text-center border-b-2 border-green-500 pb-4">
                                                                <h1 className="text-3xl font-bold">INDIAN RAILWAYS</h1>
                                                                <p className="text-lg">E-TICKET</p>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div>
                                                                    <h3 className="font-bold text-xl mb-2">{booking.trainName}</h3>
                                                                    <div className="space-y-1 text-sm">
                                                                        <p><span className="font-semibold">Train No:</span> #{booking.trainNumber}</p>
                                                                        <p><span className="font-semibold">From:</span> {booking.from}</p>
                                                                        <p><span className="font-semibold">To:</span> {booking.to}</p>
                                                                        <p><span className="font-semibold">Departure:</span> {booking.departure}</p>
                                                                        <p><span className="font-semibold">Arrival:</span> {booking.arrival}</p>
                                                                        <p><span className="font-semibold">Class:</span> {booking.class}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="space-y-1 text-sm">
                                                                        <p><span className="font-semibold">Booking ID:</span> {booking.bookingId}</p>
                                                                        <p><span className="font-semibold">PNR Number:</span> {booking.pnrNumber}</p>
                                                                        <p><span className="font-semibold">Booking Date:</span> {format(booking.bookingDate, 'MMM dd, yyyy')}</p>
                                                                        <p><span className="font-semibold">Total Fare:</span> ₹{booking.totalFare}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Refunds Tab */}
                        <TabsContent value="refunds" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Refund History</CardTitle>
                                    <CardDescription>
                                        History of your cancelled bookings and refunds
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {refundHistory.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No refund history found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {refundHistory.map((refund) => (
                                                <div key={refund.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-semibold">{refund.trainName}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                PNR: {refund.pnrNumber} • {refund.from} to {refund.to}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className="bg-red-100 text-red-800">
                                                            Refunded
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-muted-foreground">Original Amount</p>
                                                            <p className="font-semibold line-through">₹{refund.totalFare}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Refund Amount</p>
                                                            <p className="font-semibold text-green-600">₹{refund.refundAmount}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground">Refund Date</p>
                                                            <p className="font-semibold">
                                                                {refund.refundDate ? format(refund.refundDate, 'MMM dd, yyyy') : 'Processing'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Preferences Tab */}
                        <TabsContent value="preferences" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Travel Preferences</CardTitle>
                                    <CardDescription>
                                        Set your default preferences for a better booking experience
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="seatPreference">Seat Preference</Label>
                                            <select
                                                id="seatPreference"
                                                value={editForm.preferences?.seatPreference || "No Preference"}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    preferences: { ...editForm.preferences, seatPreference: e.target.value }
                                                })}
                                                disabled={!isEditing}
                                                className="w-full px-3 py-2 border rounded-md"
                                            >
                                                <option value="No Preference">No Preference</option>
                                                <option value="Lower">Lower Berth</option>
                                                <option value="Middle">Middle Berth</option>
                                                <option value="Upper">Upper Berth</option>
                                                <option value="Side Lower">Side Lower</option>
                                                <option value="Side Upper">Side Upper</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mealPreference">Meal Preference</Label>
                                            <select
                                                id="mealPreference"
                                                value={editForm.preferences?.mealPreference || "No Preference"}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    preferences: { ...editForm.preferences, mealPreference: e.target.value }
                                                })}
                                                disabled={!isEditing}
                                                className="w-full px-3 py-2 border rounded-md"
                                            >
                                                <option value="No Preference">No Preference</option>
                                                <option value="Vegetarian">Vegetarian</option>
                                                <option value="Non-Vegetarian">Non-Vegetarian</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="notificationEnabled"
                                            checked={editForm.preferences?.notificationEnabled || false}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                preferences: { ...editForm.preferences, notificationEnabled: e.target.checked }
                                            })}
                                            disabled={!isEditing}
                                            className="rounded"
                                        />
                                        <Label htmlFor="notificationEnabled">
                                            Enable notifications for booking updates and offers
                                        </Label>
                                    </div>

                                    {isEditing && (
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSaveProfile}>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Preferences
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Extend Ticket Dialog */}
            <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Extend Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>Extend your journey for {selectedBooking?.trainName}</p>
                        <div className="space-y-2">
                            <Label htmlFor="newJourneyDate">New Journey Date</Label>
                            <Input
                                id="newJourneyDate"
                                type="date"
                                value={newJourneyDate}
                                onChange={(e) => setNewJourneyDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExtendDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleExtendTicket} disabled={!newJourneyDate}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Extend Ticket
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Booking Dialog */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Booking</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>Are you sure you want to cancel this booking?</p>
                        {selectedBooking && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="font-semibold">{selectedBooking.trainName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedBooking.from} to {selectedBooking.to} • {format(selectedBooking.journeyDate, 'MMM dd, yyyy')}
                                </p>
                                <p className="text-sm mt-2">
                                    Refund Amount: <span className="font-semibold text-green-600">
                                        ₹{Math.floor(selectedBooking.totalFare * 0.8)}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                            Keep Booking
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelBooking}
                        >
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;