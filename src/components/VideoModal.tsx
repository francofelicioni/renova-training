'use client'
import { getYouTubeEmbedUrl } from '@/lib/exercises'

interface Props {
  exerciseName: string
  videoUrl: string
  onClose: () => void
}

export function VideoModal({ exerciseName, videoUrl, onClose }: Props) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          overflow: 'hidden',
          width: '100%',
          maxWidth: 520,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>Video técnico</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{exerciseName}</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: 'var(--muted)' }}>✕</button>
        </div>

        {/* Video */}
        {embedUrl ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
            <iframe
              src={embedUrl}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎬</div>
            <div>Video no disponible aún</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>El coach puede agregar el link en Configuración → Videos</div>
          </div>
        )}
      </div>
    </div>
  )
}
