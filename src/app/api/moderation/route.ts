import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

if (!process.env.HUGGING_FACE_API_KEY) {
  console.warn('Warning: HUGGING_FACE_API_KEY is not set');
}

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

interface ClassificationResult {
  label: string;
  score: number;
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Use the Hugging Face API
    const results = await hf.textClassification({
      model: 'martin-ha/toxic-comment-model',
      inputs: text,
    });

    // Get the first result
    const result = results[0] as ClassificationResult;

    // Check if the result indicates toxicity
    const isToxic = result.label === 'toxic' && result.score > 0.7;
    
    return NextResponse.json({
      is_toxic: isToxic,
      label: result.label,
      confidence: result.score
    });
    
  } catch (error) {
    console.error('Moderation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 