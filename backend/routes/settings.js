const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get phone numbers
router.get('/phone-numbers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM phone_numbers WHERE is_active = true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add phone number
router.post('/phone-numbers', async (req, res) => {
  try {
    const { phone_number, label } = req.body;
    const result = await pool.query(
      'INSERT INTO phone_numbers (phone_number, label, user_id) VALUES ($1, $2, $3) RETURNING *',
      [phone_number, label, '87071f62-bd1a-45e8-a121-44c543b6277a'] // Use your user ID
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company profiles
router.get('/companies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM company_profiles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add company profile
router.post('/companies', async (req, res) => {
  try {
    const { company_name, description, is_default } = req.body;
    
    // If setting as default, remove default from others
    if (is_default) {
      await pool.query('UPDATE company_profiles SET is_default = false');
    }
    
    const result = await pool.query(
      'INSERT INTO company_profiles (company_name, description, is_default, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [company_name, description, is_default, '87071f62-bd1a-45e8-a121-44c543b6277a'] // Use your user ID
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;