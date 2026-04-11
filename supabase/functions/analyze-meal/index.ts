import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';

const client = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
});

const SYSTEM_PROMPT = `You are a nutrition analysis expert. Analyze food images and estimate nutrition facts.
You MUST respond with ONLY a valid JSON object — no markdown, no code blocks, no explanations.
Always estimate for the visible portion size in the image.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Manual auth — project uses ES256 JWTs which verify_jwt: true can't handle
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Missing authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired session' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg', description } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'imageBase64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const prompt = [
      'Analyze this food image and return a JSON object with exactly these keys:',
      '- name: concise food name (2–4 words)',
      '- description: brief ingredient breakdown with estimated amounts, e.g. "200g chicken breast, 150g white rice, 50g broccoli" — list the main visible components',
      '- kcal: estimated calories for the visible portion (integer)',
      '- protein: protein in grams (number, one decimal)',
      '- carbs: carbohydrates in grams (number, one decimal)',
      '- fats: fats in grams (number, one decimal)',
      '- confidence: confidence in identification 0–100 (integer)',
      description ? `\nUser note: "${description}"` : '',
    ].join('\n');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text response');

    // Strip markdown code fences if Claude adds them defensively
    const raw = textBlock.text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(raw);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('analyze-meal error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
