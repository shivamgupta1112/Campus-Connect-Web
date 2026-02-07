import React from 'react';
import { useNavigate, Link } from 'react-router';

const Hero = () => {
    const navigate = useNavigate();
    return (
        <div className="relative h-screen min-h-[600px] flex flex-col overflow-hidden">

            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
                    alt="Students on campus"
                    className="w-full h-full object-cover"
                    onClick={() => navigate('/')}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-blue-900/70"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex-grow flex items-center justify-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg">
                        Your Campus, <span className="text-blue-500">Connected</span>
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-200 mb-10 leading-relaxed">
                        The all-in-one platform to find your tribe, ace your classes, and never miss an event on campus. Join the community of over 10,000 active students.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to={`/get-started/dashboard?token=${localStorage.getItem('campusconnect-token')}`} className='px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-2 transform hover:-translate-y-1'>
                            Get Started
                        </Link>

                        <Link to="/about" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-lg font-semibold rounded-xl backdrop-blur-sm border border-white/20 transition-all flex items-center justify-center transform hover:-translate-y-1">
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
