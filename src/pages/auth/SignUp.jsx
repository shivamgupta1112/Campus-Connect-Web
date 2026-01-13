import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { toast } from 'react-hot-toast';
import InteractiveInput from "../../components/ui/InteractiveInput";
import { authApi } from "../../config/api";

const SignUp = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        consent: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error("Please fill in all fields");
            setLoading(false);
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }
        if (!formData.consent) {
            toast.error("You must agree to the Terms and Privacy Policy");
            setLoading(false);
            return;
        }
        authApi.post("/register", formData)
            .then((response) => {
                toast.success("Account created successfully!");
                localStorage.setItem('campusconnect-token', response.data.token);
                navigate('/get-started');
            })
            .catch((error) => {
                toast.error("Failed to create account");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center py-8 px-4 overflow-hidden bg-slate-950">
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
                            Create Account
                        </h1>
                        <p className="text-slate-400">
                            Join the community and start your journey
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-2">
                        <InteractiveInput
                            label="Full Name"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            autoComplete="name"
                        />

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
                            autoComplete="new-password"
                            showToggle
                        />

                        <InteractiveInput
                            label="Confirm Password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            autoComplete="new-password"
                            showToggle
                        />

                        <div className="flex items-start gap-2 text-xs text-slate-500 px-1">
                            <input
                                type="checkbox"
                                id="consent"
                                checked={formData.consent}
                                onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                                className="mt-0.5 rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-offset-slate-900 focus:ring-indigo-500"
                            />
                            <label htmlFor="consent" className="cursor-pointer select-none">
                                I agree to the <Link to="/terms" className="text-indigo-400 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>
                            </label>
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
                                    Create Account
                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-400 text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="text-white hover:text-indigo-400 font-medium transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
