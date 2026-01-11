import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router';

const Footer = () => {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="flex flex-col gap-6 max-w-sm">
                        <Link to="/" className="inline-block">
                            <img
                                src="/logo.png"
                                alt="Campus Connect"
                                className="object-contain brightness-0 invert h-36 w-auto -my-12" />
                        </Link>

                        <p className="text-slate-400 leading-relaxed">
                            The all-in-one platform to find your tribe, ace your classes,
                            and never miss an event on campus.
                        </p>

                        <div className="flex gap-4 mt-2">
                            <SocialLink icon={Twitter} href="#" />
                            <SocialLink icon={Instagram} href="#" />
                            <SocialLink icon={Linkedin} href="#" />
                            <SocialLink icon={Facebook} href="#" />
                        </div>
                    </div>


                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <FooterLink to="/" label="Home" />
                            <FooterLink to="/about" label="About Us" />
                            <FooterLink to="/features" label="Features" />
                            <FooterLink to="/pricing" label="Pricing" />
                            <FooterLink to="/contact" label="Contact" />
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <FooterLink to="/blog" label="Blog" />
                            <FooterLink to="/events" label="Events Calendar" />
                            <FooterLink to="/marketplace" label="Marketplace" />
                            <FooterLink to="/help" label="Help Center" />
                            <FooterLink to="/privacy" label="Privacy Policy" />
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Get in Touch</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-1 text-blue-500 shrink-0" size={20} />
                                <span>123 University Ave,<br />Innovation District, CA 90210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-blue-500 shrink-0" size={20} />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-blue-500 shrink-0" size={20} />
                                <span>hello@campusconnect.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Campus Connect. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialLink = ({ icon: Icon, href }) => (
    <a
        href={href}
        className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
    >
        <Icon size={18} />
    </a>
);

const FooterLink = ({ to, label }) => (
    <li>
        <Link
            to={to}
            className="text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-2 group"
        >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            {label}
        </Link>
    </li>
);

export default Footer;
