'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, StudentPlan, ExerciseLog, Attendance, ExerciseVideo } from '@/lib/types'
import { ThemeToggle } from './ThemeToggle'
import { SessionView } from './SessionView'
import { ProgressSection } from './ProgressSection'
import { AttendanceGrid } from './AttendanceGrid'
import { PRTable } from './PRTable'

type Page = 'home' | 'warmup' | 'ses1' | 'ses2' | 'ses3' | 'progreso'

interface Props {
  profile: Profile
  plan: Partial<StudentPlan>
  initialLogs: ExerciseLog[]
  initialAttendance: Attendance[]
  videos: ExerciseVideo[]
}

const WEEKS = [1,2,3,4,5,6,7,8]

export function StudentApp({ profile, plan, initialLogs, initialAttendance, videos }: Props) {
  const [page, setPage] = useState<Page>('home')
  const [week, setWeek] = useState(1)
  const [logs] = useState(initialLogs)
  const [attendance] = useState(initialAttendance)
  const router = useRouter()
  const supabase = createClient()

  const mesoWeeks = plan.meso_weeks ?? 6
  const done = attendance.reduce((n, a) => n + (a.ses1?1:0) + (a.ses2?1:0) + (a.ses3?1:0), 0)
  const total = mesoWeeks * 3

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const showWeekBar = ['ses1','ses2','ses3'].includes(page)

  const NAV: { id: Page; icon: string; label: string }[] = [
    { id: 'home',     icon: '🏠', label: 'Inicio' },
    { id: 'warmup',   icon: '🔥', label: 'Warm Up' },
    { id: 'ses1',     icon: '💪', label: 'Ses. 1' },
    { id: 'ses2',     icon: '🦵', label: 'Ses. 2' },
    { id: 'ses3',     icon: '🏆', label: 'Ses. 3' },
    { id: 'progreso', icon: '📈', label: 'Progreso' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 72 }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.18em', color: 'var(--cyan)', textTransform: 'uppercase' }}>Renova Training</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{profile.name}</span>
          <ThemeToggle />
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted)', fontFamily: 'inherit' }}>Salir</button>
        </div>
      </header>

      {/* Week bar */}
      {showWeekBar && (
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 7, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', alignSelf: 'center', whiteSpace: 'nowrap', marginRight: 4 }}>Semana</span>
          {WEEKS.map(w => (
            <button key={w} onClick={() => setWeek(w)} style={{
              background: week === w ? (w > 4 ? 'var(--orange)' : 'var(--cyan)') : 'var(--surface-2)',
              border: `1px solid ${week !== w ? 'var(--border)' : (w > 4 ? 'var(--orange)' : 'var(--cyan)')}`,
              color: week === w ? '#000' : (w > 4 ? 'var(--orange)' : 'var(--muted)'),
              padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit'
            }}>
              S{w}{w > 4 ? ' ★' : ''}
            </button>
          ))}
        </div>
      )}

      {/* Pages */}
      {page === 'home' && (
        <div style={{ padding: '18px 16px', maxWidth: 620, margin: '0 auto' }}>
          {/* Hero */}
          <div style={{ background: 'linear-gradient(135deg,var(--surface) 0%,#0a1a1f 100%)', border: '1px solid var(--border)', borderRadius: 14, padding: '26px 22px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -8, top: -18, fontSize: 110, fontWeight: 900, color: 'rgba(0,229,255,.04)', lineHeight: 1, pointerEvents: 'none' }}>RT</div>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.2em', color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: 4 }}>Plan de Entrenamiento</div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-.03em', marginBottom: 14 }}>{profile.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {plan.objective && <div style={{ display: 'flex', gap: 8, fontSize: 13 }}><span style={{ color: 'var(--muted)', minWidth: 90 }}>Objetivo</span><span style={{ fontWeight: 600 }}>{plan.objective}</span></div>}
              <div style={{ display: 'flex', gap: 8, fontSize: 13 }}><span style={{ color: 'var(--muted)', minWidth: 90 }}>Frecuencia</span><span style={{ fontWeight: 600 }}>3 sesiones por semana</span></div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13 }}><span style={{ color: 'var(--muted)', minWidth: 90 }}>Mesociclo</span><span style={{ fontWeight: 600 }}>{mesoWeeks} semanas</span></div>
            </div>
          </div>

          <ProgressSection done={done} total={total} />

          {/* Quick links */}
          {[
            { id: 'warmup' as Page, icon: '🔥', label: 'Warm Up', sub: '4 ejercicios · 2 vueltas' },
            { id: 'ses1' as Page,   icon: '💪', label: 'Sesión 1', sub: 'Cuádriceps · Pecho · Espalda · Bíceps · Core' },
            { id: 'ses2' as Page,   icon: '🦵', label: 'Sesión 2', sub: 'Isquios · Glúteos · Pecho · Espalda · Tríceps · Core' },
            { id: 'ses3' as Page,   icon: '🏆', label: 'Sesión 3', sub: 'Pierna completa · Hombros · Espalda · Core' },
          ].map(s => (
            <div key={s.id} className="card" onClick={() => setPage(s.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{s.sub}</div>
              </div>
              <span style={{ fontSize: 20, color: 'var(--muted)' }}>›</span>
            </div>
          ))}
        </div>
      )}

      {page === 'warmup' && <SessionView sessionKey="warmup" week={week} studentId={profile.id} logs={logs} videos={videos} />}
      {page === 'ses1'   && <SessionView sessionKey="ses1" week={week} studentId={profile.id} logs={logs} videos={videos} />}
      {page === 'ses2'   && <SessionView sessionKey="ses2" week={week} studentId={profile.id} logs={logs} videos={videos} />}
      {page === 'ses3'   && <SessionView sessionKey="ses3" week={week} studentId={profile.id} logs={logs} videos={videos} />}

      {page === 'progreso' && (
        <div style={{ padding: '18px 16px', maxWidth: 620, margin: '0 auto' }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 3 }}>📈 Mi Progreso</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>{profile.name} · Renova Training</div>
          <ProgressSection done={done} total={total} />
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🏆 Récords Personales</div>
          <PRTable logs={logs} />
        </div>
      )}

      {/* Bottom nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', zIndex: 200 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '9px 2px', cursor: 'pointer', border: 'none', background: 'none',
            color: page === n.id ? 'var(--cyan)' : 'var(--muted)',
            fontSize: 9, fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '.04em', gap: 3,
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
