'use client'
import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { IntakeForm, MacroPlan } from '@/lib/types'
import {
  ACTIVITY_LEVELS, GOALS, type Goal, type Sex,
  calcAge, calcTMB, calcTDEE, calcTargetCalories, calcDefaultMacros,
  getGoalModifier, calcMacroCalories, calcMacroPercentages,
} from '@/lib/macros'

const LABEL: React.CSSProperties = {
  fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
  letterSpacing: '.09em', display: 'block', marginBottom: 5,
}

interface Props {
  studentId: string
  intake: IntakeForm | null
  initialPlan: MacroPlan | null
}

export function MacroCalculator({ studentId, intake, initialPlan }: Props) {
  const supabase = createClient()

  const [weightKg, setWeightKg] = useState(String(initialPlan?.weight_kg ?? intake?.peso_kg ?? ''))
  const [heightCm, setHeightCm] = useState(String(initialPlan?.height_cm ?? intake?.altura_cm ?? ''))
  const [birthDate, setBirthDate] = useState(initialPlan?.birth_date ?? intake?.fecha_nacimiento ?? '')
  const [sex, setSex] = useState<Sex>((initialPlan?.sex ?? intake?.sexo ?? 'Masculino') as Sex)
  const [activityFactor, setActivityFactor] = useState(initialPlan?.activity_factor ?? 1.55)
  const [goal, setGoal] = useState<Goal>((initialPlan?.goal as Goal) ?? 'Mantenimiento')
  const [coachNotes, setCoachNotes] = useState(initialPlan?.coach_notes ?? '')
  const [overrideProtein, setOverrideProtein] = useState<number | null>(initialPlan?.protein_g ?? null)
  const [overrideFat, setOverrideFat] = useState<number | null>(initialPlan?.fat_g ?? null)
  const [overrideCarbs, setOverrideCarbs] = useState<number | null>(initialPlan?.carbs_g ?? null)
  const [manualOverride, setManualOverride] = useState(!!initialPlan)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const w = parseFloat(weightKg) || 0
  const h = parseInt(heightCm) || 0
  const age = birthDate ? calcAge(birthDate) : 0
  const goalModifier = getGoalModifier(goal)

  const calculated = useMemo(() => {
    if (!w || !h || !age || !sex) return null
    const tmb = calcTMB(w, h, age, sex)
    const tdee = calcTDEE(tmb, activityFactor)
    const targetCalories = calcTargetCalories(tdee, goalModifier)
    const defaults = calcDefaultMacros(targetCalories, w, goal)
    return { tmb, tdee, targetCalories, defaults }
  }, [w, h, age, sex, activityFactor, goalModifier, goal])

  useEffect(() => {
    if (!manualOverride && calculated) {
      setOverrideProtein(calculated.defaults.protein_g)
      setOverrideFat(calculated.defaults.fat_g)
      setOverrideCarbs(calculated.defaults.carbs_g)
    }
  }, [calculated, manualOverride])

  const protein_g = overrideProtein ?? calculated?.defaults.protein_g ?? 0
  const fat_g = overrideFat ?? calculated?.defaults.fat_g ?? 0
  const carbs_g = overrideCarbs ?? calculated?.defaults.carbs_g ?? 0
  const targetCal = calculated?.targetCalories ?? 0
  const macroCals = calcMacroCalories(protein_g, fat_g, carbs_g)
  const pcts = calcMacroPercentages(macroCals.protein, macroCals.fat, macroCals.carbs, targetCal)

  async function handleSave() {
    if (!calculated) { setError('Completá peso, altura, fecha de nacimiento y sexo'); return }
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const row = {
        student_id: studentId,
        weight_kg: w,
        height_cm: h,
        birth_date: birthDate,
        sex,
        activity_factor: activityFactor,
        goal,
        goal_modifier: goalModifier,
        tmb: Math.round(calculated.tmb * 100) / 100,
        tdee: Math.round(calculated.tdee * 100) / 100,
        target_calories: Math.round(calculated.targetCalories * 100) / 100,
        protein_g,
        fat_g,
        carbs_g,
        coach_notes: coachNotes,
        updated_at: new Date().toISOString(),
      }
      const { error: err } = await supabase.from('macro_plans').upsert(row, { onConflict: 'student_id' })
      if (err) { setError(err.message); return }
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>🥩 Calculadora de macros</div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Datos base</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={LABEL}>Peso (kg)</label>
            <input className="input" type="number" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} />
          </div>
          <div>
            <label style={LABEL}>Altura (cm)</label>
            <input className="input" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={LABEL}>Fecha de nacimiento</label>
            <input className="input" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
          </div>
          <div>
            <label style={LABEL}>Sexo biológico</label>
            <select className="input" value={sex} onChange={e => setSex(e.target.value as Sex)}>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={LABEL}>Nivel de actividad</label>
          <select className="input" value={activityFactor} onChange={e => setActivityFactor(parseFloat(e.target.value))}>
            {ACTIVITY_LEVELS.map(l => (
              <option key={l.factor} value={l.factor}>{l.label} (×{l.factor})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={LABEL}>Objetivo</label>
          <select className="input" value={goal} onChange={e => { setGoal(e.target.value as Goal); setManualOverride(false) }}>
            {GOALS.map(g => <option key={g.label} value={g.label}>{g.label}</option>)}
          </select>
        </div>
      </div>

      {calculated && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={LABEL}>TMB</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cyan)' }}>{Math.round(calculated.tmb).toLocaleString()} kcal</div>
            </div>
            <div>
              <div style={LABEL}>TDEE</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cyan)' }}>{Math.round(calculated.tdee).toLocaleString()} kcal</div>
            </div>
            <div>
              <div style={LABEL}>Objetivo</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{goal}</div>
            </div>
            <div>
              <div style={LABEL}>Target</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>{Math.round(calculated.targetCalories).toLocaleString()} kcal</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            {[
              { label: 'Proteínas', g: protein_g, cal: macroCals.protein, pct: pcts.protein, color: 'var(--cyan)', set: setOverrideProtein },
              { label: 'Carbohidratos', g: carbs_g, cal: macroCals.carbs, pct: pcts.carbs, color: 'var(--orange)', set: setOverrideCarbs },
              { label: 'Grasas', g: fat_g, cal: macroCals.fat, pct: pcts.fat, color: 'var(--green)', set: setOverrideFat },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 100, fontSize: 13, fontWeight: 600 }}>{m.label}</div>
                <input className="input" type="number" step="0.1" style={{ width: 70, padding: '6px 8px' }}
                  value={m.g} onChange={e => { m.set(parseFloat(e.target.value) || 0); setManualOverride(true) }} />
                <span style={{ fontSize: 12, color: 'var(--muted)', flex: 1 }}>{Math.round(m.cal)} kcal · {m.pct}%</span>
                <div style={{ width: 60, height: 6, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 14 }}>
        <label style={LABEL}>Notas para el alumno</label>
        <textarea className="input" rows={3} value={coachNotes} onChange={e => setCoachNotes(e.target.value)}
          placeholder="Indicaciones nutricionales, timing de comidas..." />
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 12 }}>
          {error}
        </div>
      )}
      {saved && (
        <div style={{ background: 'rgba(0,230,118,.12)', border: '1px solid rgba(0,230,118,.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--green)', marginBottom: 12 }}>
          Plan guardado correctamente
        </div>
      )}

      <button className="btn-primary" onClick={handleSave} disabled={saving || !calculated}>
        {saving ? 'Guardando...' : 'Guardar plan de macros'}
      </button>
    </div>
  )
}
