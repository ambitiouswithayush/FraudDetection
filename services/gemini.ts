import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FraudCase, AnalysisResult } from "../types";

// NOTE: Using the prompt provided instruction to use process.env.API_KEY
// In a real deployment, ensure your bundler (Vite/Webpack) exposes this.
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || (import.meta.env as any).VITE_GEMINI_API_KEY;

// Diagnostic logging
if (typeof window !== 'undefined') {
  // Only log in browser environment
  console.log("🔍 [Gemini Service] Initializing with API Key Check");
  console.log("   ✓ process.env.API_KEY defined:", typeof process.env.API_KEY !== 'undefined');
  console.log("   ✓ process.env.GEMINI_API_KEY defined:", typeof process.env.GEMINI_API_KEY !== 'undefined');
  console.log("   ✓ import.meta.env.VITE_GEMINI_API_KEY defined:", typeof (import.meta.env as any).VITE_GEMINI_API_KEY !== 'undefined');
}

if (!apiKey) {
  console.error("❌ CRITICAL: Gemini API Key not found in environment variables");
  console.error("   - process.env.API_KEY:", process.env.API_KEY);
  console.error("   - process.env.GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
  console.error("   - import.meta.env.VITE_GEMINI_API_KEY:", (import.meta.env as any).VITE_GEMINI_API_KEY);
  console.log("   ℹ️ Check your .env.local file has: VITE_GEMINI_API_KEY=your_key");
} else {
  console.log("✅ Gemini API Key loaded successfully:", apiKey.substring(0, 10) + "...");
}

const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

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
    console.log("🚀 [Gemini API] Calling generateContent with model:", model);
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

    console.log("✅ [Gemini API] Analysis successful:", { confidence: JSON.parse(responseText).confidence });
    return JSON.parse(responseText) as AnalysisResult;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Gemini Analysis Failed:", {
      error: errorMsg,
      apiKeyPresent: !!apiKey,
      timestamp: new Date().toISOString()
    });

    // More detailed fallback message
    let failureReason = "AI Analysis unavailable. Check API Key.";
    if (!apiKey) {
      failureReason = "API Key not configured. See console for details.";
    } else if (errorMsg.includes("INVALID_ARGUMENT")) {
      failureReason = "Invalid or expired API Key.";
    } else if (errorMsg.includes("429")) {
      failureReason = "API rate limit exceeded. Try again later.";
    } else if (errorMsg.includes("UNAUTHENTICATED")) {
      failureReason = "API authentication failed. Check your key.";
    }

    return {
      isLikelyFraud: false,
      confidence: 0,
      reasoning: failureReason,
      recommendedAction: "HOLD",
      keyRiskFactors: ["System Error"]
    };
  }
};