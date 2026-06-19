'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, IntakeForm } from '@/lib/types'
import { ThemeToggle } from './ThemeToggle'

interface StudentSummary extends Profile {
  mesoWeeks: number
  sessionsDone: number
  sessionsTotal: number
  hasPlan: boolean
}

interface PendingStudent extends Profile {
  intake: IntakeForm | null
}

interface Props {
  profile: Profile
  students: StudentSummary[]
  pending: PendingStudent[]
}

export function CoachDashboard({ profile, students: initialStudents, pending: initialPending }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [students] = useState(initialStudents)
  const [pending, setPending] = useState(initialPending)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', objective: '', meso_weeks: '6' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [assigning, setAssigning] = useState<string | null>(null)
  const [selectedPending, setSelectedPending] = useState<PendingStudent | null>(null)

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function createStudent(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, meso_weeks: parseInt(form.meso_weeks) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setShowForm(false)
      setForm({ name: '', email: '', password: '', objective: '', meso_weeks: '6' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function assignStudent(studentId: string) {
    setAssigning(studentId)
    try {
      const res = await fetch('/api/students/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setPending(p => p.filter(s => s.id !== studentId))
      setSelectedPending(null)
      router.refresh()
    } finally {
      setAssigning(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.18em', color: 'var(--cyan)', textTransform: 'uppercase' }}>Renova Training</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{profile.name}</span>
          <ThemeToggle />
          <a href="/coach/settings" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>⚙️ Videos</a>
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted)', fontFamily: 'inherit' }}>Salir</button>
        </div>
      </header>

      <div style={{ padding: '20px 16px', maxWidth: 640, margin: '0 auto' }}>
        {/* Pending requests */}
        {pending.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Solicitudes pendientes</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
              {pending.length} {pending.length === 1 ? 'solicitud' : 'solicitudes'} sin asignar
            </div>
            {pending.map(s => (
              <div key={s.id} className="card" style={{ marginBottom: 10, cursor: 'pointer' }}
                onClick={() => setSelectedPending(selectedPending?.id === s.id ? null : s)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {s.intake && (
                      <span className="tag">{s.intake.type === 'presencial' ? 'Presencial' : 'Online'}</span>
                    )}
                    <span style={{ fontSize: 18, color: 'var(--muted)' }}>{selectedPending?.id === s.id ? '▾' : '›'}</span>
                  </div>
                </div>

                {selectedPending?.id === s.id && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }} onClick={e => e.stopPropagation()}>
                    {s.intake?.objetivo && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Objetivo</div>
                        <div style={{ fontSize: 14 }}>{s.intake.objetivo}</div>
                      </div>
                    )}
                    {s.intake?.peso_kg && s.intake?.altura_cm && (
                      <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13 }}>
                        <span>Peso: <strong>{s.intake.peso_kg} kg</strong></span>
                        <span>Altura: <strong>{s.intake.altura_cm} cm</strong></span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn-primary" disabled={assigning === s.id}
                        onClick={() => assignStudent(s.id)} style={{ minHeight: 44 }}>
                        {assigning === s.id ? 'Asignando...' : 'Asignar a mi lista'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Mis Alumnos</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{students.length} alumnos activos</div>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(v => !v)}>+ Nuevo alumno</button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Crear alumno</div>
            <form onSubmit={createStudent} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.09em', display: 'block', marginBottom: 5 }}>Nombre</label>
                  <input className="input" required value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} placeholder="Cande Robaina" />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.09em', display: 'block', marginBottom: 5 }}>Email</label>
                  <input className="input" type="email" required value={form.email} onChange={e => setForm(f => ({...f,email:e.target.value}))} placeholder="cande@mail.com" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.09em', display: 'block', marginBottom: 5 }}>Contraseña inicial</label>
                  <input className="input" type="text" required minLength={6} value={form.password} onChange={e => setForm(f => ({...f,password:e.target.value}))} placeholder="min. 6 caracteres" />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.09em', display: 'block', marginBottom: 5 }}>Duración (semanas)</label>
                  <select className="input" value={form.meso_weeks} onChange={e => setForm(f => ({...f,meso_weeks:e.target.value}))}>
                    {[4,5,6,7,8,10,12].map(n => <option key={n} value={n}>{n} semanas</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.09em', display: 'block', marginBottom: 5 }}>Objetivo</label>
                <input className="input" value={form.objective} onChange={e => setForm(f => ({...f,objective:e.target.value}))} placeholder="Bajar grasa · Ganar masa muscular..." />
              </div>
              {error && <div style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444' }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear alumno'}</button>
                <button className="btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {students.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div>Todavía no tenés alumnos. Creá el primero arriba o asigná una solicitud pendiente.</div>
          </div>
        ) : (
          students.map(s => {
            const pct = s.sessionsTotal > 0 ? s.sessionsDone / s.sessionsTotal : 0
            return (
              <div key={s.id} className="card" onClick={() => router.push(`/coach/students/${s.id}`)}
                style={{ cursor: 'pointer', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{s.email}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cyan)' }}>{Math.round(pct*100)}%</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.sessionsDone}/{s.sessionsTotal} ses.</div>
                  </div>
                </div>
                <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct*100}%`, background: 'linear-gradient(90deg,var(--cyan),#0090a8)', borderRadius: 6, transition: 'width .5s' }} />
                </div>
                {s.hasPlan && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                    <span className="tag">{s.mesoWeeks} semanas</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
