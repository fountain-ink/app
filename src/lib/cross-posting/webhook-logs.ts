// In-memory log storage for debugging (will reset on server restart)
const webhookLogs: Array<{
  timestamp: string;
  type: 'websub_post' | 'websub_get' | 'subscription' | 'error';
  message: string;
  data?: any;
}> = [];

export function addWebhookLog(type: string, message: string, data?: any) {
  webhookLogs.push({
    timestamp: new Date().toISOString(),
    type: type as any,
    message,
    data
  });
  
  // Keep only last 50 logs
  if (webhookLogs.length > 50) {
    webhookLogs.shift();
  }
}

export function getWebhookLogs() {
  return {
    logs: webhookLogs,
    count: webhookLogs.length,
    lastUpdate: webhookLogs[webhookLogs.length - 1]?.timestamp || null
  };
}