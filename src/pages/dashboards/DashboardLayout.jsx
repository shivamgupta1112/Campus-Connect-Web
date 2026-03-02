import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
    LogOut,
    Menu,
    X,
    Home,
    BookOpen,
    Users,
    Settings,
    Bell,
    FileText,
    GraduationCap,
    Building2,
    UserCircle,
    ChevronRight,
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

const roleNavItems = {
    Admin: [
        { label: "Dashboard", icon: Home, path: "/get-started/dashboard" },
        { label: "Users", icon: Users, path: "/get-started/dashboard" },
        { label: "Departments", icon: Building2, path: "/get-started/dashboard" },
        { label: "Settings", icon: Settings, path: "/get-started/dashboard" },
    ],
    Coordinator: [
        { label: "Dashboard", icon: Home, path: "/get-started/dashboard" },
        { label: "Teachers", icon: Users, path: "/get-started/dashboard" },
        { label: "Students", icon: GraduationCap, path: "/get-started/dashboard" },
        { label: "Courses", icon: BookOpen, path: "/get-started/dashboard" },
    ],
    Teacher: [
        { label: "Dashboard", icon: Home, path: "/get-started/dashboard" },
        { label: "My Courses", icon: BookOpen, path: "/get-started/dashboard" },
        { label: "Upload Notes", icon: FileText, path: "/get-started/dashboard" },
    ],
    Student: [
        { label: "Dashboard", icon: Home, path: "/get-started/dashboard" },
        { label: "My Courses", icon: BookOpen, path: "/get-started/dashboard" },
        { label: "Notes", icon: FileText, path: "/get-started/dashboard" },
        { label: "Profile", icon: UserCircle, path: "/get-started/dashboard" },
    ],
};

const roleBadgeColors = {
    Admin: "bg-red-50 text-red-700 border-red-200",
    Coordinator: "bg-purple-50 text-purple-700 border-purple-200",
    Teacher: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Student: "bg-blue-50 text-blue-700 border-blue-200",
};

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeItem, setActiveItem] = useState("Dashboard");

    const role = user?.role || "Student";
    const navItems = roleNavItems[role] || roleNavItems.Student;

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {/* Logo area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <GraduationCap size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg">
                            Campus Connect
                        </span>
                    </div>
                    <button
                        className="lg:hidden text-gray-400 hover:text-gray-600"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* User info */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user?.name || "User"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email || ""}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleBadgeColors[role]}`}
                        >
                            {role}
                        </span>
                        {user?.department && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                {user.department}
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.label;
                        return (
                            <button
                                key={item.label}
                                onClick={() => setActiveItem(item.label)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon
                                    size={18}
                                    className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}
                                />
                                <span className="flex-1 text-left">{item.label}</span>
                                {isActive && (
                                    <ChevronRight size={14} className="text-blue-400" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-gray-400 hover:text-gray-600"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">{activeItem}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {React.isValidElement(children) ? React.cloneElement(children, { activeItem, setActiveItem }) : children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
