require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const path = require('path');
const app = express();

// after app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));


// Middleware
app.use(cors());
app.use(express.json());

// ROUTES
// GET all cars
// GET cars with search, sort, pagination
app.get('/api/cars', async (req, res) => {
  try {
    const { 
      search = '', 
      sort = 'created_at', 
      order = 'desc', 
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build dynamic WHERE clause for search
    let whereClause = '1=1';
    let queryParams = [];
    if (search) {
      whereClause += ' AND (make ILIKE $1 OR model ILIKE $1)';
      queryParams.push(`%${search}%`);
    }

    // Main query with pagination
    const mainQuery = `
      SELECT *, COUNT(*) OVER() as total_count
      FROM cars 
      WHERE ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    queryParams.push(parseInt(limit), offset);
    const result = await pool.query(mainQuery, queryParams);

    const total = result.rows[0]?.total_count || 0;
    const cars = result.rows;

    res.json({
      cars,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        totalCars: total
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET single car
app.get('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE car
app.post('/api/cars', async (req, res) => {
  try {
    const { make, model, year, price } = req.body;
    const result = await pool.query(
      'INSERT INTO cars (make, model, year, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [make, model, year, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE car
app.put('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, year, price } = req.body;
    const result = await pool.query(
      'UPDATE cars SET make = $1, model = $2, year = $3, price = $4 WHERE id = $5 RETURNING *',
      [make, model, year, price, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE car
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json({ message: 'Car deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


