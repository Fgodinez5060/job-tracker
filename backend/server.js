// Import dotenv variables for Port number and Database link for connection
require('dotenv').config();

//import express web framework to simplify code and avoid mundane tasks
const express = require('express');
// Define express as an object (app)
const app = express();

// cors doesnt allow two different ports, it controls which browser ORIGINS are allowed to call the API
// Ex: "http://localhost:3000" <- 3000 is the origin
// So if "http://localhost:5173" comes along, it wouldnt be allowed to make the API call without cors
const cors = require('cors');
// Import PORT value from dotenv and default to 3000 if it could not be set
const PORT = process.env.PORT || 3000;

// Import Pool from pg for postgreSQL connection
const { Pool } = require('pg');
// Connect to database using Pool connection
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

// Get date from db query and await expecdted err or response to test connection, log to console no matter the case
pool.query('SELECT NOW() AS now', (err, res) => {
	if (err) {
		console.error('DB connection test failed:', err.message);
	} else {
		console.log('Database connected at:', res.rows[0].now);
	}
});

// Middleware that parses JSON request bodies so the req.body actually works for POST and PUT
app.use(express.json());
// Middleware defined as above
app.use(cors({
	origin: '*' // Allow all origins
}));

// Root Route to test if server is running
app.get('/', (req, res) => {
	res.json({ message: 'Job tracker API - Server is running'});
});

// get /api/applications which gets all jobs from applications section in PostgreSQL db with error handling
app.get('/api/applications', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM applications ORDER BY created_at DESC');
		res.json(result.rows);
	} catch (err) {
		console.error('Get application failed:', err.message);
		res.status(500).json({ error: 'Database error' });
	}
});

// post /api/applications which posts a new job to the applications section in PostgreSQL db with error handling
app.post('/api/applications', async (req, res) => {
	try {
		const { company, position, status, date_applied, salary_range, job_url, notes } = req.body;

		const result = await pool.query(
			`INSERT INTO applications
			(company, position, status, date_applied, salary_range, job_url, notes )
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			Returning *`,
			[company, position, status || 'to_apply', date_applied, salary_range, job_url, notes]
		);

		res.status(201).json(result.rows[0]);
		console.log('Post worked');
	} catch (err) {
		console.error('Post application failed:', err.message);
		res.status(500).json({ error: 'Failed to create application' });
	}
});

// delete /api/applications/:id which deletes a job by id from the applications section in PostgreSQL db with error handlind
app.delete('/api/applications/:id', async (req, res) => {
	try{
		const { id } = req.params;

		const result = await pool.query(
			`DELETE FROM applications WHERE id = $1 RETURNING *`, [id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Application not found' });
		}

		res.json({ message: 'Deleted successfully', application: result.rows[0] });
	} catch (err) {
		console.error('Application deletion failed:', err.message);
		res.status(500).json({ error: 'Failed to delete application' });
	}
});

// put /api/applications/:id which puts new information in a job by id (updates) from the applications secing in PostgreSQL db with error handling
app.put('/api/applications/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { company, position, status, date_applied, salary_range, job_url, notes } = req.body;

		const result = await pool.query(
			`UPDATE applications
			SET company = $1, position = $2, status = $3, date_applied = $4, salary_range = $5,
			job_url = $6, notes = $7
			WHERE id = $8
			RETURNING *`, [company, position, status || 'to_apply', date_applied, salary_range, job_url, notes, id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Application not found'});
		}

		res.status(201).json(result.rows[0]);
		console.log('Put worked');

	} catch (err) {
		console.error('Put application failed:', err.message);
		res.status(500).json({error: 'Failed to update application' });
	}
});

// Edit server listen to all network interfaces for Railway deployment
// Start backend server and send message to console when running
app.listen(PORT, '0.0.0.0', () => {
	console.log(`Backend Server running on port ${PORT}`);
});
