import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    SUPABASE_JWT_SECRET: z.string(),
    SUPABASE_SERVICE_KEY: z.string(),
    LISTMONK_API_URL: z.string(),
    LISTMONK_API_USERNAME: z.string(),
    LISTMONK_API_TOKEN: z.string(),
  },

  client: {
    NEXT_PUBLIC_HOCUSPOCUS_JWT_TOKEN: z.string(),
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    NEXT_PUBLIC_SUPABASE_URL: z.string(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_HOCUSPOCUS_JWT_TOKEN: process.env.NEXT_PUBLIC_HOCUSPOCUS_JWT_TOKEN,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    LISTMONK_API_URL: process.env.LISTMONK_API_URL,
    LISTMONK_API_USERNAME: process.env.LISTMONK_API_USERNAME,
    LISTMONK_API_TOKEN: process.env.LISTMONK_API_TOKEN,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
