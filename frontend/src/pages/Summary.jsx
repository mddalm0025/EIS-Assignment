import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSummary } from '../services/api';

function Summary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSummary();
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load class statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="animate-fade-in">
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <p>{error}</p>
          <button className="nav-tab active" style={{ marginTop: '1rem', border: 'none' }} onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : summary ? (
        <div className="animate-fade-in">
          <div className="summary-grid">
            {/* Top Performer Card */}
            <div className="card top-student-card">
              <div className="stats-card-header">
                <span className="stats-card-title">Top Academic Performer</span>
                <span style={{ fontSize: '1.25rem' }}>👑</span>
              </div>
              {summary.top_student ? (
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/students/${summary.top_student.admission_no}`)}
                  title="Click to view details"
                >
                  <h2 className="top-student-name">{summary.top_student.name}</h2>
                  <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Admission No: {summary.top_student.admission_no}</span>
                  
                  <div className="top-student-details">
                    <div className="top-student-stat">
                      <strong>Total:</strong> {summary.top_student.total}
                    </div>
                  </div>
                </div>
              ) : (
                <p>No performer data available</p>
              )}
            </div>

            {/* High Level Metrics */}
            <div className="card stats-card">
              <div className="stats-card-header">
                <span className="stats-card-title">Cohort Size</span>
                <span style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>👥</span>
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>47</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                24 students in 6-A | 23 students in 6-B
              </p>
            </div>
          </div>

          {/* Subject-Wise Performance Breakdown */}
          <div className="card averages-card">
            <h3 className="averages-card-title">Class Average per Subject</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {summary.subject_averages && Object.entries(summary.subject_averages).map(([subject, avg]) => (
                <div key={subject} className="average-row">
                  <span className="average-subject">{subject}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '60%' }}>
                    {/* Visual performance bar */}
                    <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${avg}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                    <span className="average-value">{avg}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Summary;
