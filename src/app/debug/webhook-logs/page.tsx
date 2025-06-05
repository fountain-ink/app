"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Activity, AlertCircle, CheckCircle, Bell } from "lucide-react";

interface WebhookLog {
  timestamp: string;
  type: 'websub_post' | 'websub_get' | 'subscription' | 'error';
  message: string;
  data?: any;
}

const typeIcons = {
  websub_post: <Bell className="h-4 w-4" />,
  websub_get: <CheckCircle className="h-4 w-4" />,
  subscription: <Activity className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />
};

const typeColors = {
  websub_post: 'bg-blue-500',
  websub_get: 'bg-green-500', 
  subscription: 'bg-purple-500',
  error: 'bg-red-500'
};

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/debug/webhook-logs');
      const data = await response.json();
      setLogs(data.logs || []);
      setLastUpdate(data.lastUpdate);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">WebSub Debug Logs</h1>
            <p className="text-muted-foreground">
              Real-time logs from WebSub webhook and subscription activities
            </p>
          </div>
          <Button onClick={fetchLogs} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['websub_post', 'websub_get', 'subscription', 'error'].map(type => {
            const count = logs.filter(log => log.type === type).length;
            return (
              <Card key={type}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${typeColors[type as keyof typeof typeColors]} text-white`}>
                      {typeIcons[type as keyof typeof typeIcons]}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{type.replace('_', ' ')}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Activity Log
              {lastUpdate && (
                <Badge variant="outline">
                  Last: {new Date(lastUpdate).toLocaleTimeString()}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {logs.length === 0 
                ? "No webhook activity yet. Try adding an RSS source or publishing a post."
                : `${logs.length} log entries`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No webhook logs yet</p>
                <p className="text-sm">
                  Logs will appear here when WebSub subscriptions are made or notifications are received
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.slice().reverse().map((log, index) => (
                  <div key={index}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-1.5 rounded-full ${typeColors[log.type]} text-white mt-0.5`}>
                        {typeIcons[log.type]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{log.message}</p>
                          <Badge variant="outline" className="text-xs">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </Badge>
                        </div>
                        {log.data && (
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                    {index < logs.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}