import { createClient } from "@/lib/db/server"
import { NextRequest, NextResponse } from "next/server"
import { checkAdminRights } from "@/lib/auth/admin-middleware"
import { getTokenClaims } from "@/lib/auth/get-token-claims"

export async function GET(req: NextRequest) {
  try {
    const authResponse = await checkAdminRights(req)
    if (authResponse) return authResponse

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("contests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching contests:", error)
      return NextResponse.json({ error: "Failed to fetch contests" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResponse = await checkAdminRights(req)
    if (authResponse) return authResponse

    const claims = await getTokenClaims()
    const adminAddress = claims?.metadata?.address

    const body = await req.json()
    const { name, slug, theme, prize_pool, start_date, end_date } = body

    if (!name || !slug || !start_date || !end_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from("contests")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Contest with this slug already exists" }, { status: 409 })
    }

    const { data, error } = await supabase
      .from("contests")
      .insert({
        name,
        slug,
        theme,
        prize_pool,
        start_date,
        end_date,
        created_by: adminAddress || "unknown",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating contest:", error)
      return NextResponse.json({ error: "Failed to create contest" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}