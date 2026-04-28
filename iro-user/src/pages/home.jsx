import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  MapPin,
  Mail,
  Clock,
  Facebook,
  Instagram,
  ChevronRight,
  ArrowRight,
  Users,
  Home,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  HandHeart,
  CalendarDays,
  Camera,
  Phone,
  PawPrint,
  Eye,
  Volume2,
  Activity,
  X,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import logo from "../assets/iro-logo.png";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

function RegistrationModal({ event, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    attendees: "1",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Registration submitted for ${event.title}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="display text-2xl font-bold text-slate-800 mb-2">
            Register for Event
          </h2>
          <p className="text-slate-500 text-sm">{event.title}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {event.month} {event.day}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">
              Number of Attendees
            </label>
            <select
              value={formData.attendees}
              onChange={(e) => setFormData({...formData, attendees: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none text-sm"
            >
              <option value="1">1 Person</option>
              <option value="2">2 People</option>
              <option value="3">3 People</option>
              <option value="4">4 People</option>
              <option value="5+">5+ People</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">
              Additional Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Any questions or special requirements?"
              rows="3"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              Complete Registration
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-sm border-2 border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   INTERSECTION OBSERVER HOOK
───────────────────────────────────────────── */
function useInView(threshold = 0.2) {
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

/* ─────────────────────────────────────────────
   ANIMATED COUNTER HOOK
───────────────────────────────────────────── */
function useCounter(target, duration = 2000, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return val;
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const CATS = [
  {
    name: "Mochi",
    age: "2 yrs",
    condition: "Three-legged",
    personality: "Playful & curious",
    status: "Ready to Adopt",
    statusColor: "bg-emerald-100 text-emerald-700",
    conditionIcon: Activity,
    img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Lumen",
    age: "4 yrs",
    condition: "One-eyed",
    personality: "Gentle & affectionate",
    status: "Ready to Adopt",
    statusColor: "bg-emerald-100 text-emerald-700",
    conditionIcon: Eye,
    img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Pebble",
    age: "1 yr",
    condition: "Deaf",
    personality: "Bold & adventurous",
    status: "In Rehabilitation",
    statusColor: "bg-amber-100 text-amber-700",
    conditionIcon: Volume2,
    img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Thistle",
    age: "6 yrs",
    condition: "Cerebellar Hypoplasia",
    personality: "Quiet & loving",
    status: "Ready to Adopt",
    statusColor: "bg-emerald-100 text-emerald-700",
    conditionIcon: Activity,
    img: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop&auto=format",
  },
];

const GALLERY = [
  {
    label: "First steps after surgery",
    img: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=700&h=700&fit=crop&auto=format",
    className: "col-span-2 row-span-2",
  },
  {
    label: "Therapy & recovery",
    img: "https://images.unsplash.com/photo-1615789591457-74a63395c990?w=400&h=400&fit=crop&auto=format",
    className: "",
  },
  {
    label: "Meeting forever families",
    img: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=400&fit=crop&auto=format",
    className: "",
  },
  {
    label: "Learning to play again",
    img: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400&h=400&fit=crop&auto=format",
    className: "",
  },
  {
    label: "Volunteer care moments",
    img: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=400&fit=crop&auto=format",
    className: "",
  },
];

const EVENTS = [
  {
    day: "22", month: "Feb",
    title: "Adoption Fair at Riverside Park",
    desc: "Meet our resident cats and learn about disability-friendly adoption.",
    type: "Adoption",
    typeColor: "bg-emerald-100 text-emerald-700",
    icon: PawPrint,
  },
  {
    day: "08", month: "Mar",
    title: "Volunteer Orientation Day",
    desc: "Join our family of caregivers and make a lasting difference.",
    type: "Volunteer",
    typeColor: "bg-sky-100 text-sky-700",
    icon: Users,
  },
  {
    day: "15", month: "Mar",
    title: "Fundraising Charity Dinner",
    desc: "An evening of compassion, stories, and community togetherness.",
    type: "Fundraiser",
    typeColor: "bg-amber-100 text-amber-700",
    icon: HandHeart,
  },
];

const ADOPTER_PHOTOS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&auto=format",
];

/* ─────────────────────────────────────────────
   SCROLL-FADE SECTION WRAPPER
───────────────────────────────────────────── */
function Section({ children, className = "" }) {
  const [ref, inView] = useInView(0.08);
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </section>
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

/* ─────────────────────────────────────────────
   INNER CONTAINER — consistent section padding
───────────────────────────────────────────── */
function Container({ children, className = "" }) {
  return (
    <div className={`w-full max-w-7xl mx-auto px-6 lg:px-16 ${className}`}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function OcatteryHomepage() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cats, setCats] = useState([]);
  const [events, setEvents] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);

  // Load cats from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "cats"), (snap) => {
      setCats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Load events from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Auto-rotate hero cat every 4 seconds
  useEffect(() => {
    if (cats.length < 2) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % cats.length), 4000);
    return () => clearInterval(t);
  }, [cats.length]);

  const heroCat = cats[heroIndex] || null;

  const [impactRef, impactInView] = useInView(0.3);
  const rescues   = useCounter(847,  2200, impactInView);
  const adoptions = useCounter(612,  2000, impactInView);
  const years     = useCounter(9,    1400, impactInView);

  /* ── Navigation handlers ── */

  // Adopt a Cat / View All Cats / Learn More → always go to /adopt
  const handleAdopt = () => {
    navigate("/adopt");
  };

  const handleDonate = () => {
    if (auth.currentUser) {
      navigate("/donate");
    } else {
      navigate("/login", { state: { from: "/donate" } });
    }
  };

  return (
    /*
      Root wrapper:
      - w-full + min-h-screen so it truly fills #root
      - NO padding here — all padding lives inside <Container>
      - overflow-x-hidden prevents horizontal scroll from
        absolutely-positioned blobs
    */
    <div
      className="w-full min-h-screen bg-slate-50 overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .display { font-family: 'Playfair Display', serif; }

        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        .float  { animation: floatY 4s ease-in-out infinite; }
        .float2 { animation: floatY 5s ease-in-out 0.8s infinite; }
        .float3 { animation: floatY 6s ease-in-out 1.6s infinite; }

        .btn-blue {
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
          transition: all .25s ease;
        }
        .btn-blue:hover {
          background: linear-gradient(135deg, #1d4ed8, #0284c7);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(37,99,235,.35);
        }
        .btn-ghost {
          border: 2px solid #2563eb;
          color: #2563eb;
          background: transparent;
          transition: all .25s ease;
          cursor: pointer;
        }
        .btn-ghost:hover {
          background: #2563eb;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(37,99,235,.25);
        }
        .card-lift {
          transition: transform .3s ease, box-shadow .3s ease;
        }
        .card-lift:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(14,100,180,.13);
        }
        .gallery-card .overlay {
          opacity: 0;
          transition: opacity .35s ease;
        }
        .gallery-card:hover .overlay { opacity: 1; }
        .gradient-text {
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-bg {
          background:
            radial-gradient(ellipse at 75% 35%, rgba(147,197,253,.55) 0%, transparent 60%),
            radial-gradient(ellipse at 15% 80%, rgba(165,180,252,.3) 0%, transparent 55%),
            #f8fafc;
        }
      `}</style>

      {/* ══════════════════════════════════════
          HERO — full-bleed background, Container inside
      ══════════════════════════════════════ */}
      <div className="hero-bg relative w-full min-h-screen flex items-center overflow-hidden">
        {/* Decorative blobs — absolutely placed, won't affect layout */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-sky-100/70 to-blue-200/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-100/60 to-sky-100/40 blur-3xl pointer-events-none" />

        <Container className="py-28">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide">
                <PawPrint className="w-3.5 h-3.5" />
                Disability is not inability
              </div>

              <h1 className="display text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.08] text-slate-800 mb-6">
                Every cat{" "}
                <span className="display italic gradient-text">deserves</span>
                <br />a second chance.
              </h1>

              <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-lg">
                Ocattery rescues and rehabilitates cats with disabilities — giving them the medical care, love, and forever homes they deserve. Because a missing limb never stopped a cat from purring.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                {/* ── Adopt a Cat → /adopt ── */}
                <button
                  onClick={handleAdopt}
                  className="btn-blue text-white font-semibold px-8 py-4 rounded-2xl text-sm flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <PawPrint className="w-4 h-4" />
                  Adopt a Cat
                </button>

                {/* ── Donate → /login if not logged in, else /donate ── */}
                <button
                  onClick={handleDonate}
                  className="btn-ghost font-semibold px-8 py-4 rounded-2xl text-sm flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Donate
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {ADOPTER_PHOTOS.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="adopter"
                      className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-slate-700 text-sm font-semibold">2,400+ families</p>
                  <p className="text-slate-400 text-xs">have trusted Ocattery</p>
                </div>
              </div>
            </div>

            {/* Right — hero image card (dynamic from Firestore) */}
            <div className="relative hidden lg:flex justify-center">
              {heroCat ? (
                <div className="relative w-[380px] float" key={heroCat.id}>
                  <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5]">
                    <img
                      src={heroCat.img || "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=760&h=950&fit=crop&auto=format"}
                      alt={heroCat.name}
                      className="w-full h-full object-cover transition-all duration-700"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/85 to-transparent p-6">
                      <p className="display text-white text-xl font-bold">{heroCat.name}</p>
                      <p className="text-sky-300 text-sm font-medium">
                        {heroCat.condition} · {heroCat.age} · {heroCat.status}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="absolute -top-5 -right-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 float2">
                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Status</p>
                      <p className="text-sm font-bold text-slate-700">{heroCat.status}</p>
                    </div>
                  </div>

                  {/* Care level badge */}
                  <div className="absolute -bottom-5 -left-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 float3">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Care Level</p>
                      <p className="text-sm font-bold text-slate-700">
                        {heroCat.vaccinated && heroCat.dewormed ? "Fully vetted" : "In care"}
                      </p>
                    </div>
                  </div>

                  {/* Dot indicators */}
                  {cats.length > 1 && (
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                      {cats.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setHeroIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === heroIndex ? "bg-blue-600 w-5" : "bg-slate-300"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-[380px] aspect-[4/5] rounded-[2.5rem] bg-slate-100 animate-pulse" />
              )}
            </div>
          </div>
        </Container>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400">
          <p className="text-[10px] tracking-[0.22em] uppercase font-semibold">Scroll to explore</p>
          <div className="w-5 h-9 border-2 border-slate-300 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-slate-400 rounded-full float" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          ABOUT PREVIEW
      ══════════════════════════════════════ */}
      <Section className="w-full bg-white py-28">
        <Container>
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Visual side */}
            <div className="relative">
              <div className="rounded-[2.5rem] overflow-hidden aspect-square shadow-xl">
                <img
                  src={heroCat?.img || "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=720&h=720&fit=crop&auto=format"}
                  alt={heroCat?.name || "Shelter cat"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Dynamic medical info pills from admin data */}
              {heroCat && (
                <div className="absolute top-8 -right-2 flex flex-col gap-3 max-w-[220px]">
                  {[
                    heroCat.vaccinated && { Icon: ShieldCheck, label: "Vaccinated", bg: "bg-emerald-50", icon: "text-emerald-600" },
                    heroCat.dewormed   && { Icon: Stethoscope, label: "Dewormed",   bg: "bg-blue-50",    icon: "text-blue-600"    },
                    heroCat.microchipped && { Icon: Activity,  label: "Microchipped", bg: "bg-purple-50", icon: "text-purple-600" },
                  ].filter(Boolean).slice(0, 3).map(({ Icon, label, bg, icon }, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <Icon className={`w-4 h-4 ${icon}`} />
                      </div>
                      <p className="text-slate-700 text-xs font-medium leading-snug">{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Cat info card */}
              {heroCat && (
                <div className="absolute -bottom-6 -left-4 bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={heroCat.img} alt={heroCat.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{heroCat.name}</p>
                    <p className="text-sky-600 text-xs font-medium">{heroCat.condition}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{heroCat.status}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Text side */}
            <div>
              <SectionLabel>Who We Are</SectionLabel>
              <h2 className="display text-4xl md:text-5xl font-bold text-slate-800 leading-tight mb-6">
                Born from love,{" "}
                <span className="display italic gradient-text">built with purpose.</span>
              </h2>
              <p className="text-slate-500 text-base leading-relaxed mb-5">
                Ocattery began in 2015 when veterinarian Dr. Lena Sorrell rescued her first three-legged cat from a roadside. She quickly realized that disabled cats were consistently overlooked in shelters — despite having just as much love to give.
              </p>
              <p className="text-slate-500 text-base leading-relaxed mb-10">
                Today, we operate a full-service rehabilitation shelter with specialized medical staff, behavioral therapists, and a passionate volunteer community. We don't just rescue cats. We rebuild their lives.
              </p>

              <div className="flex gap-10">
                {[
                  { value: "2015",      label: "Year Founded"        },
                  { value: "14+",       label: "Staff & Specialists"  },
                  { value: "501(c)(3)", label: "Nonprofit Status"     },
                ].map(({ value, label }, i) => (
                  <div key={i} className={i > 0 ? "border-l border-slate-200 pl-10" : ""}>
                    <p className="display text-2xl font-bold text-blue-600">{value}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ══════════════════════════════════════
          MISSION & VISION
      ══════════════════════════════════════ */}
      <Section className="w-full bg-gradient-to-b from-sky-50/60 to-slate-50 py-28">
        <Container>
          <div className="text-center mb-16">
            <SectionLabel>Our Purpose</SectionLabel>
            <h2 className="display text-4xl md:text-5xl font-bold text-slate-800">Mission & Vision</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Mission */}
            <div className="card-lift bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-blue-400 mb-3">Mission</p>
                <h3 className="display text-2xl font-bold text-slate-800 mb-4">Rescue. Rehabilitate. Rehome.</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  To provide compassionate, evidence-based care to cats with physical and sensory disabilities — ensuring every animal receives the medical attention, emotional support, and love they deserve before finding a permanent home.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="card-lift bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[2rem] p-10 relative overflow-hidden shadow-lg">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 75% 20%, white 0%, transparent 55%)" }}
              />
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-blue-200 mb-3">Vision</p>
                <h3 className="display text-2xl font-bold text-white mb-4">A world that sees ability, not disability.</h3>
                <p className="text-blue-100 leading-relaxed text-sm">
                  We envision a future where no cat is euthanized or abandoned due to a disability — where communities embrace difference, and every animal is valued for the joy and companionship they bring.
                </p>
              </div>
            </div>
          </div>

          {/* Values row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { Icon: HandHeart,   label: "Compassion", desc: "At the core of all we do"  },
              { Icon: Stethoscope, label: "Expertise",  desc: "Specialist veterinary care" },
              { Icon: Users,       label: "Community",  desc: "Stronger together"           },
              { Icon: Star,        label: "Hope",       desc: "For every single cat"        },
            ].map(({ Icon, label, desc }, i) => (
              <div key={i} className="card-lift bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-bold text-slate-700 text-sm mb-1">{label}</p>
                <p className="text-slate-400 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ══════════════════════════════════════
          RESCUE IMPACT
      ══════════════════════════════════════ */}
      <Section className="w-full bg-white py-28">
        <Container>
          <div className="text-center mb-16">
            <SectionLabel>Our Reach</SectionLabel>
            <h2 className="display text-4xl md:text-5xl font-bold text-slate-800 mb-4">Rescue Impact</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Every number represents a life touched, a cat saved, and a family made whole.
            </p>
          </div>

          <div ref={impactRef} className="grid md:grid-cols-3 gap-6">
            {[
              { value: rescues,   suffix: "+",    label: "Cats Rescued",         sub: "Since 2015",          Icon: PawPrint, grad: "from-sky-500 to-blue-600"   },
              { value: adoptions, suffix: "+",    label: "Successful Adoptions", sub: "Happy forever homes", Icon: Home,     grad: "from-blue-600 to-indigo-700" },
              { value: years,     suffix: " yrs", label: "Years of Service",     sub: "And counting",        Icon: Star,     grad: "from-indigo-600 to-blue-700" },
            ].map(({ value, suffix, label, sub, Icon, grad }, i) => (
              <div
                key={i}
                className={`card-lift bg-gradient-to-br ${grad} rounded-[2rem] p-10 text-white text-center relative overflow-hidden shadow-lg`}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ backgroundImage: "radial-gradient(circle at 70% 15%, rgba(255,255,255,0.12) 0%, transparent 55%)" }}
                />
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="display text-6xl md:text-7xl font-bold mb-2 tracking-tight">
                    {value.toLocaleString()}{suffix}
                  </p>
                  <p className="font-semibold text-base mb-1">{label}</p>
                  <p className="text-white/60 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ══════════════════════════════════════
          FEATURED CATS
      ══════════════════════════════════════ */}
      <Section className="w-full bg-gradient-to-b from-slate-50 to-sky-50/50 py-28">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <SectionLabel>Meet Them</SectionLabel>
              <h2 className="display text-4xl md:text-5xl font-bold text-slate-800">Featured Cats</h2>
            </div>
            {/* ── View All Cats → /adopt ── */}
            <button
              onClick={handleAdopt}
              className="btn-ghost font-semibold px-6 py-3 rounded-2xl text-sm flex items-center gap-2 self-start md:self-auto"
            >
              View All Cats <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cats.slice(0, 4).map((cat, i) => {
              const statusColor =
                cat.status === "Ready to Adopt" ? "bg-emerald-100 text-emerald-700" :
                cat.status === "In Rehabilitation" ? "bg-amber-100 text-amber-700" :
                "bg-sky-100 text-sky-700";
              return (
                <div key={cat.id || i} className="card-lift bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 cursor-pointer group">
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={cat.img || "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop&auto=format"}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${statusColor}`}>
                        {cat.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="display text-xl font-bold text-slate-800">{cat.name}</h3>
                    </div>
                    <p className="text-blue-600 text-xs font-semibold mb-1">{cat.condition} · {cat.age}</p>
                    <p className="text-slate-400 text-xs mb-5 line-clamp-1">{cat.personality}</p>
                    <button
                      onClick={handleAdopt}
                      className="btn-blue text-white text-xs font-semibold px-4 py-2.5 rounded-xl w-full flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Learn More <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {cats.length === 0 && [0,1,2,3].map(i => (
              <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm animate-pulse">
                <div className="aspect-square bg-slate-100" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ══════════════════════════════════════
          UPCOMING EVENTS
      ══════════════════════════════════════ */}
      <Section className="w-full bg-gradient-to-b from-sky-50/50 to-slate-50 py-28">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <SectionLabel>Join Us</SectionLabel>
              <h2 className="display text-4xl md:text-5xl font-bold text-slate-800">Upcoming Events</h2>
            </div>
            <button
              onClick={() => navigate("/events")}
              className="btn-ghost font-semibold px-6 py-3 rounded-2xl text-sm flex items-center gap-2 self-start md:self-auto"
            >
              All Events <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {events.slice(0, 3).map((ev, i) => {
              const typeColor =
                ev.type === "Adoption" ? "bg-emerald-100 text-emerald-700" :
                ev.type === "Volunteer" ? "bg-sky-100 text-sky-700" :
                ev.type === "Fundraiser" ? "bg-amber-100 text-amber-700" :
                "bg-blue-100 text-blue-700";
              const EvIcon =
                ev.type === "Volunteer" ? Users :
                ev.type === "Fundraiser" ? HandHeart :
                PawPrint;
              return (
                <div key={ev.id || i} className="card-lift bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex gap-5 items-center cursor-pointer">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-sky-100 to-blue-100 rounded-2xl flex flex-col items-center justify-center">
                    <p className="display text-xl font-bold text-blue-700 leading-none">{ev.day}</p>
                    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{ev.month}</p>
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    <EvIcon className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-base">{ev.title}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide ${typeColor}`}>
                        {ev.type}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{ev.description}</p>
                  </div>
                  <div className="flex-shrink-0 hidden md:block">
                    <button
                      onClick={() => setSelectedEvent(ev)}
                      className="btn-blue text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      Register <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">No upcoming events yet.</div>
            )}
          </div>
        </Container>
      </Section>

      {/* ══════════════════════════════════════
          DONATION CALLOUT
          — full-bleed section, card inside Container
      ══════════════════════════════════════ */}
      <Section className="w-full bg-slate-50 py-16">
        <Container>
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-[2.5rem] p-12 md:p-16 overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute top-8 right-10 opacity-10 pointer-events-none">
              <PawPrint className="w-24 h-24 text-white" />
            </div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide">
                <Heart className="w-3.5 h-3.5" />
                Make a difference today
              </div>

              <h2 className="display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
                Your support gives<br />
                <span className="display italic">cats a fighting chance.</span>
              </h2>

              <p className="text-blue-100 text-base max-w-2xl mx-auto mb-10 leading-relaxed">
                Every donation — big or small — funds surgeries, rehabilitation, food, and shelter for cats who have nowhere else to turn. Help us keep our doors open for the ones who need us most.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {["$10", "$25", "$50", "$100", "Custom"].map((amt) => (
                  <button
                    key={amt}
                    onClick={handleDonate}
                    className="bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    {amt}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                {/* ── Donate Now → requires login ── */}
                <button
                  onClick={handleDonate}
                  className="bg-white text-blue-700 font-bold px-10 py-4 rounded-2xl text-sm hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4" fill="#1d4ed8" /> Donate Now
                </button>
                {/* ── Monthly Giving → also requires login ── */}
                <button
                  onClick={handleDonate}
                  className="border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-2xl text-sm hover:border-white transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4" /> Monthly Giving
                </button>
              </div>

              <p className="text-blue-200/70 text-xs mt-8">
                Ocattery is a registered 501(c)(3) nonprofit · All donations are tax-deductible
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ══════════════════════════════════════
          FOOTER — full-bleed dark background
      ══════════════════════════════════════ */}
      <footer className="w-full bg-slate-900 text-slate-400 pt-16 pb-10">
        <Container>
          <div className="grid md:grid-cols-3 gap-12 mb-12">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <img src={logo} alt="Ocattery Logo" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
                A nonprofit shelter dedicated to rescuing and rehabilitating cats with disabilities since 2015. Every cat is extraordinary.
              </p>
              <div className="flex gap-2">
                {[
                  { Icon: Facebook,  href: "https://www.facebook.com/profile.php?id=100064674974636" },
                  { Icon: Instagram, href: "https://www.instagram.com/o_iro_cattery/" },
                ].map(({ Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-slate-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-white font-semibold text-sm mb-5">Quick Links</p>
              <ul className="space-y-3">
                {[
                  { label: "Adopt a Cat", action: handleAdopt },
                  { label: "Donate",      action: handleDonate },
                  { label: "Volunteer",   action: null },
                  { label: "Events",      action: null },
                  { label: "Gallery",     action: null },
                  { label: "Contact Us",  action: null },
                ].map(({ label, action }) => (
                  <li key={label}>
                    <button
                      onClick={action ?? undefined}
                      className="text-slate-400 hover:text-sky-400 text-sm transition-colors flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white font-semibold text-sm mb-5">Get in Touch</p>
              <div className="space-y-4">
                {[
                  { Icon: Mail,   label: "Email",          value: "irorescue@gmail.com",                        href: "mailto:irorescue@gmail.com",  cls: "text-sky-400 hover:text-sky-300" },
                  { Icon: Phone,  label: "Phone",          value: "09270621080",                                href: "tel:09270621080",              cls: "text-slate-300" },
                  { Icon: MapPin, label: "Address",        value: "P.Basubas, Tipolo Mandaue City, 6014",       href: "#",                            cls: "text-slate-300" },
                  { Icon: Clock,  label: "Visiting Hours", value: "Mon–Sat · 10am – 5pm",                       href: null,                           cls: "text-slate-300" },
                ].map(({ Icon, label, value, href, cls }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                      {href
                        ? <a href={href} className={`text-sm transition-colors ${cls}`}>{value}</a>
                        : <p className={`text-sm ${cls}`}>{value}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">
              © 2025 Ocattery · All rights reserved · Registered 501(c)(3) Nonprofit
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Heart className="w-3 h-3 text-rose-400" fill="#f87171" />
              Made with love for cats everywhere
            </div>
          </div>
        </Container>
      </footer>

      {selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}