import React from 'react';
import { Calendar, ShoppingBag, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:bg-slate-900 transition-all duration-300 hover:-translate-y-1 group">
        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">
            {description}
        </p>
    </div>
);

const Features = () => {
    const features = [
        {
            icon: Calendar,
            title: "Discover Events",
            description: "From hackathons to gallery openings, discover what's happening today on campus. Never miss a moment."
        },
        {
            icon: ShoppingBag,
            title: "Trade on Marketplace",
            description: "Buy and sell textbooks, dorm furniture, or electronics within your trusted student network safely."
        },
        {
            icon: Users,
            title: "Find Your Tribe",
            description: "Join specialized clubs and study groups that match your passions and academic goals."
        }
    ];

    return (
        <section className="bg-slate-950 py-24 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                        Everything you need in <span className="relative inline-block">
                            <span className="text-blue-500 relative z-10">one place</span>
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400/80 -rotate-1 z-0"></span>
                        </span>
                    </h2>
                    <p className="text-xl text-slate-400">
                        Stay engaged with your university community through our specialized features tailored for modern student life.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>

                {/* CTA Section */}
                <div className="bg-blue-600 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Ready to dive in?
                        </h2>
                        <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                            Join thousands of students and start connecting today. Your university experience is about to get a whole lot better.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/get-started"
                                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                Join Campus Connect
                            </Link>
                            <Link
                                to="/contact"
                                className="px-8 py-4 bg-transparent border-2 border-blue-400 text-white font-bold rounded-xl hover:bg-blue-700/50 hover:border-blue-300 transition-all hover:-translate-y-1"
                            >
                                Contact Admin
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
