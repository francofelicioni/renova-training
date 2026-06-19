'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, StudentPlan, ExerciseLog, Attendance, ExerciseVideo, IntakeForm, MacroPlan } from '@/lib/types'
import { ThemeToggle } from './ThemeToggle'
import { SessionView } from './SessionView'
import { ProgressSection } from './ProgressSection'
import { AttendanceGrid } from './AttendanceGrid'
import { PRTable } from './PRTable'
import { IntakeFormView } from './IntakeFormView'
import { MacroCalculator } from './MacroCalculator'

type Tab = 'ses1' | 'ses2' | 'ses3' | 'asistencia' | 'progreso' | 'intake' | 'macros'

interface Props {
  student: Profile
  plan: Partial<StudentPlan>
  logs: ExerciseLog[]
  attendance: Attendance[]
  videos: ExerciseVideo[]
  intake: IntakeForm | null
  macroPlan: MacroPlan | null
}

export function CoachStudentView({ student, plan, logs, attendance, videos, intake, macroPlan }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('asistencia')
  const [week, setWeek] = useState(1)

  const mesoWeeks = plan.meso_weeks ?? 6
  const done = attendance.reduce((n, a) => n + (a.ses1?1:0) + (a.ses2?1:0) + (a.ses3?1:0), 0)
  const total = mesoWeeks * 3

  const TABS: { id: Tab; label: string }[] = [
    { id: 'asistencia', label: '📋 Asistencia' },
    { id: 'ses1',       label: '💪 Ses. 1' },
    { id: 'ses2',       label: '🦵 Ses. 2' },
    { id: 'ses3',       label: '🏆 Ses. 3' },
    { id: 'progreso',   label: '📈 PRs' },
    { id: 'intake',     label: '📝 Intake' },
    { id: 'macros',     label: '🥩 Macros' },
  ]

  const showWeekBar = ['ses1','ses2','ses3'].includes(tab)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/coach')} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: 'var(--text)' }}>← Atrás</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{student.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{student.email}</div>
        </div>
        <ThemeToggle />
      </header>

      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            border: 'none', background: 'none',
            padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            color: tab === t.id ? 'var(--cyan)' : 'var(--muted)',
            borderBottom: `2px solid ${tab === t.id ? 'var(--cyan)' : 'transparent'}`,
            transition: 'all .15s',
          }}>{t.label}</button>
        ))}
      </div>

      {showWeekBar && (
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 7, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[1,2,3,4,5,6,7,8].map(w => (
            <button key={w} onClick={() => setWeek(w)} style={{
              background: week === w ? (w > 4 ? 'var(--orange)' : 'var(--cyan)') : 'var(--surface-2)',
              border: `1px solid ${week !== w ? 'var(--border)' : (w > 4 ? 'var(--orange)' : 'var(--cyan)')}`,
              color: week === w ? '#000' : (w > 4 ? 'var(--orange)' : 'var(--muted)'),
              padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            }}>S{w}{w > 4 ? ' ★' : ''}</button>
          ))}
        </div>
      )}

      {tab === 'asistencia' && (
        <div style={{ padding: '18px 16px', maxWidth: 620, margin: '0 auto' }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 3 }}>📋 Asistencia</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>Mesociclo de {mesoWeeks} semanas</div>
          <ProgressSection done={done} total={total} />
          <AttendanceGrid
            studentId={student.id}
            mesoWeeks={mesoWeeks}
            initialAttendance={attendance}
            coachMode
          />
        </div>
      )}

      {tab === 'ses1' && <SessionView sessionKey="ses1" week={week} studentId={student.id} logs={logs} videos={videos} readonly />}
      {tab === 'ses2' && <SessionView sessionKey="ses2" week={week} studentId={student.id} logs={logs} videos={videos} readonly />}
      {tab === 'ses3' && <SessionView sessionKey="ses3" week={week} studentId={student.id} logs={logs} videos={videos} readonly />}

      {tab === 'progreso' && (
        <div style={{ padding: '18px 16px', maxWidth: 620, margin: '0 auto' }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>📈 Récords Personales</div>
          <PRTable logs={logs} />
        </div>
      )}

      {tab === 'intake' && (
        <div style={{ padding: '18px 16px', maxWidth: 620, margin: '0 auto' }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>📝 Formulario de ingreso</div>
          {intake ? <IntakeFormView intake={intake} /> : (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
              Este alumno no completó el formulario de ingreso.
            </div>
          )}
        </div>
      )}

      {tab === 'macros' && (
        <div style={{ padding: '18px 16px', maxWidth: 620, margin: '0 auto' }}>
          <MacroCalculator studentId={student.id} intake={intake} initialPlan={macroPlan} />
        </div>
      )}
    </div>
  )
}
