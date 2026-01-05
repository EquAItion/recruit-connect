const express = require('express');
const router = express.Router();

// Mock candidates data
let mockCandidates = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    job_title: 'Software Engineer',
    company: 'Tech Corp',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

// Get all candidates
router.get('/', async (req, res) => {
  try {
    res.json(mockCandidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create candidate
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone, job_title, company, location, skills, notes, linkedin_url } = req.body;
    
    const newCandidate = {
      id: Date.now().toString(),
      full_name,
      email,
      phone,
      job_title,
      company,
      location,
      skills,
      notes,
      linkedin_url,
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    mockCandidates.push(newCandidate);
    res.status(201).json(newCandidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update candidate
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const candidateIndex = mockCandidates.findIndex(c => c.id === id);
    if (candidateIndex === -1) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    mockCandidates[candidateIndex] = { ...mockCandidates[candidateIndex], status };
    res.json(mockCandidates[candidateIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete candidate
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const candidateIndex = mockCandidates.findIndex(c => c.id === id);
    if (candidateIndex === -1) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    mockCandidates.splice(candidateIndex, 1);
    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;