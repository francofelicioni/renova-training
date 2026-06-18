'use client'
import { EXERCISES, WARMUP, SESSION_LABELS } from '@/lib/exercises'
import type { ExerciseLog, ExerciseVideo } from '@/lib/types'
import { ExerciseCard } from './ExerciseCard'

interface Props {
  sessionKey: string   // 'warmup' | 'ses1' | 'ses2' | 'ses3'
  week: number
  studentId: string
  logs: ExerciseLog[]
  videos: ExerciseVideo[]
  readonly?: boolean
}

export function SessionView({ sessionKey, week, studentId, logs, videos, readonly }: Props) {
  const isWarmup = sessionKey === 'warmup'
  const exercises = isWarmup ? WARMUP : (EXERCISES[sessionKey] ?? [])
  const label = isWarmup ? { icon: '🔥', title: 'Warm Up', subtitle: '2 vueltas · antes de cada sesión' } : SESSION_LABELS[sessionKey]

  const videoMap = Object.fromEntries(videos.map(v => [v.exercise_name, v]))

  return (
    <div style={{ padding: '18px 16px', maxWidth: 620, margin: '0 auto' }}>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 3 }}>
        {label.icon} {label.title}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>{label.subtitle}</div>

      {isWarmup ? (
        exercises.map((ex, i) => (
          <div key={i} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>{ex.name}</div>
                <span className="tag tag-hi">{ex.reps}</span>
              </div>
              <button
                onClick={() => {/* VideoModal inline */}}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12, color: 'var(--cyan)', fontWeight: 600, fontFamily: 'inherit' }}
              >
                ▶ Video
              </button>
            </div>
            <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 11px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginTop: 10 }}>
              {ex.notes}
            </div>
          </div>
        ))
      ) : (
        exercises.map((ex, i) => (
          <ExerciseCard
            key={i}
            exercise={ex}
            sessionKey={sessionKey}
            week={week}
            studentId={studentId}
            logs={logs}
            video={videoMap[ex.name]}
            readonly={readonly}
          />
        ))
      )}
    </div>
  )
}
