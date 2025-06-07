#!/usr/bin/env bun
import { spawn } from "bun";

async function runCommand(cmd: string[], description: string): Promise<boolean> {
  console.log(`[RUNNING] ${description}...`);

  const proc = spawn({
    cmd,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env },
  });

  const output = await new Response(proc.stdout).text();
  const error = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    console.error(`[ERROR] Failed: ${description}`);
    if (error) console.error(error);
    if (output) console.error(output);
    return false;
  }

  if (output.trim()) console.log(output.trim());
  return true;
}

async function resetLocalDatabase() {
  console.log("[RESET] Resetting local Supabase database");

  try {
    // Step 1: Check if local Supabase is running
    console.log("\n[CHECK] Verifying local Supabase status...");
    const statusCheck = await runCommand(["supabase", "status"], "Checking Supabase status");
    if (!statusCheck) {
      console.error("\n[ERROR] Local Supabase is not running!");
      console.error("Start it with: supabase start");
      process.exit(1);
    }

    // Step 2: Confirm reset
    console.log("\n[WARNING] This will delete all data in your local database!");
    console.log("Press Ctrl+C to cancel, or wait 3 seconds to continue...");
    await Bun.sleep(3000);

    // Step 3: Reset database
    console.log("\n[RESET] Processing database reset...");
    const resetSuccess = await runCommand(["supabase", "db", "reset"], "Resetting local database");

    if (!resetSuccess) {
      console.error("\n[ERROR] Failed to reset local database!");
      process.exit(1);
    }

    console.log("\n[SUCCESS] Local database reset completed!");
    console.log("[STUDIO] http://localhost:54323");
  } catch (error) {
    console.error("[ERROR] Reset failed:", error);
    process.exit(1);
  }
}

await resetLocalDatabase();
