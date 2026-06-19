'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { OnboardingForm } from '@/components/OnboardingForm'
import type { IntakeType } from '@/lib/types'

function OnboardingContent() {
  const params = useSearchParams()
  const typeParam = params.get('type')
  const type: IntakeType = typeParam === 'presencial' ? 'presencial' : 'remote'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px 40px' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.2em', color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: 8 }}>
            Renova Training
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-.03em' }}>
            {type === 'presencial' ? 'Formulario de ingreso presencial' : 'Formulario de ingreso online'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8 }}>
            Completá el formulario para comenzar tu proceso de entrenamiento
          </p>
        </div>

        <div className="card">
          <OnboardingForm type={type} />
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--muted)' }}>
        Cargando...
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
