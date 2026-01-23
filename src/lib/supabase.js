
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://spkdapknpqcukkzaeynt.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_Zy_bQfLU7UyEsAaKLw2oPA_ta3F1afX'

export const supabase = createClient(supabaseUrl, supabaseKey)
