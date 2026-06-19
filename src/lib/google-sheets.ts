import { google } from 'googleapis'

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function appendToSheet(sheetId: string, values: (string | number | null)[]) {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  })
}

export function buildSheetRow(data: Record<string, unknown>, type: string): (string | number | null)[] {
  const str = (v: unknown): string | number | null => {
    if (v == null) return ''
    if (typeof v === 'string' || typeof v === 'number') return v
    return String(v)
  }
  const arr = (v: unknown) => (Array.isArray(v) ? v.join(', ') : str(v))
  return [
    new Date().toISOString(),
    type,
    str(data.nombre),
    str(data.email),
    str(data.whatsapp),
    str(data.fecha_nacimiento),
    str(data.residencia),
    str(data.movilidad_propia),
    str(data.sexo),
    str(data.peso_kg),
    str(data.altura_cm),
    str(data.ocupacion_actividad),
    str(data.nivel_actividad),
    str(data.tiene_planificacion),
    str(data.descripcion_planificacion),
    str(data.tiempo_inactivo),
    str(data.experiencia_fuerza),
    arr(data.ejercicios_familiares),
    str(data.ejercicios_excluidos),
    str(data.lesiones_salud),
    str(data.nivel_estres),
    str(data.pasos_diarios),
    str(data.sueno_horario),
    str(data.sueno_horas),
    str(data.alimentacion_tipica),
    str(data.num_comidas),
    str(data.descripcion_alimentacion),
    str(data.suplementos),
    str(data.objetivo),
    str(data.sesiones_semana),
    str(data.tiempo_sesion),
    str(data.motivacion_ahora),
    str(data.compromiso_nivel),
    str(data.compromiso_no_10),
    str(data.como_llego),
    str(data.info_adicional),
    str(data.lugar_entrenamiento),
    arr(data.horarios_preferidos),
    str(data.sesiones_presenciales),
    str(data.inversion_dispuesto),
    str(data.trabajo_entrenador_previo),
  ]
}
