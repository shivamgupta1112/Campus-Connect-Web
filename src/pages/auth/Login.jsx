import { useState, useEffect } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from 'react-hot-toast';
import InteractiveInput from "../../components/ui/InteractiveInput";
import useAuthStore from "../../store/useAuthStore";
import { login } from "../../config/api";

const Login = () => {
    const navigate = useNavigate();
    const { setAuth, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

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
                    // No need to pass token in URL anymore
                    navigate(`/get-started/dashboard`);
                }
            })
            .catch((error) => {
                toast.error("Invalid credentials");
                console.error("Login failed:", error);
            })
            .finally(() => {
                setLoading(false);
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
        </div>
    );
};

export default Login;
