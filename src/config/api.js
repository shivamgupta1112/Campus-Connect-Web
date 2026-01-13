import axios from 'axios';

const AUTH_URL = import.meta.env.DEV
    ? "http://localhost:8080/api/auth"
    : 'https://campusconnect-backend-auth-shivamgupta1112.vercel.app/api/auth';

const attachToken = (config) => {
    const token = localStorage.getItem('campusconnect-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

export const authApi = axios.create({
    baseURL: AUTH_URL,
});

authApi.interceptors.request.use(attachToken);

const api = {
    auth: authApi,
};

export default api;