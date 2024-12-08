import OpenAI from "openai";
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.GROK_AI_API_KEY!,
  baseURL: "https://api.x.ai/v1",
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "grok-beta",
      messages: [
        { 
          role: "system", 
          content: "You are a career advisor helping people find job recommendations based on their interests and skills." 
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return NextResponse.json(completion);
  } catch (error) {
    console.error('Grok API error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
} 