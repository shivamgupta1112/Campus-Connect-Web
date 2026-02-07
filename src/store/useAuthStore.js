import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateToken, refreshToken, logout as apiLogout } from '../config/api';

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

                const attemptRefresh = async () => {
                    try {
                        const response = await refreshToken();
                        if (response.data && response.data.token) {
                            const { token: newToken, user, role } = response.data;
                            const userData = user ? { ...user, role: role || user.role } : null;

                            get().setAuth(userData, newToken);
                            return true;
                        }
                    } catch (error) {
                        // Silent fail
                    }
                    return false;
                };

                // 1. If local token is expired, try refresh immediately
                if (token && isTokenExpired(token)) {
                    const refreshed = await attemptRefresh();
                    if (!refreshed) get().logout();
                    return;
                }

                // 2. If authenticated cleanly, we are good
                if (state.isAuthenticated && state.user && state.user.role) {
                    return;
                }

                // 3. If no token, try to recover session via cookie (refresh)
                if (!token) {
                    const refreshed = await attemptRefresh();
                    if (!refreshed) get().logout();
                    return;
                }

                // 4. Token exists and valid locally. Verify with backend.
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
                        // Validation failed? Try refresh
                        const refreshed = await attemptRefresh();
                        if (!refreshed) get().logout();
                    }
                } catch (error) {
                    console.error("Token validation failed:", error);
                    // On auth error, try refresh
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        const refreshed = await attemptRefresh();
                        if (!refreshed) {
                            get().logout();
                            set({ error: "Session expired" });
                        }
                    } else {
                        // Don't logout on network error, just keep state invalid
                        set({ error: "Validation network error" });
                    }
                } finally {
                    set({ isLoading: false });
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }), // only persist these fields
        }
    )
);

export default useAuthStore;
