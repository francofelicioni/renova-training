'use client'
import { useState } from 'react'
import type { IntakeType } from '@/lib/types'

const LABEL: React.CSSProperties = {
  fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
  letterSpacing: '.09em', display: 'block', marginBottom: 5,
}

const EJERCICIOS = [
  'Sentadilla', 'Peso muerto', 'Press de banca', 'Press militar',
  'Dominadas', 'Remo con barra', 'Hip Thrust', 'Otros',
]

export interface OnboardingFormData {
  nombre: string
  email: string
  whatsapp: string
  fecha_nacimiento: string
  residencia: string
  movilidad_propia: string
  sexo: string
  peso_kg: string
  altura_cm: string
  ocupacion_actividad: string
  nivel_actividad: string
  tiene_planificacion: string
  descripcion_planificacion: string
  tiempo_inactivo: string
  experiencia_fuerza: string
  ejercicios_familiares: string[]
  ejercicios_excluidos: string
  lesiones_salud: string
  nivel_estres: string
  pasos_diarios: string
  sueno_horario: string
  sueno_horas: string
  alimentacion_tipica: string
  num_comidas: string
  descripcion_alimentacion: string
  suplementos: string
  objetivo: string
  sesiones_semana: string
  tiempo_sesion: string
  motivacion_ahora: string
  compromiso_nivel: number
  compromiso_no_10: string
  como_llego: string
  info_adicional: string
  lugar_entrenamiento: string
  horarios_preferidos: string[]
  sesiones_presenciales: string
  inversion_dispuesto: string
  trabajo_entrenador_previo: string
}

const EMPTY: OnboardingFormData = {
  nombre: '', email: '', whatsapp: '', fecha_nacimiento: '', residencia: '',
  movilidad_propia: '', sexo: '', peso_kg: '', altura_cm: '',
  ocupacion_actividad: '', nivel_actividad: '', tiene_planificacion: '',
  descripcion_planificacion: '', tiempo_inactivo: '', experiencia_fuerza: '',
  ejercicios_familiares: [], ejercicios_excluidos: '', lesiones_salud: '',
  nivel_estres: '', pasos_diarios: '', sueno_horario: '', sueno_horas: '',
  alimentacion_tipica: '', num_comidas: '', descripcion_alimentacion: '', suplementos: '',
  objetivo: '', sesiones_semana: '', tiempo_sesion: '', motivacion_ahora: '',
  compromiso_nivel: 5, compromiso_no_10: '', como_llego: '', info_adicional: '',
  lugar_entrenamiento: '', horarios_preferidos: [], sesiones_presenciales: '',
  inversion_dispuesto: '', trabajo_entrenador_previo: '',
}

interface Props {
  type: IntakeType
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  )
}

function RadioGroup({ name, options, value, onChange }: {
  name: string; options: string[]; value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(opt => (
        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minHeight: 44, fontSize: 14 }}>
          <input type="radio" name={name} value={opt} checked={value === opt}
            onChange={() => onChange(opt)} style={{ width: 18, height: 18, accentColor: 'var(--cyan)' }} />
          {opt}
        </label>
      ))}
    </div>
  )
}

