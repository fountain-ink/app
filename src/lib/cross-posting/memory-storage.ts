// Temporary in-memory storage for development
// TODO: Replace with Supabase database storage

export interface CrossPostingSource {
  id: string;
  rss_url: string;
  platform: string;
  title: string;
  websub_supported: boolean;
  websub_hub_url?: string;
  status: 'active' | 'error' | 'paused';
  auto_publish: boolean;
  last_checked_at: string;
}

class MemoryStorage {
  private storage = new Map<string, CrossPostingSource[]>();

  getSources(blogAddress: string): CrossPostingSource[] {
    return this.storage.get(blogAddress) || [];
  }

  addSource(blogAddress: string, source: CrossPostingSource): void {
    const existing = this.getSources(blogAddress);
    existing.push(source);
    this.storage.set(blogAddress, existing);
  }

  updateSource(blogAddress: string, sourceId: string, updates: Partial<CrossPostingSource>): boolean {
    const sources = this.getSources(blogAddress);
    const index = sources.findIndex(s => s.id === sourceId);
    
    if (index === -1) return false;
    
    sources[index] = { ...sources[index], ...updates } as CrossPostingSource;
    this.storage.set(blogAddress, sources);
    return true;
  }

  removeSource(blogAddress: string, sourceId: string): boolean {
    const sources = this.getSources(blogAddress);
    const filtered = sources.filter(s => s.id !== sourceId);
    
    if (sources.length === filtered.length) return false;
    
    this.storage.set(blogAddress, filtered);
    return true;
  }

  getAllSources(): Map<string, CrossPostingSource[]> {
    return this.storage;
  }
}

export const memoryStorage = new MemoryStorage();

// Add persistent webhook logs storage
interface WebhookLog {
  timestamp: string;
  type: 'websub_post' | 'websub_get' | 'subscription' | 'error';
  message: string;
  data?: any;
}

class WebhookLogStorage {
  private logs: WebhookLog[] = [];

  addLog(type: string, message: string, data?: any) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      type: type as any,
      message,
      data
    });
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  getLogs() {
    return {
      logs: this.logs,
      count: this.logs.length,
      lastUpdate: this.logs[this.logs.length - 1]?.timestamp || null
    };
  }
}

export const webhookLogStorage = new WebhookLogStorage();