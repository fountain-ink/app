import { webhookLogStorage } from "./memory-storage";

export function addWebhookLog(type: string, message: string, data?: any) {
  console.log(`📝 Webhook log: [${type}] ${message}`, data || '');
  webhookLogStorage.addLog(type, message, data);
}

export function getWebhookLogs() {
  return webhookLogStorage.getLogs();
}