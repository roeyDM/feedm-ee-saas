import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slyjhprwovcwxfcnxjpn.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_J2IgY8ZACubzebsuSlVqoQ_8rpGitwz";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
