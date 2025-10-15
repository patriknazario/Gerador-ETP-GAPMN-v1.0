// /api/generate.ts
import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// A Vercel (plataforma de deploy) irá injetar a variável de ambiente.
// Garanta que GEMINI_API_KEY está configurado nas "Environment Variables" do seu projeto na Vercel.
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

// Inicializa o cliente Gemini com a chave de API segura do servidor.
// Renomeei a variável para corresponder ao padrão do projeto (API_KEY -> GEMINI_API_KEY)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 1. Permite apenas requisições do tipo POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 2. Extrai o prompt do corpo da requisição
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    // 3. Chama a API do Gemini de forma segura a partir do backend
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest', // Modelo consistente com o resto da aplicação
      contents: prompt,
    });
    
    // 4. Extrai o texto gerado da resposta
    const generatedText = response.text;

    // 5. Envia o texto de volta para o frontend
    return res.status(200).json({ text: generatedText });

  } catch (error) {
    console.error("Error calling Gemini API from serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    // 6. Trata erros e envia uma resposta de erro clara
    return res.status(500).json({ message: 'Erro ao gerar conteúdo no servidor.', details: errorMessage });
  }
}
