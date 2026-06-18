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
