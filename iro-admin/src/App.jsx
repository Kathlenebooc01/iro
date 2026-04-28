import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CatsManagement from "./pages/CatsManagement";
import EventsManagement from "./pages/EventsManagement";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Update these paths to match your new files */}
        <Route path="/cats-management" element={<CatsManagement />} />
        <Route path="/events-management" element={<EventsManagement />} />

        {/* Redirect the old dashboard path to one of your new pages */}
        <Route path="/dashboard" element={<Navigate to="/cats-management" />} />
        <Route path="*" element={<Navigate to="/cats-management" />} />
      </Routes>
    </BrowserRouter>
  );
}