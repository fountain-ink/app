import { createClient } from "@/lib/db/server"
import { NextRequest, NextResponse } from "next/server"
import { checkAdminRights } from "@/lib/auth/admin-middleware"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResponse = await checkAdminRights(req)
    if (authResponse) return authResponse

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("contests")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching contest:", error)
      return NextResponse.json({ error: "Contest not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResponse = await checkAdminRights(req)
    if (authResponse) return authResponse

    const supabase = await createClient()
    const { error } = await supabase
      .from("contests")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("Error deleting contest:", error)
      return NextResponse.json({ error: "Failed to delete contest" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}