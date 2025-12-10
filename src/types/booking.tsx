export interface Booking {
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

export type BookingStatus = Booking['status'];
