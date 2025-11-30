/**
 * Chatbot API Route
 * Handles chatbot requests using Gemini API
 */

import 'dotenv/config'; // Load .env file
import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI (will be initialized when handler is called)
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Chatbot handler - sends message to Gemini and returns response
 */
export async function chatbotHandler(req: Request, res: Response) {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      console.error('GEMINI_API_KEY is not set in environment variables');
      console.error('Current env keys:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
      return res.status(500).json({
        success: false,
        error: 'Chatbot service is not configured. GEMINI_API_KEY is missing.'
      });
    }

    // Get the Gemini model - using gemini-1.5-flash (free tier)
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build conversation context
    const systemPrompt = `You are a helpful AI learning assistant for HCMUT (Ho Chi Minh City University of Technology) tutoring system. 
Your role is to help students with:
- Booking tutoring sessions
- Finding tutors by subject
- Tracking learning progress
- Rescheduling or canceling sessions
- Contacting tutors
- General questions about the platform

Be friendly, professional, and concise. If you don't know something specific about the platform, guide them to the appropriate page or feature.
Always respond in a helpful and encouraging manner.`;

    // Build conversation history for context
    let conversationText = systemPrompt + '\n\n';
    
    // Add conversation history (last 5 messages for context)
    const recentHistory = conversationHistory.slice(-5);
    for (const msg of recentHistory) {
      if (msg.sender === 'user') {
        conversationText += `User: ${msg.text}\n`;
      } else if (msg.sender === 'bot') {
        conversationText += `Assistant: ${msg.text}\n`;
      }
    }
    
    conversationText += `User: ${message}\nAssistant:`;

    // Generate response
    const result = await model.generateContent(conversationText);
    const response = await result.response;
    const text = response.text();

    return res.json({
      success: true,
      data: {
        message: text.trim(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Chatbot API error:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API_KEY') || error.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key. Please check your GEMINI_API_KEY.'
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit') || error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    if (error.status === 503 || error.message?.includes('overloaded') || error.message?.includes('Service Unavailable')) {
      return res.status(503).json({
        success: false,
        error: 'The AI service is temporarily unavailable. Please try again in a few moments.'
      });
    }

    if (error.message?.includes('model') || error.status === 404) {
      return res.status(400).json({
        success: false,
        error: 'Model not found. Please check the model name.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate response. Please try again.'
    });
  }
}
