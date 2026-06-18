'use client'
import { useTheme } from './ThemeProvider'

export function ThemeToggle({ size = 32 }: { size?: number }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro'}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        border: '1px solid var(--border)',
        background: 'var(--surface-2)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.5,
        transition: 'background 0.15s',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
