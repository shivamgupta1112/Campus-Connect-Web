import React, { useState, useEffect } from "react";
import { Users, BookOpen, GraduationCap, FileText, TrendingUp, ClipboardList, X, Loader2 } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { getCourses, getUsers, updateUser } from "../../config/api";
import { toast } from "react-hot-toast";

const CoordinatorDashboard = ({ activeItem, setActiveItem }) => {
    const { user } = useAuthStore();

    // States
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentTab = activeItem === 'Dashboard' ? 'Teachers' : activeItem;

    // Modal state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedCourses, setSelectedCourses] = useState([]); // array of course titles
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (user?.department) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [coursesRes, teachersRes, studentsRes] = await Promise.all([
                getCourses({ department: user.department }),
                getUsers({ role: 'Teacher', department: user.department }),
                getUsers({ role: 'Student', department: user.department })
            ]);

            if (coursesRes.data?.success) setCourses(coursesRes.data.data);
            if (teachersRes.data?.success) setTeachers(teachersRes.data.data);
            if (studentsRes.data?.success) setStudents(studentsRes.data.data);

        } catch (error) {
            console.error("Failed to fetch coordinator data", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignFormSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeacher) {
            toast.error(`Please select a ${currentTab === 'Teachers' ? 'teacher' : 'student'}`);
            return;
        }

        setAssigning(true);
        try {
            const res = await updateUser(selectedTeacher, { courses: selectedCourses });
            if (res.data?.success) {
                toast.success("Courses assigned successfully");
                setIsAssignModalOpen(false);
                setSelectedTeacher("");
                setSelectedCourses([]);
                fetchDashboardData();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to assign courses");
        } finally {
            setAssigning(false);
        }
    };

    const handleCourseSelection = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        setSelectedCourses(selected);
    };

    const stats = [
        { label: "Teachers", value: teachers.length || "0", icon: Users, color: "bg-emerald-50 text-emerald-600", change: "+0" },
        { label: "Students", value: students.length || "0", icon: GraduationCap, color: "bg-blue-50 text-blue-600", change: "+0" },
        { label: "Courses", value: courses.length || "0", icon: BookOpen, color: "bg-purple-50 text-purple-600", change: "+0" },
        { label: "Notes Uploaded", value: "TBD", icon: FileText, color: "bg-amber-50 text-amber-600", change: "+0" },
    ];


    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                <h2 className="text-xl font-bold mb-1">
                    Welcome back, {user?.name?.split(" ")[0] || "Coordinator"}!
                </h2>
                <p className="text-purple-100 text-sm">
                    {user?.department ? `Managing ${user.department} Department` : "Department Coordinator Dashboard"}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${stat.color.split(" ")[0]} flex items-center justify-center`}>
                                    <Icon size={20} className={stat.color.split(" ")[1]} />
                                </div>
                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                    <TrendingUp size={12} />
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Dynamic Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Department {currentTab}</h3>
                    {(currentTab === 'Teachers' || currentTab === 'Students') && (
                        <button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="text-sm bg-purple-50 text-purple-600 px-4 py-2 rounded-xl hover:bg-purple-100 font-medium flex items-center gap-2 transition-colors"
                        >
                            <ClipboardList size={16} />
                            Assign Courses
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {currentTab === 'Teachers' && (
                                    <>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Courses</th>
                                    </>
                                )}
                                {currentTab === 'Students' && (
                                    <>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Courses</th>
                                    </>
                                )}
                                {currentTab === 'Courses' && (
                                    <>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Name</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Code</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {/* Teachers View */}
                            {currentTab === 'Teachers' && teachers.map((teacher) => (
                                <tr key={teacher._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5"><span className="text-sm font-medium text-gray-900">{teacher.name}</span></td>
                                    <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{teacher.contactInfo?.email}</span></td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-wrap gap-2">
                                            {teacher.courses && teacher.courses.length > 0 ? (
                                                teacher.courses.map((course, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">{course}</span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No courses assigned</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentTab === 'Teachers' && teachers.length === 0 && !loading && (
                                <tr><td colSpan="3" className="px-5 py-8 text-center text-sm text-gray-500">No teachers found.</td></tr>
                            )}

                            {/* Students View */}
                            {currentTab === 'Students' && students.map((student) => (
                                <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5"><span className="text-sm font-medium text-gray-900">{student.name}</span></td>
                                    <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{student.contactInfo?.email}</span></td>
                                    <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{student.studentDetails?.program || "N/A"}</span></td>
                                    <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{student.studentDetails?.batch || "N/A"}</span></td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {student.courses?.length || 0} courses
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentTab === 'Students' && students.length === 0 && !loading && (
                                <tr><td colSpan="5" className="px-5 py-8 text-center text-sm text-gray-500">No students found.</td></tr>
                            )}

                            {/* Courses View */}
                            {currentTab === 'Courses' && courses.map((course) => (
                                <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5"><span className="text-sm font-medium text-gray-900">{course.name}</span></td>
                                    <td className="px-5 py-3.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700">{course.code}</span>
                                    </td>
                                    <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{course.credits}</span></td>
                                </tr>
                            ))}
                            {currentTab === 'Courses' && courses.length === 0 && !loading && (
                                <tr><td colSpan="3" className="px-5 py-8 text-center text-sm text-gray-500">No courses found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Courses Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 text-left">
                            <h3 className="font-semibold text-gray-900">Assign Courses to {currentTab === 'Teachers' ? 'Teacher' : 'Student'}</h3>
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAssignFormSubmit} className="p-5 space-y-5 text-left">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select {currentTab === 'Teachers' ? 'Teacher' : 'Student'}</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                                    value={selectedTeacher}
                                    onChange={(e) => {
                                        setSelectedTeacher(e.target.value);
                                        // Auto-select their existing courses
                                        const activeList = currentTab === 'Teachers' ? teachers : students;
                                        const selectedUser = activeList.find(t => t._id === e.target.value);
                                        if (selectedUser && selectedUser.courses) {
                                            setSelectedCourses(selectedUser.courses);
                                        } else {
                                            setSelectedCourses([]);
                                        }
                                    }}
                                    required
                                >
                                    <option value="" disabled>Choose a {currentTab === 'Teachers' ? 'teacher' : 'student'}...</option>
                                    {(currentTab === 'Teachers' ? teachers : students).map(person => (
                                        <option key={person._id} value={person._id}>
                                            {person.name} ({person.contactInfo?.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                                    <span>Select Courses (Multi-select)</span>
                                    <span className="text-xs font-normal text-gray-500">Hold Ctrl/Cmd to select multiple</span>
                                </label>
                                <select
                                    multiple
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 h-48"
                                    value={selectedCourses}
                                    onChange={handleCourseSelection}
                                >
                                    {courses.map(course => (
                                        <option key={course._id} value={course.name} className="py-1">
                                            {course.name} ({course.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                disabled={assigning || !selectedTeacher}
                                type="submit"
                                className="w-full mt-4 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                {assigning ? <Loader2 size={18} className="animate-spin" /> : "Save Assignments"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoordinatorDashboard;
