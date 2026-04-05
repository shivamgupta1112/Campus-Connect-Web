import React, { useState } from "react";
import { Link } from "react-router";
import { Mail, MapPin, Phone, Send, MessageSquare, Clock, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import Footer from "../components/Footer";

/* ──── Reusable pieces ──── */

const ContactInfoCard = ({ icon: Icon, title, lines, color }) => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:bg-slate-900 hover:-translate-y-1 transition-all duration-300 group">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${color}`}>
            <Icon size={26} />
        </div>
        <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
        {lines.map((l, i) => (
            <p key={i} className="text-slate-400 text-sm leading-relaxed">{l}</p>
        ))}
    </div>
);  

const FAQ = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <div
            className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500/40 transition-all duration-300"
            onClick={() => setOpen(!open)}
        >
            <div className="flex justify-between items-center px-7 py-5">
                <span className="text-white font-semibold">{question}</span>
                {open
                    ? <ChevronUp size={20} className="text-blue-400 shrink-0" />
                    : <ChevronDown size={20} className="text-slate-500 shrink-0" />}
            </div>
            {open && (
                <div className="px-7 pb-5 text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
                    {answer}
                </div>
            )}
        </div>
    );
};

/* ──── Page ──── */

const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate send
        setTimeout(() => {
            setLoading(false);
            setSent(true);
        }, 1500);
    };

    const contactCards = [
        {
            icon: Mail,
            title: "Email Us",
            lines: ["hello@campusconnect.com", "support@campusconnect.com"],
            color: "bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white",
        },
        {
            icon: Phone,
            title: "Call Us",
            lines: ["+1 (555) 123-4567", "Mon – Fri, 9 AM – 6 PM PST"],
            color: "bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white",
        },
        {
            icon: MapPin,
            title: "Visit Us",
            lines: ["123 University Ave", "Innovation District, CA 90210"],
            color: "bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white",
        },
        {
            icon: Clock,
            title: "Office Hours",
            lines: ["Monday – Friday: 9 AM – 6 PM", "Saturday: 10 AM – 2 PM"],
            color: "bg-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white",
        },
    ];

    const faqs = [
        {
            question: "Is Campus Connect free for students?",
            answer: "Yes! Campus Connect is completely free for all verified students. Premium institutional plans are available for universities that want extended analytics and admin tools.",
        },
        {
            question: "How do I verify my student status?",
            answer: "You verify using your official university email address (.edu or institution domain). Once you sign up, a verification link is sent to that email — takes less than a minute.",
        },
        {
            question: "Can I use Campus Connect across multiple universities?",
            answer: "Each Campus Connect account is linked to one verified institution. However, we support inter-university events and open communities for wider collaboration.",
        },
        {
            question: "How do I report a problem or a user?",
            answer: "Every profile and post has a report button. Our moderation team reviews reports within 24 hours. For urgent issues, please email support@campusconnect.com directly.",
        },
        {
            question: "How do I get my university onboarded?",
            answer: "Fill in the contact form on this page and select 'University Partnership' as the subject. Our partnerships team will reach out within 2 business days.",
        },
    ];

    const subjects = [
        "General Inquiry",
        "Technical Support",
        "University Partnership",
        "Press & Media",
        "Bug Report",
        "Other",
    ];

    return (
        <div className="bg-slate-950 min-h-screen">

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <section className="relative pt-40 pb-24 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-16 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-semibold px-5 py-2 rounded-full mb-8">
                        <MessageSquare size={16} /> Get In Touch
                    </span>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
                        We're always{" "}
                        <span className="relative inline-block">
                            <span className="text-blue-500 relative z-10">here to help</span>
                            <span className="absolute bottom-1 left-0 w-full h-1.5 bg-yellow-400/80 -rotate-1 z-0 rounded-full" />
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed">
                        Have a question, a partnership proposal, or just want to say hello?
                        Drop us a message and our team will get back to you promptly.
                    </p>
                </div>
            </section>

            {/* ── Contact Cards ─────────────────────────────────────────────── */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {contactCards.map((c) => (
                            <ContactInfoCard key={c.title} {...c} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Form + Map ────────────────────────────────────────────────── */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-5 gap-12 items-start">

                        {/* Form */}
                        <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12">
                            {sent ? (
                                <div className="flex flex-col items-center justify-center text-center h-full py-16">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle size={40} className="text-green-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-4">Message Sent!</h2>
                                    <p className="text-slate-400 max-w-sm mb-8">
                                        Thanks for reaching out. We'll get back to you within one business day.
                                    </p>
                                    <button
                                        onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
                                    >
                                        Send Another
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-extrabold text-white mb-2">Send us a message</h2>
                                    <p className="text-slate-400 mb-10">Fill in the details below and we'll respond within 24 hours.</p>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            {/* Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="name">Full Name</label>
                                                <input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    required
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    placeholder="John Doe"
                                                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 px-4 py-3 rounded-xl outline-none transition-colors"
                                                />
                                            </div>
                                            {/* Email */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="email">Email Address</label>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    placeholder="john@university.edu"
                                                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 px-4 py-3 rounded-xl outline-none transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Subject */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="subject">Subject</label>
                                            <select
                                                id="subject"
                                                name="subject"
                                                required
                                                value={form.subject}
                                                onChange={handleChange}
                                                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white px-4 py-3 rounded-xl outline-none transition-colors appearance-none"
                                            >
                                                <option value="" disabled>Select a subject…</option>
                                                {subjects.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="message">Message</label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                required
                                                rows={6}
                                                value={form.message}
                                                onChange={handleChange}
                                                placeholder="Tell us how we can help…"
                                                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 px-4 py-3 rounded-xl outline-none transition-colors resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:scale-95"
                                        >
                                            {loading ? (
                                                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Send size={18} />
                                            )}
                                            {loading ? "Sending…" : "Send Message"}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>

                        {/* Right-side info */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Map placeholder */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden h-64 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-slate-900/50" />
                                <div className="relative z-10 text-center">
                                    <MapPin size={36} className="text-blue-400 mx-auto mb-3" />
                                    <p className="text-white font-semibold">123 University Ave</p>
                                    <p className="text-slate-400 text-sm">Innovation District, CA 90210</p>
                                </div>
                                {/* Grid lines decoration */}
                                <div className="absolute inset-0 opacity-10" style={{
                                    backgroundImage: "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
                                    backgroundSize: "40px 40px"
                                }} />
                            </div>

                            {/* Response time */}
                            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/20 rounded-3xl p-8">
                                <h3 className="text-white font-bold text-lg mb-6">What to expect</h3>
                                <ul className="space-y-4">
                                    {[
                                        { emoji: "📬", text: "Response within 24 hours" },
                                        { emoji: "🔐", text: "Your info stays private" },
                                        { emoji: "🤝", text: "Partnership calls booked fast" },
                                        { emoji: "🛠️", text: "Bugs triaged same day" },
                                    ].map(({ emoji, text }) => (
                                        <li key={text} className="flex items-center gap-4 text-slate-300">
                                            <span className="text-xl">{emoji}</span>
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ───────────────────────────────────────────────────────── */}
            <section className="py-24 bg-slate-900/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4 block">Support</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            Frequently asked <span className="text-blue-500">questions</span>
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((f) => (
                            <FAQ key={f.question} {...f} />
                        ))}
                    </div>
                    <p className="text-center text-slate-500 mt-12">
                        Still have questions?{" "}
                        <Link to="/contact" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                            Email our support team →
                        </Link>
                    </p>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────────────── */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto bg-blue-600 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Still exploring?</h2>
                        <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                            Learn more about what Campus Connect has to offer and how it can transform your university experience.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/about" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                About Us
                            </Link>
                            <Link to="/get-started/dashboard" className="px-8 py-4 bg-transparent border-2 border-blue-400 text-white font-bold rounded-xl hover:bg-blue-700/50 hover:border-blue-300 transition-all hover:-translate-y-1">
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
