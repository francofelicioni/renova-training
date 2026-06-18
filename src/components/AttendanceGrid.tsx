'use client'
import { useState } from 'react'
import type { Attendance } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  studentId: string
  mesoWeeks: number
  initialAttendance: Attendance[]
  coachMode?: boolean
}

export function AttendanceGrid({ studentId, mesoWeeks, initialAttendance, coachMode }: Props) {
  const supabase = createClient()
  const [att, setAtt] = useState<Record<number, { ses1: boolean; ses2: boolean; ses3: boolean; coach_notes: string }>>(
    Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => {
        const w = i + 1
        const found = initialAttendance.find(a => a.week === w)
        return [w, { ses1: found?.ses1 ?? false, ses2: found?.ses2 ?? false, ses3: found?.ses3 ?? false, coach_notes: found?.coach_notes ?? '' }]
      })
    )
  )

  async function toggle(week: number, ses: 'ses1' | 'ses2' | 'ses3') {
    if (!coachMode) return
    const updated = { ...att[week], [ses]: !att[week][ses] }
    setAtt(prev => ({ ...prev, [week]: updated }))
    await supabase.from('attendance').upsert(
      { student_id: studentId, week, ...updated, updated_at: new Date().toISOString() },
      { onConflict: 'student_id,week' }
    )
  }

  async function saveNote(week: number, val: string) {
    if (!coachMode) return
    setAtt(prev => ({ ...prev, [week]: { ...prev[week], coach_notes: val } }))
    await supabase.from('attendance').upsert(
      { student_id: studentId, week, ...att[week], coach_notes: val, updated_at: new Date().toISOString() },
      { onConflict: 'student_id,week' }
    )
  }

  const done = Object.values(att).reduce((n, a) => n + (a.ses1?1:0) + (a.ses2?1:0) + (a.ses3?1:0), 0)
  const total = mesoWeeks * 3

  const HDR: React.CSSProperties = { fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--muted)', padding: '9px 12px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', textAlign: 'center' }
  const ROW_GRID = '80px 1fr 1fr 1fr 56px'

  return (
    <div>
      {/* Grid */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: ROW_GRID }}>
          <div style={{ ...HDR, textAlign: 'left' }}>Sem</div>
          <div style={HDR}>💪 S1</div>
          <div style={HDR}>🦵 S2</div>
          <div style={HDR}>🏆 S3</div>
          <div style={HDR}>%</div>
        </div>
        {Array.from({ length: 8 }, (_, i) => {
          const w = i + 1
          const a = att[w]
          const dw = (a.ses1?1:0) + (a.ses2?1:0) + (a.ses3?1:0)
          const active = w <= mesoWeeks
          const pctCol = dw===3?'var(--green)':dw>0?'var(--orange)':'var(--muted)'
          return (
            <div key={w} style={{ display: 'grid', gridTemplateColumns: ROW_GRID, borderTop: '1px solid var(--border)', opacity: active ? 1 : 0.3 }}>
              <div style={{ padding: '11px 12px', fontSize: 12, fontWeight: 600 }}>Sem {w}</div>
              {(['ses1','ses2','ses3'] as const).map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 4px' }}>
                  <div
                    onClick={() => active && toggle(w, s)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      border: `2px solid ${a[s] ? 'var(--green)' : 'var(--border)'}`,
                      background: a[s] ? 'var(--green)' : 'var(--surface-2)',
                      cursor: active && coachMode ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 700, color: a[s] ? '#000' : 'transparent',
                      transition: 'all .15s', userSelect: 'none',
                    }}
                  >✓</div>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: pctCol }}>
                {active ? Math.round(dw/3*100)+'%' : '—'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Coach notes per week */}
      {coachMode && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Notas por semana</div>
          {Array.from({ length: mesoWeeks }, (_, i) => i + 1).map(w => (
            <div key={w} className="card" style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 6 }}>Semana {w}</div>
              <textarea
                className="input"
                rows={2}
                style={{ resize: 'none' }}
                placeholder="Notas del coach para esta semana..."
                value={att[w].coach_notes}
                onChange={e => setAtt(prev => ({ ...prev, [w]: { ...prev[w], coach_notes: e.target.value } }))}
                onBlur={e => saveNote(w, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
