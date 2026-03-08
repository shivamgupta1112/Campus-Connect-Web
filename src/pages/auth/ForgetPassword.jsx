import { useState } from "react";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router";
import { toast } from 'react-hot-toast';
import InteractiveInput from "../../components/ui/InteractiveInput";
import { forgotPassword } from "../../config/api";

const ForgetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        forgotPassword(email)
            .then(() => {
                setSubmitted(true);
                toast.success("Reset link sent to your email!");
            })
            .catch((error) => {
                const message = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : null) || "Failed to send reset link";
                toast.error(message);
                console.error("Forgot password request failed:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (submitted) {
        return (
            <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-slate-950">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10 text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400">
                            <Mail size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Check your email</h2>
                        <p className="text-slate-400">
                            We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
                            Please check your inbox and follow the instructions.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                        >
                            <ArrowLeft size={18} />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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

                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                    <div className="mb-8 text-center space-y-2">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4"
                        >
                            <ArrowLeft size={14} />
                            Back to Sign In
                        </Link>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Forgot Password?
                        </h1>
                        <p className="text-slate-400">
                            No worries, we'll send you reset instructions.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InteractiveInput
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500
                            text-white font-semibold flex items-center justify-center gap-2 
                            shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]
                            active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;
