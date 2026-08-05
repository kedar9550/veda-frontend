import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';

import Loader from './components/Loader/Loader';
import Cursor from './components/Cursor/Cursor';
import Navbar from './components/navbar/Navbar';
import Home from './components/Home/Home';
import Events from './components/Events/Events';
import EventDetail from './components/Events/EventDetail';
import EventSingleDetail from './components/Events/EventSingleDetail';
import RegisterForm from './components/Events/RegisterForm';
import Team from './components/Team/Team';
import Contact from './components/Contact/Contact';
import AboutPage from './components/About/AboutPage';
import Poster from './components/Poster/Poster';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import Footer from './components/Footer/Footer';
import LoginPage from './components/Login/LoginPage';

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
      <div className="noise-overlay" />
      <Cursor />

      {!loadingComplete && <Loader onComplete={() => setLoadingComplete(true)} />}

      {loadingComplete && (
        <div style={{ animation: 'fadeIn 0.8s ease' }}>
          <Navbar activePage={activePage} onNavigate={navigateTo} />
          <main style={{ minHeight: '80vh' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/team" element={<Team />} />
              <Route path="/poster" element={<Poster />} />
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
        </div>
      )}
    </>
  );
}