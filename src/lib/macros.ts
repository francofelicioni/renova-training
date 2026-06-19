export type Sex = 'Masculino' | 'Femenino'

export type Goal =
  | 'Pérdida de grasa (déficit moderado)'
  | 'Recomposición corporal'
  | 'Mantenimiento'
  | 'Ganancia muscular (superávit moderado)'
  | 'Ganancia muscular (superávit agresivo)'

export const ACTIVITY_LEVELS = [
  { label: 'Sedentario (trabajo de escritorio, sin ejercicio)', factor: 1.2 },
  { label: 'Ligeramente activo (1–2 días/semana)', factor: 1.375 },
  { label: 'Moderadamente activo (3–4 días/semana)', factor: 1.55 },
  { label: 'Muy activo (5–6 días/semana)', factor: 1.725 },
  { label: 'Extra activo (2x/día o trabajo físico)', factor: 1.9 },
] as const

export const GOALS: { label: Goal; modifier: number }[] = [
  { label: 'Pérdida de grasa (déficit moderado)', modifier: 0.85 },
  { label: 'Recomposición corporal', modifier: 1.0 },
  { label: 'Mantenimiento', modifier: 1.0 },
  { label: 'Ganancia muscular (superávit moderado)', modifier: 1.1 },
  { label: 'Ganancia muscular (superávit agresivo)', modifier: 1.15 },
]

export function getGoalModifier(goal: Goal): number {
  return GOALS.find(g => g.label === goal)?.modifier ?? 1.0
}

export function calcAge(birthDate: string | Date): number {
  const bd = typeof birthDate === 'string' ? new Date(birthDate + 'T00:00:00') : birthDate
  const today = new Date()
  let age = today.getFullYear() - bd.getFullYear()
  const m = today.getMonth() - bd.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--
  return age
}

export function calcTMB(weightKg: number, heightCm: number, ageYears: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears
  return sex === 'Masculino' ? base + 5 : base - 161
}

export function calcTDEE(tmb: number, activityFactor: number): number {
  return tmb * activityFactor
}

export function calcTargetCalories(tdee: number, goalModifier: number): number {
  return tdee * goalModifier
}

export function calcDefaultMacros(
  targetCalories: number,
  weightKg: number,
  goal: Goal
): { protein_g: number; fat_g: number; carbs_g: number } {
  let proteinPerKg: number
  let fatPct: number

  switch (goal) {
    case 'Pérdida de grasa (déficit moderado)':
      proteinPerKg = 2.2
      fatPct = 0.25
      break
    case 'Recomposición corporal':
      proteinPerKg = 2.0
      fatPct = 0.25
      break
    case 'Mantenimiento':
      proteinPerKg = 1.8
      fatPct = 0.275
      break
    default:
      proteinPerKg = 2.0
      fatPct = 0.25
  }

  const protein_g = proteinPerKg * weightKg
  const fat_g = (targetCalories * fatPct) / 9
  const proteinCal = protein_g * 4
  const fatCal = fat_g * 9
  const carbs_g = (targetCalories - proteinCal - fatCal) / 4

  return {
    protein_g: Math.round(protein_g * 10) / 10,
    fat_g: Math.round(fat_g * 10) / 10,
    carbs_g: Math.round(Math.max(0, carbs_g) * 10) / 10,
  }
}

export function calcMacroCalories(protein_g: number, fat_g: number, carbs_g: number) {
  return {
    protein: protein_g * 4,
    fat: fat_g * 9,
    carbs: carbs_g * 4,
  }
}

export function calcMacroPercentages(proteinCal: number, fatCal: number, carbsCal: number, total: number) {
  if (total <= 0) return { protein: 0, fat: 0, carbs: 0 }
  return {
    protein: Math.round((proteinCal / total) * 100),
    fat: Math.round((fatCal / total) * 100),
    carbs: Math.round((carbsCal / total) * 100),
  }
}
