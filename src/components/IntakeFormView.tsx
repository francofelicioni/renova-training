'use client'
import type { IntakeForm } from '@/lib/types'

const LABEL: React.CSSProperties = {
  fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase',
  letterSpacing: '.09em', display: 'block', marginBottom: 4,
}

const SECTIONS: { title: string; fields: { key: keyof IntakeForm; label: string }[] }[] = [
  {
    title: 'Datos personales',
    fields: [
      { key: 'nombre', label: 'Nombre y apellido' },
      { key: 'email', label: 'Email' },
      { key: 'whatsapp', label: 'WhatsApp' },
      { key: 'fecha_nacimiento', label: 'Fecha de nacimiento' },
      { key: 'residencia', label: 'Residencia' },
      { key: 'movilidad_propia', label: 'Movilidad propia' },
      { key: 'sexo', label: 'Sexo biológico' },
      { key: 'peso_kg', label: 'Peso (kg)' },
      { key: 'altura_cm', label: 'Altura (cm)' },
    ],
  },
  {
    title: 'Historial de entrenamiento',
    fields: [
      { key: 'ocupacion_actividad', label: 'Ocupación y actividad diaria' },
      { key: 'nivel_actividad', label: 'Nivel de actividad semanal' },
      { key: 'tiene_planificacion', label: '¿Tiene planificación?' },
      { key: 'descripcion_planificacion', label: 'Descripción planificación' },
      { key: 'tiempo_inactivo', label: 'Tiempo inactivo' },
      { key: 'experiencia_fuerza', label: 'Experiencia en fuerza' },
      { key: 'ejercicios_familiares', label: 'Ejercicios familiares' },
      { key: 'ejercicios_excluidos', label: 'Ejercicios excluidos' },
      { key: 'lesiones_salud', label: 'Lesiones y salud' },
    ],
  },
  {
    title: 'Estilo de vida',
    fields: [
      { key: 'nivel_estres', label: 'Nivel de estrés' },
      { key: 'pasos_diarios', label: 'Pasos diarios' },
      { key: 'sueno_horario', label: 'Horario de sueño' },
      { key: 'sueno_horas', label: 'Horas de sueño' },
      { key: 'alimentacion_tipica', label: 'Alimentación típica' },
      { key: 'num_comidas', label: 'Comidas por día' },
      { key: 'descripcion_alimentacion', label: 'Descripción alimentación' },
      { key: 'suplementos', label: 'Suplementos' },
    ],
  },
  {
    title: 'Objetivos y logística',
    fields: [
      { key: 'objetivo', label: 'Objetivo' },
      { key: 'sesiones_semana', label: 'Sesiones de fuerza/semana' },
      { key: 'tiempo_sesion', label: 'Tiempo por sesión' },
      { key: 'motivacion_ahora', label: 'Motivación para empezar ahora' },
      { key: 'compromiso_nivel', label: 'Nivel de compromiso (1-10)' },
      { key: 'compromiso_no_10', label: '¿Qué hace que no sea un 10?' },
      { key: 'como_llego', label: '¿Cómo llegó?' },
      { key: 'lugar_entrenamiento', label: 'Lugar de entrenamiento' },
      { key: 'horarios_preferidos', label: 'Horarios preferidos' },
      { key: 'sesiones_presenciales', label: 'Sesiones presenciales/semana' },
      { key: 'inversion_dispuesto', label: 'Disposición a invertir' },
      { key: 'trabajo_entrenador_previo', label: 'Experiencia con entrenador' },
      { key: 'info_adicional', label: 'Info adicional' },
    ],
  },
]

function formatValue(val: unknown): string {
  if (val == null || val === '') return '—'
  if (Array.isArray(val)) return val.length ? val.join(', ') : '—'
  return String(val)
}

interface Props {
  intake: IntakeForm
}

export function IntakeFormView({ intake }: Props) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span className="tag">{intake.type === 'presencial' ? 'Presencial' : 'Online'}</span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          Enviado {new Date(intake.submitted_at).toLocaleDateString('es-AR')}
        </span>
      </div>

      {SECTIONS.map(section => {
        const visible = section.fields.filter(f => {
          const v = intake[f.key]
          return v != null && v !== '' && !(Array.isArray(v) && v.length === 0)
        })
        if (!visible.length) return null
        return (
          <div key={section.title} className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{section.title}</div>
            {visible.map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <div style={LABEL}>{f.label}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{formatValue(intake[f.key])}</div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
