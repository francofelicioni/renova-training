'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginAction(email: string, password: string): Promise<{ error: string } | void> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const user = data.user
  if (!user) return { error: 'No se pudo iniciar sesión. Intentá de nuevo.' }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileErr || !profile) {
    return { error: 'No se encontró tu perfil. Contactá a tu entrenadora.' }
  }

  revalidatePath('/', 'layout')
  redirect(profile.role === 'coach' ? '/coach' : '/student')
}
