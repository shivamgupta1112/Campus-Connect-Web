import { useState, useEffect } from "react";
import { Loader2, ArrowRight, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from 'react-hot-toast';
import InteractiveInput from "../../components/ui/InteractiveInput";
import useAuthStore from "../../store/useAuthStore";
import { login, verifyEmail } from "../../config/api";

const Login = () => {
    const navigate = useNavigate();
    const { setAuth, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    // OTP Verification State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/get-started/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        login(formData)
            .then((response) => {
                if (response.data && response.data.token) {
                    const { token, user, role } = response.data;
                    const userData = user ? { ...user, role: role || user.role } : null;

                    setAuth(userData, token);

                    toast.success("Welcome back! Redirecting...");
                    navigate(`/get-started/dashboard`);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 403 && error.response.data?.isVerified === false) {
                    toast.error("Please verify your email to continue.");
                    setShowOtpModal(true);
                } else {
                    toast.error(error.response?.data?.error || "Invalid credentials");
                    console.error("Login failed:", error);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        setOtpLoading(true);

        verifyEmail({ email: formData.email, otp })
            .then((response) => {
                if (response.data && response.data.success) {
                    toast.success("Email verified successfully! Logging you in...");

                    // Auto-login after successful verification if token is provided
                    if (response.data.token) {
                        const { token, user, role } = response.data;
                        const userData = user ? { ...user, role: role || user.role } : null;
                        setAuth(userData, token);
                        navigate(`/get-started/dashboard`);
                    } else {
                        // Fallback if no token provided immediately (though backend sends it)
                        setShowOtpModal(false);
                        handleSubmit(new Event('submit')); // Retry login
                    }
                }
            })
            .catch((error) => {
                toast.error(error.response?.data?.error || "Verification failed");
            })
            .finally(() => {
                setOtpLoading(false);
            });
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-slate-950">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10 perspective-1000">
                <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10 overflow-hidden group">

                    {/* Top decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                    <div className="mb-8 text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 mb-4 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                            <ArrowRight size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-slate-400">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-2">
                        <InteractiveInput
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            autoComplete="email"
                        />

                        <InteractiveInput
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            autoComplete="current-password"
                            showToggle
                        />

                        <div className="flex items-center justify-between text-sm pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-indigo-400 transition-colors">
                                <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-offset-slate-900" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-all">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500
                            text-white font-semibold flex items-center justify-center gap-2 
                            shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]
                            active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* OTP Verification Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowOtpModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" /><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Verify Your Email</h3>
                            <p className="text-sm text-slate-400">
                                We've sent a verification code to <br />
                                <span className="text-white font-medium">{formData.email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Enter OTP Code
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="e.g. 123456"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-center tracking-widest text-lg"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={otpLoading}
                                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Verify Email"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
