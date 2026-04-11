import { supabase } from '@/lib/supabase';

export async function getWaterForDate(dateId: string): Promise<number> {
  const { data, error } = await supabase
    .from('water_logs')
    .select('amount_ml')
    .eq('date_id', dateId)
    .maybeSingle();

  if (error) throw error;
  return data?.amount_ml ?? 0;
}

export async function setWaterForDate(dateId: string, amountMl: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('water_logs')
    .upsert(
      {
        user_id: user.id,
        date_id: dateId,
        amount_ml: amountMl,
        logged_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date_id' },
    );

  if (error) throw error;
}

export async function getWaterForMonth(
  year: number,
  month: number,
): Promise<Record<string, number>> {
  const pad = (n: number) => String(n).padStart(2, '0');
  const prefix = `${year}-${pad(month)}`;

  const { data, error } = await supabase
    .from('water_logs')
    .select('date_id, amount_ml')
    .like('date_id', `${prefix}-%`);

  if (error) throw error;

  const result: Record<string, number> = {};
  for (const row of data ?? []) {
    result[row.date_id] = row.amount_ml;
  }
  return result;
}
