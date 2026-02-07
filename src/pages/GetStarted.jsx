import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'react-hot-toast';
import { validateToken } from '../config/api';
import UniversityAdminDashboard from './dashboards/UniversityAdminDashboard';
import CollegeDirectorDashboard from './dashboards/CollegeDirectorDashboard';
import DepartmentHeadDashboard from './dashboards/DepartmentHeadDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import StudentDashboard from './dashboards/StudentDashboard';

const GetStarted = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const validateAndDecodeToken = async () => {
            try {
                // Check for token in URL params first, then fallback to localStorage
                const urlToken = searchParams.get('token');
                const token = urlToken || localStorage.getItem('campusconnect-token');

                if (!token) {
                    toast.error('No authentication token found. Please login.');
                    navigate('/login');
                    return;
                }

                // If token is from URL, store it in localStorage
                if (urlToken) {
                    localStorage.setItem('campusconnect-token', urlToken);
                }

                // Validate token by calling backend API
                const response = await validateToken();

                if (response.data && response.data.valid) {
                    // Extract role and user info from response
                    const role = response.data.role || response.data.user?.role;
                    const user = response.data.user;

                    if (!role) {
                        throw new Error('User role not found in token');
                    }

                    setUserRole(role);
                    setUserInfo(user);
                } else {
                    throw new Error('Invalid token');
                }
            } catch (err) {
                console.error('Token validation error:', err);

                // Clear invalid token
                localStorage.removeItem('campusconnect-token');

                if (err.response?.status === 401 || err.response?.status === 403) {
                    toast.error('Session expired. Please login again.');
                } else {
                    toast.error('Authentication failed. Please login.');
                }

                setError('Authentication failed');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        validateAndDecodeToken();
    }, [navigate, searchParams]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                    <p className="text-xl text-gray-700 font-semibold">Validating your credentials...</p>
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
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Role-based dashboard rendering using switch case
    const renderDashboard = () => {

        switch (userRole?.toLowerCase()) {
            case 'universityadmin':
                return <UniversityAdminDashboard userInfo={userInfo} />;

            case 'collegedirector':
                return <CollegeDirectorDashboard userInfo={userInfo} />;

            case 'departmenthead':
                return <DepartmentHeadDashboard userInfo={userInfo} />;

            case 'faculty':
                return <FacultyDashboard userInfo={userInfo} />;

            case 'student':
                return <StudentDashboard userInfo={userInfo} />;

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
                                    localStorage.clear();
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
