import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AnimatedBackground from './components/AnimatedBackground';

// Phase 1 pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HospitalsPage from './pages/HospitalsPage';
import HospitalDetailPage from './pages/HospitalDetailPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import HowItWorksPage from './pages/HowItWorksPage';

// Phase 2 — Patient experience
import PatientDashboard from './pages/patient/PatientDashboard';
import SearchResults from './pages/patient/SearchResults';
import BookingPage from './pages/patient/BookingPage';
import TokenCard from './pages/patient/TokenCard';
import AppointmentsPage from './pages/patient/AppointmentsPage';

// Phase 3 — Doctor & Chemist operations
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ConsultationHub from './pages/doctor/ConsultationHub';
import ChemistDashboard from './pages/chemist/ChemistDashboard';

// Hospital Dashboard
import HospitalDashboard from './pages/HospitalDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedBackground />
      <Routes>
        {/* ── Phase 1 ─────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/hospitals" element={<HospitalsPage />} />
        <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />

        {/* ── Phase 2 — Patient ────────────────────── */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/search" element={<SearchResults />} />
        <Route path="/patient/book/:doctorId" element={<BookingPage />} />
        <Route path="/patient/token" element={<TokenCard />} />
        <Route path="/patient/appointments" element={<AppointmentsPage />} />

        {/* ── Phase 3 — Doctor ─────────────────────── */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/consultation/:tokenId" element={<ConsultationHub />} />

        {/* ── Phase 3 — Chemist ────────────────────── */}
        <Route path="/chemist/dashboard" element={<ChemistDashboard />} />

        {/* ── Hospital Dashboard ────────────────────── */}
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
