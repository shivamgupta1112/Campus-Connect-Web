import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
    Loader2, GraduationCap, Building2, BookOpen, Settings,
    CheckCircle2, Info
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { updateProfile, getDepartments, getPrograms, getCourses } from '../../config/api';
import toast from 'react-hot-toast';

const ProfileSetup = ({ onComplete }) => {
    const { user, setAuth, token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        department: '',
        phone: '',
        studentId: '',
        batch: '',
        semester: '',
        program: '',
    });

    // Lookup data
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [previewCourses, setPreviewCourses] = useState([]); // courses to show as preview
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    // Load departments on mount
    useEffect(() => {
        getDepartments()
            .then(res => { if (res.data?.success) setDepartments(res.data.data); })
            .catch(() => {})
            .finally(() => setDataLoading(false));
    }, []);

    // Load programs when dept changes
    useEffect(() => {
        if (!formData.department) { setPrograms([]); setPreviewCourses([]); return; }
        getPrograms({ department: formData.department })
            .then(res => { if (res.data?.success) setPrograms(res.data.data); })
            .catch(() => {});
    }, [formData.department]);

    // Load course PREVIEW when dept + program + semester all selected
    useEffect(() => {
        if (!formData.department || !formData.program || !formData.semester) {
            setPreviewCourses([]);
            return;
        }
        setLoadingCourses(true);
        getCourses({
            department: formData.department,
            program:    formData.program,
            semester:   formData.semester,
        })
            .then(res => {
                if (res.data?.success) setPreviewCourses(res.data.data);
            })
            .catch(() => setPreviewCourses([]))
            .finally(() => setLoadingCourses(false));
    }, [formData.department, formData.program, formData.semester]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'department') {
            setFormData(prev => ({ ...prev, department: value, program: '', semester: '' }));
        } else if (name === 'program') {
            setFormData(prev => ({ ...prev, program: value, semester: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (user?.role === 'Student' && previewCourses.length === 0 && formData.semester) {
            toast.error('No courses found for your selected program & semester. Please check your details.');
            return;
        }

        setLoading(true);

        const payload = {
            department: formData.department,
            phone: formData.phone,
        };

        if (user?.role === 'Student') {
            payload.studentDetails = {
                studentId: formData.studentId,
                batch:     formData.batch,
                semester:  parseInt(formData.semester) || undefined,
                program:   formData.program,
            };
            // Note: courses are NOT sent manually — backend auto-derives them
            // from the student's dept + program + semester using the Course collection.
        }

        try {
            const res = await updateProfile(payload);
            if (res.data?.success) {
                const autoEnrolled = res.data.user?.courses || [];
                toast.success(
                    `Profile saved! Auto-enrolled in ${autoEnrolled.length} course${autoEnrolled.length !== 1 ? 's' : ''} for Sem ${formData.semester}.`
                );
                setAuth(res.data.user, token);
                if (onComplete) onComplete();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const semesters = Array.from({ length: 10 }, (_, i) => i + 1);

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
                    We need a few more details to customise your {user?.role?.toLowerCase()} dashboard.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
                    {dataLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Department */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Building2 className="inline mr-1 text-gray-400" size={15} />
                                        Department
                                    </label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                        className="block w-full border border-gray-300 rounded-xl py-3 px-4 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">Select your department</option>
                                        {departments.map(d => (
                                            <option key={d._id} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Phone */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="block w-full border border-gray-300 rounded-xl py-3 px-4 bg-gray-50 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                {/* Student-specific fields */}
                                {user?.role === 'Student' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                            <input
                                                type="text"
                                                name="studentId"
                                                value={formData.studentId}
                                                onChange={handleChange}
                                                required
                                                className="block w-full border border-gray-300 rounded-xl py-3 px-4 bg-gray-50 text-sm"
                                                placeholder="e.g. CSE2023001"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch / Year</label>
                                            <input
                                                type="text"
                                                name="batch"
                                                value={formData.batch}
                                                onChange={handleChange}
                                                required
                                                className="block w-full border border-gray-300 rounded-xl py-3 px-4 bg-gray-50 text-sm"
                                                placeholder="e.g. 2023-2027"
                                            />
                                        </div>

                                        {/* Program — dropdown filtered by dept */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <GraduationCap className="inline mr-1 text-gray-400" size={15} />
                                                Program
                                            </label>
                                            <select
                                                name="program"
                                                value={formData.program}
                                                onChange={handleChange}
                                                required
                                                disabled={!formData.department}
                                                className="block w-full border border-gray-300 rounded-xl py-3 px-4 bg-gray-50 text-sm disabled:opacity-50"
                                            >
                                                <option value="">{formData.department ? 'Select program' : 'Select dept first'}</option>
                                                {programs.map(p => (
                                                    <option key={p._id} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Semester */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                                            <select
                                                name="semester"
                                                value={formData.semester}
                                                onChange={handleChange}
                                                required
                                                disabled={!formData.program}
                                                className="block w-full border border-gray-300 rounded-xl py-3 px-4 bg-gray-50 text-sm disabled:opacity-50"
                                            >
                                                <option value="">{formData.program ? 'Select semester' : 'Select program first'}</option>
                                                {semesters.map(s => (
                                                    <option key={s} value={s}>Semester {s}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Auto-enrollment preview — shown once dept+program+sem are picked */}
                                        {formData.semester && (
                                            <div className="md:col-span-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BookOpen size={15} className="text-blue-500" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Courses for {formData.program} — Semester {formData.semester}
                                                    </span>
                                                </div>

                                                {loadingCourses ? (
                                                    <div className="flex items-center gap-2 py-4 px-4 border border-gray-100 rounded-xl bg-gray-50">
                                                        <Loader2 size={16} className="animate-spin text-blue-400" />
                                                        <span className="text-sm text-gray-400">Loading courses…</span>
                                                    </div>
                                                ) : previewCourses.length === 0 ? (
                                                    <div className="flex items-start gap-2 py-3 px-4 border border-amber-100 rounded-xl bg-amber-50">
                                                        <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                                        <p className="text-sm text-amber-700">
                                                            No courses have been assigned to this program & semester yet. Contact your coordinator.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Info banner */}
                                                        <div className="flex items-start gap-2 mb-3 py-2.5 px-4 border border-blue-100 rounded-xl bg-blue-50">
                                                            <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
                                                            <p className="text-xs text-blue-700">
                                                                You will be <strong>automatically enrolled</strong> in all {previewCourses.length} course{previewCourses.length !== 1 ? 's' : ''} below when you save your profile.
                                                            </p>
                                                        </div>
                                                        {/* Course list */}
                                                        <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                                            {previewCourses.map(course => (
                                                                <div
                                                                    key={course._id}
                                                                    className="flex items-center gap-3 px-4 py-3 bg-white"
                                                                >
                                                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900">{course.name}</p>
                                                                        <p className="text-xs text-gray-400">{course.code} • {course.credits} credits</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Profile & Continue'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
