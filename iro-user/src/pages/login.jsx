import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, PawPrint, ShieldCheck, ChevronLeft } from "lucide-react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [focused, setFocused] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
          ? "Incorrect email or password."
          : err.code === "auth/user-not-found"
          ? "No account found with this email."
          : err.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later."
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      // Save to Firestore if first time
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          name: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
          role: "user",
        });
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 body selection:bg-blue-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&display=swap');
        .display { font-family: 'Playfair Display', serif; }
        .body { font-family: 'DM Sans', sans-serif; }
        .glass { background: rgba(255,255,255,0.75); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.5); }
        .auth-bg { background: radial-gradient(circle at 0% 0%, rgba(59,130,246,0.1) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(14,165,233,0.1) 0%, transparent 40%); }
      `}</style>

      <div className="auth-bg min-h-screen flex flex-col items-center justify-center p-6">
        <a href="/" className="mb-8 flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-sm font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> Back to Home
        </a>

        <div className="w-full max-w-[480px]">
          <div className="glass p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-blue-100/50 border border-white relative overflow-hidden">

            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl shadow-lg shadow-blue-200 mb-6 transform -rotate-6">
                <PawPrint className="text-white w-8 h-8" />
              </div>
              <h1 className="display text-4xl font-bold text-slate-900 mb-2">Welcome Back</h1>
              <p className="text-slate-500 text-sm">Please enter your details to continue your adoption journey.</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium text-center">
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-bold text-slate-700 mb-6 disabled:opacity-60"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-semibold">or sign in with email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "email" ? "text-blue-600" : "text-slate-300"}`} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-2 transition-all outline-none text-sm ${focused === "email" ? "border-blue-600 ring-4 ring-blue-50" : "border-slate-100"}`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "pass" ? "text-blue-600" : "text-slate-300"}`} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused("pass")}
                    onBlur={() => setFocused("")}
                    className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-2 transition-all outline-none text-sm ${focused === "pass" ? "border-blue-600 ring-4 ring-blue-50" : "border-slate-100"}`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-sm shadow-xl hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : <> Sign In <ArrowRight size={16} /> </>}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account?{" "}
                <a href="/signup" className="text-blue-600 font-bold hover:underline">Create an account</a>
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Adoption Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}