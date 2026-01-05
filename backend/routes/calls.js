const express = require('express');
const axios = require('axios');
const router = express.Router();

// Mock calls data
let mockCalls = [];

// Make call using Bolna API
router.post('/make-call', async (req, res) => {
  try {
    const { agent_id, recipient_phone, from_phone, user_data, candidate_id } = req.body;

    console.log('Making Bolna API call:', { agent_id, recipient_phone, from_phone });

    // Prepare Bolna API payload according to documentation
    const payload = {
      agent_id,
      recipient_phone_number: recipient_phone,
      user_data: user_data || {}
    };

    // Only include from_phone_number if provided
    if (from_phone) {
      payload.from_phone_number = from_phone;
    }

    // Call Bolna API
    const response = await axios.post('https://api.bolna.ai/call', payload, {
      headers: {
        'Authorization': `Bearer ${process.env.BOLNA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Bolna API response:', response.data);

    // Store call record in memory
    const callRecord = {
      id: Date.now().toString(),
      candidate_id: candidate_id || null,
      bolna_call_id: response.data.id,
      status: 'initiated',
      started_at: new Date().toISOString()
    };
    
    mockCalls.push(callRecord);

    res.json({
      success: true,
      call: callRecord,
      bolna_response: response.data
    });

  } catch (error) {
    console.error('Call error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
});

// Get all calls
router.get('/', async (req, res) => {
  try {
    res.json(mockCalls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update call outcome
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome, notes, status } = req.body;

    const callIndex = mockCalls.findIndex(c => c.id === id);
    if (callIndex === -1) {
      return res.status(404).json({ error: 'Call not found' });
    }

    mockCalls[callIndex] = {
      ...mockCalls[callIndex],
      outcome,
      notes,
      status,
      ended_at: new Date().toISOString()
    };

    res.json(mockCalls[callIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;