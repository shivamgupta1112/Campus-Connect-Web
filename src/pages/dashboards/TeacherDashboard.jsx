import React, { useState, useEffect } from "react";
import { BookOpen, FileText, Upload, Clock, Plus, Loader2, Trash2 } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { getNotes, uploadNote, deleteNote } from "../../config/api";
import { toast } from "react-hot-toast";
import StudentProgressView from "./StudentProgressView";

const TeacherDashboard = ({ activeItem = 'Dashboard' }) => {
    const { user } = useAuthStore();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        course: "",
        file: null
    });

    useEffect(() => {
        if (activeItem === 'My Courses' || activeItem === 'Upload Notes' || activeItem === 'Dashboard') {
            fetchNotes();
        }
        // Student Progress tab doesn't need note fetching
    }, [activeItem]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const res = await getNotes({ department: user.department });
            if (res.data?.success) {
                // Filter notes to only show ones uploaded by this teacher.
                // Backend returns all for department; let's filter by uploader for "My Uploads".
                const userId = user._id || user.id;
                const myNotes = res.data.data.filter(n => {
                    const uploadedById = n.uploadedBy?._id || n.uploadedBy;
                    return String(uploadedById) === String(userId);
                });
                setNotes(myNotes);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.file) {
            toast.error("Please select a file to upload");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('course', form.course);
            formData.append('department', user.department);
            formData.append('file', form.file);

            const res = await uploadNote(formData);
            if (res.data.success) {
                toast.success("Notes uploaded successfully!");
                setForm({ title: "", course: "", file: null });
                // Reset file input
                document.getElementById('file-upload').value = '';
                fetchNotes();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Error uploading notes");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete these notes?")) {
            try {
                const res = await deleteNote(id);
                if (res.data.success) {
                    toast.success("Notes deleted");
                    fetchNotes();
                }
            } catch (error) {
                toast.error("Error deleting notes");
            }
        }
    };

    const myCoursesSet = user?.courses || [];

    const stats = [
        { label: "My Courses", value: myCoursesSet.length, icon: BookOpen, color: "bg-blue-50 text-blue-600" },
        { label: "Notes Uploaded", value: notes.length, icon: FileText, color: "bg-emerald-50 text-emerald-600" },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            {activeItem === 'Dashboard' && (
                <>
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
                        <h2 className="text-xl font-bold mb-1">
                            Welcome, {user?.name?.split(" ")[0] || "Teacher"}!
                        </h2>
                        <p className="text-emerald-100 text-sm">
                            {user?.department ? `${user.department} Department` : "Teacher Dashboard"}
                            {user?.facultyDetails?.designation ? ` • ${user.facultyDetails.designation}` : ""}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                                        <Icon size={20} className={stat.color.split(" ")[1]} />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* My Courses View */}
            {(activeItem === 'My Courses' || activeItem === 'Dashboard') && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* My Courses List */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Assigned Courses</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {myCoursesSet.map((course, i) => (
                                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <BookOpen size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{course}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                                        {notes.filter(n => n.course === course).length} notes
                                    </span>
                                </div>
                            ))}
                            {myCoursesSet.length === 0 && (
                                <div className="px-5 py-8 text-center text-sm text-gray-500">
                                    No courses currently assigned to you.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Uploads for Dashboard preview */}
                    {activeItem === 'Dashboard' && (
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Your Recent Notes</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {notes.slice(0, 5).map((note, i) => (
                                    <div key={note._id || i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                                <FileText size={18} className="text-red-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{note.title}</p>
                                                <p className="text-xs text-gray-500">{note.course}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <a href={`/pdf-viewer/${note._id}?url=${encodeURIComponent(note.fileUrl)}&title=${encodeURIComponent(note.title)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                                View
                                            </a>
                                        </div>
                                    </div>
                                ))}
                                {!loading && notes.length === 0 && (
                                    <div className="px-5 py-8 text-center text-sm text-gray-500">
                                        You haven't uploaded any notes yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Notes View */}
            {(activeItem === 'Upload Notes') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upload Form */}
                    <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 overflow-hidden h-fit">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-emerald-50/50">
                            <h3 className="font-semibold text-emerald-900 flex items-center gap-2">
                                <Upload size={18} className="text-emerald-600" />
                                Upload New Note
                            </h3>
                        </div>
                        <form onSubmit={handleUpload} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. Chapter 1 Notes" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                                <select required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500">
                                    <option value="">Choose a course...</option>
                                    {myCoursesSet.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF, Doc)</label>
                                <input required id="file-upload" type="file" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                            </div>
                            <button disabled={uploading} type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center">
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : "Upload Note"}
                            </button>
                        </form>
                    </div>

                    {/* All Uploaded Notes */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">All Your Uploaded Notes</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-500"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
                                    ) : notes.map((note) => (
                                        <tr key={note._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5"><span className="text-sm font-medium text-gray-900">{note.title}</span></td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">{note.course}</span>
                                            </td>
                                            <td className="px-5 py-3.5"><span className="text-sm text-gray-600">{new Date(note.createdAt).toLocaleDateString()}</span></td>
                                            <td className="px-5 py-3.5 text-right flex items-center justify-end gap-3">
                                                <a href={`/pdf-viewer/${note._id}?url=${encodeURIComponent(note.fileUrl)}&title=${encodeURIComponent(note.title)}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-900 text-sm font-medium">View</a>
                                                <button onClick={() => handleDelete(note._id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && notes.length === 0 && (
                                        <tr><td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-500">No notes found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* Student Progress View */}
            {activeItem === 'Student Progress' && (
                <StudentProgressView isTeacher={true} />
            )}
        </div>
    );
};

export default TeacherDashboard;
