import api from './client';

export interface Booking {
  id?: number;
  resourceId: number;
  resourceName?: string;
  resourceLocation?: string;
  resourceType?: string;
  userId?: number;
  userName?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  purpose?: string;
  expectedAttendees?: number;
  adminReason?: string;
  createdAt?: string;
}

// Create a new booking request
export const createBooking = async (booking: Booking): Promise<Booking> => {
  const response = await api.post('/bookings', booking);
  return response.data;
};

// Get bookings for current user (optional status filter)
export const getMyBookings = async (userId: number, status?: string): Promise<Booking[]> => {
  const params = status ? { status } : {};
  const response = await api.get(`/bookings/user/${userId}`, { params });
  return response.data;
};

// Get all bookings (admin) with optional status filter
export const getAllBookings = async (status?: string): Promise<Booking[]> => {
  const params = status ? { status } : {};
  const response = await api.get('/bookings', { params });
  return response.data;
};

// Get a single booking by ID
export const getBookingById = async (id: number): Promise<Booking> => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

// Get bookings for a specific resource
export const getBookingsByResource = async (resourceId: number): Promise<Booking[]> => {
  const response = await api.get(`/bookings/resource/${resourceId}`);
  return response.data;
};

// Admin approve booking with optional reason
export const approveBooking = async (id: number, reason?: string): Promise<Booking> => {
  const response = await api.put(`/bookings/${id}/approve`, { reason: reason || '' });
  return response.data;
};

// Admin reject booking with reason
export const rejectBooking = async (id: number, reason: string): Promise<Booking> => {
  const response = await api.put(`/bookings/${id}/reject`, { reason });
  return response.data;
};

// User cancel booking (status change to CANCELLED)
export const cancelBooking = async (id: number): Promise<Booking> => {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
};

// Admin delete booking permanently
export const deleteBookingPermanently = async (id: number): Promise<void> => {
  await api.delete(`/bookings/${id}`);
};

// Legacy: update booking status (backward compatibility)
export const updateBookingStatus = async (id: number, status: string): Promise<Booking> => {
  const response = await api.put(`/bookings/${id}/status`, null, {
    params: { status }
  });
  return response.data;
};

// QR-based check-in
export const checkIn = async (resourceId: number, userId: number): Promise<Booking> => {
  const response = await api.post('/bookings/checkin', { resourceId, userId });
  return response.data;
};
