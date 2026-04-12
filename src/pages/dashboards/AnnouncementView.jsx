import React, { useState, useEffect } from "react";
import {
    Megaphone, Plus, Trash2, X, Loader2, AlertTriangle,
    ChevronDown, Users, GraduationCap, BookOpen, Clock,
    Bell, Filter, AlertCircle, Info, Zap, Tag, BarChart2,
    ClipboardList, Calendar, FileText
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import {
    getAnnouncements, getMyAnnouncements, createAnnouncement,
    deleteAnnouncement, getAnnouncementMeta
} from "../../config/api";
import { toast } from "react-hot-toast";

// ─── Priority Config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
    Low:    { color: "bg-gray-100 text-gray-600 border-gray-200",    dot: "bg-gray-400",    icon: Info },
    Normal: { color: "bg-blue-50 text-blue-700 border-blue-100",     dot: "bg-blue-400",    icon: Bell },
    High:   { color: "bg-amber-50 text-amber-700 border-amber-100",  dot: "bg-amber-400",   icon: AlertCircle },
    Urgent: { color: "bg-red-50 text-red-700 border-red-100",        dot: "bg-red-500",     icon: Zap },
};

// ─── Category Config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
    'General':     { color: "bg-gray-100 text-gray-600",      emoji: "📢", icon: Megaphone },
    'Test/Exam':   { color: "bg-orange-50 text-orange-700",   emoji: "📝", icon: ClipboardList },
    'Performance': { color: "bg-emerald-50 text-emerald-700", emoji: "📊", icon: BarChart2 },
    'Event':       { color: "bg-pink-50 text-pink-700",       emoji: "🎉", icon: Calendar },
    'Notice':      { color: "bg-sky-50 text-sky-700",         emoji: "📌", icon: FileText },
};

const AUDIENCE_LABELS = {
    All:     { label: "Everyone",          icon: Users,         color: "text-blue-600 bg-blue-50" },   // legacy — kept for old DB records
    Staff:   { label: "Staff",             icon: Users,         color: "text-emerald-600 bg-emerald-50" },
    Student: { label: "Students",          icon: GraduationCap, color: "text-purple-600 bg-purple-50" },
    Both:    { label: "Staff & Students",  icon: Users,         color: "text-indigo-600 bg-indigo-50" },
};

// Audience includes students — used to gate program selector
const targetsStudents = (audience) => ['Student', 'Both'].includes(audience);

// Audience is strictly Students only — used to gate batch selector
const targetsBatch = (audience) => audience === 'Student';

