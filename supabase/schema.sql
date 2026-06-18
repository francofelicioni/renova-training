-- ═══════════════════════════════════════════════
-- RENOVA TRAINING — Supabase Schema
-- Pegar en: Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════

-- Extensiones
create extension if not exists "uuid-ossp";

-- ─── Profiles ───────────────────────────────────
-- Se crea automáticamente cuando un usuario se registra en Supabase Auth
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  name        text not null default '',
  email       text,
  role        text not null default 'student' check (role in ('coach','student')),
  coach_id    uuid references public.profiles(id) on delete set null,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Trigger: crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Student Plans ───────────────────────────────
create table if not exists public.student_plans (
  id           uuid default uuid_generate_v4() primary key,
  student_id   uuid references public.profiles(id) on delete cascade unique,
  meso_weeks   int default 6 check (meso_weeks between 4 and 12),
  objective    text default '',
  updated_at   timestamptz default now()
);

-- ─── Exercise Logs ───────────────────────────────
create table if not exists public.exercise_logs (
  id             uuid default uuid_generate_v4() primary key,
  student_id     uuid references public.profiles(id) on delete cascade,
  session_key    text not null,   -- 'ses1' | 'ses2' | 'ses3'
  exercise_name  text not null,
  week           int  not null check (week between 1 and 12),
  kg             numeric(6,2),
  notes          text default '',
  updated_at     timestamptz default now(),
  unique(student_id, session_key, exercise_name, week)
);

-- ─── Attendance ──────────────────────────────────
create table if not exists public.attendance (
  id           uuid default uuid_generate_v4() primary key,
  student_id   uuid references public.profiles(id) on delete cascade,
  week         int  not null check (week between 1 and 12),
  ses1         boolean default false,
  ses2         boolean default false,
  ses3         boolean default false,
  coach_notes  text default '',
  updated_at   timestamptz default now(),
  unique(student_id, week)
);

-- ─── Exercise Videos ─────────────────────────────
-- Una sola tabla global — el coach asigna URLs de YouTube por ejercicio
create table if not exists public.exercise_videos (
  id             uuid default uuid_generate_v4() primary key,
  exercise_name  text unique not null,
  video_url      text default '',  -- URL de YouTube Shorts o watch
  updated_at     timestamptz default now()
);

-- Insertar todos los ejercicios (URLs vacías — el coach las completa)
insert into public.exercise_videos (exercise_name) values
  ('Sentadilla Goblet'),
  ('Press Plano Mancuernas'),
  ('Jalón al Pecho'),
  ('Hip Thrust'),
  ('Curl Bíceps Mancuernas'),
  ('Plancha Frontal'),
  ('Peso Muerto Rumano'),
  ('Press Inclinado Mancuernas'),
  ('Remo Sentado Polea'),
  ('Step Up'),
  ('Extensión Tríceps Polea'),
  ('Pallof Press'),
  ('Prensa Inclinada'),
  ('Press Militar Sentado'),
  ('Remo Pecho Apoyado'),
  ('Vuelos Laterales'),
  ('Crunch Máquina/Banco'),
  ('Sentadillas al aire'),
  ('Puentes de glúteo'),
  ('Bird Dog')
on conflict (exercise_name) do nothing;

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════

alter table public.profiles        enable row level security;
alter table public.student_plans   enable row level security;
alter table public.exercise_logs   enable row level security;
alter table public.attendance      enable row level security;
alter table public.exercise_videos enable row level security;

-- Helper: saber si el usuario actual es coach
create or replace function public.is_coach()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'coach'
  );
$$;

-- Helper: saber si el coach es dueño de un alumno
create or replace function public.owns_student(student uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = student and coach_id = auth.uid()
  );
$$;

-- ─── Profiles policies ──────────────────────────
create policy "Ver propio perfil" on public.profiles
  for select using (id = auth.uid() or coach_id = auth.uid() or is_coach());

create policy "Editar propio perfil" on public.profiles
  for update using (id = auth.uid());

create policy "Coach inserta alumnos" on public.profiles
  for insert with check (is_coach());

-- ─── Student Plans policies ──────────────────────
create policy "Ver propio plan o coach" on public.student_plans
  for select using (student_id = auth.uid() or owns_student(student_id) or is_coach());

create policy "Coach gestiona planes" on public.student_plans
  for all using (owns_student(student_id) or is_coach());

create policy "Alumno actualiza su plan" on public.student_plans
  for update using (student_id = auth.uid());

-- ─── Exercise Logs policies ──────────────────────
create policy "Ver propios logs o coach" on public.exercise_logs
  for select using (student_id = auth.uid() or owns_student(student_id) or is_coach());

create policy "Alumno gestiona sus logs" on public.exercise_logs
  for all using (student_id = auth.uid());

create policy "Coach gestiona logs alumno" on public.exercise_logs
  for all using (owns_student(student_id));

-- ─── Attendance policies ─────────────────────────
create policy "Ver asistencia propia o coach" on public.attendance
  for select using (student_id = auth.uid() or owns_student(student_id) or is_coach());

create policy "Coach gestiona asistencia" on public.attendance
  for all using (owns_student(student_id) or is_coach());

-- ─── Exercise Videos policies ────────────────────
create policy "Todos pueden leer videos" on public.exercise_videos
  for select using (true);

create policy "Solo coach puede editar videos" on public.exercise_videos
  for all using (is_coach());

-- ═══════════════════════════════════════════════
-- ÍNDICES
-- ═══════════════════════════════════════════════
create index if not exists idx_logs_student on public.exercise_logs(student_id);
create index if not exists idx_att_student  on public.attendance(student_id);
create index if not exists idx_prof_coach   on public.profiles(coach_id);
