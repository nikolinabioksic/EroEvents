import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://llmexboxrnuztscdrjnl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbWV4Ym94cm51enRzY2Ryam5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTMyNTEsImV4cCI6MjA5NjQyOTI1MX0.rlsokmDnzL9b6KtWkwy5taVDZYVDNKVvXk_eb70KOwg";

export const SUPABASE_BUCKET_NAME = 'event-posters';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);