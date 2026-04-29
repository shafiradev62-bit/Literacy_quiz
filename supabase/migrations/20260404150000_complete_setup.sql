-- ============================================================
-- COMPLETE AUTO-SETUP: Run this once in Supabase SQL Editor
-- ============================================================

-- 1. Student Profiles Table
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  school TEXT NOT NULL,
  email TEXT,
  contact TEXT,
  instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_profiles' AND policyname = 'Anyone can insert student profiles') THEN
    CREATE POLICY "Anyone can insert student profiles" ON public.student_profiles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_profiles' AND policyname = 'Anyone can select student profiles') THEN
    CREATE POLICY "Anyone can select student profiles" ON public.student_profiles FOR SELECT USING (true);
  END IF;
END $$;

-- 2. Exam Sessions Table
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  unit INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  total INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  student_id UUID REFERENCES public.student_profiles(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exam_sessions' AND policyname = 'Anyone can insert exam sessions') THEN
    CREATE POLICY "Anyone can insert exam sessions" ON public.exam_sessions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exam_sessions' AND policyname = 'Anyone can select exam sessions') THEN
    CREATE POLICY "Anyone can select exam sessions" ON public.exam_sessions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exam_sessions' AND policyname = 'Anyone can update exam sessions') THEN
    CREATE POLICY "Anyone can update exam sessions" ON public.exam_sessions FOR UPDATE USING (true);
  END IF;
END $$;

-- 3. Add missing columns if upgrading from older version
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.exam_sessions ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.student_profiles(id);

-- 4. Add analytics columns
ALTER TABLE public.exam_sessions ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0;
ALTER TABLE public.exam_sessions ADD COLUMN IF NOT EXISTS question_attempts JSONB DEFAULT '{}';

-- ============================================================
-- DONE. All tables and policies are set up.
-- ============================================================
