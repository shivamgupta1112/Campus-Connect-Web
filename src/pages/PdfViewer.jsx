import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Document, Page, pdfjs } from "react-pdf";

// Required styles for react-pdf
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import {
    ChevronLeft,
    ChevronRight,
    Star,
    X,
    Save,
    ArrowLeft,
    LoaderCircle,
    PanelRightClose,
    PanelRightOpen,
    BookOpen,
    Edit3
} from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import { getDocumentAnnotations, saveDocumentAnnotation } from "../config/api";

// Configure PDF.js worker using modern syntax
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const PdfViewer = () => {
    const { noteId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const searchParams = new URLSearchParams(window.location.search);
    const fileUrl = searchParams.get("url");
    const title = searchParams.get("title") || "Document Viewer";

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Notes state mapping pageNumber to note content
    const [teacherNotes, setTeacherNotes] = useState({});
    const [myNotes, setMyNotes] = useState({});
    const [draftNote, setDraftNote] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("personal"); // "personal" or "teacher"
    const [teacherId, setTeacherId] = useState(null);

    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(null);

    const isTeacher = user && teacherId && (user.id === teacherId || user._id === teacherId);

    useEffect(() => {
        if (!user) {
            toast.error("Please login to view documents.");
            navigate("/login");
            return;
        }

        if (!fileUrl) {
            toast.error("Invalid document URL.");
            navigate("/get-started/dashboard");
            return;
        }

        fetchNotes();
    }, [user, fileUrl, noteId, navigate]);

    const fetchNotes = async () => {
        try {
            const res = await getDocumentAnnotations(noteId);
            if (res.data?.success) {
                const annotations = res.data.data;
                const backendTeacherId = res.data.teacherId;
                setTeacherId(backendTeacherId);

                const newTeacherNotes = {};
                const newMyNotes = {};

                const currentUserId = user.id || user._id;

                annotations.forEach(ann => {
                    const annUserId = ann.user._id || ann.user;
                    if (String(annUserId) === String(backendTeacherId)) {
                        newTeacherNotes[ann.pageNumber] = ann.content;
                    }
                    if (String(annUserId) === String(currentUserId)) {
                        newMyNotes[ann.pageNumber] = ann.content;
                    }
                });

                setTeacherNotes(newTeacherNotes);
                setMyNotes(newMyNotes);
            }
        } catch (error) {
            console.error("Failed to load notes", error);
            toast.error("Failed to load document notes");
        }
    };

    // Auto resize PDF to fit container width
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const width = entries[0].contentRect.width;
            // set maximum width to avoid being too large on wide screens, but pad it slightly
            setContainerWidth(width > 1200 ? 1200 : width - 32);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Sync draft note when page changes, panel toggles
    useEffect(() => {
        if (activeTab === "personal") {
            setDraftNote(myNotes[pageNumber] || "");
        } else {
            setDraftNote(teacherNotes[pageNumber] || "");
        }
    }, [pageNumber, myNotes, teacherNotes, activeTab]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleSaveNote = async () => {
        setIsSaving(true);
        try {
            const res = await saveDocumentAnnotation(noteId, {
                pageNumber,
                content: draftNote
            });

            if (res.data?.success) {
                toast.success("Notes saved for this page");
                if (isTeacher && activeTab === 'teacher') {
                    setTeacherNotes({ ...teacherNotes, [pageNumber]: draftNote });
                    setMyNotes({ ...myNotes, [pageNumber]: draftNote }); // Sync since teacher is same user
                } else if (isTeacher && activeTab === 'personal') {
                    setMyNotes({ ...myNotes, [pageNumber]: draftNote });
                    setTeacherNotes({ ...teacherNotes, [pageNumber]: draftNote });
                } else {
                    setMyNotes({ ...myNotes, [pageNumber]: draftNote });
                }
            }
        } catch (error) {
            console.error("Failed to save note", error);
            toast.error("Failed to save notes");
        } finally {
            setIsSaving(false);
        }
    };

    const changePage = (offset) => {
        setPageNumber((prevPageNumber) => {
            const newPage = prevPageNumber + offset;
            if (newPage < 1 || newPage > numPages) return prevPageNumber;
            return newPage;
        });
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    const togglePanelAndFocus = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    const hasAnyNote = teacherNotes[pageNumber] || myNotes[pageNumber];

    return (
        <div className="flex h-screen w-full bg-gray-50 flex-col overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-200 shrink-0 z-10 sticky top-0">
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <button
                        onClick={() => window.close()}
                        className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex shrink-0"
                        title="Close Tab"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-6 w-px bg-gray-200 hidden sm:block shrink-0"></div>
                    <h1 className="text-lg font-semibold text-gray-800 truncate" title={title}>
                        {title}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {hasAnyNote && (
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                            onClick={() => setIsPanelOpen(true)}
                            title="Notes attached to this page"
                        >
                            <Star size={16} className="fill-amber-500" />
                            <span className="text-sm font-medium hidden sm:inline-block">Has Notes</span>
                        </div>
                    )}

                    <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                    <button
                        onClick={togglePanelAndFocus}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${isPanelOpen
                            ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {isPanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                        <span className="text-sm font-medium hidden sm:inline-block">
                            {isPanelOpen ? "Close Notes" : "View Notes"}
                        </span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden relative bg-gray-100/80">
                {/* PDF Document Container */}
                <div className="flex-1 overflow-auto relative transition-all duration-300 flex flex-col items-center pt-8 pb-32 bg-[#e5e7eb]/60" ref={containerRef}>
                    <div className="relative shadow-xl ring-1 ring-black/5 bg-white rounded-md mb-8 inline-block min-h-[500px]">
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex flex-col items-center justify-center p-12 text-gray-500 gap-3 pb-32 min-w-[500px]">
                                    <LoaderCircle className="animate-spin text-blue-600" size={32} />
                                    <p className="font-medium animate-pulse">Loading Document...</p>
                                </div>
                            }
                            error={
                                <div className="flex flex-col items-center justify-center p-12 text-red-500 gap-3 min-w-[500px]">
                                    <p className="font-medium">Failed to load PDF file.</p>
                                    <p className="text-sm text-gray-500">The file might be corrupted or inaccessible.</p>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                width={containerWidth > 900 ? 900 : containerWidth}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                loading={
                                    <div className="flex items-center justify-center p-24 min-w-[500px] min-h-[700px]">
                                        <LoaderCircle className="animate-spin text-blue-400" size={24} />
                                    </div>
                                }
                                className="pdf-page"
                            />
                        </Document>

                        {/* Visual Indicator on Document for Notes */}
                        {!isPanelOpen && hasAnyNote && (
                            <div
                                className="absolute top-4 right-4 z-20 cursor-pointer animate-bounce rounded-full bg-white p-2 shadow-lg ring-1 ring-amber-200"
                                onClick={() => setIsPanelOpen(true)}
                                title="Click to view notes for this page"
                            >
                                <Star className="text-amber-500 fill-amber-500" size={24} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Panel for Notes */}
                {isPanelOpen && (
                    <aside className="w-96 bg-white border-l border-gray-200 shadow-[-8px_0_24px_rgba(0,0,0,0.02)] shrink-0 flex flex-col z-10 w-96 flex-shrink-0">
                        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <BookOpen size={18} className="text-blue-600" />
                                Page {pageNumber} Notes
                            </h2>
                            <button
                                onClick={() => setIsPanelOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tabs */}
                        {!isTeacher && (
                            <div className="flex border-b border-gray-100 bg-white px-2 pt-2">
                                <button
                                    onClick={() => setActiveTab('personal')}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal' ? 'border-amber-500 text-amber-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    <Edit3 size={16} />
                                    My Notes
                                </button>
                                <button
                                    onClick={() => setActiveTab('teacher')}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'teacher' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    <Star size={16} />
                                    Teacher's Notes
                                    {teacherNotes[pageNumber] && <span className="w-2 h-2 rounded-full bg-blue-500 ml-1"></span>}
                                </button>
                            </div>
                        )}

                        <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
                            {(!isTeacher && activeTab === 'teacher') ? (
                                <div className="space-y-3 h-full flex flex-col">
                                    <div className="text-sm text-gray-500 font-medium">
                                        Notes provided by the teacher for this page. Reference only.
                                    </div>
                                    <div className="flex-1 w-full bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-gray-800 font-medium leading-relaxed overflow-y-auto">
                                        {teacherNotes[pageNumber] ? (
                                            <p className="whitespace-pre-wrap">{teacherNotes[pageNumber]}</p>
                                        ) : (
                                            <p className="text-gray-400 italic text-center mt-10">No teacher notes for this page.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-sm text-gray-500 font-medium">
                                        {isTeacher ? "Add notes for your students. These will be visible to everyone." : "Add your personal notes for this page. Only visible to you."}
                                    </div>
                                    <textarea
                                        value={draftNote}
                                        onChange={(e) => setDraftNote(e.target.value)}
                                        placeholder="Type your notes here..."
                                        className="flex-1 w-full bg-yellow-50/30 border border-yellow-200/60 rounded-xl p-4 text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium leading-relaxed shadow-inner"
                                    />
                                </>
                            )}
                        </div>

                        {(!(!isTeacher && activeTab === 'teacher')) && (
                            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                                <button
                                    disabled={isSaving}
                                    onClick={handleSaveNote}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:hover:bg-blue-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow active:scale-95"
                                >
                                    {isSaving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
                                    {isSaving ? "Saving..." : "Save Notes in Cloud"}
                                </button>
                            </div>
                        )}
                    </aside>
                )}
            </main>

            {/* Floating Toolbar (Bottom Centered) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-20 ring-1 ring-white/10">
                <button
                    disabled={pageNumber <= 1}
                    onClick={previousPage}
                    className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                    title="Previous Page"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="flex items-center gap-2 font-medium">
                    <span className="text-white/60">Page</span>
                    <span className="w-10 text-center font-bold">{pageNumber}</span>
                    <span className="text-white/60">of</span>
                    <span className="text-white/80">{numPages || "--"}</span>
                </div>

                <button
                    disabled={pageNumber >= numPages}
                    onClick={nextPage}
                    className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                    title="Next Page"
                >
                    <ChevronRight size={24} />
                </button>

                <div className="w-px h-6 bg-white/20 mx-2"></div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
                        className="text-white/60 hover:text-white transition-colors cursor-pointer"
                        title="Zoom Out"
                    >
                        <span className="text-xl leading-none font-bold">-</span>
                    </button>
                    <span className="text-sm font-medium w-12 text-center text-white/80">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => setScale(s => Math.min(3.0, s + 0.2))}
                        className="text-white/60 hover:text-white transition-colors cursor-pointer"
                        title="Zoom In"
                    >
                        <span className="text-xl leading-none font-bold">+</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PdfViewer;
