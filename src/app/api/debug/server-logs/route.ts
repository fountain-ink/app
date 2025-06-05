import { NextRequest, NextResponse } from "next/server";

// Store recent console logs
const serverLogs: Array<{
  timestamp: string;
  level: 'log' | 'error' | 'warn';
  message: string;
  data?: any;
}> = [];

// Override console methods to capture logs
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  serverLogs.push({
    timestamp: new Date().toISOString(),
    level: 'log',
    message: args.join(' '),
    data: args.length > 1 ? args.slice(1) : undefined
  });
  if (serverLogs.length > 200) serverLogs.shift();
  originalLog(...args);
};

console.error = (...args) => {
  serverLogs.push({
    timestamp: new Date().toISOString(),
    level: 'error',
    message: args.join(' '),
    data: args.length > 1 ? args.slice(1) : undefined
  });
  if (serverLogs.length > 200) serverLogs.shift();
  originalError(...args);
};

console.warn = (...args) => {
  serverLogs.push({
    timestamp: new Date().toISOString(),
    level: 'warn',
    message: args.join(' '),
    data: args.length > 1 ? args.slice(1) : undefined
  });
  if (serverLogs.length > 200) serverLogs.shift();
  originalWarn(...args);
};

export async function GET(request: NextRequest) {
  return NextResponse.json({
    logs: serverLogs.slice(-100), // Return last 100 logs
    count: serverLogs.length,
    timestamp: new Date().toISOString()
  });
}