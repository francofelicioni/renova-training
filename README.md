# 🏋️ Renova Training — Web App

Next.js 14 + Supabase + Vercel. Multi-alumno, dark/light mode, videos de YouTube por ejercicio.

---

## 🚀 Setup en 4 pasos

### 1. Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor → New Query**
3. Pegar el contenido de `supabase/schema.sql` y ejecutar
4. Ir a **Settings → API** y copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Variables de entorno

Copiar `.env.example` a `.env.local` y completar con los valores de Supabase:

```bash
cp .env.example .env.local
```

### 3. Crear tu cuenta de coach

En Supabase → **Authentication → Users → Add user** (o usar la API):
- Creá tu usuario con email + contraseña
- Luego en **Table Editor → profiles** cambiá `role` a `'coach'` en tu fila

### 4. Deploy en Vercel

```bash
npm install
```

Subir a GitHub:
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/tu-usuario/renova-training.git
git push -u origin main
```

En [vercel.com](https://vercel.com):
1. New Project → importar el repo
2. En **Environment Variables** agregar las 3 variables de Supabase
3. Deploy ✅

---

## 📱 Estructura de la app

| Ruta | Descripción |
|------|-------------|
| `/login` | Login con email + contraseña |
| `/coach` | Dashboard del coach — lista de alumnos |
| `/coach/students/[id]` | Vista detalle alumno — asistencia, pesos, PRs |
| `/coach/settings` | Configurar videos de YouTube por ejercicio |
| `/student` | App del alumno — plan, pesos, progreso |

## 🎬 Agregar videos

1. Loguearse como coach
2. Ir a ⚙️ Videos (arriba a la derecha)
3. Pegar el link de YouTube Shorts de cada ejercicio
4. Los alumnos ven el video embebido al tocar **▶ Video**

## 👥 Crear alumnos

1. Loguearse como coach
2. En el dashboard → **+ Nuevo alumno**
3. Completar nombre, email, contraseña inicial y objetivo
4. El alumno puede loguearse con esas credenciales

---

## 🛠 Desarrollo local

```bash
npm install
npm run dev
# → http://localhost:3000
```
