'use client'

interface Props {
  done: number
  total: number
}

function pctMsg(p: number) {
  if (p >= 1)   return '🏆 ¡Mesociclo completado! — ¡Increíble trabajo!'
  if (p >= .75) return '🔥 En la recta final — ¡No pares ahora!'
  if (p >= .5)  return '💪 ¡Más de la mitad! — ¡Seguís fuerte!'
  if (p > 0)    return '🎯 ¡Buen comienzo! — A seguir así'
  return '📅 Lista para empezar — ¡Vamos!'
}

export function ProgressSection({ done, total }: Props) {
  const pct = total > 0 ? done / total : 0

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{done} de {total} sesiones</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--cyan)' }}>{Math.round(pct * 100)}%</span>
      </div>
      <div style={{ height: 9, background: 'var(--surface-2)', borderRadius: 9, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: 'linear-gradient(90deg,var(--cyan),#0090a8)', borderRadius: 9, transition: 'width .5s ease' }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{pctMsg(pct)}</div>
    </div>
  )
}
