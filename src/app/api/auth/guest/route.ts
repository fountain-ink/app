import { env } from "@/env";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const generateGuestId = () => `guest-${uuidv4()}`;

export async function POST() {
  try {
    console.log("[Guest Login] Starting guest authentication");
    const guestId = generateGuestId();
    console.log("[Guest Login] Generated guest ID:", guestId);
    
    const token = sign(
      {
        sub: guestId,
        role: "guest",
      },
      env.SUPABASE_JWT_SECRET
    );
    console.log("[Guest Login] Successfully generated JWT token");

    return NextResponse.json({ token });
  } catch (error) {
    console.error("[Guest Login Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate guest token" },
      { status: 500 }
    );
  }
}