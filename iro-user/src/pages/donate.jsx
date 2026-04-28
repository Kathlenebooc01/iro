import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, CreditCard, Send, ShieldCheck, Copy, Check, X, PawPrint } from "lucide-react";
import { auth } from "../firebase";

// ── AUTH GATE MODAL ──────────────────────────────────────────
function AuthGateModal({ onClose, onLogin, onSignup }) {
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-10 text-center"
        style={{ animation: "modalPop 0.35s cubic-bezier(0.16,1,0.3,1) forwards" }}
      >
        <style>{`
          @keyframes modalPop { from { opacity:0; transform:scale(0.95) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
          .btn-blue-mg { background: linear-gradient(135deg,#2563eb,#0ea5e9); transition: all .25s ease; }
          .btn-blue-mg:hover { background: linear-gradient(135deg,#1d4ed8,#0284c7); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,.3); }
          .btn-ghost-mg { border: 2px solid #2563eb; color: #2563eb; background: transparent; transition: all .25s ease; cursor: pointer; }
          .btn-ghost-mg:hover { background: #2563eb; color: #fff; }
        `}</style>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <PawPrint className="w-8 h-8 text-blue-600" />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-slate-800 mb-2">
          Sign in to donate
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Please log in or create an account to access our payment details and make a donation.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onLogin} className="btn-blue-mg text-white font-bold px-6 py-4 rounded-2xl text-sm">
            Log In
          </button>
          <button onClick={onSignup} className="btn-ghost-mg font-bold px-6 py-4 rounded-2xl text-sm">
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────
export default function Donate() {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState("");
  const [showAuthGate, setShowAuthGate] = React.useState(false);

  // Use Firebase auth to check login state
  const isLoggedIn = () => !!auth.currentUser;

  const handleCopy = (text, label) => {
    if (!isLoggedIn()) {
      setShowAuthGate(true);
      return;
    }
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const paymentMethods = [
    {
      title: "Bank Transfer",
      bank: "China Bank",
      accountName: "Annalyn Aizpuru",
      accountNumber: "146800008004",
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "GCash",
      accountName: "Annalyn Aizpuru",
      accountNumber: "09270621080",
      icon: <Send className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "PayPal",
      accountName: "IRO Rescue",
      accountNumber: "irorescue@gmail.com",
      icon: <Heart className="w-6 h-6 text-rose-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 font-['DM_Sans']">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            <Heart className="w-4 h-4" /> Support Our Mission
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6 font-['Playfair_Display']">
            Make a <span className="italic text-blue-600">Difference</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Your donations directly fund food, medicine, and rehabilitation for our cats with disabilities.
          </p>
        </div>

        {/* Payment Cards */}
        <div className="grid md:grid-cols-1 gap-6 mb-12">
          {paymentMethods.map((method, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                  {method.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{method.title}</p>
                  <h3 className="text-xl font-bold text-slate-800">{method.bank || method.accountName}</h3>
                  {/* Blur account number if not logged in */}
                  <p className={`text-slate-500 font-medium transition-all ${isLoggedIn() ? "" : "blur-sm select-none"}`}>
                    {method.accountNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(method.accountNumber, method.title)}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
              >
                {copied === method.title ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === method.title ? "Copied!" : "Copy Details"}
              </button>
            </div>
          ))}
        </div>

        {/* Security Note */}
        <div className="bg-blue-600 rounded-[2rem] p-10 text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold mb-2">Secure Giving</h3>
            <p className="text-blue-100 text-sm max-w-md mx-auto leading-relaxed">
              Annalyn Aizpuru is the official founder of Ocattery (2013). All funds are used exclusively for the rehabilitation and rescue of cats with disabilities.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>

      {/* Auth Gate Modal */}
      {showAuthGate && (
        <AuthGateModal
          onClose={() => setShowAuthGate(false)}
          onLogin={() => { setShowAuthGate(false); navigate("/login"); }}
          onSignup={() => { setShowAuthGate(false); navigate("/signup"); }}
        />
      )}
    </div>
  );
}