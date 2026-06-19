import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { appendToSheet, buildSheetRow } from '@/lib/google-sheets'

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, email, nombre } = body

  if (!type || !email || !nombre) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }
  if (type !== 'remote' && type !== 'presencial') {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  const tempPassword = generateTempPassword()
  const admin = createAdminClient()

  const { data: newUser, error: authErr } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: nombre },
  })
  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 400 })
  }

  const studentId = newUser.user!.id

  await admin.from('profiles').update({
    role: 'student',
    name: nombre,
  }).eq('id', studentId)

  const intakeData = {
    student_id: studentId,
    type,
    nombre: body.nombre ?? null,
    email: body.email ?? null,
    whatsapp: body.whatsapp ?? null,
    fecha_nacimiento: body.fecha_nacimiento || null,
    residencia: body.residencia ?? null,
    movilidad_propia: body.movilidad_propia ?? null,
    sexo: body.sexo ?? null,
    peso_kg: body.peso_kg ?? null,
    altura_cm: body.altura_cm ?? null,
    ocupacion_actividad: body.ocupacion_actividad ?? null,
    nivel_actividad: body.nivel_actividad ?? null,
    tiene_planificacion: body.tiene_planificacion ?? null,
    descripcion_planificacion: body.descripcion_planificacion ?? null,
    tiempo_inactivo: body.tiempo_inactivo ?? null,
    experiencia_fuerza: body.experiencia_fuerza ?? null,
    ejercicios_familiares: body.ejercicios_familiares ?? [],
    ejercicios_excluidos: body.ejercicios_excluidos ?? null,
    lesiones_salud: body.lesiones_salud ?? null,
    nivel_estres: body.nivel_estres ?? null,
    pasos_diarios: body.pasos_diarios ?? null,
    sueno_horario: body.sueno_horario ?? null,
    sueno_horas: body.sueno_horas ?? null,
    alimentacion_tipica: body.alimentacion_tipica ?? null,
    num_comidas: body.num_comidas ?? null,
    descripcion_alimentacion: body.descripcion_alimentacion ?? null,
    suplementos: body.suplementos ?? null,
    objetivo: body.objetivo ?? null,
    sesiones_semana: body.sesiones_semana ?? null,
    tiempo_sesion: body.tiempo_sesion ?? null,
    motivacion_ahora: body.motivacion_ahora ?? null,
    compromiso_nivel: body.compromiso_nivel ?? null,
    compromiso_no_10: body.compromiso_no_10 ?? null,
    como_llego: body.como_llego ?? null,
    info_adicional: body.info_adicional ?? null,
    lugar_entrenamiento: body.lugar_entrenamiento ?? null,
    horarios_preferidos: body.horarios_preferidos ?? [],
    sesiones_presenciales: body.sesiones_presenciales ?? null,
    inversion_dispuesto: body.inversion_dispuesto ?? null,
    trabajo_entrenador_previo: body.trabajo_entrenador_previo ?? null,
  }

  const { error: intakeErr } = await admin.from('intake_forms').insert(intakeData)
  if (intakeErr) {
    return NextResponse.json({ error: intakeErr.message }, { status: 500 })
  }

  const sheetId = type === 'presencial'
    ? process.env.GOOGLE_SHEET_ID_PRESENCIAL
    : process.env.GOOGLE_SHEET_ID_REMOTE

  if (sheetId && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    try {
      await appendToSheet(sheetId, buildSheetRow(body, type))
    } catch (err) {
      console.error('Google Sheets append failed:', err)
    }
  }

  return NextResponse.json({ email, tempPassword })
}
