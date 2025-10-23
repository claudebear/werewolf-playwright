// server.js — Werewolf Playwright Generator backend using OpenRouter API (ESM version)

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 🔑 Fill in your OpenRouter API key here
const OPENROUTER_API_KEY = 'YOUR_OPENROUTER_API_KEY_HERE';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🎭 Main route for generating Werewolf play script
app.post('/generate', async (req, res) => {
  const { settings, characters, numWolves, numDoctor } = req.body;

  const prompt = `
Generate a full theatrical script based on the social deduction game *Werewolf*.
Rules:
- Werewolves secretly kill one person every night.
- The Doctor can choose one person to save (including themselves).
- If the Doctor saves the same person targeted by the werewolves, that person survives.
- During the day, all players discuss and vote to eliminate someone suspected as a werewolf.
- The game alternates between night and day until one side wins.

Details:
Setting: ${settings}
Characters: ${characters}
Number of Werewolves: ${numWolves}
Number of Doctors: ${numDoctor}

Write as a stage play with:
- Scene titles (Night 1, Day 1, etc.)
- Stage directions in brackets
- Dialogues labeled by character
- Suspenseful, immersive tone.
  `;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `
You are a skilled playwright who writes immersive scripts based on the Werewolf social deduction game.
You understand:
- Werewolves kill at night.
- Doctors can save one person per night.
- Days are for discussion and voting.
Output full stage scripts with vivid dialogue and scene directions.
`
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
    const playwrightText = data?.choices?.[0]?.message?.content || 'No response generated.';
    res.json({ response: playwrightText });

  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ error: 'Failed to generate script', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Werewolf Playwright server running on http://localhost:${PORT}`);
});

