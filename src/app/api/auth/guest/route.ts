import { env } from "@/env";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const generateGuestId = () => `guest-${uuidv4()}`;

export async function POST() {
  try {
    const guestId = generateGuestId();
    
    const token = sign(
      {
        sub: guestId,
        role: "guest",
      },
      env.SUPABASE_JWT_SECRET
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("[Guest Login Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate guest token" },
      { status: 500 }
    );
  }
}