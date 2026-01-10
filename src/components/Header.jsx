import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 h-20 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">
                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer">
                        <img src="/logo.png" alt="Campus Connect Logo" className="h-40 w-auto object-contain -my-10" />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {['Home', 'About', 'Contact'].map((item) => (
                            <Link
                                key={item}
                                to="#"
                                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Sign In
                        </Link>
                        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-600 p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-4 shadow-lg animate-in slide-in-from-top-2">
                    <nav className="flex flex-col space-y-4">
                        {['Home', 'About', 'Contact'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-base font-medium text-gray-600 hover:text-blue-600 py-2 block"
                            >
                                {item}
                            </a>
                        ))}
                        <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                            <a href="#" className="text-center text-sm font-medium text-gray-600 hover:text-gray-900 py-2">
                                Sign In
                            </a>
                            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold w-full">
                                Get Started
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
