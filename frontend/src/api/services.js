import axiosInstance from './axiosInstance';

export const getServices = () => axiosInstance.get('/services');
export const getServiceById = (id) => axiosInstance.get(`/services/${id}`);