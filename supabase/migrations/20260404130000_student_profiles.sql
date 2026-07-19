-- Table for student identity before taking the exam
CREATE TABLE public.student_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  school TEXT NOT NULL,
  email TEXT,
  contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert student profiles"
  ON public.student_profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can select student profiles"
  ON public.student_profiles FOR SELECT USING (true);

-- Add student_id reference to exam_sessions
ALTER TABLE public.exam_sessions
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.student_profiles(id);
