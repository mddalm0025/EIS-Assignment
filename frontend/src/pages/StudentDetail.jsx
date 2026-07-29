import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentDetail } from '../services/api';

function StudentDetail() {
  const { admissionNo } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStudentDetail(admissionNo);
        setStudent(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load student details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [admissionNo]);

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Students List
      </button>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading student details...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <p>{error}</p>
          <button className="nav-tab active" style={{ marginTop: '1rem', border: 'none' }} onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : student ? (
        <div className="animate-fade-in">
          <div className="detail-header">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>STUDENT PROFILE</span>
            <h2 className="detail-title">{student.name}</h2>
            <div className="detail-meta">
              <div className="detail-meta-item">
                <strong>Adm No:</strong> <span className="badge badge-class">{student.admission_no}</span>
              </div>
              <div className="detail-meta-item">
                <strong>Class:</strong> <span className="badge badge-class">{student.class}</span>
              </div>
              <div className="detail-meta-item">
                <strong>Section:</strong> <span className="badge badge-section">{student.section}</span>
              </div>
              <div className="detail-meta-item">
                <strong>DOB:</strong> <span>{student.dob}</span>
              </div>
            </div>
          </div>

          <div className="grid-2col">
            {/* Subject Wise Marks Card */}
            <div className="card">
              <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Subject-wise Marks</h3>
              <div className="marks-list">
                {student.marks && student.marks.map(({ subject, marks }) => (
                  <div key={subject} className="mark-item">
                    <span className="mark-subject">{subject}</span>
                    <div className="mark-score-wrapper">
                      {marks === null ? (
                        <span className="mark-absent">Absent</span>
                      ) : (
                        <>
                          <span className="mark-score">{marks}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ 100</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Performance Widgets */}
            <div className="summary-widget">
              <div className="stat-box">
                <span className="stat-label">Total Marks Obtained</span>
                <div className="stat-value">{student.total}</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Excludes absent subjects</p>
              </div>

              <div className="stat-box" style={{ borderTop: '4px solid var(--primary)' }}>
                <span className="stat-label">Calculated Average</span>
                <div className="stat-value">{student.average}%</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Mean of exams attended</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default StudentDetail;
