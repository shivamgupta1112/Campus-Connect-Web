import React from 'react';
import { useNavigate } from 'react-router';
import { LogOut, User } from 'lucide-react';

import useAuthStore from '../store/useAuthStore';

const DashboardHeader = ({ userName, userRole }) => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Campus Connect
                        </button>
                    </div>

                    {/* User Info & Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                            <User size={18} className="text-gray-600" />
                            <div className="text-sm">
                                <p className="font-semibold text-gray-800">{userName || 'User'}</p>
                                <p className="text-xs text-gray-500 capitalize">{userRole?.replace('_', ' ')}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all font-medium"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
