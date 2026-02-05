import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, Key, CheckCircle2 } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { toast } from 'react-hot-toast';
import InteractiveInput from "../../components/ui/InteractiveInput";
import { authApi } from "../../config/api";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing reset token");
            navigate("/login");
        }
    }, [token, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        authApi.post("/reset-password", {
            token,
            newPassword: formData.newPassword
        })
            .then(() => {
                setSuccess(true);
                toast.success("Password reset successful!");
                setTimeout(() => navigate("/login"), 3000);
            })
            .catch((error) => {
                const message = error.response?.data?.error || error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : null) || "Failed to reset password";
                toast.error(message);
                console.error("Reset password failed:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (success) {
        return (
            <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-slate-950">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10 text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Password Reset!</h2>
                        <p className="text-slate-400">
                            Your password has been successfully reset. Redirecting you to login...
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                        >
                            Click here if not redirected
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
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 mb-4 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                            <Key size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Reset Password
                        </h1>
                        <p className="text-slate-400">
                            Please enter your new password below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InteractiveInput
                            label="New Password"
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            autoComplete="new-password"
                            showToggle
                            required
                        />

                        <InteractiveInput
                            label="Confirm New Password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            autoComplete="new-password"
                            showToggle
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading || !formData.newPassword || !formData.confirmPassword}
                            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500
                            text-white font-semibold flex items-center justify-center gap-2 
                            shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]
                            active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
