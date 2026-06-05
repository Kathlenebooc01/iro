import { useState, useEffect, useRef } from "react";
import {
  Heart,
  Star,
  Shield,
  Users,
  PawPrint,
  Eye,
  ChevronRight,
  Camera,
  History,
  Target,
} from "lucide-react";

/* ─────────────────────────────────────────────
   ANIMATED COUNTER HOOK
───────────────────────────────────────────── */
function useCounter(target, duration = 2000, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const end = parseInt(target.toString().replace(/[^0-9]/g, ""));
    if (start === end) return;

    let totalMiliseconds = duration;
    let incrementTime = Math.max(10, totalMiliseconds / end);
    const step = Math.max(1, Math.floor(end / (duration / 20)));

    let timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [target, duration, active]);

  return count;
}

/* ─────────────────────────────────────────────
   ANIMATION HOOK (Section Entry)
───────────────────────────────────────────── */
function useInView(threshold = 0.15) {
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
   NEW GRADIENT STAT CARD (Matching Reference)
───────────────────────────────────────────── */
function StatCard({ stat, index }) {
  const [ref, inView] = useInView(0.1);
  const animatedValue = useCounter(stat.value, 2000, inView);
  const Icon = stat.icon;

  // Different gradients for variety, matching your image style
  const gradients = [
    "from-blue-500 to-blue-600",
    "from-blue-600 to-indigo-600",
    "from-indigo-600 to-blue-700",
    "from-blue-700 to-indigo-800",
  ];

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-[2.5rem] p-10 text-center text-white shadow-xl transition-all duration-700 bg-gradient-to-br ${gradients[index % gradients.length]}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Decorative inner light effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
      
      {/* Icon Badge */}
      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10">
        <Icon className="text-white w-6 h-6" />
      </div>

      {/* Large Serif Number */}
      <h3 className="display-font text-6xl font-bold mb-2 tracking-tight">
        {animatedValue.toLocaleString()}{stat.value.includes("+") ? "+" : ""}
        <span className="text-2xl ml-1">{stat.value.includes("yrs") ? " yrs" : ""}</span>
      </h3>

      {/* Labels */}
      <p className="font-bold text-lg mb-1">{stat.label}</p>
      <p className="text-white/60 text-xs font-medium uppercase tracking-widest">
        {stat.sub}
      </p>
    </div>
  );
}

function AnimatedSection({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
// Calculate years since 2015
const currentYear = new Date().getFullYear();
const yearsSince2015 = currentYear - 2015;

const STATS = [
  { label: "Cats Rescued", value: "300+", sub: "Since 2015", icon: PawPrint },
  { label: "Successful Adoptions", value: "100+", sub: "Happy forever homes", icon: Heart },
  { label: "Years of Service", value: `${yearsSince2015} yrs`, sub: "And counting", icon: Star },
  { label: "Families Helped", value: "100+", sub: "Across the country", icon: Users },
];

const TEAM = [
  {
    name: "Annalyn Aizpuru",
    role: "Founder & Director",
    bio: "A passionate advocate for cats with special needs. Annalyn started O IRO Cattery in 2013 with one rescued cat and a big dream.",
    emoji: "👩‍⚕️",
  },
  {
    name: "Volunteer Vets",
    role: "Medical Team",
    bio: "Our dedicated veterinary partners donate their time to ensure every rescue receives proper medical care.",
    emoji: "🏥",
  },
  {
    name: "Foster Network",
    role: "Foster Families",
    bio: "Dozens of loving foster families across Cebu open their homes to our cats while they wait for forever homes.",
    emoji: "🏡",
  },
];

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-50 font-['DM_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        .display-font { font-family: 'Playfair Display', serif; }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <AnimatedSection>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-[10px] font-bold px-4 py-2 rounded-full mb-8 tracking-[0.2em] uppercase border border-blue-100">
            <History className="w-3.5 h-3.5" /> Est. 2015
          </div>
          <h1 className="display-font text-5xl md:text-7xl font-bold text-slate-900 mb-8 leading-[1.1]">
            Small Compassion, <br />
            <span className="italic text-blue-600">Infinite Impact.</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Founded by <span className="text-slate-900 font-semibold">Annalyn Aizpuru</span>, O IRO Cattery is a sanctuary for cats the world overlooks.
          </p>
        </AnimatedSection>
      </section>

      {/* Redesigned Animated Stats (Reference Match) */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
          <Shield className="w-12 h-12 text-blue-400 mb-8 opacity-50" />
          <h2 className="display-font text-3xl font-bold mb-6">Our Mission</h2>
          <div className="text-slate-300 leading-relaxed text-base space-y-4">
            <p className="text-lg font-semibold text-white">
              The mission of IRO, Island Rescue Organization Inc., shall be:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">1.</span>
                <span>To promote responsible ownership and humane treatment of all animals through cooperation, outreach, and education.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">2.</span>
                <span>To promote a symbiotic relationship between animals and humans pursuant to the laws of the Philippines.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">3.</span>
                <span>To advocate the development and enforcement of humane and effective animal welfare laws.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">4.</span>
                <span>To rescue abused, abandoned, neglected, and tortured animals.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">5.</span>
                <span>To provide a healthy, loving, truly no-kill sanctuary for these animals.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">6.</span>
                <span>To promote fostering of these animals while waiting for adoptions.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">7.</span>
                <span>To promote adoptions of these animals in loving, forever homes.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 bg-white/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">The Heart of IRO</span>
            <h2 className="display-font text-4xl md:text-5xl font-bold text-slate-900">Meet Our Team</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <div key={i} className="glass-card rounded-[2.5rem] p-10 text-center hover:bg-white transition-colors">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-8 border border-slate-100">
                  {member.emoji}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">{member.role}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TikTok CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-blue-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-200">
          <Camera className="w-12 h-12 mx-auto mb-6 opacity-40" />
          <h2 className="display-font text-3xl md:text-4xl font-bold mb-8 italic">Watch their recovery stories.</h2>
          <a 
            href="https://www.tiktok.com/@ocattery22" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            TikTok @ocattery22 <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}