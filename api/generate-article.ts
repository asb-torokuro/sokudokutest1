import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  // POSTリクエスト以外は弾く
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // ここでAPIキーを読み込む
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { textLength } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `約${textLength}文字の日本語の文章と、その内容に関する4択問題を4問作成して。ジャンルはランダムで構わない（例：科学、歴史、文学、日常など）。`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: '文章のタイトル' },
            content: { type: Type.STRING, description: '文章の本文' },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: '問題文' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '4つの選択肢'
                  },
                  answerIndex: { type: Type.INTEGER, description: '正解のインデックス（0〜3）' }
                },
                required: ['question', 'options', 'answerIndex']
              }
            }
          },
          required: ['title', 'content', 'questions']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.status(200).json(data);
  } catch (error) {
    console.error('Error generating article:', error);
    res.status(500).json({ error: 'Failed to generate article' });
  }
}
