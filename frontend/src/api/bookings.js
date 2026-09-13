import axiosInstance from './axiosInstance';

export const createBooking = (formData) =>
  axiosInstance.post('/bookings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getMyBookings = () => axiosInstance.get('/bookings/my');
export const getBookingById = (id) => axiosInstance.get(`/bookings/${id}`);
export const cancelBooking = (id) => axiosInstance.put(`/bookings/${id}/cancel`);