const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.round((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    if (diff < 172800) return "Yesterday";
    if (diff < 2592000) return `${Math.round(diff / 86400)}d ago`;
    return date.toLocaleDateString();
};

// ─── Single Announcement Card ─────────────────────────────────────────────────
const AnnouncementCard = ({ ann, currentUserId, currentUserRole, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const pConf = PRIORITY_CONFIG[ann.priority] || PRIORITY_CONFIG.Normal;
    const aConf = AUDIENCE_LABELS[ann.targetAudience] || AUDIENCE_LABELS.All;
    const AudienceIcon = aConf.icon;
    const PriorityIcon = pConf.icon;

    const isOwner = String(ann.postedBy?._id || ann.postedBy) === String(currentUserId);
    const isAdmin = currentUserRole === 'Admin';
    const canDelete = isOwner || isAdmin;

    return (
        <div className={`bg-white rounded-xl border transition-all hover:shadow-md ${ann.priority === 'Urgent' ? 'border-red-200' : 'border-gray-100'}`}>
            {/* Header */}
            <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Priority dot */}
                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${pConf.dot}`} />
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-gray-900 leading-snug">{ann.title}</h4>
                                {/* Category badge */}
                                {ann.category && ann.category !== 'General' && (() => {
                                    const cat = CATEGORY_CONFIG[ann.category] || CATEGORY_CONFIG['General'];
                                    return (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>
                                            {cat.emoji} {ann.category}
                                        </span>
                                    );
                                })()}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${pConf.color}`}>
                                    <PriorityIcon size={10} />
                                    {ann.priority}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span className="font-medium text-gray-700">{ann.postedBy?.name || "System"}</span>
                                <span>·</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${aConf.color}`}>
                                    <AudienceIcon size={10} />
                                    {aConf.label}
                                </span>
                                { ann.targetDepartment && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                                        <BookOpen size={10} />
                                        {ann.targetDepartment}
                                    </span>
                                )}
                                {ann.targetProgram && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-xs">
                                        {ann.targetProgram}
                                    </span>
                                )}
                                {ann.targetBatch && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs">
                                        Batch: {ann.targetBatch}
                                    </span>
                                )}
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                    <Clock size={10} />
                                    {timeAgo(ann.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => setExpanded(v => !v)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title={expanded ? "Collapse" : "Expand"}
                        >
                            <ChevronDown size={16} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        {canDelete && (
                            <button
                                onClick={() => onDelete(ann._id)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={15} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Message preview */}
                <div className="mt-2 pl-5">
                    <p className={`text-sm text-gray-600 leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>
                        {ann.message}
                    </p>
                </div>
            </div>

            {/* Expiry notice */}
            {ann.expiresAt && (
                <div className="px-5 pb-3 pl-10 text-xs text-amber-600 flex items-center gap-1.5">
                    <AlertTriangle size={12} />
                    Expires {new Date(ann.expiresAt).toLocaleDateString()}
                </div>
            )}
        </div>
    );
};

