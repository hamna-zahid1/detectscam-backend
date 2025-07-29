corsimport cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Groq } from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors({ origin: '*', methods: ['POST'] }));
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post('/api/analyze', async (req, res) => {
  const { message } = req.body;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct', // Recommended model for your use case
      messages: [
        {
          role: 'system',
          content: `You are an anti-scam expert. Analyze messages for scam indicators and provide detailed analysis in this format:
          
          ## [Scam Detected/No Scam Detected]
          • Risk Level: [High/Medium/Low] (X% confidence)
          ---
          ## Analysis Summary
          [Brief summary]
          
          ### Detailed Analysis
          - [x] **Character Substitution**  
          [Analysis]
          
          - [x] **Deceptive Language**  
          [Analysis]
          
          - [x] **Urgency Tactics**  
          [Analysis]
          
          - [x] **Suspicious Content**  
          [Analysis]
          
          - [x] **Impersonation**  
          [Analysis]
          
          - [x] **Grammar Issues**  
          [Analysis]`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.3, // Lower for more consistent results
      max_tokens: 1024,
      top_p: 0.9,
      stream: false // Disable streaming for API responses
    });

    res.json({ analysis: chatCompletion.choices[0]?.message?.content });
  } catch (err) {
    console.error('Groq API error:', err);
    res.status(500).json({ error: 'Failed to analyze message.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));