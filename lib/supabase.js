import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bmpxiztjbswgmjvjrnno.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcHhpenRqYnN3Z21qdmpybm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NDMzMDgsImV4cCI6MjA5NDQxOTMwOH0.XV2WeLEYiGQmCMwNGS-f0-PkAEDLRBAi66gvcY0IXGw'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)