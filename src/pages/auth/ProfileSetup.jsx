import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, GraduationCap, Building2, BookOpen, Settings } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { updateProfile } from '../../config/api';
import toast from 'react-hot-toast';

const ProfileSetup = ({ onComplete }) => {
    const { user, setAuth, token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        department: '',
        courses: '',
        phone: '',
        studentId: '',
        batch: '',
        semester: '',
        program: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Prepare payload correctly
        const payload = {
            department: formData.department,
            phone: formData.phone,
        };

        if (formData.courses) {
            payload.courses = formData.courses.split(',').map(c => c.trim()).filter(Boolean);
        }

        if (user?.role === 'Student') {
            payload.studentDetails = {
                studentId: formData.studentId,
                batch: formData.batch,
                semester: parseInt(formData.semester) || undefined,
                program: formData.program,
            };
        }

        try {
            const res = await updateProfile(payload);
            if (res.data?.success) {
                toast.success("Profile completed successfully!");
                // Update local auth store with new user data
                setAuth(res.data.user, token);
                if (onComplete) onComplete();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Settings className="text-white" size={28} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Complete Your Profile
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    We need a few more details to customize your {user?.role.toLowerCase()} dashboard.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Common Fields */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building2 className="text-gray-400" size={18} />
                                    </div>
                                    <input type="text" name="department" value={formData.department} onChange={handleChange} required className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3 border bg-gray-50" placeholder="e.g. Computer Science" />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Phone Phone (optional)</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3 px-4 border bg-gray-50" placeholder="+1 234 567 8900" />
                            </div>

                            {/* Student Specific Fields */}
                            {user?.role === 'Student' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Student ID</label>
                                        <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} required className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3 px-4 border bg-gray-50" placeholder="e.g. CS2023001" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Program</label>
                                        <input type="text" name="program" value={formData.program} onChange={handleChange} required className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3 px-4 border bg-gray-50" placeholder="e.g. B.Tech" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Batch/Year</label>
                                        <input type="text" name="batch" value={formData.batch} onChange={handleChange} required className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3 px-4 border bg-gray-50" placeholder="e.g. 2023-2027" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Current Semester</label>
                                        <input type="number" name="semester" value={formData.semester} onChange={handleChange} required min="1" max="10" className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3 px-4 border bg-gray-50" placeholder="e.g. 5" />
                                    </div>
                                </>
                            )}

                            {/* Courses Field (Comma separated) - ONLY FOR STUDENTS */}
                            {user?.role === 'Student' && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Enrolled Courses (Comma separated)
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <BookOpen className="text-gray-400" size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="courses"
                                            value={formData.courses}
                                            onChange={handleChange}
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-3 border bg-gray-50"
                                            placeholder="e.g. Data Structures, Operating Systems"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">This helps us show you relevant notes and materials.</p>
                                </div>
                            )}

                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : "Save Profile & Continue"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
