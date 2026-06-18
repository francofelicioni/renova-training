import { createClient } from '@/lib/supabase/server'
import { VideoSettings } from '@/components/VideoSettings'

export default async function CoachSettingsPage() {
  const supabase = createClient()
  const { data: videos } = await supabase
    .from('exercise_videos')
    .select('*')
    .order('exercise_name')

  return <VideoSettings initialVideos={videos ?? []} />
}
