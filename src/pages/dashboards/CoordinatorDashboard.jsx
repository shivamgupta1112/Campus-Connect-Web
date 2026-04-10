import React, { useState, useEffect } from "react";
import { Users, BookOpen, GraduationCap, FileText, TrendingUp, ClipboardList, X, Loader2 } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { getCourses, getUsers, updateUser, getPrograms, updateProgram } from "../../config/api";
import { toast } from "react-hot-toast";
import StudentProgressView from "./StudentProgressView";

const CoordinatorDashboard = ({ activeItem, setActiveItem }) => {
    const { user } = useAuthStore();

    // States
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentTab = activeItem || 'Dashboard';

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
            const [coursesRes, teachersRes, studentsRes, programsRes] = await Promise.all([
                getCourses({ department: user.department }),
                getUsers({ role: 'Teacher', department: user.department }),
                getUsers({ role: 'Student', department: user.department }),
                getPrograms({ department: user.department })
            ]);

            if (coursesRes.data?.success) setCourses(coursesRes.data.data);
            if (teachersRes.data?.success) setTeachers(teachersRes.data.data);
            if (studentsRes.data?.success) setStudents(studentsRes.data.data);
            if (programsRes.data?.success) setPrograms(programsRes.data.data);

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
            toast.error(`Please select a ${currentTab === 'Teachers' ? 'teacher' : 'program'}`);
            return;
        }

        setAssigning(true);
        try {
            let res;
            if (currentTab === 'Programs') {
                res = await updateProgram(selectedTeacher, { courses: selectedCourses });
            } else {
                res = await updateUser(selectedTeacher, { courses: selectedCourses });
            }
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
        { label: "Programs", value: programs.length || "0", icon: ClipboardList, color: "bg-orange-50 text-orange-600", change: "+0" },
        { label: "Courses", value: courses.length || "0", icon: BookOpen, color: "bg-purple-50 text-purple-600", change: "+0" },
    ];

    const renderDashboardOverview = () => (
        <div className="space-y-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Users size={18} className="text-emerald-600" />
                            Recent Teachers
                        </h3>
                        {setActiveItem && (
                            <button onClick={() => setActiveItem('Teachers')} className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</button>
                        )}
                    </div>
                    <div className="divide-y divide-gray-50">
                        {teachers.slice(0, 5).map(t => (
                            <div key={t._id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{t.name}</p>
                                        <p className="text-xs text-gray-500 text-truncate max-w-[150px]">{t.contactInfo?.email}</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    {(t.courses || []).length} assigned
                                </span>
                            </div>
                        ))}
                        {teachers.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No teachers found.</div>}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <GraduationCap size={18} className="text-blue-600" />
                            Recent Students
                        </h3>
                        {setActiveItem && (
                            <button onClick={() => setActiveItem('Students')} className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</button>
                        )}
                    </div>
                    <div className="divide-y divide-gray-50">
                        {students.slice(0, 5).map(s => (
                            <div key={s._id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                                        {s.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{s.name}</p>
                                        <p className="text-xs text-gray-500">{s.studentDetails?.program || "Program N/A"} • {s.studentDetails?.batch || "Batch N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {students.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No students found.</div>}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Welcome */}
            {currentTab !== 'Student Progress' && (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                    <h2 className="text-xl font-bold mb-1">
                        Welcome back, {user?.name?.split(" ")[0] || "Coordinator"}!
                    </h2>
                    <p className="text-purple-100 text-sm">
                        {user?.department ? `Managing ${user.department} Department` : "Department Coordinator Dashboard"}
                    </p>
                </div>
            )}

            {currentTab === 'Student Progress' && (
                <StudentProgressView department={user?.department} />
            )}

            {currentTab !== 'Student Progress' && (currentTab === 'Dashboard' ? renderDashboardOverview() : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Department {currentTab}</h3>
                        {(currentTab === 'Teachers' || currentTab === 'Programs') && (
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
                                        </>
                                    )}
                                    {currentTab === 'Programs' && (
                                        <>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program Name</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Courses</th>
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
                                    </tr>
                                ))}
                                {currentTab === 'Students' && students.length === 0 && !loading && (
                                    <tr><td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-500">No students found.</td></tr>
                                )}

                                {/* Programs View */}
                                {currentTab === 'Programs' && programs.map((prog) => (
                                    <tr key={prog._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5"><span className="text-sm font-medium text-gray-900">{prog.name}</span></td>
                                        <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{prog.department}</span></td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-wrap gap-2">
                                                {prog.courses && prog.courses.length > 0 ? (
                                                    prog.courses.map((course, idx) => (
                                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">{course}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No courses assigned</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {currentTab === 'Programs' && programs.length === 0 && !loading && (
                                    <tr><td colSpan="3" className="px-5 py-8 text-center text-sm text-gray-500">No programs found.</td></tr>
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
            ))}

            {/* Assign Courses Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 text-left">
                            <h3 className="font-semibold text-gray-900">Assign Courses to {currentTab === 'Teachers' ? 'Teacher' : 'Program'}</h3>
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAssignFormSubmit} className="p-5 space-y-5 text-left">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select {currentTab === 'Teachers' ? 'Teacher' : 'Program'}</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                                    value={selectedTeacher}
                                    onChange={(e) => {
                                        setSelectedTeacher(e.target.value);
                                        // Auto-select their existing courses
                                        const activeList = currentTab === 'Teachers' ? teachers : programs;
                                        const selectedUser = activeList.find(t => t._id === e.target.value);
                                        if (selectedUser && selectedUser.courses) {
                                            setSelectedCourses(selectedUser.courses);
                                        } else {
                                            setSelectedCourses([]);
                                        }
                                    }}
                                    required
                                >
                                    <option value="" disabled>Choose a {currentTab === 'Teachers' ? 'teacher' : 'program'}...</option>
                                    {(currentTab === 'Teachers' ? teachers : programs).map(person => (
                                        <option key={person._id} value={person._id}>
                                            {person.name} {person.contactInfo?.email ? `(${person.contactInfo.email})` : ''}
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
