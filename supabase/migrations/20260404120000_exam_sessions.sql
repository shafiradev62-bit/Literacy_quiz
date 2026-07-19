-- Table for auto-saving exam sessions per device
CREATE TABLE public.exam_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  unit INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  total INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations by device_id (no auth required)
CREATE POLICY "Anyone can insert exam sessions"
  ON public.exam_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can select exam sessions"
  ON public.exam_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update exam sessions"
  ON public.exam_sessions FOR UPDATE
  USING (true);
