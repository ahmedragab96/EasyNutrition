import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  lightly_active: 'Lightly active (1–3 days/week)',
  moderately_active: 'Moderately active (3–5 days/week)',
  very_active: 'Very active (6–7 days/week)',
  extra_active: 'Extra active (physical job + daily exercise)',
};

Deno.serve(async (req: Request) => {
  console.log(`[calculate-goals] ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Manual auth — verify_jwt: false is set because the project uses ES256 JWTs
  // which the edge runtime's built-in verifier doesn't support.
  const authHeader = req.headers.get('Authorization');
  console.log('[calculate-goals] Authorization header present:', !!authHeader);

  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  console.log('[calculate-goals] auth user:', user?.id ?? null, 'error:', authError?.message ?? null);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    console.log('[calculate-goals] ANTHROPIC_API_KEY present:', !!apiKey);
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY secret is not set on this project.');
    const client = new Anthropic({ apiKey });

    const body = await req.json();
    console.log('[calculate-goals] request body:', JSON.stringify(body));

    const {
      gender,
      age,
      heightCm,
      weightKg,
      activityLevel,
      goal,
      targetWeightDeltaKg,
      goalApproach,
      resistanceTraining,
    } = body;

    const RESISTANCE_LABELS: Record<string, string> = {
      none: 'None',
      light: '1–2x per week',
      moderate: '3–4x per week',
      high: '5+ per week',
    };

    const goalLabel = goal === 'lose'
      ? `Lose ${targetWeightDeltaKg} kg`
      : goal === 'gain'
      ? `Gain ${targetWeightDeltaKg} kg`
      : 'Maintain current weight';

    const gainInstructions = `
Instructions:
- Estimate TDEE and apply a calorie surplus based on goal type:
  - lean_bulk: +250–350 kcal
  - balanced_gain: +300–450 kcal
  - aggressive_bulk: +400–500 kcal
- Protein per kg of bodyweight based on goal type:
  - lean_bulk: 1.8–2.2 g/kg (use higher end if resistance training is moderate or high)
  - balanced_gain: 1.6–2.0 g/kg
  - aggressive_bulk: 1.6–1.8 g/kg
- Fats: 20–30% of total calories
- Carbs: fill remaining calories (prioritise carbs for performance and muscle gain)
- Do not exceed +500 kcal surplus`;

    const loseInstructions = `
Instructions:
- Estimate TDEE and apply a calorie deficit based on goal type:
  - gradual_cut: −250–350 kcal
  - moderate_cut: −350–500 kcal
  - aggressive_cut: −500–700 kcal
- Protein per kg of bodyweight (high protein preserves muscle during a cut):
  - gradual_cut: 1.8–2.2 g/kg
  - moderate_cut: 2.0–2.4 g/kg
  - aggressive_cut: 2.2–2.6 g/kg
- Fats: 20–30% of total calories
- Carbs: fill remaining calories
- Do not exceed −700 kcal deficit`;

    const maintainInstructions = `
Instructions:
- Match TDEE calories exactly
- Protein: 1.6–2.0 g/kg (use higher end if resistance training is moderate or high)
- Fats: 25–35% of total calories
- Carbs: fill remaining calories`;

    const instructions = goal === 'gain' ? gainInstructions
      : goal === 'lose' ? loseInstructions
      : maintainInstructions;

    const prompt = `You are a certified nutritionist. Based on the profile below, calculate personalised daily calorie and macro targets.

Profile:
- Gender: ${gender}
- Age: ${age} years
- Height: ${heightCm} cm
- Current weight: ${weightKg} kg
- Activity level: ${ACTIVITY_LABELS[activityLevel] ?? activityLevel}
- Goal: ${goalLabel}
- Goal type: ${goalApproach}
- Resistance training: ${RESISTANCE_LABELS[resistanceTraining] ?? resistanceTraining}
${instructions}

Respond with ONLY a valid JSON object with exactly these keys:
- calorieGoal: daily calorie target (integer kcal)
- proteinGoal: daily protein target (integer grams)
- carbsGoal: daily carbohydrates target (integer grams)
- fatsGoal: daily fat target (integer grams)
- reasoning: one sentence (max 25 words) explaining the key driver behind these numbers — do not mention rate or speed of weight change

No markdown, no code blocks, just the raw JSON object.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text response from AI');

    const raw = textBlock.text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
    console.log('[calculate-goals] AI raw response:', raw);
    const result = JSON.parse(raw);
    console.log('[calculate-goals] parsed result:', JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[calculate-goals] ERROR:', err);
    console.error('[calculate-goals] error type:', err?.constructor?.name);
    if (err && typeof err === 'object' && 'status' in err) {
      console.error('[calculate-goals] upstream status:', (err as { status: number }).status);
    }
    // Always return 500 — never forward upstream status codes (e.g. Anthropic 401)
    const message = err instanceof Error ? err.message : 'Calculation failed';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
