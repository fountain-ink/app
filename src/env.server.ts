import { config } from "dotenv";
import { z } from "zod";

// Load .env.local file
config({ path: ".env.local" });

const serverEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),
  NEXT_PUBLIC_HOCUSPOCUS_JWT_TOKEN: z.string(),
});

export const env = serverEnv.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  NEXT_PUBLIC_HOCUSPOCUS_JWT_TOKEN: process.env.NEXT_PUBLIC_HOCUSPOCUS_JWT_TOKEN,
});
