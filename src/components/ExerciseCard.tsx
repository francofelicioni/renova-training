'use client'
import { useState, useCallback } from 'react'
import type { Exercise, ExerciseLog, ExerciseVideo } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { VideoModal } from './VideoModal'

interface Props {
  exercise: Exercise
  sessionKey: string
  week: number
  studentId: string
  logs: ExerciseLog[]
  video?: ExerciseVideo
  readonly?: boolean
}

export function ExerciseCard({ exercise, sessionKey, week, studentId, logs, video, readonly }: Props) {
  const supabase = createClient()
  const [showHist, setShowHist] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [saving, setSaving] = useState(false)

  const currentLog = logs.find(l =>
    l.session_key === sessionKey && l.exercise_name === exercise.name && l.week === week
  )

  const [kg, setKg]       = useState(currentLog?.kg?.toString() ?? '')
  const [notes, setNotes] = useState(currentLog?.notes ?? '')

  const pr = logs
    .filter(l => l.session_key === sessionKey && l.exercise_name === exercise.name && l.kg != null)
    .reduce((mx, l) => (l.kg! > mx ? l.kg! : mx), 0)

  const save = useCallback(async (field: 'kg' | 'notes', val: string) => {
    if (readonly) return
    setSaving(true)
    const payload: Record<string, unknown> = {
      student_id: studentId,
      session_key: sessionKey,
      exercise_name: exercise.name,
      week,
      kg: field === 'kg' ? (parseFloat(val) || null) : (parseFloat(kg) || null),
      notes: field === 'notes' ? val : notes,
      updated_at: new Date().toISOString(),
    }
    await supabase.from('exercise_logs').upsert(payload, { onConflict: 'student_id,session_key,exercise_name,week' })
    setSaving(false)
  }, [kg, notes, week, sessionKey, exercise.name, studentId, readonly, supabase])

  const weekLogs = [1,2,3,4,5,6,7,8].map(w =>
    logs.find(l => l.session_key === sessionKey && l.exercise_name === exercise.name && l.week === w)
  )

  return (
    <>
      <div className="card" style={{ marginBottom: 12, borderColor: saving ? 'var(--cyan)' : 'var(--border)', transition: 'border-color .2s' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{exercise.name}</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 5 }}>
              <span className="tag tag-hi">{exercise.series} × {exercise.reps}</span>
              {exercise.rir !== '-' && <span className="tag">RIR {exercise.rir}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            {pr > 0 && (
              <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--orange)', fontWeight: 700, lineHeight: 1.4 }}>
                🏆 PR<br/><span style={{ fontSize: 15 }}>{pr} kg</span>
              </div>
            )}
            <button
              onClick={() => setShowVideo(true)}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12, color: 'var(--cyan)', fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'inherit' }}
            >
              ▶ Video
            </button>
          </div>
        </div>

        {/* Notas técnicas */}
        <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 11px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 13 }}>
          {exercise.notes}
        </div>

        {/* Input row */}
        {!readonly && (
          <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 10, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--muted)', marginBottom: 4 }}>
                {exercise.isTimeBased ? 'Seg' : 'Kg'}
              </div>
              <input
                type="number"
                className="input"
                step={exercise.isTimeBased ? '1' : '0.5'}
                value={kg}
                placeholder="—"
                style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', padding: '10px 6px' }}
                onChange={e => setKg(e.target.value)}
                onBlur={e => save('kg', e.target.value)}
              />
              <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center', marginTop: 3 }}>
                {exercise.isTimeBased ? 'seg' : 'kg'} · Sem {week}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--muted)', marginBottom: 4 }}>Notas</div>
              <textarea
                className="input"
                value={notes}
                placeholder="Sensaciones, ajustes..."
                rows={3}
                style={{ resize: 'none' }}
                onChange={e => setNotes(e.target.value)}
                onBlur={e => save('notes', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Historial */}
        <button
          onClick={() => setShowHist(v => !v)}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 11, cursor: 'pointer', padding: '8px 0 0', textDecoration: 'underline', fontFamily: 'inherit' }}
        >
          {showHist ? 'Ocultar historial ▴' : 'Ver historial semanas ▾'}
        </button>

        {showHist && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 3, marginTop: 9 }}>
            {weekLogs.map((l, i) => (
              <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 6, padding: '5px 2px', textAlign: 'center' }}>
                <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>S{i+1}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: l?.kg ? 'var(--cyan)' : 'var(--border)', marginTop: 1 }}>
                  {l?.kg ?? '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showVideo && (
        <VideoModal
          exerciseName={exercise.name}
          videoUrl={video?.video_url ?? ''}
          onClose={() => setShowVideo(false)}
        />
      )}
    </>
  )
}
