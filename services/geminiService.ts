import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "../types";

export const analyzeResume = async (
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResponse> => {
  // Initialize AI right before call to catch environment updates
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze this professional resume against the provided job description.
    
    1. Calculate a final 'overallScore' (0-100) based on industry relevance.
    2. Extract 'matchedSkills' and identify 'missingSkills'.
    3. Write a detailed 'semanticAnalysis' explaining the alignment (max 150 words).
    4. Provide 5 actionable 'improvementTips' for higher ATS ranking.
    5. Generate radar scores (0-100) for: 'Technical Stack', 'Soft Skills', 'Experience Rank', 'Education Match', 'Keyword Density'.

    Resume Content:
    ${resumeText}

    Target Job Description:
    ${jobDescription}

    You MUST return only a strict JSON object following the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            semanticAnalysis: { type: Type.STRING },
            improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            categoryScores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  A: { type: Type.NUMBER },
                  fullMark: { type: Type.NUMBER }
                },
                required: ["subject", "A", "fullMark"]
              }
            }
          },
          required: ["overallScore", "matchedSkills", "missingSkills", "semanticAnalysis", "improvementTips", "categoryScores"],
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty AI Response");
    
    return JSON.parse(resultText) as AnalysisResponse;
  } catch (error) {
    console.error("Gemini Diagnostic Failure:", error);
    throw error;
  }
};