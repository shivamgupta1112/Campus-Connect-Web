import React, { useState, useEffect } from "react";
import { Users, Building2, GraduationCap, BookOpen, TrendingUp, UserPlus, X, Loader2, Settings, Edit2, Trash2 } from "lucide-react";
import { createDepartment, getDepartments, createCourse, getCourses, getUsers, createUser, updateUser, deleteUser } from "../../config/api";
import { toast } from "react-hot-toast";

const stats = [
    { label: "Total Users", value: "1,245", icon: Users, color: "blue", change: "+12%" },
    { label: "Departments", value: "8", icon: Building2, color: "purple", change: "+1" },
    { label: "Active Teachers", value: "86", icon: GraduationCap, color: "emerald", change: "+5" },
    { label: "Total Courses", value: "142", icon: BookOpen, color: "amber", change: "+18" },
];

const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", badge: "text-blue-700 bg-blue-50" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", badge: "text-purple-700 bg-purple-50" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", badge: "text-emerald-700 bg-emerald-50" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", badge: "text-amber-700 bg-amber-50" },
};

const recentUsers = [
    { name: "Rahul Sharma", role: "Student", dept: "Computer Science", date: "2 hours ago" },
    { name: "Priya Patel", role: "Teacher", dept: "Mathematics", date: "5 hours ago" },
    { name: "Ankit Verma", role: "Coordinator", dept: "Electronics", date: "1 day ago" },
    { name: "Sneha Gupta", role: "Student", dept: "Physics", date: "1 day ago" },
    { name: "Vikram Singh", role: "Teacher", dept: "Chemistry", date: "2 days ago" },
];

