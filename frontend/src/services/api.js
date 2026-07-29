import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStudents = async (search = '') => {
  const response = await api.get('/students/', {
    params: search ? { search } : {},
  });
  return response.data;
};

export const getStudentDetail = async (admissionNo) => {
  const response = await api.get(`/students/${admissionNo}/`);
  return response.data;
};

export const getSummary = async () => {
  const response = await api.get('/summary/');
  return response.data;
};
