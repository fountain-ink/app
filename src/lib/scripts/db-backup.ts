#!/usr/bin/env bun
import { spawn } from "bun"
import { env } from "../../env.js"

function formatTimestamp(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19)
}

async function runSupabaseBackup(connectionString: string, outputFile: string, args: string[]): Promise<boolean> {
  const proc = spawn({
    cmd: ["supabase", "db", "dump", "--db-url", connectionString, "-f", outputFile, ...args],
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env }
  })

  const output = await new Response(proc.stdout).text()
  const error = await new Response(proc.stderr).text()
  const exitCode = await proc.exited

  if (exitCode !== 0) {
    console.error(`[ERROR] Backup failed for ${outputFile}:`)
    if (error) console.error(error)
    if (output) console.error(output)
    return false
  }

  const file = Bun.file(outputFile)
  const size = file.size
  const sizeStr = size > 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(2)} MB`
    : `${(size / 1024).toFixed(2)} KB`

  console.log(`[OK] ${outputFile} (${sizeStr})`)
  return true
}

async function backupDatabase() {
  if (!env.DATABASE_URL) {
    console.error("[ERROR] DATABASE_URL not configured!")
    console.error("Set DATABASE_URL in your .env.local file")
    process.exit(1)
  }

  const timestamp = formatTimestamp()
  const backupDir = `.backups/backup_${timestamp}`

  console.log(`[BACKUP] Creating database backup in: ${backupDir}`)
  console.log(`[DATABASE] Connecting to: ${env.DATABASE_URL.replace(/:\/\/.*:.*@/, "://***:***@")}`)

  try {
    const { mkdir, writeFile } = await import("node:fs/promises")
    await mkdir(backupDir, { recursive: true })

    console.log("\n[INFO] Creating backup files:")

    // Backup roles
    const rolesSuccess = await runSupabaseBackup(
      env.DATABASE_URL,
      `${backupDir}/roles.sql`,
      ["--role-only"]
    )

    // Backup schema
    const schemaSuccess = await runSupabaseBackup(
      env.DATABASE_URL,
      `${backupDir}/schema.sql`,
      []
    )

    // Backup data
    const dataSuccess = await runSupabaseBackup(
      env.DATABASE_URL,
      `${backupDir}/data.sql`,
      ["--use-copy", "--data-only"]
    )

    if (!rolesSuccess || !schemaSuccess || !dataSuccess) {
      console.error("\n[ERROR] Backup failed! Some files could not be created.")
      process.exit(1)
    }

    // Create a metadata file with backup info
    const metadata = {
      timestamp,
      source: env.DATABASE_URL.replace(/:\/\/.*:.*@/, "://***:***@"),
      files: ["roles.sql", "schema.sql", "data.sql"],
      createdAt: new Date().toISOString()
    }
    await writeFile(`${backupDir}/backup.json`, JSON.stringify(metadata, null, 2))

    console.log(`\n[SUCCESS] Backup completed successfully!`)
    console.log(`[DIRECTORY] ${backupDir}`)
    console.log(`[FILES] roles.sql, schema.sql, data.sql, backup.json`)
    
    // Also create a symlink to latest backup
    try {
      const { symlink, unlink } = await import("node:fs/promises")
      const latestLink = ".backups/latest"
      try {
        await unlink(latestLink)
      } catch {}
      await symlink(backupDir.replace(".backups/", ""), latestLink)
      console.log(`[SYMLINK] Latest backup link updated`)
    } catch {}
  } catch (error) {
    console.error("[ERROR] Failed to create backup:", error)
    process.exit(1)
  }
}

await backupDatabase()