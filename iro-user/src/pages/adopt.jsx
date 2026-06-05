import { useState, useEffect, useRef, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  PawPrint, Heart, Star, Activity, Eye, Volume2,
  ChevronRight, ArrowRight, X, CheckCircle2,
  ClipboardList, Home, Phone, Stethoscope,
  ShieldCheck, Sparkles, Search, SlidersHorizontal,
  Clock, FileText, HandHeart, Users, MapPin
} from "lucide-react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// Map a condition string to a lucide icon
function getConditionIcon(condition = "") {
  const c = condition.toLowerCase();
  if (c.includes("eye") || c.includes("blind")) return Eye;
  if (c.includes("deaf") || c.includes("hear")) return Volume2;
  if (c.includes("fiv") || c.includes("shield") || c.includes("immune")) return ShieldCheck;
  return Activity;
}

// Map admin status to adopt page category
function getCategory(status = "") {
  if (status === "Ready to Adopt") return "ready";
  if (status === "In Rehabilitation") return "ongoing";
  if (status === "Ongoing Care") return "ongoing";
  return "special";
}


const FILTERS = [
  { id: "all",      label: "All Cats",       icon: PawPrint    },
  { id: "ready",    label: "Ready to Adopt", icon: CheckCircle2 },
  { id: "special",  label: "Special Needs",  icon: Heart        },
  { id: "ongoing",  label: "Ongoing Care",   icon: Stethoscope  },
];

const STEPS = [
  {
    num: "01",
    Icon: Search,
    title: "Browse & Connect",
    desc: "Explore our cats, read their stories, and find the one who speaks to your heart. We only cater face-to-face applications for adoption.",
    color: "from-sky-400 to-blue-500",
  },
  {
    num: "02",
    Icon: FileText,
    title: "Contact Us",
    desc: "Reach out to us to express your interest. We'll guide you through the process and answer any questions.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    num: "03",
    Icon: Phone,
    title: "Meet & Greet",
    desc: "We'll arrange a meet-and-greet — in person or virtual — so you and your future companion can bond.",
    color: "from-indigo-500 to-blue-600",
  },
  {
    num: "04",
    Icon: Home,
    title: "Welcome Home",
    desc: "Once approved, we'll prepare your cat for their journey and provide a full care guide.",
    color: "from-sky-500 to-indigo-500",
  },
];

function StatusBadge({ status }) {
  const map = {
    "Ready to Adopt":    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "In Rehabilitation": "bg-amber-100 text-amber-700 border-amber-200",
    "Ongoing Care":      "bg-sky-100 text-sky-700 border-sky-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 text-blue-600 text-xs font-bold tracking-[0.18em] uppercase mb-5">
      <span className="block w-6 h-px bg-blue-400" />
      {children}
      <span className="block w-6 h-px bg-blue-400" />
    </div>
  );
}

function Container({ children, className = "" }) {
  return (
    <div className={`w-full max-w-7xl mx-auto px-6 lg:px-16 ${className}`}>
      {children}
    </div>
  );
}

const Section = forwardRef(({ children, className = "", delay = 0, id }, forwardedRef) => {
  const [ref, inView] = useInView(0.07);
  return (
    <section
      ref={(node) => {
        ref.current = node;
        if (forwardedRef) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else {
            forwardedRef.current = node;
          }
        }
      }}
      id={id}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </section>
  );
});

