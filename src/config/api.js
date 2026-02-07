import axios from 'axios';

const AUTH_URL =
    import.meta.env.DEV
        ? "http://localhost:5000/api/auth"
        : import.meta.env.VITE_VERCEL_ENV === "preview"
            ? import.meta.env.VITE_PREVIEW_AUTH_URL
            : import.meta.env.VITE_PROD_AUTH_URL;

const COLLEGE_URL =
    import.meta.env.DEV
        ? "http://localhost:5000/api/colleges"
        : import.meta.env.VITE_VERCEL_ENV === "preview"
            ? import.meta.env.VITE_PREVIEW_COLLEGE_URL
            : import.meta.env.VITE_PROD_COLLEGE_URL;

const USER_URL =
    import.meta.env.DEV
        ? "http://localhost:5000/api/users"
        : import.meta.env.VITE_VERCEL_ENV === "preview"
            ? import.meta.env.VITE_PREVIEW_USER_URL
            : import.meta.env.VITE_PROD_USER_URL;

const attachToken = (config) => {
    const token = localStorage.getItem('campusconnect-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

// Create axios instances
// Create axios instances
const authApi = axios.create({ baseURL: AUTH_URL, withCredentials: true });
const collegeApi = axios.create({ baseURL: COLLEGE_URL, withCredentials: true });
const userApi = axios.create({ baseURL: USER_URL, withCredentials: true });

// Attach interceptors
// Attach token interceptor
authApi.interceptors.request.use(attachToken);
collegeApi.interceptors.request.use(attachToken);
userApi.interceptors.request.use(attachToken);

// Logging Interceptors (Dev only)
if (import.meta.env.DEV) {
    const logRequest = (config) => {
        console.groupCollapsed(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`);
        console.log('Headers:', config.headers);
        if (config.data) console.log('Body:', config.data);
        if (config.params) console.log('Params:', config.params);
        console.groupEnd();
        return config;
    };

    const logResponse = (response) => {
        console.groupCollapsed(`✅ API Response: ${response.status} ${response.config.url}`);
        console.log('Data:', response.data);
        console.groupEnd();
        return response;
    };

    const logError = (error) => {
        console.groupCollapsed(`❌ API Error: ${error.message}`);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
        console.groupEnd();
        return Promise.reject(error);
    };

    [authApi, collegeApi, userApi].forEach(api => {
        api.interceptors.request.use(logRequest);
        api.interceptors.response.use(logResponse, logError);
    });
}

// Auth API Methods
export const login = (credentials) => authApi.post('/login', credentials);
export const register = (data) => authApi.post('/register', data);
export const validateToken = () => authApi.get('/validate-token');
export const verifyEmail = (data) => authApi.post('/verify-email', data);
export const forgotPassword = (email) => authApi.post('/forgot-password', { email });
export const resetPassword = (data) => authApi.post('/reset-password', data);
export const refreshToken = () => authApi.get('/refresh');
export const logout = () => authApi.get('/logout');

// College API Methods
export const getColleges = (params) => collegeApi.get('/', { params });
export const getCollege = (id) => collegeApi.get(`/${id}`);
export const createCollege = (data) => collegeApi.post('/', data);
export const updateCollege = (id, data) => collegeApi.put(`/${id}`, data);
export const deleteCollege = (id) => collegeApi.delete(`/${id}`);
export const getAvailableDirectors = (params) => collegeApi.get('/available-directors', { params });

// User API Methods (Directors, Faculty, Students)
export const getUsers = (params) => userApi.get('/', { params });
export const getUser = (id) => userApi.get(`/${id}`);
export const createUser = (data) => userApi.post('/', data); // Used for creating directors
export const updateUser = (id, data) => userApi.put(`/${id}`, data);
export const deleteUser = (id) => userApi.delete(`/${id}`);

const api = {
    auth: {
        login,
        register,
        validateToken,
        verifyEmail,
        forgotPassword,
        resetPassword
    },
    college: {
        getAll: getColleges,
        getOne: getCollege,
        create: createCollege,
        update: updateCollege,
        delete: deleteCollege,
        getDirectors: getAvailableDirectors
    },
    user: {
        getAll: getUsers,
        getOne: getUser,
        create: createUser,
        update: updateUser,
        delete: deleteUser
    }
};

export default api;


