import axiosInstance from './axiosInstance';

export const getDashboardStats = () => axiosInstance.get('/admin/dashboard');

export const getAllServices = () => axiosInstance.get('/services/admin/all');
export const createService = (formData) =>
  axiosInstance.post('/services', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateService = (id, formData) =>
  axiosInstance.put(`/services/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteService = (id) => axiosInstance.delete(`/services/${id}`);
export const getAllBookingsAdmin = (params) => axiosInstance.get('/admin/bookings', { params });
export const approveBooking = (id) => axiosInstance.put(`/admin/bookings/${id}/approve`);
export const rejectBooking = (id, reason) => axiosInstance.put(`/admin/bookings/${id}/reject`, { reason });
export const rescheduleBooking = (id, newSlotId) => axiosInstance.put(`/admin/bookings/${id}/reschedule`, { newSlotId });
export const cancelBookingAdmin = (id) => axiosInstance.put(`/admin/bookings/${id}/cancel`);