export function OnboardingForm({ type }: Props) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<OnboardingFormData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ email: string; tempPassword: string } | null>(null)

  const isPresencial = type === 'presencial'
  const title = isPresencial ? 'Formulario Presencial' : 'Formulario Online'

  function set<K extends keyof OnboardingFormData>(key: K, val: OnboardingFormData[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function toggleCheckbox(key: 'ejercicios_familiares' | 'horarios_preferidos', val: string) {
    setForm(f => {
      const arr = f[key]
      return { ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
    })
  }

  function step1Valid() {
    const base = form.nombre && form.email && form.whatsapp && form.fecha_nacimiento
      && form.residencia && form.sexo && parseFloat(form.peso_kg) > 0 && parseInt(form.altura_cm) > 0
    if (isPresencial) return base && form.movilidad_propia
    return !!base
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type, peso_kg: parseFloat(form.peso_kg), altura_cm: parseInt(form.altura_cm) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al enviar'); return }
      setSuccess({ email: data.email, tempPassword: data.tempPassword })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>¡Formulario enviado!</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
          Tu entrenadora revisará tu perfil y se pondrá en contacto.
        </p>
        <div className="card" style={{ textAlign: 'left', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
            Guardá estos datos para acceder a la app
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{success.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Contraseña temporal</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: 'var(--cyan)' }}>{success.tempPassword}</div>
          </div>
        </div>
        <a href="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Ir al login
        </a>
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)' }}>Paso {step} de 4</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{title}</span>
        </div>
        <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step / 4) * 100}%`, background: 'var(--cyan)', borderRadius: 4, transition: 'width .3s' }} />
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Datos personales</h2>
          <Field label="Nombre y apellido *">
            <input className="input" required value={form.nombre} onChange={e => set('nombre', e.target.value)} style={{ minHeight: 44 }} />
          </Field>
          <Field label="Email *">
            <input className="input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} style={{ minHeight: 44 }} />
          </Field>
          <Field label="Número de contacto (WhatsApp) *">
            <input className="input" type="tel" required value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} style={{ minHeight: 44 }} />
          </Field>
          <Field label="Fecha de nacimiento *">
            <input className="input" type="date" required value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} style={{ minHeight: 44 }} />
          </Field>
          <Field label="Lugar de residencia *">
            <input className="input" required value={form.residencia} onChange={e => set('residencia', e.target.value)} style={{ minHeight: 44 }} />
          </Field>
          {isPresencial && (
            <Field label="¿Tenés movilidad propia? *">
              <RadioGroup name="movilidad" options={['Sí', 'No']} value={form.movilidad_propia} onChange={v => set('movilidad_propia', v)} />
            </Field>
          )}
          <Field label="Sexo biológico *">
            <RadioGroup name="sexo" options={['Masculino', 'Femenino']} value={form.sexo} onChange={v => set('sexo', v)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Peso actual (kg) *">
              <input className="input" type="number" step="0.1" min="0" required value={form.peso_kg} onChange={e => set('peso_kg', e.target.value)} style={{ minHeight: 44 }} />
            </Field>
            <Field label="Altura (cm) *">
              <input className="input" type="number" min="0" required value={form.altura_cm} onChange={e => set('altura_cm', e.target.value)} style={{ minHeight: 44 }} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Historial de entrenamiento</h2>
          <Field label="¿A qué te dedicás y cómo es tu actividad diaria?">
            <textarea className="input" rows={3} value={form.ocupacion_actividad} onChange={e => set('ocupacion_actividad', e.target.value)} />
          </Field>
          <Field label="¿Qué nivel de actividad semanal tenés actualmente?">
            <select className="input" value={form.nivel_actividad} onChange={e => set('nivel_actividad', e.target.value)} style={{ minHeight: 44 }}>
              <option value="">Seleccionar...</option>
              <option>Sedentario</option>
              <option>Ligeramente activo (1–2 días)</option>
              <option>Moderadamente activo (3–4 días)</option>
              <option>Muy activo (5+ días)</option>
            </select>
          </Field>
          <Field label="¿Estás siguiendo actualmente alguna planificación de entrenamiento?">
            <RadioGroup name="planificacion" options={['Sí', 'No']} value={form.tiene_planificacion} onChange={v => set('tiene_planificacion', v)} />
          </Field>
          {form.tiene_planificacion === 'Sí' && (
            <Field label="Describí tu última planificación">
              <textarea className="input" rows={3} value={form.descripcion_planificacion} onChange={e => set('descripcion_planificacion', e.target.value)} />
            </Field>
          )}
          {form.tiene_planificacion === 'No' && (
            <Field label="¿Cuánto tiempo estuviste inactivo/a y por qué?">
              <textarea className="input" rows={3} value={form.tiempo_inactivo} onChange={e => set('tiempo_inactivo', e.target.value)} />
            </Field>
          )}
          <Field label="¿Cuál es tu experiencia en el entrenamiento de fuerza y en la hipertrofia muscular?">
            <select className="input" value={form.experiencia_fuerza} onChange={e => set('experiencia_fuerza', e.target.value)} style={{ minHeight: 44 }}>
              <option value="">Seleccionar...</option>
              <option>Ninguna</option>
              <option>Poca (menos de 1 año)</option>
              <option>Intermedia (1–3 años)</option>
              <option>Avanzada (más de 3 años)</option>
            </select>
          </Field>
          <Field label="¿Con cuáles de estos ejercicios tenés familiaridad?">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EJERCICIOS.map(ej => (
                <label key={ej} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minHeight: 44, fontSize: 14 }}>
                  <input type="checkbox" checked={form.ejercicios_familiares.includes(ej)}
                    onChange={() => toggleCheckbox('ejercicios_familiares', ej)}
                    style={{ width: 18, height: 18, accentColor: 'var(--cyan)' }} />
                  {ej}
                </label>
              ))}
            </div>
          </Field>
          <Field label="¿Hay ejercicios que no podés o no querés realizar?">
            <textarea className="input" rows={2} value={form.ejercicios_excluidos} onChange={e => set('ejercicios_excluidos', e.target.value)} />
          </Field>
          <Field label="Lesiones, enfermedades diagnosticadas, cirugías recientes y medicación habitual">
            <textarea className="input" rows={3} value={form.lesiones_salud} onChange={e => set('lesiones_salud', e.target.value)} />
          </Field>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Estilo de vida</h2>
          <Field label="Nivel de estrés percibido en tu día a día">
            <select className="input" value={form.nivel_estres} onChange={e => set('nivel_estres', e.target.value)} style={{ minHeight: 44 }}>
              <option value="">Seleccionar...</option>
              <option>Bajo</option>
              <option>Moderado</option>
              <option>Alto</option>
              <option>Muy alto</option>
            </select>
          </Field>
          <Field label="¿Cuántos pasos aproximados hacés por día?">
            <select className="input" value={form.pasos_diarios} onChange={e => set('pasos_diarios', e.target.value)} style={{ minHeight: 44 }}>
              <option value="">Seleccionar...</option>
              <option>Menos de 5.000</option>
              <option>5.000–8.000</option>
              <option>8.000–12.000</option>
              <option>Más de 12.000</option>
            </select>
          </Field>
          <Field label="¿A qué hora te dormís y a qué hora te despertás? ¿Dormís de un tirón?">
            <textarea className="input" rows={2} value={form.sueno_horario} onChange={e => set('sueno_horario', e.target.value)} />
          </Field>
          <Field label="¿Cuántas horas dormís habitualmente?">
            <select className="input" value={form.sueno_horas} onChange={e => set('sueno_horas', e.target.value)} style={{ minHeight: 44 }}>
              <option value="">Seleccionar...</option>
              <option>Menos de 5h</option>
              <option>5–6h</option>
              <option>6–7h</option>
              <option>7–8h</option>
              <option>Más de 8h</option>
            </select>
          </Field>
          <Field label="Contanos cómo comés normalmente en un día típico">
            <textarea className="input" rows={3} value={form.alimentacion_tipica} onChange={e => set('alimentacion_tipica', e.target.value)} />
          </Field>
          <Field label="¿Cuántas comidas hacés por día?">
            <select className="input" value={form.num_comidas} onChange={e => set('num_comidas', e.target.value)} style={{ minHeight: 44 }}>
              <option value="">Seleccionar...</option>
              <option>1–2</option>
              <option>3–4</option>
              <option>5+</option>
            </select>
          </Field>
          {isPresencial && (
            <Field label="¿Cómo describirías tu alimentación actual?">
              <select className="input" value={form.descripcion_alimentacion} onChange={e => set('descripcion_alimentacion', e.target.value)} style={{ minHeight: 44 }}>
                <option value="">Seleccionar...</option>
                <option>Muy desordenada</option>
                <option>Irregular</option>
                <option>Regular</option>
                <option>Bastante ordenada</option>
                <option>Muy ordenada</option>
              </select>
            </Field>
          )}
          <Field label="¿Tomás algún suplemento deportivo o nutricional?">
            <textarea className="input" rows={2} placeholder="Ej: proteína en polvo, creatina, vitamina D..."
              value={form.suplementos} onChange={e => set('suplementos', e.target.value)} />
          </Field>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Objetivos y logística</h2>
          <Field label="¿Qué querés lograr concretamente con este proceso?">
            <textarea className="input" rows={3} value={form.objetivo} onChange={e => set('objetivo', e.target.value)} />
          </Field>
          <Field label="¿Cuántas sesiones de fuerza por semana vas a realizar?">
            <select className="input" value={form.sesiones_semana} onChange={e => set('sesiones_semana', e.target.value)} style={{ minHeight: 44 }}>
              <option value="">Seleccionar...</option>
              <option>2</option><option>3</option><option>4</option><option>5+</option>
            </select>
          </Field>
          <Field label="¿Cuánto tiempo tenés por sesión?">
            <select className="input" value={form.tiempo_sesion} onChange={e => set('tiempo_sesion', e.target.value)} style={{ minHeight: 44 }}>
              <option value="">Seleccionar...</option>
              <option>30–45 min</option><option>45–60 min</option><option>60–75 min</option>
              <option>75–90 min</option><option>+90 min</option>
            </select>
          </Field>
          <Field label="¿Por qué querés empezar ahora y no dentro de 3 meses?">
            <textarea className="input" rows={2} value={form.motivacion_ahora} onChange={e => set('motivacion_ahora', e.target.value)} />
          </Field>
          <Field label={`Del 1 al 10, ¿qué tan comprometido/a estás? (${form.compromiso_nivel})`}>
            <input className="input" type="range" min={1} max={10} value={form.compromiso_nivel}
              onChange={e => set('compromiso_nivel', parseInt(e.target.value))} style={{ minHeight: 44 }} />
          </Field>
          <Field label="¿Qué hace que no sea un 10?">
            <textarea className="input" rows={2} value={form.compromiso_no_10} onChange={e => set('compromiso_no_10', e.target.value)} />
          </Field>
          <Field label="¿Cómo llegaste a Renova Training?">
            <select className="input" value={form.como_llego} onChange={e => set('como_llego', e.target.value)} style={{ minHeight: 44 }}>
              <option value="">Seleccionar...</option>
              <option>Instagram</option><option>Recomendación</option><option>Google</option>
              <option>TikTok</option><option>Otro</option>
            </select>
          </Field>
          {isPresencial && (
            <>
              <Field label="¿Dónde preferís entrenar?">
                <select className="input" value={form.lugar_entrenamiento} onChange={e => set('lugar_entrenamiento', e.target.value)} style={{ minHeight: 44 }}>
                  <option value="">Seleccionar...</option>
                  <option>En un gimnasio</option><option>En casa</option>
                  <option>Al aire libre</option><option>Indistinto</option>
                </select>
              </Field>
              <Field label="¿Qué horarios te sirven mejor?">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Mañana', 'Mediodía', 'Tarde', 'Noche'].map(h => (
                    <label key={h} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minHeight: 44, fontSize: 14 }}>
                      <input type="checkbox" checked={form.horarios_preferidos.includes(h)}
                        onChange={() => toggleCheckbox('horarios_preferidos', h)}
                        style={{ width: 18, height: 18, accentColor: 'var(--cyan)' }} />
                      {h}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="¿Cuántas sesiones presenciales por semana buscás?">
                <select className="input" value={form.sesiones_presenciales} onChange={e => set('sesiones_presenciales', e.target.value)} style={{ minHeight: 44 }}>
                  <option value="">Seleccionar...</option>
                  <option>1</option><option>2</option><option>3</option><option>4+</option>
                </select>
              </Field>
              <Field label="Invertir en acompañamiento profesional requiere compromiso económico. ¿Estás dispuesto/a a invertir si el servicio encaja con lo que buscás?">
                <RadioGroup name="inversion" options={['Sí', 'Necesito más información', 'No por ahora']}
                  value={form.inversion_dispuesto} onChange={v => set('inversion_dispuesto', v)} />
              </Field>
              <Field label="¿Ya trabajaste antes con entrenador/a personal?">
                <RadioGroup name="entrenador" options={['Sí', 'No']}
                  value={form.trabajo_entrenador_previo} onChange={v => set('trabajo_entrenador_previo', v)} />
              </Field>
            </>
          )}
          <Field label="¿Hay algo más que quieras que sepamos antes de empezar?">
            <textarea className="input" rows={2} value={form.info_adicional} onChange={e => set('info_adicional', e.target.value)} />
          </Field>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginTop: 16 }}>
          {error}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        {step > 1 && (
          <button className="btn-ghost" type="button" onClick={() => setStep(s => s - 1)} style={{ minHeight: 44 }}>
            Anterior
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < 4 ? (
          <button className="btn-primary" type="button"
            disabled={step === 1 && !step1Valid()}
            onClick={() => setStep(s => s + 1)}
            style={{ minHeight: 44 }}>
            Siguiente
          </button>
        ) : (
          <button className="btn-primary" type="button" disabled={loading} onClick={handleSubmit} style={{ minHeight: 44 }}>
            {loading ? 'Enviando...' : 'Enviar formulario'}
          </button>
        )}
      </div>
    </div>
  )
}