// ── AUTH GATE MODAL ──────────────────────────────────────────
function AuthGateModal({ onClose, onLogin, onSignup }) {
  useEffect(() => {
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
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-10 text-center modal-enter">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <PawPrint className="w-8 h-8 text-blue-600" />
        </div>

        <h2 className="display text-2xl font-bold text-slate-800 mb-2">
          Sign in to continue
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          You need an account to start an adoption application or donate. It only takes a minute to sign up!
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="btn-blue text-white font-bold px-6 py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            Log In
          </button>
          <button
            onClick={onSignup}
            className="btn-ghost font-bold px-6 py-4 rounded-2xl text-sm flex items-center justify-center gap-2"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CAT DETAIL MODAL ─────────────────────────────────────────
function CatModal({ cat, onClose, onAdopt }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const CondIcon = cat.conditionIcon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto modal-enter">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-10 h-10 bg-white/90 hover:bg-slate-100 rounded-xl flex items-center justify-center shadow-md transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative h-72 md:h-full min-h-[380px] rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none overflow-hidden">
            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="display text-3xl font-bold text-white mb-1">{cat.name}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={cat.status} />
                <span className="text-white/80 text-xs font-medium">{cat.age} · {cat.gender}</span>
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {cat.tags.map((tag) => (
                <span key={tag} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-100">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CondIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Condition</p>
                <p className="text-slate-700 text-sm font-semibold">{cat.condition}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-2">Their Story</p>
              <p className="text-slate-500 text-sm leading-relaxed">{cat.story}</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-amber-600" />
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">Medical Needs</p>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{cat.medicalNeeds}</p>
            </div>

            <div>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-2">Personality</p>
              <p className="text-slate-500 text-sm leading-relaxed">{cat.personality_full}</p>
            </div>

            {/* AUTH-GATED adopt button */}
            <button
              onClick={onAdopt}
              className="btn-blue-modal text-white font-bold px-6 py-4 rounded-2xl text-sm flex items-center justify-center gap-2 mt-auto shadow-lg"
            >
              <Heart className="w-4 h-4" />
              Start Adoption Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CAT CARD ─────────────────────────────────────────────────
function CatCard({ cat, onClick, index }) {
  const CondIcon = cat.conditionIcon;
  return (
    <div
      className="cat-card bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 cursor-pointer group"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => onClick(cat)}
    >
      <div className="relative overflow-hidden" style={{ height: "240px" }}>
        <img
          src={cat.img}
          alt={cat.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={cat.status} />
        </div>
        <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
          <CondIcon className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="absolute bottom-4 inset-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 text-blue-700 text-xs font-bold">
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="display text-xl font-bold text-slate-800 leading-tight">{cat.name}</h3>
            <p className="text-blue-600 text-xs font-semibold mt-0.5">{cat.condition} · {cat.age}</p>
          </div>
          <span className="text-slate-400 text-xs font-medium mt-1">{cat.gender}</span>
        </div>
        <p className="text-slate-400 text-xs mb-5 leading-relaxed">{cat.personality}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {cat.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="bg-slate-50 text-slate-500 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-slate-100">
              {tag}
            </span>
          ))}
        </div>
        <button
          className="btn-blue w-full text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-1.5"
          onClick={(e) => { e.stopPropagation(); onClick(cat); }}
        >
          View Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────
export default function AdoptPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const processRef = useRef(null);

  // Real-time listener from Firestore — same collection the admin writes to
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "cats"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        conditionIcon: getConditionIcon(d.data().condition),
        category: getCategory(d.data().status),
        personality: d.data().personality || d.data().story || "",
        personality_full: d.data().personality || d.data().story || "",
        medicalNeeds: d.data().medicalNeeds || "Please contact us for medical details.",
        tags: d.data().tags || [],
      }));
      setCats(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Helper — returns true if logged in
  // Swap this out for your real auth check (context, zustand, etc.)
  const isLoggedIn = () => !!localStorage.getItem("token");

  const handleAdoptClick = () => {
    if (isLoggedIn()) {
      // TODO: navigate to the actual adoption form
      navigate("/apply");
    } else {
      setShowAuthGate(true);
    }
  };

  const filtered = cats.filter((c) => {
    const matchFilter = activeFilter === "all" || c.category === activeFilter;
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.condition.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div
      className="w-full min-h-screen bg-slate-50 overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .display { font-family: 'Playfair Display', serif; }
        .btn-blue { background: linear-gradient(135deg, #2563eb, #0ea5e9); transition: all .25s ease; }
        .btn-blue:hover { background: linear-gradient(135deg, #1d4ed8, #0284c7); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,.3); }
        .btn-blue-modal { background: linear-gradient(135deg, #2563eb, #0ea5e9); transition: all .25s ease; }
        .btn-blue-modal:hover { background: linear-gradient(135deg, #1d4ed8, #0284c7); transform: translateY(-1px); box-shadow: 0 12px 32px rgba(37,99,235,.35); }
        .btn-ghost { border: 2px solid #2563eb; color: #2563eb; background: transparent; transition: all .25s ease; cursor: pointer; }
        .btn-ghost:hover { background: #2563eb; color: #fff; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,.25); }
        .gradient-text { background: linear-gradient(135deg, #2563eb, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .adopt-hero-bg { background: radial-gradient(ellipse at 80% 20%, rgba(147,197,253,.5) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(165,180,252,.3) 0%, transparent 50%), #f8fafc; }
        .cat-card { transition: transform .3s ease, box-shadow .3s ease; animation: cardIn 0.5s ease both; }
        .cat-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(14,100,180,.12); }
        @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .filter-btn { transition: all .2s ease; white-space: nowrap; }
        .filter-btn.active { background: linear-gradient(135deg, #2563eb, #0ea5e9); color: white; box-shadow: 0 4px 16px rgba(37,99,235,.25); }
        .step-card { transition: transform .3s ease, box-shadow .3s ease; }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(14,100,180,.1); }
        .modal-enter { animation: modalPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.95) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .search-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,.15); }
        @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .float { animation: floatY 4s ease-in-out infinite; }
        .float2 { animation: floatY 5s ease-in-out 1s infinite; }
      `}</style>

      {/* HERO */}
      <div className="adopt-hero-bg relative w-full pt-36 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-100/60 to-blue-100/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-indigo-100/50 to-sky-100/30 blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide">
                <PawPrint className="w-3.5 h-3.5" />
                {cats.filter(c => c.status === "Ready to Adopt").length} cats waiting for a home
              </div>
              <h1 className="display text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.08] text-slate-800 mb-6">
                Find Your{" "}
                <span className="display italic gradient-text">New</span>
                <br />Companion.
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-lg">
                Every cat here has a story — one of resilience, strength, and hope. Browse our adoptable cats and discover the one who's been waiting for you.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#browse" className="btn-blue text-white font-semibold px-8 py-4 rounded-2xl text-sm flex items-center gap-2 shadow-lg cursor-pointer">
                  <PawPrint className="w-4 h-4" />
                  Meet Our Cats
                </a>
                <button 
                  onClick={() => {
                    if (processRef.current) {
                      processRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="btn-ghost font-semibold px-8 py-4 rounded-2xl text-sm flex items-center gap-2 cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4" />
                  How It Works
                </button>
              </div>
            </div>

            <div className="hidden lg:block relative h-[420px]">
              <div className="absolute right-0 top-0 w-64 h-80 rounded-[2rem] overflow-hidden shadow-2xl float">
                <img src="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=500&fit=crop&auto=format" alt="Mochi" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4">
                  <p className="display text-white text-lg font-bold">Mochi</p>
                  <p className="text-sky-300 text-xs">Ready to Adopt</p>
                </div>
              </div>
              <div className="absolute left-0 bottom-0 w-52 h-64 rounded-[2rem] overflow-hidden shadow-xl float2">
                <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=400&fit=crop&auto=format" alt="Lumen" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4">
                  <p className="display text-white text-base font-bold">Lumen</p>
                  <p className="text-sky-300 text-xs">Ready to Adopt</p>
                </div>
              </div>
              <div className="absolute right-4 bottom-16 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 float">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-4 h-4 text-emerald-600" fill="#6ee7b7" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Adopted</p>
                  <p className="text-sm font-bold text-slate-700">100+ cats</p>
                </div>
              </div>
              <div className="absolute left-24 top-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 float2">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">All cats</p>
                  <p className="text-sm font-bold text-slate-700">Fully vetted</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* BROWSE SECTION */}
      <Section id="browse" className="w-full bg-white py-20">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <SectionLabel>Browse</SectionLabel>
              <h2 className="display text-4xl md:text-5xl font-bold text-slate-800">Adoptable Cats</h2>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed md:text-right">
              Each of these cats has been medically assessed, lovingly cared for, and is ready for their forever home.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or condition…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input w-full pl-11 pr-4 py-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl transition-shadow"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {FILTERS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`filter-btn flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all
                    ${activeFilter === id
                      ? "active border-transparent"
                      : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-slate-400 text-xs font-semibold mb-6 uppercase tracking-wide">
            Showing {filtered.length} of {cats.length} cats
          </p>

          {loading ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <PawPrint className="w-7 h-7 text-blue-300" />
              </div>
              <p className="text-slate-400 font-semibold">Loading cats...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((cat, i) => (
                <CatCard key={cat.id} cat={cat} index={i} onClick={setSelectedCat} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PawPrint className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold mb-1">No cats found</p>
              <p className="text-slate-400 text-sm">Try adjusting your search or filter</p>
            </div>
          )}
        </Container>
      </Section>

      {/* ADOPTION PROCESS */}
      <Section ref={processRef} id="process" className="w-full bg-gradient-to-b from-sky-50/60 to-slate-50 py-24">
        <Container>
          <div className="text-center mb-16">
            <SectionLabel>Simple Steps</SectionLabel>
            <h2 className="display text-4xl md:text-5xl font-bold text-slate-800 mb-4">How Adoption Works</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              We've made the adoption process as straightforward and stress-free as possible — for you and your future cat.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ num, Icon, title, desc, color }, i) => (
              <div key={i} className="step-card bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <p className="absolute top-4 right-5 display text-7xl font-bold text-slate-50 select-none leading-none" aria-hidden="true">{num}</p>
                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-[10px] text-blue-500 font-bold tracking-widest uppercase mb-2">Step {num}</p>
                <h3 className="display text-xl font-bold text-slate-800 mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center justify-center mt-8 gap-0">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                {i < STEPS.length - 1 && <div className="w-32 xl:w-48 h-px bg-gradient-to-r from-blue-300 to-sky-300" />}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* TRUST SIGNALS */}
      <Section className="w-full bg-white py-16">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { Icon: ShieldCheck, label: "All cats fully vetted",  val: "100%", color: "text-emerald-600", bg: "bg-emerald-50" },
              { Icon: Heart,       label: "Successful adoptions",   val: "100+", color: "text-rose-500",   bg: "bg-rose-50"    },
              { Icon: Users,       label: "Volunteer caregivers",   val: "40+",  color: "text-blue-600",   bg: "bg-blue-50"    },
              { Icon: Clock,       label: "Post-adoption support",  val: "1 yr", color: "text-indigo-600", bg: "bg-indigo-50"  },
            ].map(({ Icon, label, val, color, bg }, i) => (
              <div key={i} className="step-card bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className={`display text-2xl font-bold mb-1 ${color}`}>{val}</p>
                <p className="text-slate-500 text-xs leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CALL TO ACTION */}
      <Section className="w-full bg-gradient-to-b from-sky-50/50 to-slate-50 py-16">
        <Container>
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-[2.5rem] p-12 md:p-16 overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute top-8 right-12 opacity-10 pointer-events-none">
              <PawPrint className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ready to change a life?
                </div>
                <h2 className="display text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Your perfect cat<br />
                  <span className="display italic">is waiting for you.</span>
                </h2>
                <p className="text-blue-100 leading-relaxed text-sm max-w-md">
                  Every adoption saves a life and opens a spot for another cat in need. Start your application today — it takes less than 10 minutes.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Adoption Application</p>
                    <p className="text-blue-200 text-xs">Takes about 10 minutes · Free</p>
                  </div>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Talk to Our Team</p>
                    <p className="text-blue-200 text-xs">+1 (503) 294-8812 · Mon–Sat 10–5pm</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  {/* AUTH-GATED apply button in CTA */}
                  <button
                    onClick={handleAdoptClick}
                    className="flex-1 bg-white text-blue-700 font-bold px-6 py-4 rounded-2xl text-sm hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4" fill="#1d4ed8" />
                    Apply Now
                  </button>
                  <button className="border-2 border-white/40 text-white font-semibold px-6 py-4 rounded-2xl text-sm hover:border-white transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <MapPin className="w-4 h-4" />
                    Visit Us
                  </button>
                </div>
                <p className="text-blue-200/70 text-xs text-center">
                  501(c)(3) nonprofit · All adoptions include a 1-year post-adoption support plan
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* CAT DETAIL MODAL */}
      {selectedCat && (
        <CatModal
          cat={selectedCat}
          onClose={() => setSelectedCat(null)}
          onAdopt={handleAdoptClick}
        />
      )}

      {/* AUTH GATE MODAL */}
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