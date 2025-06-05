import { NextRequest, NextResponse } from "next/server";
import { addWebhookLog } from "@/lib/cross-posting/webhook-logs";

export async function GET(request: NextRequest) {
  // Add a test log entry
  addWebhookLog('subscription', '🧪 Test log entry from API call', { 
    timestamp: new Date().toISOString(),
    test: true 
  });
  
  return NextResponse.json({ 
    message: "Test log added",
    timestamp: new Date().toISOString()
  });
}