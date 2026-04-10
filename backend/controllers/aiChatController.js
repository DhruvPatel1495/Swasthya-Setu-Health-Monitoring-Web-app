import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// @desc    Chat with Groq AI Assistant
// @route   POST /api/aichat
// @access  Private
export const chatWithAi = async (req, res) => {
  try {
    const { message, history } = req.body;

    const messages = [
      {
        role: "system",
        content: "You are the Swasthya Setu AI Assistant, a helpful health monitoring and telehealth virtual assistant. Your role is to answer patient's health queries responsibly, advise them to book an appointment with a doctor for serious issues, and keep your answers concise and empathetic. DO NOT provide definitive medical diagnoses."
      },
      ...(history || []),
      { role: "user", content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 500,
    });

    res.json({ reply: chatCompletion.choices[0]?.message?.content || "I couldn't process that request." });
  } catch (error) {
    if(error.status === 401) {
       return res.status(500).json({ reply: "Service error: the AI is currently unavailable due to authentication issues."});
    }
    res.status(500).json({ reply: "An error occurred with the AI service. Please try again later.", error: error.message });
  }
};
