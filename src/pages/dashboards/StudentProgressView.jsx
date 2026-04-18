import React, { useState, useEffect, useMemo } from "react";
import {
    Search, ChevronDown, ChevronUp, Users, TrendingUp, BookOpen, FileText,
    CheckCircle2, Clock, AlertCircle, BarChart2, Award, Activity,
    Mail, Phone, GraduationCap, Calendar, Hash, Layers, Filter,
    SortAsc, SortDesc, X, Eye, Info
} from "lucide-react";
import { getStudentProgress } from "../../config/api";
import useAuthStore from "../../store/useAuthStore";

/* ─── Utility Helpers ────────────────────────────────────────── */
const timeAgo = (dateStr) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* ─── Sub-components ────────────────────────────────────────── */

const ProgressBar = ({ value, color = "blue", size = "md", showLabel = true }) => {
    const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
    const colors = {
        blue: "from-blue-500 to-cyan-400",
        green: "from-emerald-500 to-green-400",
        amber: "from-amber-500 to-yellow-400",
        red: "from-red-500 to-rose-400",
        purple: "from-purple-500 to-violet-400",
    };
    const pct = Math.min(100, Math.max(0, value));
    const colorKey = pct >= 75 ? "green" : pct >= 40 ? "amber" : "red";
    const gradientColor = color === "auto" ? colorKey : color;
    return (
        <div className="flex items-center gap-2">
            <div className={`flex-1 bg-gray-100 rounded-full overflow-hidden ${heights[size]}`}>
                <div
                    className={`${heights[size]} rounded-full bg-gradient-to-r ${colors[gradientColor]} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-xs font-semibold text-gray-700 min-w-[36px] text-right">{pct}%</span>
            )}
        </div>
    );
};

const StatusBadge = ({ active, verified, profileCompleted }) => {
    if (!active) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100"><AlertCircle size={10} /> Inactive</span>;
    if (!verified) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100"><Clock size={10} /> Unverified</span>;
    if (!profileCompleted) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"><Info size={10} /> Incomplete</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle2 size={10} /> Active</span>;
};

/* ─── Expanded Student Detail Panel ─────────────────────────── */
const StudentDetailPanel = ({ student }) => {
    const pct = student.overall.completionPercentage;
    const pctColor = pct >= 75 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-600";
    const ringColor = pct >= 75 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-100 p-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Profile Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">{student.name}</h4>
                            <StatusBadge active={student.isActive} verified={student.isVerified} profileCompleted={student.profileCompleted} />
                        </div>
                    </div>

                    <div className="space-y-2.5 text-sm">
                        {student.email && (
                            <div className="flex items-center gap-2.5 text-gray-600">
                                <Mail size={14} className="text-gray-400 shrink-0" />
                                <span className="truncate">{student.email}</span>
                            </div>
                        )}
                        {student.phone && (
                            <div className="flex items-center gap-2.5 text-gray-600">
                                <Phone size={14} className="text-gray-400 shrink-0" />
                                <span>{student.phone}</span>
                            </div>
                        )}
                        {student.department && (
                            <div className="flex items-center gap-2.5 text-gray-600">
                                <Layers size={14} className="text-gray-400 shrink-0" />
                                <span>{student.department}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                        {student.studentDetails?.studentId && (
                            <div>
                                <p className="text-xs text-gray-400">Student ID</p>
                                <p className="text-sm font-semibold text-gray-800">{student.studentDetails.studentId}</p>
                            </div>
                        )}
                        {student.studentDetails?.program && (
                            <div>
                                <p className="text-xs text-gray-400">Program</p>
                                <p className="text-sm font-semibold text-gray-800">{student.studentDetails.program}</p>
                            </div>
                        )}
                        {student.studentDetails?.batch && (
                            <div>
                                <p className="text-xs text-gray-400">Batch</p>
                                <p className="text-sm font-semibold text-gray-800">{student.studentDetails.batch}</p>
                            </div>
                        )}
                        {student.studentDetails?.semester && (
                            <div>
                                <p className="text-xs text-gray-400">Semester</p>
                                <p className="text-sm font-semibold text-gray-800">Sem {student.studentDetails.semester}</p>
                            </div>
                        )}
                        {student.studentDetails?.section && (
                            <div>
                                <p className="text-xs text-gray-400">Section</p>
                                <p className="text-sm font-semibold text-gray-800">{student.studentDetails.section}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-gray-400">Joined</p>
                            <p className="text-sm font-semibold text-gray-800">{formatDate(student.createdAt)}</p>
                        </div>
                    </div>

                    {/* Engagement */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Engagement</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-amber-50 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-amber-700">{student.engagement.totalAnnotations}</p>
                                <p className="text-xs text-amber-600">Annotations</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-purple-700">{student.engagement.annotatedDocuments}</p>
                                <p className="text-xs text-purple-600">Docs Annotated</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                            <Activity size={11} /> Last active: {timeAgo(student.engagement.lastActivity)}
                        </p>
                    </div>
                </div>

                {/* Center: Overall Progress Ring + Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col">
                    <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-600" /> Overall Progress
                    </p>

                    {/* Big ring */}
                    <div className="flex flex-col items-center justify-center flex-1 py-4">
                        <div className="relative w-32 h-32">
                            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                                <circle
                                    cx="60" cy="60" r="50" fill="none"
                                    stroke={ringColor} strokeWidth="12"
                                    strokeDasharray={`${2 * Math.PI * 50}`}
                                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-700"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-3xl font-extrabold ${pctColor}`}>{pct}%</span>
                                <span className="text-xs text-gray-400">Complete</span>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3 w-full">
                            <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">{student.overall.totalNotes}</p>
                                <p className="text-xs text-gray-500">Total Notes</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-emerald-600">{student.overall.completedNotes}</p>
                                <p className="text-xs text-gray-500">Completed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-gray-500">{student.overall.totalNotes - student.overall.completedNotes}</p>
                                <p className="text-xs text-gray-500">Remaining</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Enrolled Courses ({student.courseBreakdown.length} tracked)</p>
                        <div className="flex flex-wrap gap-1.5">
                            {student.courseBreakdown.length === 0 ? (
                                <span className="text-xs text-gray-400 italic">No courses to track</span>
                            ) : student.courseBreakdown.map((cb, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{cb.courseName}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Per-course Breakdown */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-y-auto max-h-[420px]">
                    <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <BookOpen size={16} className="text-purple-600" /> Per-Course Breakdown
                    </p>
                    {student.courseBreakdown.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center text-gray-400">
                            <BookOpen size={32} className="mb-2 opacity-30" />
                            <p className="text-sm">No courses to show</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {student.courseBreakdown.map((cb, idx) => (
                                <CourseBreakdownItem key={idx} cb={cb} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CourseBreakdownItem = ({ cb }) => {
    const [open, setOpen] = useState(false);
    const pct = cb.completionPercentage;

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
            >
                <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{cb.courseName}</p>
                    <div className="mt-1.5">
                        <ProgressBar value={pct} color="auto" size="sm" />
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">{cb.completedNotes}/{cb.totalNotes}</span>
                    {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
            </button>
            {open && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {cb.notes.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-gray-400 italic">No notes uploaded for this course yet.</p>
                    ) : cb.notes.map((note, ni) => (
                        <div key={ni} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                            {note.completed
                                ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                : <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                            }
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium truncate ${note.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{note.title}</p>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0">{formatDate(note.createdAt)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Summary Stats Banner ───────────────────────────────────── */
const SummaryBanner = ({ students }) => {
    const total = students.length;
    const active = students.filter(s => s.isActive).length;
    const avgPct = total > 0 ? Math.round(students.reduce((acc, s) => acc + s.overall.completionPercentage, 0) / total) : 0;
    const topStudents = students.filter(s => s.overall.completionPercentage >= 75).length;
    const zeroProgress = students.filter(s => s.overall.completionPercentage === 0 && s.overall.totalNotes > 0).length;

    const cards = [
        { label: "Total Students", value: total, icon: Users, bg: "bg-blue-50", fg: "text-blue-600", border: "border-blue-100" },
        { label: "Active Students", value: active, icon: Activity, bg: "bg-emerald-50", fg: "text-emerald-600", border: "border-emerald-100" },
        { label: "Avg. Completion", value: `${avgPct}%`, icon: TrendingUp, bg: "bg-violet-50", fg: "text-violet-600", border: "border-violet-100" },
        { label: "Top Performers (≥75%)", value: topStudents, icon: Award, bg: "bg-amber-50", fg: "text-amber-600", border: "border-amber-100" },
        { label: "No Progress Yet", value: zeroProgress, icon: AlertCircle, bg: "bg-red-50", fg: "text-red-500", border: "border-red-100" },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {cards.map(c => {
                const Icon = c.icon;
                return (
                    <div key={c.label} className={`rounded-2xl p-4 border ${c.bg} ${c.border} flex flex-col gap-2`}>
                        <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center`}>
                            <Icon size={18} className={c.fg} />
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900">{c.value}</p>
                        <p className="text-xs text-gray-500 leading-tight">{c.label}</p>
                    </div>
                );
            })}
        </div>
    );
};

/* ─── Main Component ────────────────────────────────────────── */
const StudentProgressView = ({ department, isTeacher: isTeacherProp }) => {
    const { user } = useAuthStore();
    const isTeacher = isTeacherProp || user?.role === 'Teacher';
    const teacherCourses = isTeacher ? (user?.courses || []) : [];

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filterProgram, setFilterProgram] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortField, setSortField] = useState("name");
    const [sortDir, setSortDir] = useState("asc");
    const [expandedId, setExpandedId] = useState(null);

    // Effective department: explicit prop, or teacher's dept, or coordinator's dept
    const effectiveDept = department || user?.department || undefined;

    useEffect(() => {
        fetchProgress();
    }, [effectiveDept]);

    const fetchProgress = async () => {
        setLoading(true);
        setError(null);
        try {
            let params = {};
            if (isTeacher) {
                // Teacher: backend auto-scopes by their courses - send no params
                params = {};
            } else if (user?.role === 'Admin') {
                // Admin: fetch all students globally - no department filter
                params = {};
            } else if (effectiveDept) {
                // Coordinator: scope to their department
                params = { department: effectiveDept };
            }
            const res = await getStudentProgress(params);
            if (res.data?.success) {
                setStudents(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to load student progress");
        } finally {
            setLoading(false);
        }
    };

    // All unique programs for filter
    const programs = useMemo(() => {
        const set = new Set(students.map(s => s.studentDetails?.program).filter(Boolean));
        return [...set];
    }, [students]);

    // Filtered + sorted list
    const filtered = useMemo(() => {
        let list = [...students];
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                (s.studentDetails?.studentId || "").toLowerCase().includes(q) ||
                (s.studentDetails?.batch || "").toLowerCase().includes(q) ||
                (s.studentDetails?.program || "").toLowerCase().includes(q)
            );
        }
        if (filterProgram) list = list.filter(s => s.studentDetails?.program === filterProgram);
        if (filterStatus === "active") list = list.filter(s => s.isActive);
        if (filterStatus === "inactive") list = list.filter(s => !s.isActive);
        if (filterStatus === "top") list = list.filter(s => s.overall.completionPercentage >= 75);
        if (filterStatus === "lagging") list = list.filter(s => s.overall.completionPercentage < 30 && s.overall.totalNotes > 0);

        // Sort
        list.sort((a, b) => {
            let av, bv;
            if (sortField === "name") { av = a.name; bv = b.name; }
            else if (sortField === "program") { av = a.studentDetails?.program || ""; bv = b.studentDetails?.program || ""; }
            else if (sortField === "semester") { av = a.studentDetails?.semester || 0; bv = b.studentDetails?.semester || 0; }
            else if (sortField === "batch") { av = a.studentDetails?.batch || ""; bv = b.studentDetails?.batch || ""; }
            else if (sortField === "progress") { av = a.overall.completionPercentage; bv = b.overall.completionPercentage; }
            else if (sortField === "courses") { av = a.enrolledCourses.length; bv = b.enrolledCourses.length; }
            else if (sortField === "activity") { av = new Date(a.engagement.lastActivity); bv = new Date(b.engagement.lastActivity); }
            else { av = a.name; bv = b.name; }
            if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
            return sortDir === "asc" ? av - bv : bv - av;
        });
        return list;
    }, [students, search, filterProgram, filterStatus, sortField, sortDir]);

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortField(field); setSortDir("asc"); }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <SortAsc size={13} className="text-gray-300" />;
        return sortDir === "asc" ? <SortAsc size={13} className="text-blue-500" /> : <SortDesc size={13} className="text-blue-500" />;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500 font-medium">Loading student progress…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
                <h3 className="font-semibold text-red-700 mb-1">Failed to load data</h3>
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <button onClick={fetchProgress} className="px-4 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={`bg-gradient-to-r ${isTeacher ? 'from-emerald-600 via-teal-600 to-cyan-600' : 'from-indigo-600 via-blue-600 to-cyan-600'} rounded-2xl p-6 text-white shadow-lg`}>
                <div className="flex items-center gap-3 mb-1">
                    <BarChart2 size={24} />
                    <h2 className="text-xl font-bold">
                        {isTeacher ? 'My Students\' Progress' : 'Student Progress Tracker'}
                    </h2>
                </div>
                <p className="text-white/80 text-sm">
                    {isTeacher
                        ? teacherCourses.length > 0
                            ? `Tracking students in your ${teacherCourses.length} course${teacherCourses.length !== 1 ? 's' : ''}: ${teacherCourses.slice(0, 3).join(', ')}${teacherCourses.length > 3 ? ` +${teacherCourses.length - 3} more` : ''}`
                            : 'No courses assigned to you yet'
                        : effectiveDept
                            ? `Detailed progress for all students in ${effectiveDept} department`
                            : 'Detailed per-student academic progress across all departments'
                    }
                </p>
                {/* Teacher course chips */}
                {isTeacher && teacherCourses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {teacherCourses.map((c, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/20 text-white border border-white/30">
                                <BookOpen size={11} /> {c}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary Banner */}
            {students.length > 0 && <SummaryBanner students={students} />}

            {/* Filters Row */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, email, ID, batch…"
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Program filter */}
                    {programs.length > 0 && (
                        <div className="relative">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={filterProgram}
                                onChange={e => setFilterProgram(e.target.value)}
                                className="pl-8 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">All Programs</option>
                                {programs.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Status filter */}
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">All Students</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive</option>
                        <option value="top">Top Performers (≥75%)</option>
                        <option value="lagging">Lagging ({"<"}30%)</option>
                    </select>

                    <button
                        onClick={fetchProgress}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shrink-0"
                    >
                        <Activity size={15} /> Refresh
                    </button>
                </div>

                {/* Active filters summary */}
                {(search || filterProgram || filterStatus !== "all") && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs text-gray-500">Showing {filtered.length} of {students.length} students</span>
                        {(search || filterProgram || filterStatus !== "all") && (
                            <button
                                onClick={() => { setSearch(""); setFilterProgram(""); setFilterStatus("all"); }}
                                className="text-xs text-blue-600 hover:underline ml-auto"
                            >Clear all filters</button>
                        )}
                    </div>
                )}
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                                <th className="text-left px-5 py-3.5">
                                    <button onClick={() => toggleSort("name")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors">
                                        Student <SortIcon field="name" />
                                    </button>
                                </th>
                                <th className="text-left px-5 py-3.5">
                                    <button onClick={() => toggleSort("program")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors">
                                        Program <SortIcon field="program" />
                                    </button>
                                </th>
                                <th className="text-left px-5 py-3.5">
                                    <button onClick={() => toggleSort("semester")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors">
                                        Sem <SortIcon field="semester" />
                                    </button>
                                </th>
                                <th className="text-left px-5 py-3.5">
                                    <button onClick={() => toggleSort("batch")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors">
                                        Batch <SortIcon field="batch" />
                                    </button>
                                </th>
                                <th className="text-left px-5 py-3.5">
                                    <button onClick={() => toggleSort("courses")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors">
                                        Courses <SortIcon field="courses" />
                                    </button>
                                </th>
                                <th className="px-5 py-3.5" style={{ minWidth: 180 }}>
                                    <button onClick={() => toggleSort("progress")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors">
                                        Overall Progress <SortIcon field="progress" />
                                    </button>
                                </th>
                                <th className="text-left px-5 py-3.5">
                                    <button onClick={() => toggleSort("activity")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors">
                                        Last Active <SortIcon field="activity" />
                                    </button>
                                </th>
                                <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center">
                                        <GraduationCap size={48} className="mx-auto text-gray-200 mb-3" />
                                        <p className="text-gray-400 text-sm font-medium">No students found matching your filters.</p>
                                    </td>
                                </tr>
                            ) : filtered.map((student) => {
                                const isExpanded = expandedId === student._id.toString();
                                const pct = student.overall.completionPercentage;

                                return (
                                    <React.Fragment key={student._id}>
                                        <tr
                                            className={`border-b border-gray-50 transition-colors ${isExpanded ? "bg-blue-50/30" : "hover:bg-gray-50"}`}
                                        >
                                            {/* Student Name */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                                                        <p className="text-xs text-gray-400 truncate max-w-[140px]">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Program */}
                                            <td className="px-5 py-4">
                                                {student.studentDetails?.program
                                                    ? <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">{student.studentDetails.program}</span>
                                                    : <span className="text-xs text-gray-400">—</span>
                                                }
                                            </td>

                                            {/* Semester */}
                                            <td className="px-5 py-4">
                                                {student.studentDetails?.semester
                                                    ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">Sem {student.studentDetails.semester}</span>
                                                    : <span className="text-xs text-gray-400">—</span>
                                                }
                                            </td>

                                            {/* Batch */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-600">{student.studentDetails?.batch || "—"}</span>
                                            </td>

                                            {/* Enrolled Courses count */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <BookOpen size={14} className="text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">{student.enrolledCourses.length}</span>
                                                </div>
                                            </td>

                                            {/* Progress bar */}
                                            <td className="px-5 py-4" style={{ minWidth: 180 }}>
                                                <ProgressBar value={pct} color="auto" size="md" />
                                                <p className="text-xs text-gray-400 mt-1">{student.overall.completedNotes} / {student.overall.totalNotes} notes</p>
                                            </td>

                                            {/* Last Active */}
                                            <td className="px-5 py-4">
                                                <span className="text-xs text-gray-500">{timeAgo(student.engagement.lastActivity)}</span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4 text-center">
                                                <StatusBadge active={student.isActive} verified={student.isVerified} profileCompleted={student.profileCompleted} />
                                            </td>

                                            {/* Expand */}
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => setExpandedId(isExpanded ? null : student._id.toString())}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isExpanded
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                                        }`}
                                                >
                                                    <Eye size={13} />
                                                    {isExpanded ? "Close" : "View"}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Detail Row */}
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={8} className="p-0">
                                                    <StudentDetailPanel student={student} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <p className="text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? "s" : ""} shown</p>
                        <p className="text-xs text-gray-400">Click <strong>View</strong> to expand full progress details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProgressView;
