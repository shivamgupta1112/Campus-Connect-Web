import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { validateToken, logout as apiLogout } from '../config/api';

// Helper to check if token is expired
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        const { exp } = JSON.parse(jsonPayload);

        // Check if expired (exp is in seconds)
        return Date.now() >= exp * 1000;
    } catch (error) {
        return true;
    }
};

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setAuth: (user, token) => {
                if (token) {
                    localStorage.setItem('campusconnect-token', token);
                }
                set({ user, token, isAuthenticated: true, error: null });
            },

            logout: async () => {
                try {
                    await apiLogout().catch(() => { });
                } catch (error) {
                    console.error("Logout API failed", error);
                }
                localStorage.removeItem('campusconnect-token');
                set({ user: null, token: null, isAuthenticated: false, error: null });
            },

            checkAuth: async () => {
                const state = get();
                const token = state.token || localStorage.getItem('campusconnect-token');

                // 1. If no token, ensure logout state and return
                if (!token) {
                    set({ user: null, token: null, isAuthenticated: false });
                    return;
                }

                // 2. If token is expired locally
                if (isTokenExpired(token)) {
                    get().logout();
                    toast.error("Session expired. Please login again.");
                    return;
                }

                // 3. Validate with backend
                set({ isLoading: true, error: null });

                try {
                    const response = await validateToken();

                    if (response.data && response.data.valid) {
                        const role = response.data.role || response.data.user?.role;
                        const user = response.data.user;

                        set({
                            user: { ...user, role },
                            token,
                            isAuthenticated: true,
                            error: null
                        });
                    } else {
                        // Token invalid/blacklisted
                        get().logout();
                        toast.error("Session invalid. Please login again.");
                    }
                } catch (error) {
                    console.error("Token validation failed:", error);

                    if (error.response?.status === 401 || error.response?.status === 403) {
                        get().logout();
                        toast.error("Session expired. Please login again.");
                    } else {
                        // Network error or other server error
                        set({ error: "Validation network error" });
                    }
                } finally {
                    set({ isLoading: false });
                }
            }
        }),
        {
            name: 'campusconnect-auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);

export default useAuthStore;
