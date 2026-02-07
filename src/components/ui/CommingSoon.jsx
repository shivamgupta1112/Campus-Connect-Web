import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Rocket, Construction, Sparkles } from 'lucide-react';

const CommingSoon = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center border border-white/50">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100/50 text-gray-600 transition-all group"
                    aria-label="Go back"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Main Content */}
                <div className="flex flex-col items-center gap-6 mt-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full"></div>
                        <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-6 rounded-2xl shadow-xl transform rotate-3 hover:rotate-6 transition-transform duration-300 relative z-10">
                            <Rocket size={48} className="text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-lg animate-bounce">
                            <Sparkles size={16} className="text-white" />
                        </div>
                    </div>

                    <div className="space-y-4 max-w-lg">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                            Coming Soon
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl font-medium">
                            The future is under construction.
                        </p>
                        <p className="text-gray-500 leading-relaxed">
                            We're crafting something amazing for you. This feature is currently in development and will be available shortly. Stay tuned!
                        </p>
                    </div>

                    <div className="pt-6 w-full max-w-xs">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Go Back
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Text */}
            <p className="absolute bottom-8 text-gray-400 text-sm font-medium">
                Campus Connect &copy; {new Date().getFullYear()}
            </p>
        </div>
    );
};

export default CommingSoon;
