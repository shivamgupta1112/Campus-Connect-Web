import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import UniversityAdminDashboard from './dashboards/UniversityAdminDashboard';
import CollegeDirectorDashboard from './dashboards/CollegeDirectorDashboard';
import DepartmentHeadDashboard from './dashboards/DepartmentHeadDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import StudentDashboard from './dashboards/StudentDashboard';

const GetStarted = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        checkAuth,
        logout
    } = useAuthStore();

    useEffect(() => {
        const initAuth = async () => {
            const urlToken = searchParams.get('token');

            if (urlToken) {
                // Token from URL (e.g. login redirect)
                localStorage.setItem('campusconnect-token', urlToken);

                // Clear token from URL to keep it clean
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('token');
                setSearchParams(newParams);

                // Force validation for new token
                // We manually reset auth state first to ensure checkAuth runs
                useAuthStore.setState({ isAuthenticated: false });
                await checkAuth();
            } else {
                // Normal navigation or refresh
                await checkAuth();
            }
        };

        initAuth();
    }, [checkAuth, searchParams, setSearchParams]);

    // Handle authentication failures or missing session
    useEffect(() => {
        if (!isLoading && !isAuthenticated && !localStorage.getItem('campusconnect-token')) {
            // No token at all
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                    <p className="text-xl text-gray-700 font-semibold">Validating session...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    // Role-based dashboard rendering using switch case
    const renderDashboard = () => {
        const userRole = user?.role;

        if (!userRole) {
            logout();
            return null;
        }

        switch (userRole?.toLowerCase()) {
            case 'universityadmin':
                return <UniversityAdminDashboard userInfo={user} />;

            case 'collegedirector':
                return <CollegeDirectorDashboard userInfo={user} />;

            case 'departmenthead':
                return <DepartmentHeadDashboard userInfo={user} />;

            case 'faculty':
                return <FacultyDashboard userInfo={user} />;

            case 'student':
                return <StudentDashboard userInfo={user} />;

            default:
                return (
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
                        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
                            <div className="text-6xl mb-4">🤔</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Unknown Role</h2>
                            <p className="text-gray-600 mb-4">
                                Your role "{userRole}" is not recognized in the system.
                            </p>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return renderDashboard();
};

export default GetStarted;
