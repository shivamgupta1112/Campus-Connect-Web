import React, { useState, useRef } from "react";
import {
    UserPlus, Upload, Download, Edit2, Trash2, X, Loader2,
    GraduationCap, BookOpen, Users, CheckCircle2,
    AlertTriangle, FileSpreadsheet, Search
} from "lucide-react";
import { createUser, updateUser, deleteUser } from "../../config/api";
import { toast } from "react-hot-toast";

// ─── Tab Config (Admin excluded — Admin accounts managed separately for security) ──
const TABS = [
    { key: "Student", label: "Students", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50", activeBg: "bg-blue-600" },
    { key: "Teacher", label: "Teachers", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50", activeBg: "bg-emerald-600" },
    { key: "Coordinator", label: "Coordinators", icon: Users, color: "text-purple-600", bg: "bg-purple-50", activeBg: "bg-purple-600" },
];

// ─── CSV Templates per role (with validation notes row) ─────────────────────
// Format: headers row, then VALIDATION HINTS row (prefixed with #), then sample row
const CSV_TEMPLATES = {
    Student: {
        headers: ["name", "email", "phone", "password", "department", "program", "batch"],
        hints: ["Full name (required)", "Valid email (required)", "10-digit number", "Min 8 chars, 1 uppercase, 1 number (required)", "Exact dept name", "Exact program name", "4-digit year e.g. 2023"],
        sample: [],
    },
    Teacher: {
        headers: ["name", "email", "phone", "password", "department", "designation", "specialization"],
        hints: ["Full name (required)", "Valid email (required)", "10-digit number", "Min 8 chars, 1 uppercase, 1 number (required)", "Exact dept name", "e.g. Professor / Asst. Professor", "Subject area (optional)"],
        sample: [],
    },
    Coordinator: {
        headers: ["name", "email", "phone", "password", "department", "designation", "specialization"],
        hints: ["Full name (required)", "Valid email (required)", "10-digit number", "Min 8 chars, 1 uppercase, 1 number (required)", "Exact dept name (required)", "e.g. Coordinator", "Subject area (optional)"],
        sample: [],
    },
};

// ─── Parse CSV text → array of row objects ────────────────────────────────────
const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) return { headers: [], rows: [], error: "CSV must have a header row and at least one data row." };
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map((line, i) => {
        const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = vals[idx] || ""; });
        obj._rowIndex = i + 2;
        return obj;
    });
    return { headers, rows, error: null };
};

