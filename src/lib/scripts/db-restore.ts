#!/usr/bin/env bun
import { spawn } from "bun";
import { readdir, stat, readFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../../env.js";

interface RestoreOptions {
  target: "local" | "remote";
  dbUrl?: string;
  backupDir?: string;
  dropExisting?: boolean;
}

async function parseArgs(): Promise<RestoreOptions> {
  const args = process.argv.slice(2);
  const options: RestoreOptions = { target: "local" };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--remote" || arg === "-r") {
      options.target = "remote";
      // Check if a custom DB URL is provided
      if (i + 1 < args.length && args[i + 1] && !args[i + 1]!.startsWith("-")) {
        options.dbUrl = args[i + 1];
        i++;
      }
    } else if (arg === "--local" || arg === "-l") {
      options.target = "local";
    } else if (arg === "--drop-existing" || arg === "-d") {
      options.dropExisting = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Usage: bun run db-restore.ts [options] [backup-dir]

Options:
  --local, -l           Restore to local Supabase (default)
  --remote, -r [URL]    Restore to remote database (uses DATABASE_URL from env if URL not provided)
  --drop-existing, -d   Drop existing tables before restore (use with caution!)
  --help, -h            Show this help message

Examples:
  bun run db:restore                             # Restore latest backup to local
  bun run db:restore .backups/backup_*           # Restore specific backup to local
  bun run db:restore-to-remote                   # Restore latest backup to remote (DATABASE_URL)
  bun run db:restore --remote --drop-existing    # Drop existing tables and restore
  bun run db-restore.ts --remote "postgresql://..." # Restore to specific remote DB
`);
      process.exit(0);
    } else if (arg && !arg.startsWith("-")) {
      // Assume it's a backup directory
      options.backupDir = arg;
    }
  }

  return options;
}

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

async function getAvailableBackups(): Promise<{ dir: string; metadata: any }[]> {
  try {
    const backupsDir = ".backups";
    const entries = await readdir(backupsDir);
    const backups = [];

    for (const entry of entries) {
      if (entry.startsWith("backup_")) {
        const backupPath = join(backupsDir, entry);
        const metadataPath = join(backupPath, "backup.json");

        try {
          const metadata = JSON.parse(await readFile(metadataPath, "utf-8"));
          backups.push({ dir: backupPath, metadata });
        } catch {
          // Skip backups without metadata
        }
      }
    }

    return backups.sort((a, b) => b.metadata.createdAt.localeCompare(a.metadata.createdAt));
  } catch {
    return [];
  }
}

async function restoreDatabase(options: RestoreOptions) {
  const { target, dbUrl, backupDir } = options;
  const isLocal = target === "local";

  console.log(`[RESTORE] Restoring database backup to ${target} database`);

  try {
    // Step 1: For local, check if Supabase is running
    if (isLocal) {
      console.log("\n[CHECK] Verifying local Supabase status...");
      const statusCheck = await runCommand(["supabase", "status"], "Checking Supabase status");
      if (!statusCheck) {
        console.error("\n[ERROR] Local Supabase is not running!");
        console.error("Start it with: supabase start");
        process.exit(1);
      }
    }

    // Get database connection details
    let connectionUrl: string;
    let displayUrl: string;

    if (isLocal) {
      connectionUrl = "postgresql://postgres:postgres@localhost:54322/postgres";
      displayUrl = connectionUrl;
    } else {
      const remoteUrl = dbUrl || env.DATABASE_URL;
      if (!remoteUrl) {
        console.error("\n[ERROR] No database URL provided for remote restore!");
        console.error("Either provide a URL with --remote or set DATABASE_URL in .env.local");
        process.exit(1);
      }
      connectionUrl = remoteUrl;
      displayUrl = connectionUrl.replace(/:\/\/.*:.*@/, "://***:***@");
    }

    // Step 2: Determine which backup to use
    let selectedBackup: string;

    if (backupDir) {
      selectedBackup = backupDir;
    } else {
      // Try to use latest symlink first
      try {
        await stat(".backups/latest");
        selectedBackup = ".backups/latest";
        console.log("\n[INFO] Using latest backup");
      } catch {
        // Show available backups
        const backups = await getAvailableBackups();

        if (backups.length === 0) {
          console.error("\n[ERROR] No backups found!");
          console.error("Run 'bun run db:backup' first to create a backup");
          process.exit(1);
        }

        console.log("\n[LIST] Available backups:");
        backups.forEach((backup, index) => {
          console.log(`${index + 1}. ${backup.dir} (${backup.metadata.createdAt})`);
        });

        // Use the most recent backup
        const mostRecentBackup = backups[0];
        if (!mostRecentBackup) {
          console.error("\n[ERROR] No backups available!");
          process.exit(1);
        }
        selectedBackup = mostRecentBackup.dir;
        console.log(`\n[INFO] Using most recent backup: ${selectedBackup}`);
      }
    }

    // Verify backup files exist
    const requiredFiles = ["schema.sql", "data.sql"];
    for (const file of requiredFiles) {
      try {
        await stat(join(selectedBackup, file));
      } catch {
        console.error(`\n[ERROR] Missing required file: ${file}`);
        process.exit(1);
      }
    }

    // Step 3: Warning
    console.log(`\n[WARNING] This will replace all data in your ${target} database!`);
    console.log(`[SOURCE] ${selectedBackup}`);
    console.log(`[TARGET] ${displayUrl}`);
    console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...");
    await Bun.sleep(5000);

    // Step 4: Check if roles.sql exists (optional file)
    const rolesPath = join(selectedBackup, "roles.sql");
    let hasRoles = false;
    try {
      await stat(rolesPath);
      hasRoles = true;
    } catch {
      console.log("\n[INFO] No roles.sql file found, skipping roles restoration");
    }

    // Step 5: Drop existing tables if requested
    if (options.dropExisting) {
      console.log("\n[WARNING] Dropping existing tables...");
      console.log("[WARNING] This will DELETE ALL DATA in the target database!");
      await Bun.sleep(3000);

      // Get list of all tables
      const listTablesProc = spawn({
        cmd: [
          "psql",
          connectionUrl,
          "-t",
          "-c",
          "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%';",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const tablesOutput = await new Response(listTablesProc.stdout).text();
      const tables = tablesOutput
        .trim()
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);

      if (tables.length > 0) {
        console.log(`[INFO] Found ${tables.length} tables to drop`);

        // Drop all tables
        const dropCommand = tables.map((table) => `DROP TABLE IF EXISTS public."${table}" CASCADE;`).join(" ");
        const dropProc = spawn({
          cmd: ["psql", connectionUrl, "-c", dropCommand],
          stdout: "pipe",
          stderr: "pipe",
        });

        await dropProc.exited;
        console.log("[OK] Existing tables dropped");
      }
    }

    // Step 6: Pre-process schema to remove problematic statements
    console.log("\n[PREPARE] Processing schema file...");
    const schemaPath = join(selectedBackup, "schema.sql");
    const schemaContent = await readFile(schemaPath, "utf-8");

    // Remove ALTER ... OWNER TO "supabase_admin" statements as per Supabase docs
    const processedSchema = schemaContent
      .split("\n")
      .map((line) => {
        // Comment out ALTER ... OWNER TO "supabase_admin" statements
        if (line.match(/ALTER\s+.*\s+OWNER\s+TO\s+"supabase_admin"/i)) {
          return `-- ${line} -- Commented out for restore compatibility`;
        }
        return line;
      })
      .join("\n");

    // Write processed schema to temp file
    const tempSchemaPath = join(selectedBackup, "schema_processed.sql");
    await import("node:fs/promises").then((fs) => fs.writeFile(tempSchemaPath, processedSchema));

    // Step 7: Restore database
    console.log("\n[RESTORE] Processing database files (roles, schema, and data)...");

    // For local restore, we'll run without single transaction to allow partial success
    const psqlArgs = ["psql"];

    if (!isLocal) {
      // For remote, use single transaction for safety
      psqlArgs.push("--single-transaction", "--variable", "ON_ERROR_STOP=1");
    } else {
      // For local, continue on errors (role permissions, etc)
      psqlArgs.push("--variable", "ON_ERROR_STOP=0");
    }

    // Add files in the correct order
    if (hasRoles && !isLocal) {
      // Skip roles for local restore to avoid permission errors
      psqlArgs.push("--file", rolesPath);
    }

    psqlArgs.push(
      "--file",
      tempSchemaPath, // Use processed schema
      "--command",
      "SET session_replication_role = replica",
      "--file",
      join(selectedBackup, "data.sql"),
      "--dbname",
      connectionUrl,
    );

    const restoreProc = spawn({
      cmd: psqlArgs,
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env },
    });

    const output = await new Response(restoreProc.stdout).text();
    const error = await new Response(restoreProc.stderr).text();
    const exitCode = await restoreProc.exited;

    if (exitCode !== 0) {
      if (isLocal && error.includes("must be member of role")) {
        // This is expected for local restores - role permissions differ
        console.log("[WARNING] Some role-related commands were skipped (this is normal for local restore)");
        console.log("[INFO] Continuing with restore...");
      } else if (!isLocal) {
        // For remote restores, fail on any error
        console.error("[ERROR] Failed to restore database!");
        if (error) console.error(error);
        if (output) console.error(output);
        process.exit(1);
      }
    }

    // For local restores, check if we at least got the schema and data
    if (isLocal) {
      // Verify basic restoration by checking for tables
      const checkProc = spawn({
        cmd: [
          "psql",
          connectionUrl,
          "-t",
          "-c",
          "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';",
        ],
        stdout: "pipe",
        stderr: "pipe",
      });

      const checkOutput = await new Response(checkProc.stdout).text();
      const tableCount = Number.parseInt(checkOutput.trim()) || 0;

      if (tableCount > 0) {
        console.log(`[OK] Database restored with ${tableCount} tables`);
      } else {
        console.error("[ERROR] No tables were created during restore");
        process.exit(1);
      }
    } else {
      console.log("[OK] Database restored successfully");
    }

    console.log("\n[SUCCESS] Database restoration complete!");
    console.log(`[FROM] ${selectedBackup}`);
    console.log(`[TO] ${displayUrl}`);

    if (isLocal) {
      console.log("[STUDIO] http://localhost:54323");
    }

    // Cleanup temporary files
    try {
      const tempSchemaPath = join(selectedBackup, "schema_processed.sql");
      await import("node:fs/promises").then((fs) => fs.unlink(tempSchemaPath));
    } catch {
      // Ignore cleanup errors
    }
  } catch (error) {
    console.error("[ERROR] Restore failed:", error);
    process.exit(1);
  }
}

// Parse command line arguments and run restore
const options = await parseArgs();
await restoreDatabase(options);
