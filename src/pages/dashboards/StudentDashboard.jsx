import React, { useState, useEffect } from "react";
import { BookOpen, FileText, Clock, TrendingUp, Download, Calendar, FolderOpen, CheckCircle2, Circle } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { getNotes, updateUser, getPrograms } from "../../config/api";

const StudentDashboard = ({ activeItem, setActiveItem }) => {
    const { user, updateUserLocally } = useAuthStore();
    const [notes, setNotes] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize from user state
    const completedNotes = user?.completedNotes || [];

    const toggleNoteCompletion = async (noteId) => {
        if (!noteId) return;

        const newCompletedNotes = completedNotes.includes(noteId)
            ? completedNotes.filter(id => id !== noteId)
            : [...completedNotes, noteId];

        // Optimistically update local state via store
        updateUserLocally({ completedNotes: newCompletedNotes });

        try {
            // Update backend
            await updateUser(user.id || user._id, { completedNotes: newCompletedNotes });
        } catch (error) {
            console.error("Failed to save progress", error);
            // Revert on failure
            updateUserLocally({ completedNotes });
        }
    };

    const currentTab = activeItem || 'Dashboard';

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const timeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.round((now - date) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        if (days < 30) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            if (user?.studentDetails?.program) {
                const progRes = await getPrograms({ department: user.department });
                if (progRes.data?.success) {
                    const studentProgram = progRes.data.data.find(p => p.name === user.studentDetails.program);
                    const coursesArr = studentProgram?.courses || [];
                    setEnrolledCourses(coursesArr);

                    const res = await getNotes({ department: user.department });
                    if (res.data?.success) {
                        const matchedNotes = res.data.data.filter(n => coursesArr.includes(n.course));
                        setNotes(matchedNotes);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalNotes = notes.length;
    const validCompletedCount = completedNotes.filter(id => notes.some(n => n._id === id)).length;
    const progressPercentage = totalNotes > 0 ? Math.round((validCompletedCount / totalNotes) * 100) : 0;

    const stats = [
        { label: "Enrolled Courses", value: enrolledCourses.length, icon: BookOpen, color: "bg-blue-50 text-blue-600" },
        { label: "Notes Available", value: loading ? "..." : notes.length, icon: FileText, color: "bg-emerald-50 text-emerald-600" },
        { label: "Overall Progress", value: `${progressPercentage}%`, icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
    ];

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                <h2 className="text-xl font-bold mb-1">
                    Hello, {user?.name?.split(" ")[0] || "Student"}! 👋
                </h2>
                <p className="text-blue-100 text-sm">
                    {user?.studentDetails?.program ? `${user.studentDetails.program}, ` : ""}
                    {user?.department ? `${user.department} Department ` : "Student Dashboard "}
                    {user?.studentDetails?.semester ? `• Sem ${user.studentDetails.semester}` : ""}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className={`w-10 h-10 rounded-xl ${stat.color.split(" ")[0]} flex items-center justify-center mb-3`}>
                                <Icon size={20} className={stat.color.split(" ")[1]} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Recent Notes */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FileText size={18} className="text-blue-600" />
                            Latest Notes for You
                        </h3>
                        <button
                            onClick={() => setActiveItem('My Courses')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View All
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            <div className="px-5 py-8 text-center text-sm text-gray-500">Loading notes...</div>
                        ) : notes.length > 0 ? (
                            notes.slice(0, 5).map((note, i) => (
                                <div key={note._id || i} className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${completedNotes.includes(note._id) ? 'bg-gray-50/50' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => toggleNoteCompletion(note._id)}
                                            className="text-gray-400 hover:text-green-600 transition-colors"
                                        >
                                            {completedNotes.includes(note._id) ? <CheckCircle2 size={24} className="text-green-500" /> : <Circle size={24} />}
                                        </button>
                                        <div className={`w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center ${completedNotes.includes(note._id) ? 'opacity-60' : ''}`}>
                                            <span className="text-xs font-bold text-red-600">{note.fileType || 'PDF'}</span>
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium text-gray-900 ${completedNotes.includes(note._id) ? 'line-through text-gray-500' : ''}`}>{note.title}</p>
                                            <p className="text-xs text-gray-500">
                                                {note.course} • {note.uploadedBy?.name || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-gray-400 hidden sm:inline-block">{timeAgo(note.createdAt)}</span>
                                        <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Download size={18} />
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-8 text-center text-sm text-gray-500">No recent notes found for your enrolled courses.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMyCourses = () => {
        const courses = enrolledCourses;

        return (
            <div className="space-y-6">
                {courses.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                        <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Courses Found</h3>
                        <p className="text-sm text-gray-500">You are not enrolled in any courses yet.</p>
                    </div>
                ) : (
                    courses.map(courseName => {
                        const courseNotes = notes.filter(n => n.course === courseName);

                        return (
                            <div key={courseName} className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
                                <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <BookOpen size={18} className="text-blue-600" />
                                        {courseName}
                                    </h3>
                                    <span className="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                                        {courseNotes.length} Note{courseNotes.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {loading ? (
                                        <div className="px-5 py-8 text-center text-sm text-gray-500">Loading notes...</div>
                                    ) : courseNotes.length > 0 ? (
                                        courseNotes.map((note) => (
                                            <div key={note._id} className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${completedNotes.includes(note._id) ? 'bg-gray-50/50' : ''}`}>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => toggleNoteCompletion(note._id)}
                                                        className="text-gray-400 hover:text-green-600 transition-colors"
                                                    >
                                                        {completedNotes.includes(note._id) ? <CheckCircle2 size={24} className="text-green-500" /> : <Circle size={24} />}
                                                    </button>
                                                    <div className={`w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center ${completedNotes.includes(note._id) ? 'opacity-60' : ''}`}>
                                                        <span className="text-xs font-bold text-red-600">{note.fileType || 'PDF'}</span>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-medium text-gray-900 ${completedNotes.includes(note._id) ? 'line-through text-gray-500' : ''}`}>{note.title}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Uploaded by {note.uploadedBy?.name || 'Unknown'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-gray-400 hidden sm:inline-block">{timeAgo(note.createdAt)}</span>
                                                    <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors title='Download note'">
                                                        <Download size={18} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-5 py-6 text-center text-sm text-gray-500">
                                            No notes have been uploaded for this course yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    return (
        <div>
            {currentTab === 'Dashboard' && renderDashboard()}
            {currentTab === 'My Courses' && renderMyCourses()}
        </div>
    );
};

export default StudentDashboard;
