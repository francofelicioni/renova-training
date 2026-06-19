export type Role = 'coach' | 'student'

export interface Profile {
  id: string
  name: string
  email: string | null
  role: Role
  coach_id: string | null
  avatar_url: string | null
  created_at: string
}

export interface StudentPlan {
  id: string
  student_id: string
  meso_weeks: number
  objective: string
  updated_at: string
}

export interface ExerciseLog {
  id: string
  student_id: string
  session_key: string
  exercise_name: string
  week: number
  kg: number | null
  notes: string
  updated_at: string
}

export interface Attendance {
  id: string
  student_id: string
  week: number
  ses1: boolean
  ses2: boolean
  ses3: boolean
  coach_notes: string
  updated_at: string
}

export interface ExerciseVideo {
  id: string
  exercise_name: string
  video_url: string
  updated_at: string
}

export interface Exercise {
  name: string
  series: number
  reps: string
  rir: number | '-'
  notes: string
  isTimeBased?: boolean
}

export type IntakeType = 'remote' | 'presencial'

export interface IntakeForm {
  id: string
  student_id: string
  type: IntakeType
  nombre: string | null
  email: string | null
  whatsapp: string | null
  fecha_nacimiento: string | null
  residencia: string | null
  movilidad_propia: string | null
  sexo: string | null
  peso_kg: number | null
  altura_cm: number | null
  ocupacion_actividad: string | null
  nivel_actividad: string | null
  tiene_planificacion: string | null
  descripcion_planificacion: string | null
  tiempo_inactivo: string | null
  experiencia_fuerza: string | null
  ejercicios_familiares: string[] | null
  ejercicios_excluidos: string | null
  lesiones_salud: string | null
  nivel_estres: string | null
  pasos_diarios: string | null
  sueno_horario: string | null
  sueno_horas: string | null
  alimentacion_tipica: string | null
  num_comidas: string | null
  descripcion_alimentacion: string | null
  suplementos: string | null
  objetivo: string | null
  sesiones_semana: string | null
  tiempo_sesion: string | null
  motivacion_ahora: string | null
  compromiso_nivel: number | null
  compromiso_no_10: string | null
  como_llego: string | null
  info_adicional: string | null
  lugar_entrenamiento: string | null
  horarios_preferidos: string[] | null
  sesiones_presenciales: string | null
  inversion_dispuesto: string | null
  trabajo_entrenador_previo: string | null
  submitted_at: string
}

export interface MacroPlan {
  id: string
  student_id: string
  weight_kg: number | null
  height_cm: number | null
  birth_date: string | null
  sex: 'Masculino' | 'Femenino' | null
  activity_factor: number
  goal: string
  goal_modifier: number
  tmb: number | null
  tdee: number | null
  target_calories: number | null
  protein_g: number | null
  fat_g: number | null
  carbs_g: number | null
  coach_notes: string
  updated_at: string
}
