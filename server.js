require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: message }] }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
    res.json({ reply });
  } catch (err) {
    // Print the full Gemini error for debugging
    if (err.response && err.response.data) {
      console.error('Gemini API error:', JSON.stringify(err.response.data, null, 2));
      res.status(500).json({ error: 'Gemini API error', details: err.response.data });
    } else {
      console.error('Gemini API error:', err.message);
      res.status(500).json({ error: 'Gemini API error', details: err.message });
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Gemini chat backend running on port ${PORT}`));
