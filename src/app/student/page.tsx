import { createClient } from '@/lib/supabase/server'
import { StudentApp } from '@/components/StudentApp'

export default async function StudentPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user!.id).single()

  const { data: plan } = await supabase
    .from('student_plans').select('*').eq('student_id', user!.id).single()

  const { data: logs } = await supabase
    .from('exercise_logs').select('*').eq('student_id', user!.id)

  const { data: attendance } = await supabase
    .from('attendance').select('*').eq('student_id', user!.id)

  const { data: videos } = await supabase
    .from('exercise_videos').select('*')

  return (
    <StudentApp
      profile={profile}
      plan={plan ?? { meso_weeks: 6, objective: '' }}
      initialLogs={logs ?? []}
      initialAttendance={attendance ?? []}
      videos={videos ?? []}
    />
  )
}
