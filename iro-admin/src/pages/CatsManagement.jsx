import { useState, useEffect } from "react";
import {
    PawPrint, Plus, Edit2, Trash2, Activity,
    ShieldCheck, Search, Calendar, Home, Upload, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/iro-logo.png";
import { db } from "../firebase";
import {
    collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from "firebase/firestore";

const CATS_COLLECTION = "cats";


function StatusBadge({ status }) {
    const map = {
        "Ready to Adopt": "bg-[#E6F9F1] text-[#00B67A] border-[#D1F2E5]",
        "In Rehabilitation": "bg-[#FFF9E6] text-[#FFBB00] border-[#FFF1CC]",
        "Ongoing Care": "bg-[#E6F4FF] text-[#0085FF] border-[#CCE9FF]",
        "Adopted": "bg-slate-100 text-slate-600 border-slate-200",
    };
    return <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${map[status] || "bg-slate-100"}`}>{status}</span>;
}

function ImageUploader({ onImageChange, currentImage }) {
    const [preview, setPreview] = useState(currentImage || "");
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;

        // Show local preview immediately
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "irocattery");

            const res = await fetch("https://api.cloudinary.com/v1_1/ddksarrsd/image/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                setPreview(data.secure_url);
                onImageChange(data.secure_url);
            } else {
                alert("Upload failed: " + (data.error?.message || "Unknown error"));
            }
        } catch (err) {
            alert("Upload error: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div
                className="relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors border-slate-300 bg-slate-50 hover:border-blue-400"
                onClick={() => document.getElementById('fileInput').click()}
            >
                <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    onChange={(e) => handleFile(e.target.files[0])}
                    className="hidden"
                />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Uploading...</p>
                    </div>
                ) : preview ? (
                    <div className="relative group">
                        <img src={preview} alt="Cat preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-sm font-medium">Click to change</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <Upload size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                            Drop your image here, or <span className="text-blue-600 font-semibold">browse</span>
                        </p>
                        <p className="text-xs text-slate-500">Supports: JPG, PNG, GIF (Max 5MB)</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function CatFormModal({ cat, onClose, onSave, saving }) {
    // Parse existing age string like "2 yrs" or "3 months" back into parts
    const parseAge = (ageStr = "") => {
        const match = ageStr.match(/^(\d+)\s*(yr|yrs|year|years|month|months|mo)$/i);
        if (match) {
            const unit = match[2].toLowerCase().startsWith("m") ? "months" : "years";
            return { ageNum: match[1], ageUnit: unit };
        }
        return { ageNum: "", ageUnit: "years" };
    };

    const { ageNum: initNum, ageUnit: initUnit } = parseAge(cat?.age);

    const [formData, setFormData] = useState(cat || {
        name: "", age: "", gender: "Female", breed: "Mixed Breed", status: "In Rehabilitation",
        story: "", medicalNeeds: "", color: "", personality: "", condition: "",
        vaccinated: false, dewormed: false, spayedNeutered: false, microchipped: false, fleaTreatment: false,
        lastVetVisit: "", img: ""
    });
    const [ageNum, setAgeNum]   = useState(initNum || "");
    const [ageUnit, setAgeUnit] = useState(initUnit || "years");

    const updateAge = (num, unit) => {
        setAgeNum(num);
        setAgeUnit(unit);
        if (num) setFormData(f => ({ ...f, age: `${num} ${unit}` }));
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-medium focus:border-blue-500 transition-colors placeholder:text-slate-300 text-slate-700";
    const labelClass = "text-[11px] font-bold text-slate-800 uppercase tracking-widest mb-2 block";
    const checkboxLabelClass = "flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700";

    const CONDITIONS = [
        "Healthy (No condition)",
        "Three-legged", "One-eyed", "Deaf", "Blind", "FIV Positive",
        "Cerebellar Hypoplasia", "Limb difference", "Paralyzed (hind legs)",
        "Chronic illness", "Skin condition", "Neurological condition", "Other",
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-12 relative my-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

                <h2 className="text-2xl font-black text-slate-900 mb-10">{cat ? "Edit Cat Details" : "Add New Cat"}</h2>

                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Name</label>
                            <input type="text" placeholder="e.g., Mochi" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Breed</label>
                            <select value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} className={inputClass}>
                                <option>Mixed Breed</option>
                                <option>Domestic Shorthair</option>
                                <option>Domestic Longhair</option>
                                <option>Tabby</option>
                                <option>Siamese</option>
                                <option>Persian</option>
                                <option>Maine Coon</option>
                                <option>Ragdoll</option>
                                <option>Bengal</option>
                                <option>British Shorthair</option>
                                <option>Scottish Fold</option>
                                <option>Abyssinian</option>
                                <option>Burmese</option>
                                <option>Russian Blue</option>
                                <option>Sphynx</option>
                                <option>Norwegian Forest Cat</option>
                                <option>Birman</option>
                                <option>Tonkinese</option>
                                <option>Himalayan</option>
                                <option>American Shorthair</option>
                                <option>Oriental Shorthair</option>
                                <option>Devon Rex</option>
                                <option>Cornish Rex</option>
                                <option>Manx</option>
                                <option>Turkish Angora</option>
                                <option>Savannah</option>
                                <option>Unknown</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Age</label>
                            <div className="flex gap-2">
                                <select
                                    value={ageNum}
                                    onChange={(e) => updateAge(e.target.value, ageUnit)}
                                    className={`${inputClass} flex-1`}
                                    required
                                >
                                    <option value="">Age</option>
                                    {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                                <select
                                    value={ageUnit}
                                    onChange={(e) => updateAge(ageNum, e.target.value)}
                                    className={`${inputClass} flex-1`}
                                >
                                    <option value="months">months</option>
                                    <option value="years">years</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Gender</label>
                            <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className={inputClass}>
                                <option>Female</option>
                                <option>Male</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                                <option>Ready to Adopt</option>
                                <option>In Rehabilitation</option>
                                <option>Ongoing Care</option>
                                <option>Adopted</option>
                                <option>Foster Care</option>
                                <option>Medical Hold</option>
                                <option>Quarantine</option>
                                <option>Pending Adoption</option>
                                <option>Sponsored</option>
                                <option>Sanctuary (Permanent Resident)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Condition</label>
                            <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className={inputClass} required>
                                <option value="">Select condition...</option>
                                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Color</label>
                        <input type="text" placeholder="e.g., Orange tabby" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Personality</label>
                        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] min-h-[48px]">
                            {[
                                "Playful","Curious","Affectionate","Gentle","Calm","Shy","Bold",
                                "Adventurous","Loving","Independent","Social","Quiet","Energetic",
                                "Mischievous","Loyal","Friendly","Timid","Confident","Sweet",
                                "Regal","Chatty","Lazy","Cuddly","Protective","Silly",
                            ].map((trait) => {
                                const selected = (formData.personality || "").split(",").map(s => s.trim()).filter(Boolean).includes(trait);
                                return (
                                    <button
                                        key={trait}
                                        type="button"
                                        onClick={() => {
                                            const current = (formData.personality || "").split(",").map(s => s.trim()).filter(Boolean);
                                            const updated = selected
                                                ? current.filter(t => t !== trait)
                                                : [...current, trait];
                                            setFormData({ ...formData, personality: updated.join(", ") });
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                            selected
                                                ? "bg-[#1A56FF] text-white border-[#1A56FF]"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                                        }`}
                                    >
                                        {trait}
                                    </button>
                                );
                            })}
                        </div>
                        {formData.personality && (
                            <p className="text-xs text-blue-500 font-medium mt-2 ml-1">Selected: {formData.personality}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Their Story</label>
                        <textarea placeholder="Tell the cat's story..." value={formData.story} onChange={(e) => setFormData({ ...formData, story: e.target.value })} rows="5" className={`${inputClass} resize-none`} required />
                    </div>

                    <div className="border-t border-slate-100 pt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="text-blue-600" size={18} />
                            <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Medical Records & Vaccinations</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                            <label className={checkboxLabelClass}>
                                <input type="checkbox" checked={formData.vaccinated} onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                                Vaccinated (FVRCP, Rabies)
                            </label>
                            <label className={checkboxLabelClass}>
                                <input type="checkbox" checked={formData.microchipped} onChange={(e) => setFormData({ ...formData, microchipped: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                                Microchipped
                            </label>
                            <label className={checkboxLabelClass}>
                                <input type="checkbox" checked={formData.dewormed} onChange={(e) => setFormData({ ...formData, dewormed: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                                Dewormed
                            </label>
                            <label className={checkboxLabelClass}>
                                <input type="checkbox" checked={formData.fleaTreatment} onChange={(e) => setFormData({ ...formData, fleaTreatment: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                                Flea/Tick Treatment
                            </label>
                            <label className={checkboxLabelClass}>
                                <input type="checkbox" checked={formData.spayedNeutered} onChange={(e) => setFormData({ ...formData, spayedNeutered: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                                Spayed/Neutered
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Last Vet Visit</label>
                        <input type="date" value={formData.lastVetVisit} onChange={(e) => setFormData({ ...formData, lastVetVisit: e.target.value })} className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Cat Photo</label>
                        <ImageUploader onImageChange={(img) => setFormData({ ...formData, img })} currentImage={formData.img} />
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <button type="submit" disabled={saving} className="flex-1 bg-[#1A56FF] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                            {saving ? "Saving..." : cat ? "Save Changes" : "Add Cat"}
                        </button>
                        <button type="button" onClick={onClose} className="px-10 py-4 rounded-xl font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CatsManagement() {
    const navigate = useNavigate();
    const [cats, setCats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [showModal, setShowModal] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [saving, setSaving] = useState(false);

    // Real-time listener from Firestore
    useEffect(() => {
        const unsub = onSnapshot(collection(db, CATS_COLLECTION), (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setCats(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }, []);

    const handleSave = async (catData) => {
        setSaving(true);
        try {
            const { id, ...data } = catData;
            if (!data.img) data.img = "";
            data.updatedAt = serverTimestamp();
            if (editingCat) {
                await updateDoc(doc(db, CATS_COLLECTION, id), data);
            } else {
                data.createdAt = serverTimestamp();
                await addDoc(collection(db, CATS_COLLECTION), data);
            }
            setEditingCat(null);
            setShowModal(false);
        } catch (err) {
            alert("Error saving cat: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this cat profile?")) {
            await deleteDoc(doc(db, CATS_COLLECTION, id));
        }
    };

    const filteredCats = cats.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All Status" || cat.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const counts = {
        total: cats.length,
        ready: cats.filter(c => c.status === "Ready to Adopt").length,
        rehab: cats.filter(c => c.status === "In Rehabilitation").length,
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <header className="bg-white px-8 py-5 flex flex-col items-center border-b border-slate-100 sticky top-0 z-40">
                <img src={logo} alt="Logo" className="h-10 w-auto mb-5" />
                <div className="flex gap-3">
                    <button className="bg-[#1A56FF] text-white px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-blue-100">
                        <PawPrint size={18} /> Cats Management
                    </button>
                    <button onClick={() => navigate('/events-management')} className="bg-white text-slate-500 border border-slate-100 px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 hover:bg-slate-50 transition-all">
                        <Calendar size={18} /> Events Management
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-10">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-slate-400 font-medium">Loading cats...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-4 gap-6 mb-10">
                            {[
                                { label: 'Total Cats', count: counts.total, icon: <PawPrint size={22} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Ready to Adopt', count: counts.ready, icon: <Home size={22} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { label: 'In Rehabilitation', count: counts.rehab, icon: <Activity size={22} />, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { label: 'Ongoing Care', count: counts.total - counts.ready - counts.rehab, icon: <Clock size={22} />, color: 'text-amber-500', bg: 'bg-amber-50' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-5`}>{stat.icon}</div>
                                    <p className="text-4xl font-black text-slate-800 tracking-tight">{stat.count}</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-10 flex justify-between items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input type="text" placeholder="Search cats..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#F8FAFC] border-none rounded-2xl py-4.5 pl-16 pr-6 text-sm font-medium outline-none" />
                            </div>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#F8FAFC] border-none rounded-2xl py-4.5 px-8 text-sm font-bold text-slate-600 outline-none">
                                <option>All Status</option>
                                <option>Ready to Adopt</option>
                                <option>In Rehabilitation</option>
                                <option>Ongoing Care</option>
                            </select>
                            <button onClick={() => { setEditingCat(null); setShowModal(true); }} className="bg-[#1A56FF] text-white px-10 py-4.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform">
                                <Plus size={22} /> Add New Cat
                            </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            {filteredCats.map((cat) => (
                                <div key={cat.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-300">
                                    <div className="relative overflow-hidden aspect-[4/5]">
                                        <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    </div>
                                    <div className="p-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-2xl font-black text-slate-800">{cat.name}</h3>
                                            <StatusBadge status={cat.status} />
                                        </div>
                                        <p className="text-sm font-bold mb-4" style={{ color: '#1A56FF' }}>{cat.condition} · {cat.age}</p>
                                        <p className="text-sm font-medium text-slate-400 leading-relaxed line-clamp-2 mb-8">{cat.story}</p>
                                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                            <button onClick={() => { setEditingCat(cat); setShowModal(true); }} className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-[#F0F4FF] text-[#1A56FF] flex items-center justify-center gap-2.5 hover:bg-blue-100 transition-colors">
                                                <Edit2 size={14} /> Edit Profile
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-500 flex items-center justify-center gap-2.5 hover:bg-rose-100 transition-colors">
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {showModal && <CatFormModal cat={editingCat} onClose={() => { setShowModal(false); setEditingCat(null); }} onSave={handleSave} saving={saving} />}
        </div>
    );
}