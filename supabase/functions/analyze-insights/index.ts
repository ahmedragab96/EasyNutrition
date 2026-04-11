import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';

const client = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
});

const SYSTEM_PROMPT = `You are a nutrition coach analysing a user's monthly eating habits.
You MUST respond with ONLY a valid JSON object — no markdown, no code blocks, no explanations.
Be specific, encouraging where progress is shown, and constructive where improvement is needed.
Keep insight text concise (1–2 sentences each). Recommendations should be actionable and specific.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('[analyze-insights] request received', req.method);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.warn('[analyze-insights] missing authorization header');
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
    console.warn('[analyze-insights] auth failed', authError?.message);
    return new Response(
      JSON.stringify({ error: 'Invalid or expired session' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  console.log('[analyze-insights] authenticated user:', user.id);

  try {
    const payload = await req.json();
    const { goals, daysInMonth, daysLogged, days, topFoods, month } = payload;
    const waterGoalMl: number = goals?.waterMl ?? 2000;

    console.log('[analyze-insights] payload received', {
      month,
      daysInMonth,
      daysLogged,
      daysCount: days?.length ?? 0,
      foodsCount: topFoods?.length ?? 0,
      goals,
    });

    if (!days || !goals) {
      console.error('[analyze-insights] invalid payload — missing days or goals');
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Compute some quick stats to help the AI reason accurately
    const daysOnKcalGoal = days.filter(
      (d: { kcal: number }) => d.kcal >= goals.kcal * 0.85 && d.kcal <= goals.kcal * 1.15
    ).length;

    // Water stats
    const daysWithWater = days.filter((d: { waterMl: number }) => d.waterMl > 0).length;
    const daysAtWaterGoal = days.filter((d: { waterMl: number }) => d.waterMl >= waterGoalMl).length;
    const avgWaterMl = daysWithWater > 0
      ? Math.round(days.filter((d: { waterMl: number }) => d.waterMl > 0)
          .reduce((s: number, d: { waterMl: number }) => s + d.waterMl, 0) / daysWithWater)
      : 0;

    const avgKcal = days.length
      ? Math.round(days.reduce((s: number, d: { kcal: number }) => s + d.kcal, 0) / days.length)
      : 0;
    const avgProtein = days.length
      ? Math.round(days.reduce((s: number, d: { protein: number }) => s + d.protein, 0) / days.length)
      : 0;
    const avgCarbs = days.length
      ? Math.round(days.reduce((s: number, d: { carbs: number }) => s + d.carbs, 0) / days.length)
      : 0;
    const avgFats = days.length
      ? Math.round(days.reduce((s: number, d: { fats: number }) => s + d.fats, 0) / days.length)
      : 0;

    // Streak calculation (consecutive days with kcal within ±15% of goal)
    let currentStreak = 0;
    let bestStreak = 0;
    let streak = 0;
    for (const d of days) {
      if (d.kcal >= goals.kcal * 0.85 && d.kcal <= goals.kcal * 1.15) {
        streak++;
        if (streak > bestStreak) bestStreak = streak;
      } else {
        streak = 0;
      }
    }
    currentStreak = streak;

    // Best weekday by average kcal accuracy
    const weekdayTotals: Record<number, { sum: number; count: number }> = {};
    for (const d of days) {
      const dow = new Date(d.date).getDay();
      if (!weekdayTotals[dow]) weekdayTotals[dow] = { sum: 0, count: 0 };
      const accuracy = 1 - Math.abs(d.kcal - goals.kcal) / goals.kcal;
      weekdayTotals[dow].sum += accuracy;
      weekdayTotals[dow].count++;
    }
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let bestWeekday = '';
    let bestAccuracy = -1;
    for (const [dow, { sum, count }] of Object.entries(weekdayTotals)) {
      const avg = sum / count;
      if (avg > bestAccuracy) {
        bestAccuracy = avg;
        bestWeekday = weekdayNames[Number(dow)];
      }
    }

    type DayRow = { date: string; kcal: number; protein: number; carbs: number; fats: number; mealsCount: number; waterMl: number };
    const dailyLines = days.slice(0, 31)
      .map((d: DayRow) => d.date + ': ' + d.kcal + 'kcal P' + d.protein + 'g C' + d.carbs + 'g F' + d.fats + 'g (' + d.mealsCount + ' meals) water:' + d.waterMl + 'ml')
      .join('\n');

    const prompt = [
      'Analyse this user\'s nutrition data for ' + month + ' and return a JSON object.',
      '',
      'USER GOALS: ' + goals.kcal + ' kcal | ' + goals.protein + 'g protein | ' + goals.carbs + 'g carbs | ' + goals.fats + 'g fats | ' + waterGoalMl + 'ml water',
      '',
      'MONTHLY STATS:',
      '- Days in month: ' + daysInMonth,
      '- Days with logged meals: ' + daysLogged,
      '- Days on calorie goal (+/-15%): ' + daysOnKcalGoal,
      '- Average daily: ' + avgKcal + ' kcal | ' + avgProtein + 'g protein | ' + avgCarbs + 'g carbs | ' + avgFats + 'g fats',
      '- Current streak (days on goal): ' + currentStreak,
      '- Best streak this month: ' + bestStreak,
      '- Best weekday (most consistent): ' + (bestWeekday || 'N/A'),
      '- Foods eaten: ' + (topFoods.length > 0 ? topFoods.slice(0, 20).join(', ') : 'none recorded'),
      '- Water goal: ' + waterGoalMl + 'ml/day',
      '- Days with water logged: ' + daysWithWater,
      '- Days at water goal (>=' + waterGoalMl + 'ml): ' + daysAtWaterGoal,
      '- Average water on tracked days: ' + avgWaterMl + 'ml',
      '',
      'DAILY BREAKDOWN (date, kcal, protein, carbs, fats, mealsLogged, water):',
      dailyLines,
      '',
      'Return a JSON object with exactly these keys:',
      '- score: overall nutrition score 0-100 (integer) — base on goal adherence, macro balance, consistency, variety, and hydration',
      '- headline: one punchy sentence summarising the month (max 10 words)',
      '- sections: array of exactly 5 objects, each with:',
      '    - id: one of "consistency" | "macros" | "patterns" | "variety" | "hydration"',
      '    - title: human-readable title',
      '    - rating: "good" | "fair" | "poor"',
      '    - insight: 1-2 specific sentences based on the data',
      '  For "hydration": rate based on days at water goal vs days tracked. If no water logged at all, rating is "poor".',
      '- recommendations: array of 3-5 specific, actionable strings (include water advice if hydration is fair/poor)',
      '- bestWeekday: "' + (bestWeekday || '') + '" (use this value)',
      '- currentStreak: ' + currentStreak + ' (use this value)',
      '- bestStreak: ' + bestStreak + ' (use this value)',
    ].join('\n');

    console.log('[analyze-insights] calling Claude', { month, daysLogged, avgKcal });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text response');

    const raw = textBlock.text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(raw);

    console.log('[analyze-insights] success', {
      score: result.score,
      sectionsCount: result.sections?.length,
      recoCount: result.recommendations?.length,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[analyze-insights] error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
