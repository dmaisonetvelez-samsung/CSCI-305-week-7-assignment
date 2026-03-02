const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to the SQLite database
const dbPath = path.resolve(__dirname, 'database/university.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the university database.');
    }
});

// --- API Endpoints ---

// GET /api/courses - Get all courses
app.get('/api/courses', (req, res) => {
    const sql = 'SELECT * FROM courses';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

// GET /api/courses/:id - Get course by ID
app.get('/api/courses/:id', (req, res) => {
    const sql = 'SELECT * FROM courses WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ data: row });
    });
});

// POST /api/courses - Create new course
app.post('/api/courses', (req, res) => {
    const { name, code, description } = req.body;
    if (!name || !code) {
        return res.status(400).json({ error: 'Name and Code are required' });
    }

    const sql = 'INSERT INTO courses (name, code, description) VALUES (?, ?, ?)';
    const params = [name, code, description];
    
    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            id: this.lastID,
            message: 'Course created successfully'
        });
    });
});

// PUT /api/courses/:id - Update course
app.put('/api/courses/:id', (req, res) => {
    const { name, code, description } = req.body;
    const sql = `UPDATE courses SET 
                 name = COALESCE(?, name), 
                 code = COALESCE(?, code), 
                 description = COALESCE(?, description) 
                 WHERE id = ?`;
    const params = [name, code, description, req.params.id];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ message: 'Course updated successfully' });
    });
});

// DELETE /api/courses/:id - Delete course
app.delete('/api/courses/:id', (req, res) => {
    const sql = 'DELETE FROM courses WHERE id = ?';
    db.run(sql, req.params.id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
