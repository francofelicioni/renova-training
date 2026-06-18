'use client'
import { EXERCISES } from '@/lib/exercises'
import type { ExerciseLog } from '@/lib/types'

interface Props { logs: ExerciseLog[] }

export function PRTable({ logs }: Props) {
  const allEx = Object.entries(EXERCISES).flatMap(([sk, exs]) => exs.map(ex => ({ ...ex, sk })))

  const rows = allEx.map(ex => {
    const relevant = logs.filter(l => l.session_key === ex.sk && l.exercise_name === ex.name && l.kg != null)
    const pr = relevant.reduce((mx, l) => (l.kg! > mx ? l.kg! : mx), 0)
    const label = ex.sk === 'ses1' ? '💪 S1' : ex.sk === 'ses2' ? '🦵 S2' : '🏆 S3'
    return { name: ex.name, label, pr }
  })

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '9px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--muted)' }}>Ejercicio</th>
            <th style={{ padding: '9px 8px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--muted)' }}>Ses.</th>
            <th style={{ padding: '9px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--muted)', textAlign: 'right' }}>Mejor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '11px 12px', fontSize: 13 }}>{r.name}</td>
              <td style={{ padding: '11px 8px', textAlign: 'center' }}>
                <span style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: 'var(--muted)' }}>{r.label}</span>
              </td>
              <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: r.pr > 0 ? 800 : 400, fontSize: r.pr > 0 ? 16 : 13, color: r.pr > 0 ? 'var(--orange)' : 'var(--muted)' }}>
                {r.pr > 0 ? `${r.pr} kg` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
