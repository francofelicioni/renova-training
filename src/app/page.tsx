import { redirect } from 'next/navigation'

// El middleware maneja la redirección — esta página solo aplica como fallback
export default function Home() {
  redirect('/login')
}
