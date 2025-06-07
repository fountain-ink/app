import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`Health check at ${timestamp}`);
  
  return NextResponse.json({
    status: "healthy",
    timestamp,
    message: "WebSub webhook endpoint is reachable"
  });
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`Test POST received at ${timestamp}`);
  
  return NextResponse.json({
    status: "received",
    timestamp,
    message: "Test POST received successfully"
  });
}