import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'coach') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { student_id } = await req.json()
  if (!student_id) return NextResponse.json({ error: 'Falta student_id' }, { status: 400 })

  const admin = createAdminClient()

  const { data: student } = await admin.from('profiles')
    .select('id, role, coach_id')
    .eq('id', student_id)
    .single()

  if (!student || student.role !== 'student' || student.coach_id !== null) {
    return NextResponse.json({ error: 'Alumno no disponible para asignar' }, { status: 400 })
  }

  const { data: intake } = await admin.from('intake_forms')
    .select('objetivo')
    .eq('student_id', student_id)
    .single()

  await admin.from('profiles').update({ coach_id: user.id }).eq('id', student_id)

  await admin.from('student_plans').insert({
    student_id,
    meso_weeks: 6,
    objective: intake?.objetivo ?? '',
  })

  return NextResponse.json({ success: true })
}
