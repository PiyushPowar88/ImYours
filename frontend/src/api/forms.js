import axiosInstance from './axiosInstance';

export const getFormFields = (serviceId) => axiosInstance.get(`/forms/${serviceId}`);
export const addField = (payload) => axiosInstance.post('/forms', payload);
export const updateField = (id, payload) => axiosInstance.put(`/forms/${id}`, payload);
export const deleteField = (id) => axiosInstance.delete(`/forms/${id}`);
export const reorderFields = (serviceId, orderedIds) =>
  axiosInstance.put('/forms/reorder', { serviceId, orderedIds });