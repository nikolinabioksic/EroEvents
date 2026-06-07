import { createClient } from "@supabase/supabase-js";

// Tvoji stvarni i točni podaci s platforme
const supabaseUrl = "https://llmexboxrnuztscdrjnl.supabase.co"; 
const supabaseAnonKey = "sb_publishable_-PNF2lbNOJOOyJnAStVL7w_QTLwagbr"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Naziv bucketa koji smo kreirali u prvom koraku
export const SUPABASE_BUCKET_NAME = "event-posters";