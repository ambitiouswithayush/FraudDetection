import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FraudCase, AnalysisResult } from "../types";

// NOTE: Using the prompt provided instruction to use process.env.API_KEY
// In a real deployment, ensure your bundler (Vite/Webpack) exposes this.
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTransactionWithGemini = async (
  transaction: Transaction,
  knowledgeBase: FraudCase[]
): Promise<AnalysisResult> => {
  
  // 1. Retrieve the relevant case (RAG step)
  // In a real app, we would perform a vector search here using the embedding model.
  // For this architecture demo, we assume the 'Fraud Engine' has already attached
  // the ID of the closest match found via 'hybrid search' in the simulation layer.
  const matchedCase = knowledgeBase.find(c => c.id === transaction.matchedCaseId);

  const model = "gemini-2.5-flash"; // Optimized for speed/cost in high-volume systems

  // 2. Construct the Prompt
  const prompt = `
    You are a Senior Fraud Analyst for a banking institution. Your job is to analyze a suspicious transaction 
    that has been flagged by our hybrid detection engine.

    *** TRANSACTION DATA ***
    ID: ${transaction.id}
    Amount: $${transaction.amount}
    Merchant: ${transaction.merchant} (${transaction.merchantId})
    Narrative: "${transaction.narrative}"
    Behavioral Z-Score: ${transaction.zScore.toFixed(2)} (Values > 3 are anomalous)
    
    *** RAG RETRIEVAL CONTEXT (Knowledge Base) ***
    ${matchedCase 
      ? `System found a similar known fraud pattern (Similarity: ${(transaction.signatureMatchScore * 100).toFixed(0)}%):
         Case ID: ${matchedCase.id}
         Narrative: "${matchedCase.narrative}"
         Fraud Type: ${matchedCase.type}`
      : "No direct match found in the fraud knowledge base."
    }

    *** INSTRUCTIONS ***
    1. Analyze the risk based on the behavioral score AND the context match.
    2. Provide a confidence score (0-100).
    3. Explain your reasoning clearly.
    4. Recommend an action: BLOCK, ALLOW, or HOLD.
  `;

  try {
    const result = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isLikelyFraud: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            recommendedAction: { type: Type.STRING, enum: ["BLOCK", "ALLOW", "HOLD"] },
            keyRiskFactors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          }
        }
      }
    });

    const responseText = result.text;
    if (!responseText) throw new Error("Empty response from Gemini");

    return JSON.parse(responseText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback if API fails
    return {
      isLikelyFraud: false,
      confidence: 0,
      reasoning: "AI Analysis unavailable. Check API Key.",
      recommendedAction: "HOLD",
      keyRiskFactors: ["System Error"]
    };
  }
};