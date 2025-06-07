#!/usr/bin/env bun
import { spawn } from "bun"
import { env } from "../../env.js"

function getConnectionUrl(): string {
  if (!env.DATABASE_URL) {
    console.error("[ERROR] DATABASE_URL not configured!")
    console.error("Set DATABASE_URL in your .env.local file")
    process.exit(1)
  }
  return env.DATABASE_URL
}

async function generateTypes() {
  const connectionUrl = getConnectionUrl()
  const outputFile = "src/lib/db/database.ts"
  
  console.log(`[GENERATE] Creating TypeScript types...`)
  console.log(`[DATABASE] Connecting...`)
  console.log(`[OUTPUT] ${outputFile}`)
  
  try {
    // Try using supabase CLI with the connection URL
    const proc = spawn({
      cmd: ["supabase", "gen", "types", "typescript", "--db-url", connectionUrl],
      stdout: "pipe",
      stderr: "pipe",
    })
    
    // Collect the output
    const output = await new Response(proc.stdout).text()
    const error = await new Response(proc.stderr).text()
    const exitCode = await proc.exited
    
    if (exitCode === 0 && output.length > 0) {
      // Write the output to file
      await Bun.write(outputFile, output)
      
      const lines = output.split('\n').length
      
      console.log(`[SUCCESS] Types generated successfully!`)
      console.log(`[FILE] ${outputFile}`)
      console.log(`[LINES] ${lines}`)
      
      // Verify the content looks like TypeScript
      if (output.includes('export interface') || output.includes('export type')) {
        console.log(`[OK] TypeScript interfaces detected`)
      } else {
        console.log(`[WARNING] Generated content may not be valid TypeScript`)
      }
    } else {
      console.error("[ERROR] Type generation failed!")
      if (error) {
        console.error("Error details:", error)
      }
      console.error("Falling back to copying existing database types...")
      
      // Fallback: try to copy from the existing file or create a basic structure
      await createFallbackTypes(outputFile)
    }
  } catch (error) {
    console.error("[ERROR] Failed to generate types:", error)
    console.error("Creating fallback types...")
    await createFallbackTypes(outputFile)
  }
}

async function createFallbackTypes(outputFile: string) {
  const fallbackContent = `// Database types - Generated fallback
// Update this file by running: bun run generate-types

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          address: string
          handle: string | null
          name: string | null
          bio: string | null
          avatar: string | null
          metadata: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          address: string
          handle?: string | null
          name?: string | null
          bio?: string | null
          avatar?: string | null
          metadata?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          address?: string
          handle?: string | null
          name?: string | null
          bio?: string | null
          avatar?: string | null
          metadata?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
`
  
  await Bun.write(outputFile, fallbackContent)
  console.log(`[FALLBACK] Created fallback types in ${outputFile}`)
}

// Check if DATABASE_URL is available
if (!env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not configured!")
  console.error("Set DATABASE_URL in your .env.local file")
  process.exit(1)
}

await generateTypes()