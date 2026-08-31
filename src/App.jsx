import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';

import { Toaster } from 'sonner';
import Loader from './components/Loader/Loader';
import Cursor from './components/Cursor/Cursor';
import Navbar from './components/navbar/Navbar';
import MobileNav from './components/navbar/MobileNav';
import Home from './components/Home/Home';
import Events from './components/Events/Events';
import EventDetail from './components/Events/EventDetail';
import EventSingleDetail from './components/Events/EventSingleDetail';
import RegisterForm from './components/Events/RegisterForm';
import Team from './components/Team/Team';
import Contact from './components/Contact/Contact';
import AboutPage from './components/About/AboutPage';
import Gallery from './components/Gallery/Gallery';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import Footer from './components/Footer/Footer';
import LoginPage from './components/Login/LoginPage';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';
import RightStrip from './components/common/RightStrip';

function RegisterFormWrapper() {
  const { schoolId, eventId } = useParams();
  const navigate = useNavigate();
  return (
    <RegisterForm
      schoolId={schoolId}
      eventId={eventId}
      onCancel={() => navigate(`/events/${schoolId}/${eventId}`)}
    />
  );
}

function EventSingleDetailWrapper() {
  const { schoolId, eventId } = useParams();
  return <EventSingleDetail schoolId={schoolId} eventId={eventId} />;
}

function EventDetailWrapper() {
  const { schoolId } = useParams();
  return <EventDetail schoolId={schoolId} />;
}

export default function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navigateTo = (page) => {
    navigate(page === 'home' ? '/' : `/${page}`);
  };

  const getActivePage = () => {
    const path = location.pathname.replace(/^\//, '') || 'home';
    return path.split('/')[0];
  };

  const activePage = getActivePage();

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="noise-overlay" />
      <Cursor />

      {/* 1. Fixed Loader curtain on top */}
      {!loadingComplete && <Loader onComplete={() => setLoadingComplete(true)} />}

      {/* 2. Main page content rendered in background */}
      <Navbar activePage={activePage} onNavigate={navigateTo} />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home loadingComplete={loadingComplete} />} />
          <Route path="/home" element={<Home loadingComplete={loadingComplete} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/team" element={<Team />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/register/:schoolId/:eventId" element={<RegisterFormWrapper />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:schoolId" element={<EventDetailWrapper />} />
          <Route path="/events/:schoolId/:eventId" element={<EventSingleDetailWrapper />} />
          <Route path="*" element={<Contact />} />
        </Routes>
      </main>
      <Footer onNavigate={navigateTo} />
      <MobileNav activePage={activePage} onNavigate={navigateTo} />
      
      {/* Global Floating AI Chatbot */}
      <ChatbotWidget />

      {/* Global Right Strip */}
      <RightStrip />
    </>
  );
}