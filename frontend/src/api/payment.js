import axiosInstance from './axiosInstance';

export const createPaymentOrder = (bookingId) =>
  axiosInstance.post('/payment/create-order', { bookingId });

export const verifyPayment = (payload) => axiosInstance.post('/payment/verify', payload);