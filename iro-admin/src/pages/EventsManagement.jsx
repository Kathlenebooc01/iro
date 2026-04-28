import { useState, useEffect } from "react";
import {
    Calendar, Plus, Edit2, Trash2, Search,
    MapPin, Clock, PawPrint, Users, X, ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/iro-logo.png";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from "firebase/firestore";

const EVENTS_COLLECTION = "events";

const EVENT_TITLES = [
    "Adoption Fair",
    "Adoption Fair at Riverside Park",
    "Spring Adoption Event",
    "Holiday Adoption Drive",
    "Volunteer Orientation Day",
    "Volunteer Training Workshop",
    "Fundraising Charity Dinner",
    "Community Fundraiser Walk",
    "Cat Care Workshop",
    "Special Needs Cat Awareness Day",
    "Annual Gala & Auction",
    "Foster Care Information Night",
    "Microchipping & Vaccination Day",
    "Open House at the Shelter",
    "Pet Photography Day",
    "Kids & Cats Education Day",
    "Senior Cat Adoption Event",
    "Spay & Neuter Awareness Day",
    "Community Clean-Up & Cat Fair",
    "Holiday Gift Drive for Shelter Cats",
];

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function formatTimeSlot(start, end) {
    const fmt = (t) => {
        if (!t) return "";
        const [h, m] = t.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const hour = h % 12 || 12;
        return m === 0 ? `${hour} ${ampm}` : `${hour}:${String(m).padStart(2,"0")} ${ampm}`;
    };
    const s = fmt(start);
    const e = fmt(end);
    if (s && e) return `${s} – ${e}`;
    if (s) return s;
    return "";
}

function EventTypeBadge({ type }) {
    const map = {
        Adoption: "bg-[#E6F9F1] text-[#00B67A] border-[#D1F2E5]",
        Volunteer: "bg-[#E6F4FF] text-[#0085FF] border-[#CCE9FF]",
        Fundraiser: "bg-[#FFF9E6] text-[#FFBB00] border-[#FFF1CC]"
    };
    return <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full border ${map[type]}`}>{type}</span>;
}

function EventModal({ event, onClose, onSave, saving }) {
    const [formData, setFormData] = useState(event || {
        day: "", month: "", title: "", titlePreset: "", description: "", type: "Adoption", location: "", time: "", timeStart: "", timeEnd: ""
    });

    // When user picks a date, extract day and month
    const handleDateChange = (e) => {
        const val = e.target.value; // "YYYY-MM-DD"
        if (!val) return;
        const [, m, d] = val.split("-");
        setFormData(prev => ({
            ...prev,
            day: String(parseInt(d, 10)),
            month: MONTHS[parseInt(m, 10) - 1],
        }));
    };

    // Build a date string for the input's value if we already have day/month
    const dateValue = () => {
        if (!formData.day || !formData.month) return "";
        const mIdx = MONTHS.indexOf(formData.month) + 1;
        if (mIdx === 0) return "";
        const year = new Date().getFullYear();
        return `${year}-${String(mIdx).padStart(2,"0")}-${String(formData.day).padStart(2,"0")}`;
    };

    const inputClass = "w-full px-5 py-4 rounded-2xl border border-slate-100 bg-[#F8FAFC] outline-none text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-300";
    const labelClass = "text-[11px] font-black text-slate-800 uppercase tracking-[0.15em] mb-2.5 block";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-10 relative" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all hover:rotate-90">
                    <X size={18} className="text-slate-500" />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900">{event ? "Edit Event" : "Add New Event"}</h2>
                    <p className="text-sm font-medium text-slate-400 mt-1">Fill in the details to update the community.</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-5">

                    {/* Date picker — fills both day and month */}
                    <div>
                        <label className={labelClass}>Event Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dateValue()}
                                onChange={handleDateChange}
                                className={`${inputClass} cursor-pointer`}
                                required
                            />
                            <Calendar size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {formData.day && formData.month && (
                            <p className="text-xs text-blue-500 font-semibold mt-2 ml-1">
                                Day: {formData.day} · Month: {formData.month}
                            </p>
                        )}
                    </div>

                    {/* Event Title */}
                    <div>
                        <label className={labelClass}>Event Title</label>
                        <div className="relative">
                            <select
                                value={formData.titlePreset || (EVENT_TITLES.includes(formData.title) ? formData.title : "__custom__")}
                                onChange={(e) => {
                                    if (e.target.value === "__custom__") {
                                        setFormData({ ...formData, titlePreset: "__custom__", title: "" });
                                    } else {
                                        setFormData({ ...formData, titlePreset: e.target.value, title: e.target.value });
                                    }
                                }}
                                className={`${inputClass} appearance-none cursor-pointer pr-12`}
                            >
                                <option value="">Select a title...</option>
                                {EVENT_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                                <option value="__custom__">✏️ Type my own title...</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {(formData.titlePreset === "__custom__" || (!EVENT_TITLES.includes(formData.title) && formData.title)) && (
                            <input
                                type="text"
                                placeholder="Type your event title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={`${inputClass} mt-2`}
                                required
                                autoFocus
                            />
                        )}
                    </div>

                    {/* Event Category with chevron */}
                    <div>
                        <label className={labelClass}>Event Category</label>
                        <div className="relative">
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className={`${inputClass} appearance-none cursor-pointer pr-12`}
                            >
                                <option value="Adoption">🐾 Adoption</option>
                                <option value="Volunteer">🤝 Volunteer</option>
                                <option value="Fundraiser">💛 Fundraiser</option>
                                <option value="Workshop">📚 Workshop</option>
                                <option value="Community">🏘️ Community</option>
                            </select>
                            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea placeholder="Event details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" className={`${inputClass} resize-none leading-relaxed`} required />
                    </div>

                    {/* Location & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Location</label>
                            <input type="text" placeholder="Venue Name" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Time Slot</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="time"
                                    value={formData.timeStart || ""}
                                    onChange={(e) => {
                                        const start = e.target.value;
                                        const end = formData.timeEnd || "";
                                        setFormData({
                                            ...formData,
                                            timeStart: start,
                                            time: formatTimeSlot(start, end),
                                        });
                                    }}
                                    className={`${inputClass} flex-1`}
                                    required
                                />
                                <span className="text-slate-400 font-bold text-sm flex-shrink-0">–</span>
                                <input
                                    type="time"
                                    value={formData.timeEnd || ""}
                                    onChange={(e) => {
                                        const end = e.target.value;
                                        const start = formData.timeStart || "";
                                        setFormData({
                                            ...formData,
                                            timeEnd: end,
                                            time: formatTimeSlot(start, end),
                                        });
                                    }}
                                    className={`${inputClass} flex-1`}
                                    required
                                />
                            </div>
                            {formData.time && (
                                <p className="text-xs text-blue-500 font-semibold mt-2 ml-1">{formData.time}</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={saving} className="w-full bg-[#1A56FF] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                            {saving ? "Saving..." : event ? "Save Changes" : "Publish Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function EventsManagement() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [registrations, setRegistrations] = useState({});
    const [openRegs, setOpenRegs] = useState({});

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "registrations"), (snap) => {
            const map = {};
            snap.docs.forEach(d => {
                const r = { id: d.id, ...d.data() };
                if (!map[r.eventId]) map[r.eventId] = [];
                map[r.eventId].push(r);
            });
            setRegistrations(map);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, EVENTS_COLLECTION), (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setEvents(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleSave = async (eventData) => {
        setSaving(true);
        try {
            const { id, ...data } = eventData;
            data.updatedAt = serverTimestamp();
            if (editingEvent) {
                await updateDoc(doc(db, EVENTS_COLLECTION, id), data);
            } else {
                data.createdAt = serverTimestamp();
                await addDoc(collection(db, EVENTS_COLLECTION), data);
            }
            setShowModal(false);
            setEditingEvent(null);
        } catch (err) {
            alert("Error saving event: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this event?")) {
            await deleteDoc(doc(db, EVENTS_COLLECTION, id));
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <header className="bg-white px-8 py-6 flex flex-col items-center border-b border-slate-100 sticky top-0 z-40">
                <img src={logo} alt="Logo" className="h-10 w-auto mb-6" />
                <div className="flex gap-3">
                    <button onClick={() => navigate('/cats-management')} className="bg-white text-slate-500 border border-slate-100 px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <item size={18} /> Cats Management
                    </button>
                    <button className="bg-[#1A56FF] text-white px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-100 transition-all" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <Calendar size={18} /> Events Management
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-10">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-slate-400 font-medium">Loading events...</p>
                    </div>
                ) : (
                <div>
                <div className="grid grid-cols-3 gap-6 mb-10">
                    {[
                        { label: "Total Events", val: events.length, icon: <Calendar size={22} />, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Adoption Events", val: events.filter(e => e.type === "Adoption").length, icon: <PawPrint size={22} />, color: "text-emerald-500", bg: "bg-emerald-50" },
                        { label: "Volunteer Events", val: events.filter(e => e.type === "Volunteer").length, icon: <Users size={22} />, color: "text-blue-500", bg: "bg-blue-50" }
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-5`}>{s.icon}</div>
                            <p className="text-4xl font-black text-slate-800 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.val}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-10 flex justify-between items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input type="text" placeholder="Search events..." className="w-full bg-[#F8FAFC] border-none rounded-2xl py-4.5 pl-16 pr-6 text-sm font-bold outline-none" style={{ fontFamily: "'DM Sans', sans-serif" }} value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button onClick={() => { setEditingEvent(null); setShowModal(true); }} className="bg-[#1A56FF] text-white px-10 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <Plus size={22} /> Add New Event
                    </button>
                </div>

                <div className="space-y-6">
                    {events.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).map((event) => (
                        <div key={event.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm flex group hover:shadow-lg transition-all duration-300">
                            {/* Blue gradient date sidebar */}
                            <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-700 w-28 flex flex-col items-center justify-center text-white py-8 px-4">
                                <p className="text-4xl font-black leading-none mb-1">{event.day}</p>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80">{event.month}</p>
                            </div>

                            {/* Event content */}
                            <div className="flex-1 p-8">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{event.title}</h3>
                                    <EventTypeBadge type={event.type} />
                                </div>
                                <p className="text-sm font-medium text-slate-400 leading-relaxed mb-4">{event.description}</p>
                                <div className="flex gap-8 mb-4">
                                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400"><MapPin size={16} className="text-slate-200" /> {event.location}</div>
                                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400"><Clock size={16} className="text-slate-200" /> {event.time}</div>
                                </div>

                                {/* Registrants dropdown */}
                                <div className="mb-4">
                                    <button
                                        onClick={() => setOpenRegs(prev => ({ ...prev, [event.id]: !prev[event.id] }))}
                                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"
                                    >
                                        <Users size={14} />
                                        {(registrations[event.id] || []).length} Registrant{(registrations[event.id] || []).length !== 1 ? "s" : ""}
                                        <ChevronDown size={14} className={`transition-transform ${openRegs[event.id] ? "rotate-180" : ""}`} />
                                    </button>

                                    {openRegs[event.id] && (
                                        <div className="mt-3 border border-slate-100 rounded-2xl overflow-hidden">
                                            {(registrations[event.id] || []).length === 0 ? (
                                                <p className="text-xs text-slate-400 text-center py-4">No registrants yet.</p>
                                            ) : (
                                                <table className="w-full text-xs">
                                                    <thead className="bg-slate-50">
                                                        <tr>
                                                            <th className="text-left px-4 py-2 text-slate-500 font-bold uppercase tracking-wide">Name</th>
                                                            <th className="text-left px-4 py-2 text-slate-500 font-bold uppercase tracking-wide">Email</th>
                                                            <th className="text-left px-4 py-2 text-slate-500 font-bold uppercase tracking-wide">Phone</th>
                                                            <th className="text-left px-4 py-2 text-slate-500 font-bold uppercase tracking-wide">Attendees</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(registrations[event.id] || []).map((r, i) => (
                                                            <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                                                <td className="px-4 py-2.5 font-medium text-slate-700">{r.name}</td>
                                                                <td className="px-4 py-2.5 text-slate-500">{r.email}</td>
                                                                <td className="px-4 py-2.5 text-slate-500">{r.phone}</td>
                                                                <td className="px-4 py-2.5 text-slate-500">{r.attendees}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    <button onClick={() => { setEditingEvent(event); setShowModal(true); }} className="px-6 py-2.5 rounded-xl bg-blue-50 text-[#1A56FF] text-[11px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-blue-100 transition-colors"><Edit2 size={14} /> Edit</button>
                                    <button onClick={() => handleDelete(event.id)} className="px-6 py-2.5 rounded-xl bg-rose-50 text-rose-500 text-[11px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-rose-100 transition-colors"><Trash2 size={14} /> Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
                )}
            </main>
            {showModal && <EventModal event={editingEvent} onClose={() => { setShowModal(false); setEditingEvent(null); }} onSave={handleSave} saving={saving} />}
        </div>
    );
}