import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key_if_not_set"
});

export const analyzeVitals = async (heartRate, temperature, spo2) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return "Groq API Key not configured. AI Analysis skipped.";
    }
    
    const prompt = `You are a medical assistant AI. Analyze the following vitals: Heart Rate: ${heartRate} bpm, Temperature: ${temperature}°C, SpO2: ${spo2}%. Provide a concise output with 3 points: 1. Risk Level (Low/Medium/High), 2. Condition, 3. Recommended Action.`;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
    });

    return chatCompletion.choices[0]?.message?.content || "No analysis generated.";
  } catch (error) {
    console.error("Error with Groq AI:", error.status, error.message);
    if (error.status === 401) {
       return "API Key invalid or unauthorized access.";
    } else if (error.status === 429) {
       return "Rate limit exceeded. Please try again later.";
    } else if (error.status >= 500) {
       return "Groq server error.";
    }
    return "Analysis failed due to API error.";
  }
};

export const detectAnomaly = (heartRate, temperature, spo2) => {
  let isAnomaly = false;
  let severityScore = 0;

  if (heartRate > 120 || heartRate < 50) {
    isAnomaly = true;
    severityScore += 3;
  }
  if (spo2 < 92) {
    isAnomaly = true;
    severityScore += 4;
  }
  if (temperature > 38 || temperature < 35) {
    isAnomaly = true;
    severityScore += 3;
  }

  return { isAnomaly, severityScore };
};