// ─── Main AnnouncementView Component ─────────────────────────────────────────
const AnnouncementView = () => {
    const { user } = useAuthStore();
    const role = user?.role;

    // List state
    const [announcements, setAnnouncements] = useState([]);
    const [myAnnouncements, setMyAnnouncements] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    // Tab: "inbox" | "sent"
    const [tab, setTab] = useState("inbox");

    // Create form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: "",
        message: "",
        targetAudience: role === 'Teacher' ? 'Student' : 'Both',
        targetDepartment: "",
        targetProgram: "",
        targetBatch: "",
        priority: "Normal",
        category: "General",
        expiresAt: "",
    });

    // Meta for all roles that can post
    const [metaDepartments, setMetaDepartments] = useState([]);
    const [metaPrograms, setMetaPrograms] = useState([]);
    const [metaBatches, setMetaBatches] = useState([]);
    const [filterPriority, setFilterPriority] = useState("All");

    const canPost = ['Admin', 'Coordinator', 'Teacher'].includes(role);

    useEffect(() => {
        fetchAnnouncements();
        if (canPost) {
            fetchMeta();
        }
    }, []);

    const fetchAnnouncements = async () => {
        setLoadingList(true);
        try {
            const [inboxRes, sentRes] = await Promise.all([
                getAnnouncements(),
                canPost ? getMyAnnouncements() : Promise.resolve({ data: { data: [] } }),
            ]);
            if (inboxRes.data?.success) setAnnouncements(inboxRes.data.data);
            if (sentRes.data?.success) setMyAnnouncements(sentRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingList(false);
        }
    };

    const fetchMeta = async (department) => {
        try {
            const params = (role === 'Admin' && department) ? { department } : undefined;
            const res = await getAnnouncementMeta(params);
            if (res.data?.success) {
                setMetaPrograms(res.data.data.programs || []);
                setMetaBatches(res.data.data.batches || []);
                if (role === 'Admin') {
                    setMetaDepartments(res.data.data.departments || []);
                }
            }
        } catch (err) {
            console.error("Meta fetch failed", err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                targetDepartment: form.targetDepartment || undefined,
                targetProgram: form.targetProgram || undefined,
                targetBatch: form.targetBatch || undefined,
                expiresAt: form.expiresAt || undefined,
            };
            const res = await createAnnouncement(payload);
            if (res.data?.success) {
                toast.success("Announcement posted!");
                setIsFormOpen(false);
                setForm({ title: "", message: "", targetAudience: role === 'Teacher' ? 'Student' : 'Both', targetDepartment: "", targetProgram: "", targetBatch: "", priority: "Normal", category: "General", expiresAt: "" });
                fetchAnnouncements();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to post announcement");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            const res = await deleteAnnouncement(id);
            if (res.data?.success) {
                toast.success("Announcement deleted");
                fetchAnnouncements();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Delete failed");
        }
    };

    // Audience options by role — 'All' removed, use 'Both' for Staff+Students
    const audienceOptions = () => {
        if (role === 'Admin') return ['Staff', 'Student', 'Both'];
        if (role === 'Coordinator') return ['Staff', 'Student', 'Both'];
        return ['Student'];
    };

    const displayList = tab === 'inbox' ? announcements : myAnnouncements;
    const filtered = filterPriority === 'All'
        ? displayList
        : displayList.filter(a => a.priority === filterPriority);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Megaphone size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Announcements</h2>
                            <p className="text-purple-200 text-sm">
                                {tab === 'inbox' ? `${filtered.length} announcement${filtered.length !== 1 ? 's' : ''} for you` : `${filtered.length} sent by you`}
                            </p>
                        </div>
                    </div>
                    {canPost && (
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 font-semibold text-sm rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            New Announcement
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs + Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                    <button
                        onClick={() => setTab("inbox")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'inbox' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Inbox
                        {announcements.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">{announcements.length}</span>
                        )}
                    </button>
                    {canPost && (
                        <button
                            onClick={() => setTab("sent")}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'sent' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            My Posts
                            {myAnnouncements.length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">{myAnnouncements.length}</span>
                            )}
                        </button>
                    )}
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-400" />
                    <select
                        value={filterPriority}
                        onChange={e => setFilterPriority(e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 bg-white"
                    >
                        <option value="All">All Priorities</option>
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Normal">Normal</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>

            {/* Announcement List */}
            <div className="space-y-3">
                {loadingList ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={30} className="animate-spin text-violet-500" />
                    </div>
                ) : filtered.length > 0 ? (
                    filtered.map(ann => (
                        <AnnouncementCard
                            key={ann._id}
                            ann={ann}
                            currentUserId={user?._id || user?.id}
                            currentUserRole={role}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                        <Megaphone size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No announcements found</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {tab === 'inbox' ? "You're all caught up!" : "You haven't posted any announcements yet."}
                        </p>
                    </div>
                )}
            </div>

            {/* Create Announcement Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Megaphone size={18} className="text-violet-600" />
                                New Announcement
                            </h3>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                                <input
                                    required
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="Announcement title..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                                <textarea
                                    required
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    placeholder="Write your announcement here..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm resize-none"
                                />
                            </div>

                            {/* Audience + Priority + Category row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
                                    <select
                                        value={form.targetAudience}
                                        onChange={e => {
                                            const newAud = e.target.value;
                                            setForm(f => ({
                                                ...f,
                                                targetAudience: newAud,
                                                // Clear program if no students at all
                                                targetProgram: targetsStudents(newAud) ? f.targetProgram : '',
                                                // Clear batch if not strictly Student
                                                targetBatch: targetsBatch(newAud) ? f.targetBatch : '',
                                            }));
                                        }}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm"
                                    >
                                        {audienceOptions().map(opt => (
                                            <option key={opt} value={opt}>{AUDIENCE_LABELS[opt]?.label || opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                                    <select
                                        value={form.priority}
                                        onChange={e => setForm({ ...form, priority: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm"
                                    >
                                        {['Low', 'Normal', 'High', 'Urgent'].map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setForm({ ...form, category: key })}
                                            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 text-xs font-medium transition-all ${
                                                form.category === key
                                                    ? `${conf.color} border-current shadow-sm`
                                                    : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-lg leading-none">{conf.emoji}</span>
                                            <span className="leading-tight text-center">{key}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Admin: Department dropdown + Program + Batch (batch only if targeting students) */}
                            {role === 'Admin' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Target Department <span className="text-gray-400 font-normal">(optional — leave blank for all)</span>
                                        </label>
                                        <select
                                            value={form.targetDepartment}
                                            onChange={e => {
                                                const dept = e.target.value;
                                                setForm({ ...form, targetDepartment: dept, targetProgram: '', targetBatch: '' });
                                                fetchMeta(dept || undefined);
                                            }}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm"
                                        >
                                            <option value="">All Departments (Global broadcast)</option>
                                            {metaDepartments.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Program — only when dept selected AND audience includes students */}
                                    {form.targetDepartment && targetsStudents(form.targetAudience) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Program <span className="text-gray-400 font-normal">(optional)</span>
                                            </label>
                                            <select
                                                value={form.targetProgram}
                                                onChange={e => setForm({ ...form, targetProgram: e.target.value, targetBatch: '' })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm"
                                            >
                                                <option value="">All Programs</option>
                                                {metaPrograms.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Batch — only when dept selected AND audience is strictly Students */}
                                    {form.targetDepartment && targetsBatch(form.targetAudience) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Batch <span className="text-gray-400 font-normal">(optional)</span>
                                            </label>
                                            <select
                                                value={form.targetBatch}
                                                onChange={e => setForm({ ...form, targetBatch: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm"
                                            >
                                                <option value="">All Batches</option>
                                                {metaBatches.map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Hint: dept selected but Staff-only */}
                                    {form.targetDepartment && !targetsStudents(form.targetAudience) && (
                                        <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                            <Info size={12} />
                                            Program & batch targeting is only available when the audience includes students.
                                        </p>
                                    )}
                                </>
                            )}

                            {/* Teacher / Coordinator: Program & Batch targeting */}
                            {(role === 'Teacher' || role === 'Coordinator') && (
                                <>
                                    {/* Program: shows when audience includes students */}
                                    {targetsStudents(form.targetAudience) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Program <span className="text-gray-400 font-normal">(optional)</span>
                                            </label>
                                            <select
                                                value={form.targetProgram}
                                                onChange={e => setForm({ ...form, targetProgram: e.target.value, targetBatch: '' })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm"
                                            >
                                                <option value="">All Programs</option>
                                                {metaPrograms.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Batch: only when audience is strictly Students */}
                                    {targetsBatch(form.targetAudience) ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Batch <span className="text-gray-400 font-normal">(optional)</span>
                                            </label>
                                            <select
                                                value={form.targetBatch}
                                                onChange={e => setForm({ ...form, targetBatch: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm"
                                            >
                                                <option value="">All Batches</option>
                                                {metaBatches.map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        targetsStudents(form.targetAudience) && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                                <Info size={12} />
                                                Select <strong>Students only</strong> to enable batch targeting.
                                            </p>
                                        )
                                    )}
                                </>
                            )}

                            {/* Expiry Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Expiry Date <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.expiresAt}
                                    onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-violet-400 text-sm"
                                />
                            </div>

                            {/* Preview badge */}
                            <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
                                <p className="text-xs text-violet-700 font-medium mb-1">📢 Posting as: <span className="font-bold">{user?.name}</span> ({role})</p>
                                <p className="text-xs text-violet-600">
                                    {CATEGORY_CONFIG[form.category]?.emoji} <strong>{form.category}</strong> announcement for{' '}
                                    <strong>{AUDIENCE_LABELS[form.targetAudience]?.label || form.targetAudience}</strong>
                                    {form.targetDepartment && ` in ${form.targetDepartment}`}
                                    {!form.targetDepartment && role !== 'Admin' && user?.department ? ` in ${user.department}` : ''}
                                    {form.targetProgram && ` › ${form.targetProgram}`}
                                    {form.targetBatch && ` (Batch: ${form.targetBatch})`}
                                </p>
                            </div>

                            <button
                                disabled={submitting}
                                type="submit"
                                className="w-full py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? <><Loader2 size={18} className="animate-spin" /> Posting...</> : <><Megaphone size={18} /> Post Announcement</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementView;
