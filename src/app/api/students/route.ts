import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Solo coaches pueden crear alumnos
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'coach') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { name, email, password, objective, meso_weeks } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 1. Crear usuario en Supabase Auth
  const { data: newUser, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })

  // 2. Asignar coach_id y rol student en profiles
  await admin.from('profiles').update({
    role: 'student',
    coach_id: user.id,
    name,
  }).eq('id', newUser.user!.id)

  // 3. Crear student_plan
  await admin.from('student_plans').insert({
    student_id: newUser.user!.id,
    meso_weeks: meso_weeks ?? 6,
    objective: objective ?? '',
  })

  return NextResponse.json({ success: true, student_id: newUser.user!.id })
}