const AdminDashboard = ({ activeItem = 'Dashboard', setActiveItem }) => {
    // Stat States
    const [departmentCount, setDepartmentCount] = useState(0);
    const [courseCount, setCourseCount] = useState(0);
    const [userCount, setUserCount] = useState(0);

    // Modal States
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Data lists
    const [departmentsList, setDepartmentsList] = useState([]);
    const [coursesList, setCoursesList] = useState([]);
    const [usersList, setUsersList] = useState([]);

    // Form Data
    const [deptForm, setDeptForm] = useState({ name: "", description: "" });
    const [courseForm, setCourseForm] = useState({ name: "", code: "", department: "", credits: 3 });
    const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", role: "Student", password: "", department: "" });

    // Edit User States
    const [isEditUser, setIsEditUser] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [deptRes, courseRes, userRes] = await Promise.all([
                getDepartments(),
                getCourses(),
                getUsers()
            ]);

            if (deptRes.data?.success) {
                setDepartmentCount(deptRes.data.count);
                setDepartmentsList(deptRes.data.data);
            }
            if (courseRes.data?.success) {
                setCourseCount(courseRes.data.count);
                setCoursesList(courseRes.data.data);
            }
            if (userRes.data?.success) {
                setUserCount(userRes.data.count);
                setUsersList(userRes.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createDepartment(deptForm);
            if (res.data.success) {
                toast.success("Department created!");
                setIsDeptModalOpen(false);
                setDeptForm({ name: "", description: "" });
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Error creating department");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createCourse(courseForm);
            if (res.data.success) {
                toast.success("Course created!");
                setIsCourseModalOpen(false);
                setCourseForm({ name: "", code: "", department: "", credits: 3 });
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Error creating course");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateUser = () => {
        setIsEditUser(false);
        setUserForm({ name: "", email: "", phone: "", role: "Student", password: "", department: "" });
        setIsUserModalOpen(true);
    };

    const handleOpenEditUser = (u) => {
        setIsEditUser(true);
        setEditingUserId(u._id);
        setUserForm({ name: u.name, email: u.contactInfo?.email || "", phone: u.contactInfo?.phone || "", role: u.role, password: "", department: u.department || "" });
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditUser) {
                const data = { ...userForm };
                if (!data.password) delete data.password;
                const res = await updateUser(editingUserId, data);
                if (res.data.success) {
                    toast.success("User updated!");
                }
            } else {
                const res = await createUser(userForm);
                if (res.data.success) {
                    toast.success("User created!");
                }
            }
            setIsUserModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || "Error saving user");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await deleteUser(id);
            if (res.data.success) {
                toast.success("User deleted");
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Error deleting user");
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center`}>
                            <Users size={20} className="text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{userCount}</p>
                    <p className="text-sm text-gray-500 mt-0.5">Total Users</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center`}>
                            <Building2 size={20} className="text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{departmentCount}</p>
                    <p className="text-sm text-gray-500 mt-0.5">Departments</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center`}>
                            <BookOpen size={20} className="text-amber-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{courseCount}</p>
                    <p className="text-sm text-gray-500 mt-0.5">Total Courses</p>
                </div>
            </div>

            {/* Tab Views */}
            {activeItem === 'Dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Users */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Recent Users</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {usersList.slice(0, 5).map((u, i) => (
                                <div key={u._id || i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                            <p className="text-xs text-gray-500">{u.department || 'No Dept'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === "Student" ? "bg-blue-50 text-blue-700" :
                                            u.role === "Teacher" ? "bg-emerald-50 text-emerald-700" :
                                                "bg-purple-50 text-purple-700"
                                            }`}>
                                            {u.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setActiveItem && setActiveItem('Users')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                                <UserPlus size={18} />
                                Manage Users
                            </button>
                            <button
                                onClick={() => setIsDeptModalOpen(true)}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                            >
                                <Building2 size={18} />
                                Create Department
                            </button>
                            <button
                                onClick={() => setIsCourseModalOpen(true)}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-xl text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                                <BookOpen size={18} />
                                Create Course
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl text-white">
                            <h4 className="font-semibold text-sm mb-1">System Status</h4>
                            <p className="text-xs text-gray-400 mb-3">All services running normally</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-xs text-emerald-400 font-medium">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeItem === 'Users' && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">All System Users</h3>
                        <button
                            onClick={handleOpenCreateUser}
                            className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 font-medium flex items-center gap-2 transition-colors"
                        >
                            <UserPlus size={16} />
                            Add User
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {usersList.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5"><span className="text-sm font-medium text-gray-900">{user.name}</span></td>
                                        <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{user.contactInfo?.email}</span></td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                                ${user.role === 'Admin' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                    user.role === 'Coordinator' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                        user.role === 'Teacher' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                            'bg-blue-50 text-blue-700 border border-blue-100'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{user.department || "-"}</span></td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEditUser(user)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Edit User"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {usersList.length === 0 && (
                                    <tr><td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-500">No users found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeItem === 'Departments' && (
                <div className="space-y-6">
                    {/* Departments Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Departments</h3>
                            <button
                                onClick={() => setIsDeptModalOpen(true)}
                                className="text-sm bg-purple-50 text-purple-600 px-4 py-2 rounded-xl hover:bg-purple-100 font-medium flex items-center gap-2 transition-colors"
                            >
                                <Building2 size={16} />
                                Add Department
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department Name</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {departmentsList.map((dept) => (
                                        <tr key={dept._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5"><span className="text-sm font-medium text-gray-900">{dept.name}</span></td>
                                            <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{dept.description || "-"}</span></td>
                                        </tr>
                                    ))}
                                    {departmentsList.length === 0 && (
                                        <tr><td colSpan="2" className="px-5 py-8 text-center text-sm text-gray-500">No departments found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Courses Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Courses</h3>
                            <button
                                onClick={() => setIsCourseModalOpen(true)}
                                className="text-sm bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-100 font-medium flex items-center gap-2 transition-colors"
                            >
                                <BookOpen size={16} />
                                Add Course
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Name</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Code</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {coursesList.map((course) => (
                                        <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5"><span className="text-sm font-medium text-gray-900">{course.name}</span></td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700">{course.code}</span>
                                            </td>
                                            <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{course.department}</span></td>
                                            <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{course.credits}</span></td>
                                        </tr>
                                    ))}
                                    {coursesList.length === 0 && (
                                        <tr><td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-500">No courses found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeItem === 'Settings' && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                        <Settings size={28} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">Configuration options and environmental settings will be available here in a future update.</p>
                </div>
            )}

            {/* Modals */}
            {/* Create/Edit User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">{isEditUser ? "Edit User" : "Create New User"}</h3>
                            <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveUser} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input required type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="user@example.com" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select required value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500">
                                        <option value="Student">Student</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Coordinator">Coordinator</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select value={userForm.department} onChange={(e) => setUserForm({ ...userForm, department: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">No Department</option>
                                        {departmentsList.map(dept => (
                                            <option key={dept._id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                                    <input type="tel" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="+1234567890" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{isEditUser ? "New Password (Optional)" : "Password"}</label>
                                    <input type="password" required={!isEditUser} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" minLength={6} />
                                </div>
                            </div>
                            <button disabled={loading} type="submit" className="w-full mt-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : (isEditUser ? "Update User" : "Create User")}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Department Modal */}
            {isDeptModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Create New Department</h3>
                            <button onClick={() => setIsDeptModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateDepartment} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                                <input required type="text" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Computer Science" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="Department short description" rows={3}></textarea>
                            </div>
                            <button disabled={loading} type="submit" className="w-full py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Department"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Course Modal */}
            {isCourseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Create New Course</h3>
                            <button onClick={() => setIsCourseModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCourse} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                                <input required type="text" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Machine Learning" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                                <input required type="text" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 uppercase" placeholder="e.g. CS401" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select required value={courseForm.department} onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Select a Department</option>
                                    {departmentsList.map(dept => (
                                        <option key={dept._id} value={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                                <input type="number" value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500" min="1" max="10" />
                            </div>
                            <button disabled={loading} type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Course"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
