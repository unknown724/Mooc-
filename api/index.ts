import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/parse-pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const { base64, mimeType = 'application/pdf', filename, weekHint } = req.body;

    if (!base64) {
      res.status(400).json({ error: 'Base64 PDF content is required' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured on server' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64,
                mimeType,
              },
            },
            {
              text: `You are an expert academic PDF parser for NPTEL / MOOC assignments. Extract 10 multiple-choice questions for Conservation Geography ${weekHint ? `(Hint: Week ${weekHint})` : filename ? `(Filename: ${filename})` : ''}. Return strict JSON with weekNumber, weekTitle, and questions.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weekNumber: { type: Type.INTEGER },
            weekTitle: { type: Type.STRING },
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
                        label: { type: Type.STRING },
                        text: { type: Type.STRING },
                      },
                      required: ['label', 'text'],
                    },
                  },
                  correctOption: { type: Type.STRING },
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

    const parsedData = JSON.parse(response.text || '{}');
    const weekNum = parsedData.weekNumber || weekHint || 1;
    const questionsWithIds = (parsedData.questions || []).map((q: any, idx: number) => ({
      ...q,
      id: `w${weekNum}-q${q.number || idx + 1}`,
      number: q.number || idx + 1,
      weekNumber: weekNum,
      correctOption: (q.correctOption || 'a').toLowerCase(),
    }));

    res.json({
      success: true,
      data: {
        weekNumber: weekNum,
        weekTitle: parsedData.weekTitle || `Week ${weekNum} Assignment`,
        questions: questionsWithIds,
      },
    });
  } catch (error: any) {
    console.error('Error in Vercel API parse-pdf:', error);
    res.status(500).json({ error: error?.message || 'Failed to parse PDF' });
  }
});

export default app;
