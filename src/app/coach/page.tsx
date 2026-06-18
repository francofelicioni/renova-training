import { createClient } from '@/lib/supabase/server'
import { CoachDashboard } from '@/components/CoachDashboard'

export default async function CoachPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user!.id).single()

  const { data: students } = await supabase
    .from('profiles')
    .select('*, student_plans(*)')
    .eq('coach_id', user!.id)
    .eq('role', 'student')
    .order('name')

  const studentsWithProgress = await Promise.all(
    (students || []).map(async (s) => {
      const plan = Array.isArray(s.student_plans) ? s.student_plans[0] : s.student_plans
      const mesoWeeks = plan?.meso_weeks ?? 6
      const { count } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', s.id)
      // quick hack: get all attendance and count trues
      const { data: att } = await supabase
        .from('attendance')
        .select('ses1,ses2,ses3')
        .eq('student_id', s.id)
      const done = (att || []).reduce((n, r) => n + (r.ses1 ? 1 : 0) + (r.ses2 ? 1 : 0) + (r.ses3 ? 1 : 0), 0)
      return { ...s, mesoWeeks, hasPlan: !!plan, sessionsDone: done, sessionsTotal: mesoWeeks * 3 }
    })
  )

  return <CoachDashboard profile={profile} students={studentsWithProgress} />
}
