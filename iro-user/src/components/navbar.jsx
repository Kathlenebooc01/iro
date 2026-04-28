import { useState, useEffect } from "react";
import { Menu, X, PawPrint, Heart, User, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/iro-logo.png";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const NAV_LINKS = [
  { label: "Home",     href: "/",         type: "route"  },
  { label: "Adopt",    href: "/adopt",    type: "route"  },
  { label: "Events",   href: "/events",   type: "route"  },
  { 
    label: "Others", 
    type: "dropdown",
    items: [
      { label: "About Us", href: "/aboutus" },
      { label: "Contact", href: "/contact" },
      { label: "Gallery", href: "/gallery" },
    ]
  },
];

export default function Navbar({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [othersDropdown, setOthersDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (link) => {
    setMobileOpen(false);
    if (link.type === "route") {
      navigate(link.href);
    } else {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const el = document.querySelector(link.href);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const el = document.querySelector(link.href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const isActive = (link) => {
    if (link.type === "dropdown") {
      return link.items.some(item => location.pathname === item.href);
    }
    return link.type === "route" ? location.pathname === link.href : false;
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUserDropdown(false);
    navigate("/");
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;700&display=swap');
        .nav-display { font-family: 'Playfair Display', serif; }
        .nav-body { font-family: 'DM Sans', sans-serif; }
        .navbar-glass-static {
          background: rgba(248, 250, 252, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.5);
        }
        .nav-link-active::after {
          content: ''; position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%);
          width: 16px; height: 3px; border-radius: 99px; background: #2563eb;
        }
      `}</style>

      <nav className="navbar-glass-static fixed top-0 left-0 right-0 z-50 w-full py-2 nav-body">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src={logo} alt="Logo" className="h-14 w-auto object-contain" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                link.type === "dropdown" ? (
                  <div key={link.label} className="relative">
                    <button
                      onClick={() => setOthersDropdown(!othersDropdown)}
                      className={`relative px-4 py-2 text-sm font-bold transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1
                        ${isActive(link) ? "nav-link-active text-blue-600" : "text-slate-600 hover:text-blue-600"}`}
                    >
                      {link.label}
                      <ChevronDown size={14} className={`transition-transform ${othersDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {othersDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 overflow-hidden z-50">
                        {link.items.map((item) => (
                          <button
                            key={item.href}
                            onClick={() => {
                              navigate(item.href);
                              setOthersDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-slate-50 ${
                              location.pathname === item.href ? 'text-blue-600 bg-blue-50' : 'text-slate-700'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link)}
                    className={`relative px-4 py-2 text-sm font-bold transition-colors border-none bg-transparent cursor-pointer
                      ${isActive(link) ? "nav-link-active text-blue-600" : "text-slate-600 hover:text-blue-600"}`}
                  >
                    {link.label}
                  </button>
                )
              ))}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                <>
                  <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                    Login
                  </Link>
                  <Link to="/signup" className="bg-slate-900 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 bg-white border border-slate-100 p-1.5 pr-4 rounded-full hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-700">Hello, {displayName.split(" ")[0]}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${userDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {userDropdown && (
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs text-slate-400 font-medium truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}