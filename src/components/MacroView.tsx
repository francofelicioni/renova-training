'use client'
import type { MacroPlan } from '@/lib/types'
import { calcMacroCalories, calcMacroPercentages } from '@/lib/macros'

interface Props {
  plan: MacroPlan | null
}

export function MacroView({ plan }: Props) {
  if (!plan || !plan.target_calories) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🥩</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Plan nutricional en preparación</div>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
          Tu entrenadora está preparando tu plan nutricional. ¡Pronto lo verás acá!
        </p>
      </div>
    )
  }

  const target = plan.target_calories
  const protein = plan.protein_g ?? 0
  const fat = plan.fat_g ?? 0
  const carbs = plan.carbs_g ?? 0
  const cals = calcMacroCalories(protein, fat, carbs)
  const pcts = calcMacroPercentages(cals.protein, cals.fat, cals.carbs, target)

  const macros = [
    { label: 'Proteínas', g: protein, cal: cals.protein, pct: pcts.protein, color: 'var(--cyan)' },
    { label: 'Carbohidratos', g: carbs, cal: cals.carbs, pct: pcts.carbs, color: 'var(--orange)' },
    { label: 'Grasas', g: fat, cal: cals.fat, pct: pcts.fat, color: 'var(--green)' },
  ]

  return (
    <div style={{ padding: '18px 16px', maxWidth: 620, margin: '0 auto' }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 3 }}>🥩 Mis Macros</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>Objetivo diario de calorías y macronutrientes</div>

      <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
          Calorías objetivo
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--green)' }}>
          {Math.round(target).toLocaleString()}
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--muted)' }}> kcal/día</span>
        </div>
        {plan.goal && (
          <div style={{ marginTop: 8 }}>
            <span className="tag">{plan.goal}</span>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        {macros.map(m => (
          <div key={m.label} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{m.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.g}g</span>
            </div>
            <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 6, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 6, transition: 'width .5s' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              {Math.round(m.cal)} kcal · {m.pct}% del total
            </div>
          </div>
        ))}
      </div>

      {plan.coach_notes && (
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
            Notas de tu entrenadora
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{plan.coach_notes}</p>
        </div>
      )}
    </div>
  )
}
