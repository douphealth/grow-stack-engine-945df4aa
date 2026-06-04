-- Create the leads table to capture user submissions
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  archetype text,
  primary_goal text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts from the client app
CREATE POLICY "Allow public inserts" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);
