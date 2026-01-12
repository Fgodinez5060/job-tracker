import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'to_apply',
    salary_range: '',
    job_url: '',
    notes: ''
  });

  // Handles application to be edited and new selection
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  // Fetch applications when component loads
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('https://job-tracker-production-fecf.up.railway.app/api/applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://job-tracker-production-fecf.up.railway.app/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Clear form
        setFormData({
          company: '',
          position: '',
          status: 'to_apply',
          salary_range: '',
          job_url: '',
          notes: ''
        });
        
        // Refresh the list
        fetchApplications();
      }
    } catch (error) {
      console.error('Error creating application:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://job-tracker-production-fecf.up.railway.app/api/applications/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
	fetchApplications();
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const app = applications.find(a => a.id === id);

      const response = await fetch(`https://job-tracker-production-fecf.up.railway.app/api/applications/${id}`, {
	method: 'PUT',
	headers: {
	  'Content-Type': 'application/json',
	},
	body: JSON.stringify({
	  company: app.company,
	  position: app.position,
	  status: editStatus,
	  date_applied: app.date_applied,
	  salary_range: app.salary_range,
	  job_url: app.job_url,
	  notes: app.notes
	})
      });

      if (response.ok) {
	setEditingId(null);
	fetchApplications();
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  return (
    <div className="App">
      <h1>Job Application Tracker</h1>
      
      <div className="form-section">
        <h2>Add New Application</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="company"
            placeholder="Company"
            value={formData.company}
            onChange={handleChange}
            required
          />
          
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={formData.position}
            onChange={handleChange}
            required
          />
          
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="to_apply">To Apply</option>
            <option value="applied">Applied</option>
            <option value="phone_screen">Phone Screen</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <input
            type="text"
            name="salary_range"
            placeholder="Salary Range (e.g. $80k-$100k)"
            value={formData.salary_range}
            onChange={handleChange}
          />
          
          <input
            type="url"
            name="job_url"
            placeholder="Job URL"
            value={formData.job_url}
            onChange={handleChange}
          />
          
          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          />
          
          <button type="submit">Add Application</button>
        </form>
      </div>

      <div className="applications-section">
        <h2>My Applications ({applications.length})</h2>
        
        {applications.length === 0 ? (
          <p>No applications yet. Add one above!</p>
        ) : (
          <div className="applications-list">
            {applications.map(app => (
              <div key={app.id} className="application-card">
                <h3>{app.company}</h3>
                <p className="position">{app.position}</p>
                <p className="status">Status: {app.status}</p>
                {app.salary_range && <p>Salary: {app.salary_range}</p>}
                {app.job_url && (
                  <a href={app.job_url} target="_blank" rel="noopener noreferrer">
                    View Job Posting
                  </a>
                )}
                {app.notes && <p className="notes">{app.notes}</p>}

		<div className="card-actions">
		  {editingId === app.id ? (
		    <>
		      <select
			value={editStatus}
			onChange={(e) => setEditStatus(e.target.value)}
			className="status-select"
		      >
			<option value="to_apply">To Apply</option>
			<option value="applied">Applied</option>
			<option value="phone_screen">Phone Screen</option>
			<option value="interview">Interview</option>
			<option value="offer">Offer</option>
			<option value="rejected">Rejected</option>
		      </select>
		      <button onClick={() => handleUpdate(app.id)} className="save-btn">
			Save
		      </button>
		      <button onClick={() => setEditingId(null)} className="cancel-btn">
			Cancel
		      </button>
		    </>
		  ) : (
		    <>
		      <button
			onClick={() => {
			  setEditingId(app.id);
			  setEditStatus(app.status);
			}}
			className="edit-btn"
		      >
			Edit
		      </button>
		      <button onClick={() => handleDelete(app.id)} className="delete-btn">
			Delete
		      </button>
		    </>
		  )}
		</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
