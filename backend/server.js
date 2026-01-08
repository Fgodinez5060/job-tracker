// Load environment variables
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', res.rows[0].now);
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Job Tracker API - Server is running!' });
});

// GET all applications
app.get('/api/applications', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM applications ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST new application
app.post('/api/applications', async (req, res) => {
  try {
    const { company, position, status, date_applied, salary_range, job_url, notes } = req.body;
    
    const result = await pool.query(
      `INSERT INTO applications 
       (company, position, status, date_applied, salary_range, job_url, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [company, position, status || 'to_apply', date_applied, salary_range, job_url, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
