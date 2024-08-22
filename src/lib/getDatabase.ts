import { env } from "@/env";
import { SupabaseClient } from "@supabase/supabase-js";

export const getDatabase = () => {
	const supabase = new SupabaseClient(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.SUPABASE_SECRET_KEY,
	);

	return supabase;
};
