#!/usr/bin/env bun

import { createClient } from "@supabase/supabase-js";
import { spawn } from "bun";
import { env } from "../../env.js";

// Test connection to production database
async function testConnection() {
  const dbUrl = env.DATABASE_URL || process.env.REMOTE_DATABASE_URL;

  if (!dbUrl) {
    console.error("[ERROR] No database URL provided");
    console.error("Set DATABASE_URL in .env.local or pass REMOTE_DATABASE_URL");
    process.exit(1);
  }

  console.log("[TEST] Testing database connection...");
  console.log(`[DATABASE] ${dbUrl.replace(/:\/\/.*:.*@/, "://***:***@")}`);

  try {
    // Parse connection string
    const url = new URL(dbUrl);
    const isSupabase = url.hostname.includes("supabase");

    if (isSupabase && env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      // Use Supabase client for Supabase-hosted databases
      const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
        auth: { persistSession: false },
      });

      const { data, error } = await supabase.from("users").select("count").limit(1);

      if (error) throw error;
      console.log("[OK] Connected via Supabase client");
    } else {
      // Use direct SQL connection
      const proc = spawn({
        cmd: ["psql", dbUrl, "-c", "SELECT version();"],
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;

      if (exitCode === 0) {
        console.log("[OK] Connected successfully!");
        const versionLine = stdout.trim().split("\n")[0];
        if (versionLine) {
          console.log("[VERSION]", versionLine);
        }
      } else {
        throw new Error(stderr);
      }
    }

    // Test table access
    console.log("\n[CHECK] Retrieving table list...");
    const tableProc = spawn({
      cmd: [
        "psql",
        dbUrl,
        "-t",
        "-c",
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;",
      ],
      stdout: "pipe",
      stderr: "pipe",
    });

    const tables = await new Response(tableProc.stdout).text();
    const tableError = await new Response(tableProc.stderr).text();
    const tableExitCode = await tableProc.exited;

    if (tableExitCode === 0) {
      const tableList = tables
        .trim()
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);
      console.log("[TABLES]", tableList.join(", "));
      console.log(`[COUNT] ${tableList.length} tables found`);
    } else {
      console.error("[ERROR] Could not list tables:", tableError);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ERROR] Connection failed:", errorMessage);
    process.exit(1);
  }
}

await testConnection();
