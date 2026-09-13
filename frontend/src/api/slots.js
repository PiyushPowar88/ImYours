import axiosInstance from './axiosInstance';

export const getSlotsByService = (serviceId, date) =>
  axiosInstance.get('/slots', { params: { serviceId, ...(date && { date }) } });

export const getAllSlotsAdmin = (serviceId) =>
  axiosInstance.get('/slots/admin/all', { params: { serviceId } });

export const createSlot = (payload) => axiosInstance.post('/slots', payload);
export const bulkCreateSlots = (payload) => axiosInstance.post('/slots/bulk', payload);
export const updateSlot = (id, payload) => axiosInstance.put(`/slots/${id}`, payload);
export const deleteSlot = (id) => axiosInstance.delete(`/slots/${id}`);