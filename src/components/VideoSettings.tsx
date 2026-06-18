'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ExerciseVideo } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'
import { getYouTubeEmbedUrl } from '@/lib/exercises'

interface Props { initialVideos: ExerciseVideo[] }

export function VideoSettings({ initialVideos }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [videos, setVideos] = useState<ExerciseVideo[]>(initialVideos)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  async function saveVideo(v: ExerciseVideo, url: string) {
    setSaving(v.id)
    setVideos(prev => prev.map(x => x.id === v.id ? { ...x, video_url: url } : x))
    await supabase.from('exercise_videos').update({ video_url: url, updated_at: new Date().toISOString() }).eq('id', v.id)
    setSaving(null)
    setSaved(v.id)
    setTimeout(() => setSaved(null), 1500)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/coach')} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: 'var(--text)' }}>← Atrás</button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>⚙️ Videos de ejercicios</div>
        <ThemeToggle />
      </header>

      <div style={{ padding: '18px 16px', maxWidth: 640, margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: 16, background: 'var(--cyan-dim)', borderColor: 'rgba(0,229,255,.3)' }}>
          <div style={{ fontSize: 13, color: 'var(--cyan)' }}>
            Pegá el link de YouTube Shorts de cada ejercicio. Los alumnos verán el video embebido al tocar ▶ Video.
          </div>
        </div>

        {videos.map(v => {
          const embed = getYouTubeEmbedUrl(v.video_url)
          const isSaved = saved === v.id
          const isSaving = saving === v.id
          return (
            <div key={v.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{v.exercise_name}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  placeholder="https://www.youtube.com/shorts/..."
                  defaultValue={v.video_url}
                  onBlur={e => { if (e.target.value !== v.video_url) saveVideo(v, e.target.value) }}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => {
                    const el = document.getElementById(`url-${v.id}`) as HTMLInputElement
                    if (el) saveVideo(v, el.value)
                  }}
                  className="btn-primary"
                  style={{ padding: '10px 14px', fontSize: 12, whiteSpace: 'nowrap' }}
                >
                  {isSaving ? '...' : isSaved ? '✓' : 'Guardar'}
                </button>
              </div>
              {embed && (
                <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', position: 'relative', paddingBottom: '30%', background: '#000', maxHeight: 160 }}>
                  <iframe src={embed} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
