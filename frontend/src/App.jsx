import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Summary from './pages/Summary';

function Header() {
  const location = useLocation();
  // Active if we are on root or on a student detail page
  const isSummaryActive = location.pathname === '/summary';

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-logo">E</div>
        <div>
          <h1 className="brand-title">EIS School Platform</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Class 6 Cohort Performance Dashboard</p>
        </div>
      </div>
      <div className="nav-tabs">
        <Link 
          to="/" 
          className={`nav-tab ${!isSummaryActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          Students Directory
        </Link>
        <Link 
          to="/summary" 
          className={`nav-tab ${isSummaryActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          Class Summary & Stats
        </Link>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        
        <main className="animate-fade-in">
          <Routes>
            <Route path="/" element={<Students />} />
            <Route path="/students/:admissionNo" element={<StudentDetail />} />
            <Route path="/summary" element={<Summary />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
