import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🔑 Insert your OpenRouter API key here
const OPENROUTER_API_KEY = 'insert your own api key here';

// POST /generate: handles playwright generation requests
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',   // You can change this to any model OpenRouter supports
        messages: [
          {
            role: 'system',
            content: 'You are a creative playwright generator that writes detailed werewolf-themed plays with scenes, characters, and stage directions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return res.status(500).json({ error: 'API returned non-200 response', details: errorText });
    }

    const data = await response.json();

    // Extract generated text from OpenRouter’s structure
    const playwrightText =
      data?.choices?.[0]?.message?.content || 'No response generated.';

    res.json({ response: playwrightText });

  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ error: 'Failed to generate script', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

