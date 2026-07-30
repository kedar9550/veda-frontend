import React, { useState } from 'react';

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

/**
 * Parse hash → { page, subPage, subSubPage }
 * #events/krishi/agro-innovate → { page:'events', subPage:'krishi', subSubPage:'agro-innovate' }
 */
function parseHash(hash) {
  const raw = hash.replace('#', '') || 'home';
  const [page = 'home', subPage = null, subSubPage = null] = raw.split('/');
  return { page, subPage, subSubPage };
}

export default function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  React.useEffect(() => {
    const handleHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.page, route.subPage, route.subSubPage]);

  const navigateTo = (page) => { window.location.hash = page; };

  const { page, subPage, subSubPage } = route;

  const renderPage = () => {
    if (page === 'home') return <Home />;
    if (page === 'about') return <AboutPage />;
    if (page === 'team') return <Team />;
    if (page === 'poster') return <Poster />;
    if (page === 'contact') return <Contact />;
    if (page === 'dashboard') return <StudentDashboard onNavigate={navigateTo} />;

    if (page === 'register') {
      return (
        <RegisterForm schoolId={subPage} eventId={subSubPage} onCancel={() => { window.location.hash = `events/${subPage}/${subSubPage}`; }} />
      );
    }

    if (page === 'events') {
      // Level 3: single event detail (#events/krishi/agro-innovate)
      if (subPage && subSubPage) {
        return (
          <EventSingleDetail
            schoolId={subPage}
            eventId={subSubPage}
            onBack={() => { window.location.hash = `events/${subPage}`; }}
            onBackToSchool={() => { window.location.hash = 'events'; }}
          />
        );
      }
        // Registration page (#register/krishi/agro-innovate)
        if (page === 'register') {
          return (
            <RegisterForm schoolId={subPage} eventId={subSubPage} onCancel={() => { window.location.hash = `events/${subPage}/${subSubPage}`; }} />
          );
        }
      // Level 2: school event list (#events/krishi)
      if (subPage) {
        return (
          <EventDetail
            schoolId={subPage}
            onBack={() => { window.location.hash = 'events'; }}
          />
        );
      }
      // Level 1: all schools (#events)
      return <Events />;
    }

    return <Contact />;
  };

  return (
    <>
      <div className="noise-overlay" />
      <Cursor />

      {!loadingComplete && <Loader onComplete={() => setLoadingComplete(true)} />}

      {loadingComplete && (
        <div style={{ animation: 'fadeIn 0.8s ease' }}>
          <Navbar activePage={page} onNavigate={navigateTo} />
          <main style={{ minHeight: '80vh' }}>
            {renderPage()}
          </main>
          <Footer onNavigate={navigateTo} />
        </div>
      )}
    </>
  );
}