// ─── Download CSV helper (includes hints row + sample) ───────────────────────
const downloadCSV = (role) => {
    const tmpl = CSV_TEMPLATES[role];
    const lines = [
        "# VALIDATION RULES — delete this row before uploading",
        "# " + tmpl.hints.join(" | "),
        tmpl.headers.join(","),
        ...tmpl.sample.map(row => row.join(","))
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${role.toLowerCase()}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

// ─── Build createUser payload from CSV row + role ─────────────────────────────
const buildPayload = (row, role) => {
    const base = {
        name: row.name,
        email: row.email,
        phone: row.phone || "",
        password: row.password,
        role,
        department: row.department || "",
    };
    if (role === "Student") {
        base.studentDetails = { program: row.program || "", batch: row.batch || "" };
    }
    if (role === "Teacher" || role === "Coordinator") {
        base.facultyDetails = { designation: row.designation || "", specialization: row.specialization || "" };
    }
    return base;
};

// ─── Role badge ───────────────────────────────────────────────────────────────
const ROLE_BADGE = {
    Admin: "bg-red-50 text-red-700 border-red-100",
    Coordinator: "bg-purple-50 text-purple-700 border-purple-100",
    Teacher: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Student: "bg-blue-50 text-blue-700 border-blue-100",
};

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════
const UserManagementView = ({ usersList, departmentsList, programsList, onRefresh }) => {
    const [activeTab, setActiveTab] = useState("Student");
    const [search, setSearch] = useState("");

    // Single-user form modal
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(defaultForm("Student"));

    // Bulk upload modal
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [bulkRows, setBulkRows] = useState([]);    // parsed preview rows
    const [bulkErrors, setBulkErrors] = useState([]);    // per-row errors
    const [bulkResults, setBulkResults] = useState([]);    // after upload
    const [bulkUploading, setBulkUploading] = useState(false);
    const [parseError, setParseError] = useState("");
    const fileRef = useRef(null);

    // ── Helpers ──────────────────────────────────────────────────────────────
    function defaultForm(role) {
        return {
            name: "", email: "", phone: "", password: "", role,
            department: "",
            studentDetails: { program: "", batch: "" },
            facultyDetails: { designation: "", specialization: "" },
        };
    }

    const filteredUsers = usersList.filter(u =>
        u.role === activeTab &&
        (u.name.toLowerCase().includes(search.toLowerCase()) ||
            (u.contactInfo?.email || "").toLowerCase().includes(search.toLowerCase()))
    );

    const tabCounts = {};
    TABS.forEach(t => { tabCounts[t.key] = usersList.filter(u => u.role === t.key).length; });

    // ── Single user CRUD ──────────────────────────────────────────────────────
    const openCreate = () => {
        setIsEditMode(false);
        setEditingId(null);
        setForm(defaultForm(activeTab));
        setIsFormOpen(true);
    };

    const openEdit = (u) => {
        setIsEditMode(true);
        setEditingId(u._id);
        setForm({
            name: u.name, email: u.contactInfo?.email || "",
            phone: u.contactInfo?.phone || "", password: "",
            role: u.role, department: u.department || "",
            studentDetails: u.studentDetails || { program: "", batch: "" },
            facultyDetails: u.facultyDetails || { designation: "", specialization: "" },
        });
        setIsFormOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEditMode) {
                const data = { ...form };
                if (!data.password) delete data.password;
                await updateUser(editingId, data);
                toast.success("User updated!");
            } else {
                await createUser(form);
                toast.success("User created!");
            }
            setIsFormOpen(false);
            onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to save user");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this user? This cannot be undone.")) return;
        try {
            await deleteUser(id);
            toast.success("User deleted");
            onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.error || "Delete failed");
        }
    };

    // ── Bulk CSV upload ───────────────────────────────────────────────────────
    // Per-field validators
    const VALIDATORS = {
        name: v => v ? null : 'Name is required',
        email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Invalid email format',
        password: v => v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v) ? null : 'Password must be ≥8 chars with 1 uppercase & 1 number',
        phone: v => !v || /^\d{10}$/.test(v) ? null : 'Phone must be exactly 10 digits',
        batch: v => !v || /^\d{4}$/.test(v) ? null : 'Batch must be a 4-digit year (e.g. 2023)',
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            // Skip comment lines starting with #
            const rawLines = evt.target.result.split("\n").filter(l => l.trim() && !l.trim().startsWith("#"));
            const cleanText = rawLines.join("\n");
            const { headers, rows, error } = parseCSV(cleanText);
            if (error) { setParseError(error); setBulkRows([]); return; }
            setParseError("");
            setBulkRows(rows);
            setBulkErrors([]);
            setBulkResults([]);

            // Validate each row with detailed rules
            const errs = [];
            rows.forEach(row => {
                const rowErrs = [];
                Object.entries(VALIDATORS).forEach(([field, validate]) => {
                    // Only validate fields that exist in this role's template
                    if (!CSV_TEMPLATES[activeTab].headers.includes(field)) return;
                    const msg = validate(row[field] || '');
                    if (msg) rowErrs.push(`${field}: ${msg}`);
                });
                if (rowErrs.length) errs.push(`Row ${row._rowIndex} — ${rowErrs.join(' · ')}`);
            });
            setBulkErrors(errs);
        };
        reader.readAsText(file);
    };

    const handleBulkUpload = async () => {
        if (bulkErrors.length) { toast.error("Fix validation errors before uploading"); return; }
        setBulkUploading(true);
        const results = [];
        for (const row of bulkRows) {
            try {
                const payload = buildPayload(row, activeTab);
                await createUser(payload);
                results.push({ row: row._rowIndex, name: row.name, status: "success" });
            } catch (err) {
                results.push({ row: row._rowIndex, name: row.name, status: "error", msg: err.response?.data?.error || "Failed" });
            }
        }
        setBulkResults(results);
        setBulkUploading(false);
        const ok = results.filter(r => r.status === "success").length;
        toast.success(`${ok} of ${results.length} users imported`);
        onRefresh();
    };

    // ── Active tab config ─────────────────────────────────────────────────────
    const tab = TABS.find(t => t.key === activeTab);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">

            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-bold">User Management</h2>
                        <p className="text-slate-300 text-sm mt-0.5">
                            Manage all {usersList.length} system users · Add individually or bulk import via CSV
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setIsBulkOpen(true); setBulkRows([]); setBulkResults([]); setBulkErrors([]); setParseError(""); if (fileRef.current) fileRef.current.value = ""; }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium transition-colors"
                        >
                            <Upload size={16} /> Bulk Import
                        </button>
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
                        >
                            <UserPlus size={16} /> Add {activeTab}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Role Tabs ── */}
            <div className="flex gap-2 flex-wrap">
                {TABS.map(t => {
                    const Icon = t.icon;
                    const isActive = activeTab === t.key;
                    return (
                        <button
                            key={t.key}
                            onClick={() => { setActiveTab(t.key); setSearch(""); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${isActive
                                ? `${t.activeBg} text-white border-transparent shadow-sm`
                                : `bg-white ${t.color} border-gray-100 hover:${t.bg}`
                                }`}
                        >
                            <Icon size={15} />
                            {t.label}
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-semibold ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                                }`}>
                                {tabCounts[t.key]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Table Card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3 flex-wrap">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={`Search ${tab.label.toLowerCase()}...`}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => downloadCSV(activeTab)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-colors ${tab.color} ${tab.bg} border-transparent hover:opacity-80`}
                        >
                            <Download size={14} /> Download Template
                        </button>
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
                        >
                            <UserPlus size={14} /> Add
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                {activeTab === "Student" && <>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch</th>
                                </>}
                                {(activeTab === "Teacher" || activeTab === "Coordinator") && <>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization</th>
                                </>}
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map(u => (
                                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${tab.activeBg}`}>
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-gray-600">{u.contactInfo?.email || "—"}</td>
                                    <td className="px-5 py-3.5 text-sm text-gray-600">{u.department || "—"}</td>
                                    {activeTab === "Student" && <>
                                        <td className="px-5 py-3.5 text-sm text-gray-600">{u.studentDetails?.program || "—"}</td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600">{u.studentDetails?.batch || "—"}</td>
                                    </>}
                                    {(activeTab === "Teacher" || activeTab === "Coordinator") && <>
                                        <td className="px-5 py-3.5 text-sm text-gray-600">{u.facultyDetails?.designation || "—"}</td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600">{u.facultyDetails?.specialization || "—"}</td>
                                    </>}
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive !== false ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                            {u.isActive !== false ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <button onClick={() => openEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit2 size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(u._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-5 py-12 text-center">
                                        <tab.icon size={32} className={`mx-auto mb-2 ${tab.color} opacity-30`} />
                                        <p className="text-sm text-gray-400">No {tab.label.toLowerCase()} found{search ? " for your search" : ""}.</p>
                                        <button onClick={openCreate} className={`mt-3 text-sm font-medium ${tab.color} hover:underline`}>
                                            + Add first {activeTab.toLowerCase()}
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ════════════ Single User Modal ════════════ */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">
                                {isEditMode ? "Edit" : "Add New"} {form.role}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="Full name" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                        placeholder="user@email.com" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                        placeholder="10-digit number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{isEditMode ? "New Password" : "Password *"}</label>
                                    <input type="password" required={!isEditMode} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder={isEditMode ? "Leave blank to keep" : "Min 6 chars"} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                                </div>
                            </div>

                            {/* Role — locked to active tab on create; Admin excluded on edit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                    disabled={!isEditMode}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:bg-gray-50">
                                    {TABS.map(t => <option key={t.key} value={t.key}>{t.label.slice(0, -1)}</option>)}
                                </select>
                                {!isEditMode && <p className="text-xs text-gray-400 mt-1">Role is set from the active tab. Switch tabs to add other roles.</p>}
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                                    <option value="">Select department</option>
                                    {departmentsList.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>

                            {/* Student-specific fields */}
                            {form.role === "Student" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                                        <select value={form.studentDetails.program}
                                            onChange={e => setForm({ ...form, studentDetails: { ...form.studentDetails, program: e.target.value } })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                                            <option value="">Select program</option>
                                            {programsList
                                                .filter(p => !form.department || p.department === form.department)
                                                .map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Batch (Year)</label>
                                        <input value={form.studentDetails.batch}
                                            onChange={e => setForm({ ...form, studentDetails: { ...form.studentDetails, batch: e.target.value } })}
                                            placeholder="e.g. 2023" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                                    </div>
                                </div>
                            )}

                            {/* Faculty-specific fields */}
                            {(form.role === "Teacher" || form.role === "Coordinator") && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                        <input value={form.facultyDetails.designation}
                                            onChange={e => setForm({ ...form, facultyDetails: { ...form.facultyDetails, designation: e.target.value } })}
                                            placeholder="e.g. Professor" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                        <input value={form.facultyDetails.specialization}
                                            onChange={e => setForm({ ...form, facultyDetails: { ...form.facultyDetails, specialization: e.target.value } })}
                                            placeholder="e.g. Data Science" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={saving}
                                className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : isEditMode ? "Update User" : "Create User"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════ Bulk Upload Modal ════════════ */}
            {isBulkOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <FileSpreadsheet size={18} className={tab.color} />
                                    Bulk Import {tab.label}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">Upload a CSV file matching the template format</p>
                            </div>
                            <button onClick={() => setIsBulkOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                            {/* Step 1: Download template */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Step 1 — Download Template</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Required columns: <span className="font-mono">{CSV_TEMPLATES[activeTab].headers.join(", ")}</span>
                                    </p>
                                </div>
                                <button onClick={() => downloadCSV(activeTab)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${tab.bg} ${tab.color} hover:opacity-80 transition-colors`}>
                                    <Download size={15} /> Template
                                </button>
                            </div>

                            {/* Step 2: Upload file */}
                            <div>
                                <p className="text-sm font-medium text-gray-800 mb-2">Step 2 — Upload Filled CSV</p>
                                <label className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${bulkRows.length ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}>
                                    <Upload size={24} className={bulkRows.length ? "text-green-500" : "text-gray-400"} />
                                    <span className="text-sm text-gray-600 font-medium">
                                        {bulkRows.length ? `${bulkRows.length} row(s) loaded — click to replace` : "Click to select CSV file"}
                                    </span>
                                    <span className="text-xs text-gray-400">Only .csv files are supported</span>
                                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                                </label>
                                {parseError && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={12} />{parseError}</p>}
                            </div>

                            {/* Validation errors */}
                            {bulkErrors.length > 0 && (
                                <div className="p-3 bg-red-50 rounded-xl border border-red-100 space-y-1">
                                    <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5"><AlertTriangle size={13} /> Validation Errors</p>
                                    {bulkErrors.map((e, i) => <p key={i} className="text-xs text-red-600 pl-4">{e}</p>)}
                                </div>
                            )}

                            {/* Preview table */}
                            {bulkRows.length > 0 && bulkErrors.length === 0 && bulkResults.length === 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-800 mb-2">Preview ({bulkRows.length} rows)</p>
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="w-full text-xs">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-gray-500">#</th>
                                                    {CSV_TEMPLATES[activeTab].headers.map(h => (
                                                        <th key={h} className="px-3 py-2 text-left text-gray-500 capitalize">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {bulkRows.slice(0, 10).map((row, i) => (
                                                    <tr key={i} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2 text-gray-400">{row._rowIndex}</td>
                                                        {CSV_TEMPLATES[activeTab].headers.map(h => (
                                                            <td key={h} className="px-3 py-2 text-gray-700">{row[h] || <span className="text-gray-300">—</span>}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {bulkRows.length > 10 && <p className="text-xs text-gray-400 px-3 py-2">…and {bulkRows.length - 10} more rows</p>}
                                    </div>
                                </div>
                            )}

                            {/* Upload results */}
                            {bulkResults.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-sm font-medium text-gray-800 mb-2">Import Results</p>
                                    {bulkResults.map((r, i) => (
                                        <div key={i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${r.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                            {r.status === "success" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                                            <span>Row {r.row} — <strong>{r.name}</strong>: {r.status === "success" ? "Imported successfully" : r.msg}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload button */}
                            {bulkRows.length > 0 && bulkErrors.length === 0 && (
                                <button
                                    onClick={handleBulkUpload}
                                    disabled={bulkUploading}
                                    className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {bulkUploading
                                        ? <><Loader2 size={16} className="animate-spin" /> Importing...</>
                                        : <><Upload size={16} /> Import {bulkRows.length} {tab.label}</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementView;
