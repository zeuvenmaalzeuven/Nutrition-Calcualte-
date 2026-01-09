import { GoogleGenAI, Type } from "@google/genai";
import { ActivityLevelValue } from '../types';
import { ACTIVITY_OPTIONS } from '../constants';

export const determineActivityLevel = async (description: string): Promise<ActivityLevelValue | null> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }

  // Initialize client here to ensure we use the latest API key (e.g. after user selection)
  const ai = new GoogleGenAI({ apiKey });

  if (!description.trim()) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze the following user description of their weekly physical activity and map it to the most appropriate standard activity level.
        
        User Description: "${description}"
        
        Available Levels:
        - Sedentary (1.2): Little or no exercise, desk job.
        - Lightly Active (1.375): Light exercise/sports 1-3 days/week.
        - Moderately Active (1.55): Moderate exercise/sports 3-5 days/week.
        - Very Active (1.725): Hard exercise/sports 6-7 days/week.
        - Extra Active (1.9): Very hard daily exercise & physical job or 2x training.

        Return strictly a JSON object with the "value" property matching one of the numeric multipliers (1.2, 1.375, 1.55, 1.725, 1.9).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            value: {
              type: Type.NUMBER,
              description: "The numeric multiplier for the activity level.",
              nullable: false,
            },
            reasoning: {
                type: Type.STRING,
                description: "Short explanation of why this level was chosen."
            }
          },
          required: ["value"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    const result = JSON.parse(text);
    
    // Validate result against known values
    const validValues = ACTIVITY_OPTIONS.map(o => o.value);
    if (validValues.includes(result.value)) {
        return result.value as ActivityLevelValue;
    }
    
    // Fallback if AI returns a weird number, find closest
    return validValues.reduce((prev, curr) => 
        Math.abs(curr - result.value) < Math.abs(prev - result.value) ? curr : prev
    );

  } catch (error) {
    console.error("Error determining activity level:", error);
    return null;
  }
};
