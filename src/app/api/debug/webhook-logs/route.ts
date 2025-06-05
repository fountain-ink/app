import { NextRequest, NextResponse } from "next/server";
import { getWebhookLogs } from "@/lib/cross-posting/webhook-logs";

export async function GET(request: NextRequest) {
  return NextResponse.json(getWebhookLogs());
}