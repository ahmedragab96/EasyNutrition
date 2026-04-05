import { supabase } from '@/lib/supabase';

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Store displayName in auth metadata — readable before email confirmation
      // and synced to user_profiles once the session is established.
      data: { display_name: displayName },
    },
  });
  if (error) throw new Error(error.message);
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
