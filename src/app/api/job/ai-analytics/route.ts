import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.grok.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROK_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "grok-1",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant analyzing job market trends."
          },
          {
            role: "user",
            content: "Analyze current job market trends and provide insights."
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI insights');
    }

    const data = await response.json();
    
    return NextResponse.json({
      aiInsights: {
        marketTrends: data.choices[0].message.content,
        salaryAnalysis: "AI-powered salary analysis will be available soon.",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      aiInsights: {
        marketTrends: "Currently analyzing market trends...",
        salaryAnalysis: "Analyzing salary data...",
        timestamp: new Date().toISOString()
      }
    });
  }
} 