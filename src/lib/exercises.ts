import type { Exercise } from './types'

export const EXERCISES: Record<string, Exercise[]> = {
  ses1: [
    { name: 'Sentadilla Goblet',      series: 3, reps: '8',       rir: 3, notes: 'Mancuerna al pecho, rodillas hacia afuera, bajá con control total' },
    { name: 'Press Plano Mancuernas', series: 3, reps: '8',       rir: 3, notes: 'Escápulas retraídas, recorrido completo, no rebotar en el pecho' },
    { name: 'Jalón al Pecho',         series: 3, reps: '10',      rir: 2, notes: 'Tirá con codos, no con manos. Pecho hacia la barra al bajar' },
    { name: 'Hip Thrust',             series: 3, reps: '10',      rir: 2, notes: 'Barbilla al pecho, empuja con talones, aprieta glúteos arriba' },
    { name: 'Curl Bíceps Mancuernas', series: 2, reps: '12',      rir: 2, notes: 'Codos fijos pegados al cuerpo, no balancees el torso' },
    { name: 'Plancha Frontal',        series: 3, reps: "20–30''", rir: '-', notes: 'Cadera en línea, core apretado, respirá con normalidad', isTimeBased: true },
  ],
  ses2: [
    { name: 'Peso Muerto Rumano',         series: 3, reps: '8',          rir: 3, notes: 'Espalda neutra, bisagra de cadera, mancuernas cerca del cuerpo' },
    { name: 'Press Inclinado Mancuernas', series: 3, reps: '8',          rir: 3, notes: 'Banco a 30–45°, escápulas retraídas, recorrido completo' },
    { name: 'Remo Sentado Polea',         series: 3, reps: '10',         rir: 2, notes: 'Tirá con codos, pecho al frente, escápulas juntas al final' },
    { name: 'Step Up',                    series: 3, reps: '8 c/pierna', rir: 3, notes: 'Pie completo sobre banco, empuja con talón, sin impulso' },
    { name: 'Extensión Tríceps Polea',    series: 2, reps: '12',         rir: 2, notes: 'Codos fijos pegados al cuerpo, extensión completa controlada' },
    { name: 'Pallof Press',               series: 3, reps: '10 c/lado',  rir: 2, notes: 'Core activo, sin rotar la cadera, empuja y controlá la vuelta' },
  ],
  ses3: [
    { name: 'Prensa Inclinada',      series: 3, reps: '10', rir: 2, notes: 'Pies bien apoyados, rodillas al ancho de hombros, no bloquees' },
    { name: 'Press Militar Sentado', series: 3, reps: '8',  rir: 3, notes: 'Espalda contra el respaldo, empuja arriba en línea con las orejas' },
    { name: 'Remo Pecho Apoyado',    series: 3, reps: '10', rir: 2, notes: 'Pecho apoyado firme, tirá los codos hacia atrás y arriba' },
    { name: 'Hip Thrust',            series: 3, reps: '10', rir: 2, notes: 'Barbilla al pecho, empuja con talones, aprieta glúteos arriba' },
    { name: 'Vuelos Laterales',      series: 2, reps: '12', rir: 2, notes: 'Leve flexión de codo, sube hasta hombros, bajá con control' },
    { name: 'Crunch Máquina/Banco',  series: 3, reps: '12', rir: 2, notes: 'Contrae abdomen al bajar, no uses el cuello, movimiento controlado' },
  ],
}

export const WARMUP: Exercise[] = [
  { name: 'Sentadillas al aire', series: 2, reps: '10',    rir: '-', notes: 'Pies al ancho de hombros, rodillas hacia afuera, pecho arriba' },
  { name: 'Puentes de glúteo',   series: 2, reps: '10',    rir: '-', notes: 'Empuja con talones, aprieta glúteos arriba, no hiperextiendas lumbar' },
  { name: 'Bird Dog',            series: 2, reps: '5 c/l', rir: '-', notes: 'Core activo, columna neutra, movimientos lentos y controlados' },
  { name: 'Plancha frontal',     series: 2, reps: "20–30''",rir: '-', notes: 'Cadera en línea, core apretado, respirá con normalidad', isTimeBased: true },
]

export const SESSION_LABELS: Record<string, { icon: string; title: string; subtitle: string }> = {
  ses1: { icon: '💪', title: 'Sesión 1', subtitle: 'Cuádriceps · Pecho · Espalda · Bíceps · Core' },
  ses2: { icon: '🦵', title: 'Sesión 2', subtitle: 'Isquios · Glúteos · Pecho · Espalda · Tríceps · Core' },
  ses3: { icon: '🏆', title: 'Sesión 3', subtitle: 'Pierna completa · Hombros · Espalda · Core' },
}

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    let videoId = ''
    if (u.hostname.includes('youtu.be')) {
      videoId = u.pathname.slice(1)
    } else if (u.pathname.includes('/shorts/')) {
      videoId = u.pathname.split('/shorts/')[1].split('/')[0]
    } else {
      videoId = u.searchParams.get('v') || ''
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
}
