import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CoachStudentView } from '@/components/CoachStudentView'

export default async function CoachStudentPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: student } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('coach_id', user!.id)
    .single()

  if (!student) notFound()

  const { data: plan } = await supabase
    .from('student_plans')
    .select('*')
    .eq('student_id', params.id)
    .single()

  const { data: logs } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('student_id', params.id)
    .order('week')

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', params.id)
    .order('week')

  const { data: videos } = await supabase
    .from('exercise_videos')
    .select('*')

  const { data: intake } = await supabase
    .from('intake_forms')
    .select('*')
    .eq('student_id', params.id)
    .single()

  const { data: macroPlan } = await supabase
    .from('macro_plans')
    .select('*')
    .eq('student_id', params.id)
    .single()

  return (
    <CoachStudentView
      student={student}
      plan={plan ?? { meso_weeks: 6, objective: '' }}
      logs={logs ?? []}
      attendance={attendance ?? []}
      videos={videos ?? []}
      intake={intake ?? null}
      macroPlan={macroPlan ?? null}
    />
  )
}
