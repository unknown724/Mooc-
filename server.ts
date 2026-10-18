import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Support large PDF payloads in base64
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Initialize GoogleGenAI client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface QuestionOption {
  label: 'a' | 'b' | 'c' | 'd';
  text: string;
}

interface ParsedQuestion {
  id: string;
  number: number;
  questionText: string;
  options: QuestionOption[];
  correctOption: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  topicTag: string;
}

interface ParsePdfResponse {
  weekNumber: number;
  weekTitle: string;
  questions: ParsedQuestion[];
}

// PDF Parsing API route using Gemini multimodal capabilities
app.post('/api/parse-pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const { base64, mimeType = 'application/pdf', filename, weekHint } = req.body;

    if (!base64) {
      res.status(400).json({ error: 'Base64 PDF content is required' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
      return;
    }

    const prompt = `You are an expert academic evaluator for the MOOC course "Conservation Geography".
Analyze the attached assignment PDF document carefully.
Filename reference: "${filename || 'Assignment.pdf'}"
Week hint if provided: ${weekHint || 'none'}

Your task:
1. Determine the Week Number (an integer between 1 and 12). If the title says "Week 3 Assignment Solutions", weekNumber is 3.
2. Determine a descriptive concise weekTitle representing the major topic covered (e.g., "Rocks, Minerals & Weathering", "Climate & Atmospheric Dynamics", "Drainage Systems & Geomorphology").
3. Extract each multiple-choice question in the PDF (typically 10 questions numbered 1 to 10).
4. For each question:
   - "number": integer question number (1, 2, ... 10)
   - "questionText": clean question text (clean up any OCR noise or stray numbering)
   - "options": exactly 4 options labeled 'a', 'b', 'c', 'd' with their exact wording.
   - "correctOption": identify which option is marked as correct. In these solution PDFs, the correct answer is formatted in BOLD text, or visually emphasized, or verified by accurate Geography knowledge (e.g., mudrock is siliciclastic rock; carbonation is chemical weathering; amphiboles are green/black inosilicates).
   - "explanation": a concise, high quality 1 to 2 sentence educational explanation stating WHY this option is correct.
   - "topicTag": a short 2-3 word topic classification (e.g., "Mineralogy", "Geomorphology", "Oceanography", "Climatology", "GIS & LiDAR").

Return the result adhering strictly to the JSON schema.`;

    const pdfPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64,
      },
    };

    const textPart = {
      text: prompt,
    };

    // Use gemini-2.5-flash as specified or gemini-3.8-flash as standard fallback
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [pdfPart, textPart] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              weekNumber: { type: Type.INTEGER, description: 'Week number between 1 and 12' },
              weekTitle: { type: Type.STRING, description: 'Descriptive title for the week topic' },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.INTEGER },
                    questionText: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          label: { type: Type.STRING, enum: ['a', 'b', 'c', 'd'] },
                          text: { type: Type.STRING },
                        },
                        required: ['label', 'text'],
                      },
                    },
                    correctOption: { type: Type.STRING, enum: ['a', 'b', 'c', 'd'] },
                    explanation: { type: Type.STRING },
                    topicTag: { type: Type.STRING },
                  },
                  required: ['number', 'questionText', 'options', 'correctOption', 'explanation', 'topicTag'],
                },
              },
            },
            required: ['weekNumber', 'weekTitle', 'questions'],
          },
        },
      });
    } catch (primaryErr) {
      console.warn('Falling back to gemini-3.8-flash due to:', primaryErr);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: [pdfPart, textPart] },
        config: {
          responseMimeType: 'application/json',
        },
      });
    }

    const text = response.text?.trim() || '{}';
    const parsedData = JSON.parse(text);

    // Ensure IDs are generated
    const formattedQuestions: ParsedQuestion[] = (parsedData.questions || []).map((q: any, idx: number) => ({
      id: `w${parsedData.weekNumber || weekHint || 1}_q${q.number || idx + 1}_${Date.now()}`,
      number: q.number || idx + 1,
      questionText: q.questionText || '',
      options: (q.options || []).map((opt: any) => ({
        label: (opt.label || 'a').toLowerCase() as 'a' | 'b' | 'c' | 'd',
        text: opt.text || '',
      })),
      correctOption: (q.correctOption || 'a').toLowerCase() as 'a' | 'b' | 'c' | 'd',
      explanation: q.explanation || 'Verified answer from course assignment solution keys.',
      topicTag: q.topicTag || 'Conservation Geography',
    }));

    const result: ParsePdfResponse = {
      weekNumber: parsedData.weekNumber || Number(weekHint) || 1,
      weekTitle: parsedData.weekTitle || `Week ${parsedData.weekNumber || weekHint || 1} Assignment`,
      questions: formattedQuestions,
    };

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error parsing PDF with Gemini:', error);
    res.status(500).json({
      error: error?.message || 'Failed to parse PDF document with Gemini API',
    });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve dist files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`GeoPrep MOOC server running on port ${PORT}`);
  });
}

startServer();
