import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    SUPABASE_JWT_SECRET: z.string(),
    SUPABASE_SERVICE_KEY: z.string(),
    DATABASE_URL: z.string().optional(),
    LISTMONK_API_URL: z.string(),
    LISTMONK_API_USERNAME: z.string(),
    LISTMONK_API_TOKEN: z.string(),
    LENS_API_KEY: z.string(),
    LENS_API_KEY_TESTNET: z.string(),
    IFRAMELY_API_KEY: z.string(),
    IFRAMELY_BASE_URL: z.string(),
  },

  client: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    NEXT_PUBLIC_SUPABASE_URL: z.string(),
    NEXT_PUBLIC_APP_ADDRESS: z.string(),
    NEXT_PUBLIC_APP_ADDRESS_TESTNET: z.string(),
    NEXT_PUBLIC_ENVIRONMENT: z.enum(["development", "production"]).default("development"),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,

    LENS_API_KEY: process.env.LENS_API_KEY,
    LENS_API_KEY_TESTNET: process.env.LENS_API_KEY_TESTNET,

    IFRAMELY_API_KEY: process.env.IFRAMELY_API_KEY,
    IFRAMELY_BASE_URL: process.env.IFRAMELY_BASE_URL,

    LISTMONK_API_URL: process.env.LISTMONK_API_URL,
    LISTMONK_API_USERNAME: process.env.LISTMONK_API_USERNAME,
    LISTMONK_API_TOKEN: process.env.LISTMONK_API_TOKEN,

    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_ADDRESS: process.env.NEXT_PUBLIC_APP_ADDRESS,
    NEXT_PUBLIC_APP_ADDRESS_TESTNET: process.env.NEXT_PUBLIC_APP_ADDRESS_TESTNET,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
