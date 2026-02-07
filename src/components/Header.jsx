import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router";

const Header = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <header
                className={`fixed z-50 transition-all duration-500 ease-in-out border-b border-white/10 ${isScrolled
                    ? "top-4 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] md:max-w-5xl rounded-2xl bg-slate-900/90 backdrop-blur-xl shadow-2xl border-white/10"
                    : "top-0 left-0 w-full bg-transparent border-transparent"
                    }`}
            >
                <div className={`mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 ${isScrolled ? "h-16" : "h-20"}`}>
                    <div className="flex justify-between items-center h-full">
                        {/* Logo Section */}
                        <div className="flex-shrink-0 flex items-center cursor-pointer gap-2">
                            <img src="/logo.png" onClick={() => navigate('/')} alt="Campus Connect Logo" className={`object-contain transition-all duration-500 brightness-0 invert ${isScrolled ? "h-32" : "h-40"}`} />
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {['Home', 'About', 'Contact University'].map((item) => (
                                <Link
                                    key={item}
                                    to={item === 'Home' ? '/' : `/${item.split(' ')[0].toLowerCase()}`}
                                    onClick={() => navigate(item === 'Home' ? '/' : `/${item.toLowerCase()}`)}
                                    className="px-4 py-2 text-sm font-medium text-white hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                                >
                                    {item}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Side Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                to={`/get-started/dashboard?token=${localStorage.getItem('campusconnect-token')}`}
                                className={`
                                    px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-blue-600/30 active:scale-95
                                    ${isScrolled
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-blue-600 text-white hover:bg-blue-700"}
                                `}
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 w-full p-4 md:hidden">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2">
                            <nav className="flex flex-col p-2">
                                {['Home', 'About', 'Contact University'].map((item) => (
                                    <Link
                                        key={item}
                                        to={item === 'Home' ? '/' : `/${item.split(' ')[0].toLowerCase()}`}
                                        className="text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item}
                                    </Link>
                                ))}
                                <div className="h-px bg-gray-100 my-2 mx-2"></div>
                                <Link
                                    to={`/get-started/dashboard?token=${localStorage.getItem('campusconnect-token')}`}
                                    className="bg-blue-600 text-white text-center py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 active:scale-95 mx-2 mb-2"
                                >
                                    Get Started
                                </Link>
                            </nav>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;
