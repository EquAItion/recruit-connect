const express = require('express');
const router = express.Router();

// Simple mock authentication for testing
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock user for testing
    const mockUser = {
      id: '87071f62-bd1a-45e8-a121-44c543b6277a',
      email: email,
      full_name: 'Test User'
    };
    
    // Mock token
    const token = 'mock-jwt-token-' + Date.now();
    
    res.json({
      user: mockUser,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mock registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    
    const mockUser = {
      id: '87071f62-bd1a-45e8-a121-44c543b6277a',
      email: email,
      full_name: full_name || 'New User'
    };
    
    const token = 'mock-jwt-token-' + Date.now();
    
    res.status(201).json({
      user: mockUser,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;