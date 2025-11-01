// Test endpoint to list available Gemini models
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAkB3KvuadtCtqXMhfU8ujRdIxuP50X_5g'

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    
    // List all available models
    const models = await genAI.listModels()
    
    const availableModels = models.map((model: any) => ({
      name: model.name,
      displayName: model.displayName,
      supportedMethods: model.supportedGenerationMethods
    }))
    
    return NextResponse.json({
      success: true,
      models: availableModels,
      total: availableModels.length
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || String(error),
      stack: error.stack
    }, { status: 500 })
  }
}

