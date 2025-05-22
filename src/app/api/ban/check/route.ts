import { createServiceClient } from "@/lib/db/service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    let addressesToCheck: string[];
    try {
      const body = await req.json();
      addressesToCheck = body.addresses;
      if (!Array.isArray(addressesToCheck)) {
        throw new Error("'addresses' field must be an array");
      }
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON body or missing 'addresses' array" }, { status: 400 });
    }

    addressesToCheck = addressesToCheck.filter((addr) => typeof addr === "string" && addr.trim() !== "");

    if (addressesToCheck.length === 0) {
      return NextResponse.json({ error: "No valid addresses provided in the request body" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data: bannedAddresses, error } = await supabase
      .from("banlist")
      .select("address")
      .in("address", addressesToCheck);

    if (error) {
      console.error("Error checking bulk ban status:", error);
      return NextResponse.json({ error: "Failed to check bulk ban status" }, { status: 500 });
    }

    const banStatusMap: Record<string, boolean> = {};
    addressesToCheck.forEach((addr) => {
      banStatusMap[addr] = false;
    });

    bannedAddresses?.forEach((ban) => {
      if (ban.address) {
        banStatusMap[ban.address] = true;
      }
    });

    return NextResponse.json(banStatusMap);
  } catch (error) {
    console.error("Unexpected error in ban check:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
