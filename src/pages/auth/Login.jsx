import { useState, useEffect } from "react";
import { Loader2, ArrowRight, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import InteractiveInput from "../../components/ui/InteractiveInput";
import useAuthStore from "../../store/useAuthStore";
import { login, verifyEmail } from "../../config/api";

const Login = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student", // default role based on image
  });

  // OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/get-started/dashboard", { replace: true });
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
        if (
          error.response &&
          error.response.status === 403 &&
          error.response.data?.isVerified === false
        ) {
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
            handleSubmit(new Event("submit")); // Retry login
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

  const roles = ["Admin", "Coordinator", "Teacher", "Student"];

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left Panel: Information & Branding */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center relative overflow-hidden" style={{
        background: 'linear-gradient(160deg, #0f2540 0%, #1a3a5c 40%, #5a4a2f 75%, #8c7a45 100%)'
      }}>
        <div className="relative z-10 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <svg className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
            </svg>
            <span className="text-3xl font-bold text-white tracking-tight">
              Campus Connect
            </span>
          </div>

          <h1 className="text-[2.5rem] font-bold text-white mb-6 leading-tight">
            Your Academic Hub, One Login Away
          </h1>

          <p className="text-white/60 text-base leading-relaxed italic">
            Access course materials, manage departments, track student progress, and collaborate — all from one secure portal.
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white relative">
        <div className="w-full max-w-md mx-auto">
          {/* Back to Home Link */}
          <div className="absolute top-8 left-8 sm:left-16 lg:left-24">
            <Link
              to="/"
              className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowRight size={16} className="mr-2 rotate-180" />
              Back to home
            </Link>
          </div>

          <div className="mt-16 mb-10">
            <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-2">
              Sign In
            </h2>
            <p className="text-slate-500 text-sm">
              Select your role and enter your credentials.
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFormData({ ...formData, role: r })}
                className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${formData.role === r
                  ? "bg-blue-50 border-blue-200 border-2 text-blue-700 shadow-sm"
                  : "bg-white border-gray-200 border-2 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@college.edu"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm tracking-[0.2em]"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-blue-600/30 flex items-center justify-center disabled:opacity-70 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                `Sign In as ${formData.role}`
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-400">
                Demo mode — click Sign In with any credentials.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* OTP Verification Modal (Keeping logical structure but adapting style slightly) */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
                  <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h3>
              <p className="text-sm text-gray-500">
                We've sent a verification code to <br />
                <span className="text-gray-900 font-medium">
                  {formData.email}
                </span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-center tracking-widest text-lg"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg hover:shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                {otpLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
