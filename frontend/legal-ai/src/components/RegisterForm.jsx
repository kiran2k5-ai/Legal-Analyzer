import { useState, useContext } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Scale } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";

function RegisterForm() {
  const { loginUser, registerUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          throw new Error("Please fill in all fields.");
        }
        await loginUser(email, password);
      } else {
        if (!fullName || !email || !password) {
          throw new Error("Please fill in all required fields.");
        }
        if (password.length < 12) {
          throw new Error("Password must be at least 12 characters long.");
        }
        await registerUser(fullName, email, password);
      }
      navigate("/chatpage");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#030712] p-8 md:p-16 text-white flex flex-col justify-center relative overflow-hidden">
      
      {/* Decorative Blur Blobs behind form */}
      <div className="absolute top-1/4 right-0 h-64 w-64 rounded-full bg-blue-600/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-10 h-72 w-72 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[390px] mx-auto space-y-8">
        
        {/* Logo (Shown only on Mobile) */}
        <div className="flex flex-col items-center justify-center text-center">
          <Link to="/" className="flex md:hidden items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-300">
              <Scale size={20} className="text-slate-950" />
            </div>
          </Link>

          <h2 className="font-serif text-3xl font-bold tracking-tight text-white mt-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {isLogin
              ? "Sign in to access your document workspaces"
              : "Set up credentials to start analyzing documents"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400 leading-relaxed">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Only on signup) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Smith"
                  required={!isLogin}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950/40 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:border-yellow-500 focus:bg-slate-950/80 focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
                className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950/40 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:border-yellow-500 focus:bg-slate-950/80 focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                required
                className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950/40 pl-10 pr-10 text-sm text-white placeholder-slate-600 outline-none transition focus:border-yellow-500 focus:bg-slate-950/80 focus:ring-1 focus:ring-yellow-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-[10px] text-slate-500 leading-tight">
                Must contain at least 12 characters.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 text-sm font-semibold uppercase tracking-wider text-slate-950 transition hover:from-yellow-400 hover:to-amber-300 disabled:opacity-50 cursor-pointer mt-6 shadow-lg shadow-yellow-500/10"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

        </form>

        {/* Toggle Option */}
        <p className="text-center text-xs text-slate-400">
          {isLogin ? "New to LegalAI?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="ml-1.5 font-bold text-yellow-500 hover:text-yellow-400 cursor-pointer focus:outline-none"
          >
            {isLogin ? "Sign Up Free" : "Sign In"}
          </button>
        </p>

        {/* Footer Info */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 border-t pt-5 border-slate-800/60">
          <a href="#terms" className="hover:text-slate-400">Terms</a>
          <span>•</span>
          <a href="#privacy" className="hover:text-slate-400">Privacy</a>
          <span>•</span>
          <a href="#support" className="hover:text-slate-400">Support</a>
        </div>

      </div>
    </div>
  );
}

export default RegisterForm;