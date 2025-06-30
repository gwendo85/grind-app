import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, workout_id, exercise_name, set_number, timestamp, success } = body;

  if (!user_id || !workout_id || !exercise_name || !set_number) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('workout_sets').insert({
    user_id,
    workout_id,
    exercise_name,
    set_number,
    timestamp,
    success
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
} 