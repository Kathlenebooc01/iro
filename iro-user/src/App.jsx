import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/navbar.jsx";
import Home from "./pages/home.jsx";
import Adopt from "./pages/adopt.jsx";
import Events from "./pages/events.jsx";
import AboutUs from "./pages/aboutus.jsx";
import Contact from "./pages/contact.jsx";
import Donate from "./pages/donate.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  if (authLoading) return null; // wait for auth to resolve before rendering

  return (
    <BrowserRouter>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/events" element={<Events />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
