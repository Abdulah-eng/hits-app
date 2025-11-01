import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAkB3KvuadtCtqXMhfU8ujRdIxuP50X_5g'

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful AI assistant for H.I.T.S. (Hire I.T. Specialists), a platform connecting clients with verified IT specialists.

IMPORTANT: You must respond directly to what the user says. Read their message carefully and provide a relevant, specific response. Do NOT give generic greetings if the user asks a specific question.

Your primary functions are:
1. **Troubleshooting**: Help users with technical issues, computer problems, software questions, and IT-related guidance
2. **Appointment Booking**: Assist users in booking appointments with IT specialists

**For Troubleshooting:**
- Provide clear, step-by-step guidance
- Use simple language that's easy to understand
- Ask clarifying questions if needed
- Suggest when it might be better to book an appointment with a specialist for complex issues
- Address the specific problem the user mentions

**For Appointment Booking:**
- Help users understand how to book appointments
- Explain the booking process
- Answer questions about specialists, pricing, availability
- Guide users to the booking page if they're ready to book
- You can mention that users need to:
  - Select a specialist from available verified specialists
  - Choose a date and time slot
  - Provide a description of their needs
  - Complete payment through Stripe

**General Guidelines:**
- Be friendly, patient, and professional
- Use clear, concise language suitable for users of all technical levels
- ALWAYS respond to the specific content of the user's message
- If the user says "hi" or "hello", acknowledge it briefly but ask what they need help with
- If the user asks a question, answer it directly
- If you don't know something, admit it rather than guessing
- Encourage users to book appointments for personalized help
- Never repeat the same generic response - vary your language based on what the user said

Keep responses concise but informative. Always tailor your response to what the user actually said in their message.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Build conversation contents array for Gemini
    // Format: Array of { role: 'user' | 'model', parts: [{ text: string }] }
    const contents: Array<{ role: 'user' | 'model', parts: Array<{ text: string }> }> = []
    
    // Process conversation history (keep last 10 messages for context)
    conversationHistory.slice(-10).forEach((msg: { role: string; content: string }) => {
      // Convert 'assistant' to 'model' for Gemini
      const geminiRole = msg.role === 'assistant' ? 'model' : 'user'
      contents.push({
        role: geminiRole,
        parts: [{ text: msg.content }]
      })
    })

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    console.log(`Sending to Gemini - ${contents.length} messages in conversation. Current user message: "${message}"`)
    if (conversationHistory.length > 0) {
      console.log(`Conversation history (last ${Math.min(conversationHistory.length, 10)} messages):`)
      conversationHistory.slice(-10).forEach((msg: { role: string; content: string }, idx: number) => {
        console.log(`  [${idx + 1}] ${msg.role}: ${msg.content.substring(0, 50)}...`)
      })
    }

    // Try different model names - some API keys have access to different models
    // Order matters - try most likely to work first based on API version
    // Note: Model availability depends on API key and region
    // Latest models: gemini-2.5-pro, gemini-2.5-flash (2024)
    const modelNamesToTry = [
      'gemini-2.5-pro',        // Latest (2024)
      'gemini-2.5-flash',      // Latest fast model (2024)
      'gemini-1.5-pro',        // Stable v1.5 model
      'gemini-1.5-flash',      // Fast v1.5 model
      'gemini-1.0-pro',        // Stable v1 model
      'models/gemini-2.5-pro',
      'models/gemini-2.5-flash',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash',
      'models/gemini-1.0-pro',
      'gemini-pro',            // Legacy (deprecated)
      'models/gemini-pro'
    ]
    
    let lastError
    let model
    let result
    let response
    let text
    
    // Try each model until one works
    for (const modelName of modelNamesToTry) {
      try {
        console.log(`Trying model: ${modelName}`)
        model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: SYSTEM_PROMPT
        })
        
        // Use generateContent with full conversation context
        // This ensures the model sees the entire conversation and responds appropriately
        result = await model.generateContent({
          contents: contents
        })
        
        if (!result || !result.response) {
          throw new Error('No response object from Gemini API')
        }

        response = result.response
        
        try {
          text = response.text()
        } catch (textError: any) {
          console.error('Error extracting text from response:', textError)
          // Try alternative method
          const candidates = response.candidates
          if (candidates && candidates[0]?.content?.parts) {
            text = candidates[0].content.parts.map((p: any) => p.text).join('')
          } else {
            throw new Error(`Failed to extract text: ${textError?.message || String(textError)}`)
          }
        }

        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from Gemini API')
        }

        console.log(`✓ Successfully got response from ${modelName}`)
        console.log(`  Response preview: "${text.substring(0, 150)}${text.length > 150 ? '...' : ''}"`)
        console.log(`  Full response length: ${text.length} characters`)
        break // Success! Exit the loop
      } catch (apiError: any) {
        lastError = apiError
        console.log(`Model ${modelName} failed: ${apiError?.message || String(apiError)}`)
        // Continue to next model
        continue
      }
    }
    
    // Check if we got a successful response
    if (!text || !model) {
      throw new Error(`Failed to get response from any Gemini model. Last error: ${lastError?.message || 'Unknown'}. Please verify your API key has access to Gemini models.`)
    }

    return NextResponse.json({
      success: true,
      message: text,
    })
  } catch (error: any) {
    console.error('Chatbot API error:', error)
    console.error('Error type:', typeof error)
    console.error('Error details:', {
      message: error?.message || String(error),
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause,
      status: error?.status,
      statusText: error?.statusText
    })
    
    // Provide more helpful error message
    let errorMessage = 'Failed to process message'
    if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error?.stack || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

