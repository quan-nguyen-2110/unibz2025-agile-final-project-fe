import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Trash2, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

interface Booking {
  id: string;
  apartmentId: string;
  apartmentTitle: string;
  apartmentImage: string;
  apartmentAddress: string;
  apartmentPrice: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  cancelReason?: string;
}

const Bookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newCheckIn, setNewCheckIn] = useState<Date>();
  const [newCheckOut, setNewCheckOut] = useState<Date>();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const storedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(storedBookings);
  }, [isLoggedIn, navigate]);

  const handleCancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.map(booking =>
      booking.id === bookingId ? { ...booking, status: 'cancelled' as const } : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    
    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled successfully.",
    });
  };

  const handleDeleteBooking = (bookingId: string) => {
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    
    toast({
      title: "Booking Deleted",
      description: "The booking has been removed from your list.",
    });
  };

  const openRescheduleDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewCheckIn(new Date(booking.checkIn));
    setNewCheckOut(new Date(booking.checkOut));
    setRescheduleDialogOpen(true);
  };

  const handleReschedule = () => {
    if (!selectedBooking || !newCheckIn || !newCheckOut) return;

    if (newCheckOut <= newCheckIn) {
      toast({
        title: "Invalid Dates",
        description: "Check-out date must be after check-in date.",
        variant: "destructive",
      });
      return;
    }

    const nights = Math.ceil((newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = selectedBooking.apartmentPrice * nights;

    const updatedBookings = bookings.map(booking =>
      booking.id === selectedBooking.id
        ? {
            ...booking,
            checkIn: newCheckIn.toISOString(),
            checkOut: newCheckOut.toISOString(),
            nights,
            totalPrice,
          }
        : booking
    );

    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    setRescheduleDialogOpen(false);
    
    toast({
      title: "Booking Rescheduled",
      description: "Your booking dates have been updated successfully.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage all your apartment bookings</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">Start exploring apartments and make your first booking!</p>
              <Button onClick={() => navigate("/")}>Browse Apartments</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={booking.apartmentImage}
                      alt={booking.apartmentTitle}
                      className="w-full h-64 md:h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => navigate(`/apartment/${booking.apartmentId}`)}
                    />
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 
                          className="text-2xl font-bold mb-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => navigate(`/apartment/${booking.apartmentId}`)}
                        >
                          {booking.apartmentTitle}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.apartmentAddress}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Check-in</p>
                          <p className="font-semibold">{formatDate(booking.checkIn)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Check-out</p>
                          <p className="font-semibold">{formatDate(booking.checkOut)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Guests</p>
                          <p className="font-semibold">{booking.guests}</p>
                        </div>
                      </div>
                    </div>

                    {booking.cancelReason && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Cancellation Reason:</p>
                        <p className="text-sm">{booking.cancelReason}</p>
                      </div>
                    )}

                    <div className="border-t pt-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-2xl font-bold text-primary">
                          ${booking.totalPrice.toLocaleString()}
                          <span className="text-sm text-muted-foreground ml-2">
                            ({booking.nights} night{booking.nights > 1 ? 's' : ''})
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {booking.status !== 'cancelled' && (
                          <Button 
                            variant="outline" 
                            onClick={() => openRescheduleDialog(booking)}
                          >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Reschedule
                          </Button>
                        )}
                        {booking.status === 'pending' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline">Cancel Booking</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will cancel your booking for {booking.apartmentTitle}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancelBooking(booking.id)}>
                                  Cancel Booking
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this booking record. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBooking(booking.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reschedule Booking</DialogTitle>
              <DialogDescription>
                Change your check-in and check-out dates for {selectedBooking?.apartmentTitle}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <CalendarComponent
                    mode="single"
                    selected={newCheckIn}
                    onSelect={setNewCheckIn}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out Date</Label>
                  <CalendarComponent
                    mode="single"
                    selected={newCheckOut}
                    onSelect={setNewCheckOut}
                    disabled={(date) => !newCheckIn || date <= newCheckIn}
                    className="rounded-md border"
                  />
                </div>
              </div>
              {newCheckIn && newCheckOut && selectedBooking && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">New Total</p>
                      <p className="text-2xl font-bold">
                        ${(selectedBooking.apartmentPrice * Math.ceil((newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24))).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {Math.ceil((newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${selectedBooking.apartmentPrice}/night
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReschedule} disabled={!newCheckIn || !newCheckOut}>
                  Confirm Reschedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Bookings;
