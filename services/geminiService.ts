import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BusinessMetrics, SimulationResult, AnalysisResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeBusinessPerformance = async (
  currentMetrics: BusinessMetrics,
  currentResult: SimulationResult,
  historicalTrend: string
): Promise<AnalysisResponse> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `
    You are a senior business analyst. Analyze the following business performance data.
    
    Current Core Metrics:
    ${JSON.stringify({ 
        ...currentMetrics, 
        customMetrics: undefined // Hide from this block to avoid duplication if printed
    }, null, 2)}
    
    Additional Contextual Metrics (User Defined):
    ${JSON.stringify(currentMetrics.customMetrics, null, 2)}
    
    Current P&L Results:
    ${JSON.stringify(currentResult, null, 2)}
    
    Historical Context:
    ${historicalTrend}
    
    Tasks:
    1. Evaluate the current financial health based on the P&L and Core Metrics.
    2. INTELLIGENTLY INTERPRET the "Additional Contextual Metrics". How do these extra factors (like competitors, weather, internal HR stats, etc.) likely impact the financial results? Correlation doesn't imply causation, but suggest potential links.
    3. Identify any anomalies.
    4. Use Google Search to find if there are any current external market factors (e.g., raw material price trends, labor market shifts) that might explain high costs or sales trends relevant to a general manufacturing/retail context.
    5. Provide actionable recommendations.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Use Google Search Grounding
      }
    });

    const markdown = response.text || "No analysis generated.";
    
    // Extract grounding chunks if available to display sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingUrls = groundingChunks
      .map(chunk => chunk.web)
      .filter(web => web !== undefined)
      .map(web => ({ uri: web!.uri!, title: web!.title! }));

    return { markdown, groundingUrls };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { markdown: "Error generating analysis. Please check your API key and try again." };
  }
};

export const simulateDecisionImpact = async (
  baseMetrics: BusinessMetrics,
  newMetrics: BusinessMetrics,
  diffResult: any
): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `
    A user is simulating a business decision. 
    Baseline Metrics: ${JSON.stringify(baseMetrics)}
    New Simulated Metrics: ${JSON.stringify(newMetrics)}
    Calculated Financial Difference: ${JSON.stringify(diffResult)}

    Explain the impact of this decision on the Profit & Loss statement in simple terms. 
    Focus on the trade-offs (e.g., "Increasing marketing spend by X increased sales by Y, leading to a net positive...").
    Keep it concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No simulation insight generated.";
  } catch (error) {
    return "Error generating simulation insight.";
  }
};

export const editProductImage = async (
  imageBase64: string,
  promptText: string
): Promise<string | null> => {
  if (!apiKey) throw new Error("API Key not found");

  try {
    // Using gemini-2.5-flash-image (Nano Banana) for image editing
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity, can be dynamic
              data: imageBase64
            }
          },
          {
            text: promptText
          }
        ]
      },
      // Note: For editing/generation, we parse the response parts for the image
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};