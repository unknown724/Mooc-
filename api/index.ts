import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { ALL_WEEKS_DATA } from '../src/data/seedData';

const app = express();

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

function detectWeek(hint?: any, name?: string): number {
  if (hint && Number(hint) >= 1 && Number(hint) <= 12) return Number(hint);
  const str = `${name || ''} ${hint || ''}`;
  const match = str.match(/week[_\s-]?([0-9]{1,2})/i) || str.match(/([0-9]{1,2})/);
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    if (val >= 1 && val <= 12) return val;
  }
  return 1;
}

const getAIClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/parse-pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const { base64, mimeType = 'application/pdf', filename, weekHint } = req.body;

    const detectedWeekNum = detectWeek(weekHint, filename);
    const seed = ALL_WEEKS_DATA[detectedWeekNum] || ALL_WEEKS_DATA[1];

    const ai = getAIClient();

    // If no GEMINI_API_KEY is configured in Vercel, serve pre-verified curriculum questions
    if (!ai || !process.env.GEMINI_API_KEY) {
      res.json({
        success: true,
        weekNumber: detectedWeekNum,
        weekTitle: seed.title,
        questions: seed.questions,
        data: {
          weekNumber: detectedWeekNum,
          weekTitle: seed.title,
          questions: seed.questions,
        },
        source: 'standalone_built_in',
      });
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
      weekNumber: weekNum,
      weekTitle: parsedData.weekTitle || `Week ${weekNum} Assignment`,
      questions: questionsWithIds,
    });
  } catch (error: any) {
    console.warn('Vercel API parse-pdf fallback to verified curriculum:', error?.message);
    const detectedWeekNum = detectWeek(req.body?.weekHint, req.body?.filename);
    const seed = ALL_WEEKS_DATA[detectedWeekNum] || ALL_WEEKS_DATA[1];
    res.json({
      success: true,
      data: {
        weekNumber: detectedWeekNum,
        weekTitle: seed.title,
        questions: seed.questions,
      },
      weekNumber: detectedWeekNum,
      weekTitle: seed.title,
      questions: seed.questions,
      fallback: true,
      source: 'standalone_built_in',
    });
  }
});

export default app;
