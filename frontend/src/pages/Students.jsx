import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../services/api';

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStudents(search);
        setStudents(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch students. Please check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [search]);

  return (
    <div className="animate-fade-in">
      <div className="controls-row">
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search students by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && students.length === 0 ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading students directory...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <p>{error}</p>
          <button className="nav-tab active" style={{ marginTop: '1rem', border: 'none' }} onClick={() => setSearch(search)}>Retry</button>
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No students found matching "{search}"</p>
        </div>
      ) : (
        <div className="table-responsive card" style={{ padding: 0 }}>
          <table className="students-table">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Date of Birth</th>
                <th>Average Mark</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.admission_no} onClick={() => navigate(`/students/${student.admission_no}`)}>
                  <td><span style={{ fontWeight: 600 }}>{student.admission_no}</span></td>
                  <td><span className="student-name-cell">{student.name}</span></td>
                  <td><span className="badge badge-class">{student.class}</span></td>
                  <td><span className="badge badge-section">{student.section}</span></td>
                  <td>{student.dob}</td>
                  <td>
                    <span className={`badge badge-avg ${student.average >= 75 ? 'good' : student.average < 50 ? 'critical' : ''}`}>
                      {student.average}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Students;
