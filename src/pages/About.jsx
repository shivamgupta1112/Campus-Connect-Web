import React from "react";
import { Link } from "react-router";
import { Users, BookOpen, Star, Globe, Heart, Zap, ArrowRight, GraduationCap, Award, TrendingUp } from "lucide-react";
import Footer from "../components/Footer";

/* ──── Reusable pieces ──── */

const StatCard = ({ value, label, icon: Icon }) => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-slate-900 hover:-translate-y-1 transition-all duration-300">
        <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
            <Icon size={28} />
        </div>
        <p className="text-4xl font-extrabold text-white mb-2">{value}</p>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
    </div>
);

const ValueCard = ({ icon: Icon, title, description, color }) => (
    <div className="group bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:bg-slate-900 hover:-translate-y-1 transition-all duration-300">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${color}`}>
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
);

const TeamCard = ({ name, role, emoji }) => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center hover:bg-slate-900 hover:-translate-y-1 transition-all duration-300 group">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl border border-slate-700 group-hover:border-blue-500/50 transition-all duration-300">
            {emoji}
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
        <p className="text-blue-400 text-sm font-medium">{role}</p>
    </div>
);

/* ──── Page ──── */

const About = () => {
    const stats = [
        { value: "10K+", label: "Active Students", icon: Users },
        { value: "150+", label: "Clubs & Societies", icon: BookOpen },
        { value: "4.9★", label: "Average Rating", icon: Star },
        { value: "30+", label: "Universities", icon: Globe },
    ];

    const values = [
        {
            icon: Heart,
            title: "Community First",
            description: "We believe every student deserves a vibrant and inclusive community. Everything we build puts people and connections at the center.",
            color: "bg-pink-600/20 text-pink-400 group-hover:bg-pink-600 group-hover:text-white",
        },
        {
            icon: Zap,
            title: "Simplicity & Speed",
            description: "University life is already complex. We strip away the noise and give you a fast, intuitive experience that gets out of your way.",
            color: "bg-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white",
        },
        {
            icon: GraduationCap,
            title: "Academic Excellence",
            description: "From study groups to resource sharing, we amplify your academic journey and connect you with peers who push you to be better.",
            color: "bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white",
        },
        {
            icon: Award,
            title: "Trust & Safety",
            description: "Your data and identity are protected. Our platform is verified, moderated, and built exclusively for your university community.",
            color: "bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white",
        },
        {
            icon: TrendingUp,
            title: "Constant Growth",
            description: "We iterate rapidly based on student feedback. New features ship every week because we listen to you, not boardrooms.",
            color: "bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white",
        },
        {
            icon: Globe,
            title: "Built to Scale",
            description: "From a single campus to a nationwide network, Campus Connect is engineered to grow with your institution.",
            color: "bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white",
        },
    ];

    const team = [
        { name: "Aiden Park", role: "Co-founder & CEO", emoji: "👨‍💼" },
        { name: "Priya Mehta", role: "Head of Product", emoji: "👩‍💻" },
        { name: "Carlos Ruiz", role: "Lead Engineer", emoji: "🧑‍🔧" },
        { name: "Sofia Andersen", role: "Head of Design", emoji: "👩‍🎨" },
    ];

    return (
        <div className="bg-slate-950 min-h-screen">

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <section className="relative pt-40 pb-24 overflow-hidden">
                {/* ambient blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-semibold px-5 py-2 rounded-full mb-8">
                        🎓 Our Story
                    </span>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
                        Built by students,{" "}
                        <span className="relative inline-block">
                            <span className="text-blue-500 relative z-10">for students</span>
                            <span className="absolute bottom-1 left-0 w-full h-1.5 bg-yellow-400/80 -rotate-1 z-0 rounded-full" />
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed mb-12">
                        Campus Connect was born out of frustration — scattered group chats, missed events,
                        and textbooks bought at three times the price. We decided to fix it.
                    </p>

                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1"
                    >
                        Get in Touch <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* ── Stats ─────────────────────────────────────────────────────── */}
            <section className="py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((s) => (
                            <StatCard key={s.label} {...s} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Mission ───────────────────────────────────────────────────── */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Text */}
                        <div>
                            <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4 block">Our Mission</span>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
                                Making campus life <span className="text-blue-500">effortlessly social</span>
                            </h2>
                            <div className="space-y-6 text-slate-400 leading-relaxed">
                                <p>
                                    We envision a world where every student walks onto campus feeling connected — where discovering a study buddy,
                                    selling last semester's textbook, or finding out about tomorrow's hackathon takes seconds, not hours.
                                </p>
                                <p>
                                    Campus Connect is more than an app. It's an ecosystem designed around the rhythm of student life,
                                    from orientation day to graduation.
                                </p>
                            </div>
                        </div>

                        {/* Visual card */}
                        {/* <div className="relative">
                            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-slate-800 rounded-3xl p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
                                <div className="relative z-10 space-y-6">
                                    {[
                                        { label: "Students helped", pct: "92%", color: "bg-blue-500" },
                                        { label: "Events discovered", pct: "87%", color: "bg-purple-500" },
                                        { label: "Cost savings on books", pct: "76%", color: "bg-yellow-400" },
                                    ].map(({ label, pct, color }) => (
                                        <div key={label}>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-slate-300 font-medium">{label}</span>
                                                <span className="text-white font-bold">{pct}</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${color}`}
                                                    style={{ width: pct }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </section>

            {/* ── Values ────────────────────────────────────────────────────── */}
            <section className="py-24 bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4 block">What We Stand For</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            Our core <span className="text-blue-500">values</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((v) => (
                            <ValueCard key={v.title} {...v} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Team ──────────────────────────────────────────────────────── */}
            {/* <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4 block">The People</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            Meet the <span className="text-blue-500">team</span>
                        </h2>
                        <p className="mt-6 text-slate-400 text-xl">
                            A small, passionate crew of ex-students who lived the problem firsthand.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((t) => (
                            <TeamCard key={t.name} {...t} />
                        ))}
                    </div>
                </div>
            </section> */}

            {/* ── CTA ───────────────────────────────────────────────────────── */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto bg-blue-600 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to join the movement?</h2>
                        <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                            Thousands of students are already connecting, learning, and thriving. Be part of something bigger.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/get-started/dashboard" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                Get Started Free
                            </Link>
                            <Link to="/contact" className="px-8 py-4 bg-transparent border-2 border-blue-400 text-white font-bold rounded-xl hover:bg-blue-700/50 hover:border-blue-300 transition-all hover:-translate-y-1">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
