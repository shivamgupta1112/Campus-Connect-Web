import { BookOpen, FileText, Clock, TrendingUp, Download, Calendar } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

const StudentDashboard = () => {
    const { user } = useAuthStore();

    const stats = [
        { label: "Enrolled Courses", value: user?.courses?.length || "6", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
        { label: "Notes Available", value: "48", icon: FileText, color: "bg-emerald-50 text-emerald-600" },
        { label: "Assignments Due", value: "3", icon: Clock, color: "bg-amber-50 text-amber-600" },
        { label: "Average Attendance", value: "85%", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    ];

    const recentNotes = [
        { title: "Operating Systems - Unit 1", course: "OS", teacher: "Prof. Verma", size: "2.4 MB", date: "Today" },
        { title: "Binary Trees & Heaps", course: "Data Structures", teacher: "Dr. Sharma", size: "1.8 MB", date: "Yesterday" },
        { title: "Computer Networks Basics", course: "Networking", teacher: "Prof. Singh", size: "3.1 MB", date: "3 days ago" },
    ];

    const schedule = [
        { time: "09:00 AM", course: "Data Structures", location: "Room 302" },
        { time: "11:00 AM", course: "Operating Systems", location: "Room 405" },
        { time: "02:00 PM", course: "DBMS Lab", location: "Lab 2" },
    ];

    return (
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Notes */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FileText size={18} className="text-blue-600" />
                            Latest Notes for You
                        </h3>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentNotes.map((note, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                        <span className="text-xs font-bold text-red-600">PDF</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{note.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {note.course} • {note.teacher} • <span className="text-gray-400">{note.size}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-400 hidden sm:inline-block">{note.date}</span>
                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar size={18} className="text-purple-600" />
                            Today's Schedule
                        </h3>
                    </div>
                    <div className="p-5">
                        <div className="space-y-6">
                            {schedule.map((item, i) => (
                                <div key={i} className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-[-20px] before:w-0.5 before:bg-gray-100 last:before:hidden">
                                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-purple-500 shadow-sm" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900">{item.course}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.time} • {item.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2.5 bg-gray-50 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
                            Full Timetable
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
