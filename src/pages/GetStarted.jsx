import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { LogOut, User, Home, BookOpen, Settings, Bell, Search } from 'lucide-react';

const GetStarted = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, error, checkAuth, logout } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Handle authentication failures or missing session
    useEffect(() => {
        if (!isLoading && !isAuthenticated && !localStorage.getItem('campusconnect-token')) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm boeder border-gray-100 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors w-full"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    // Clean Dashboard UI for Authenticated User (No Role Specifics)
    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            Get Started
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default GetStarted;
