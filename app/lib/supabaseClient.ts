import {createClient} from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!; // 서버 전용 키라면 NEXT_PUBLIC_ 접두어 없이 사용
export const supabase = createClient(supabaseUrl, supabaseKey);
