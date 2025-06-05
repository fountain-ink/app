"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Globe, 
  Rss, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  Settings,
  Zap,
  Shield,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CrossPostingSource {
  id: string;
  rss_url: string;
  platform: string;
  title: string;
  websub_supported: boolean;
  websub_hub_url?: string;
  last_checked_at?: string;
  last_post_date?: string;
  status: 'active' | 'error' | 'paused';
  error_message?: string;
  auto_publish: boolean;
}

interface CrossPostedContent {
  id: string;
  source_id: string;
  external_post_id: string;
  external_url: string;
  title: string;
  published_at: string;
  fountain_post_id?: string;
  fountain_url?: string;
  status: 'published' | 'failed' | 'draft';
  platform: string;
}

interface AccountManagerStatus {
  is_delegated: boolean;
  lens_account_id?: string;
  expires_at?: string;
  permissions?: string[];
  status: 'active' | 'revoked' | 'expired' | 'none';
}

interface CrossPostingSettingsProps {
  blogAddress: string;
}

const platformIcons: Record<string, string> = {
  'substack': '📮',
  'medium': 'Ⓜ️',
  'ghost': '👻',
  'beehiiv': '🐝',
  'wordpress': '📝',
  'unknown': '📄'
};

const platformNames: Record<string, string> = {
  'substack': 'Substack',
  'medium': 'Medium',
  'ghost': 'Ghost',
  'beehiiv': 'Beehiiv', 
  'wordpress': 'WordPress',
  'unknown': 'Unknown Platform'
};

const detectPlatform = (url: string): string => {
  const hostname = new URL(url).hostname.toLowerCase();
  const urlPath = url.toLowerCase();
  
  // Substack: subdomain.substack.com/feed
  if (hostname.includes('substack.com')) return 'substack';
  
  // Medium: multiple patterns
  // - medium.com/@username/feed
  // - username.medium.com/feed  
  // - custom-domain redirecting to medium
  if (hostname.includes('medium.com') || 
      hostname.endsWith('.medium.com') || 
      urlPath.includes('medium.com/feed') ||
      urlPath.includes('@') && urlPath.includes('/feed')) return 'medium';
  
  // Beehiiv: newsletter.beehiiv.com/feed
  if (hostname.includes('beehiiv.com')) return 'beehiiv';
  
  // WordPress: multiple patterns
  // - site.wordpress.com/feed
  // - custom-domain/feed (common WordPress pattern)
  // - site.wp.com/feed
  if (hostname.includes('wordpress.com') || 
      hostname.includes('wp.com') ||
      urlPath.endsWith('/feed') || 
      urlPath.endsWith('/feed/')) return 'wordpress';
  
  // Ghost: multiple patterns  
  // - custom-domain/rss/
  // - custom-domain/ghost/api/content/posts/rss/
  // - custom-domain/feed/
  if (urlPath.includes('/rss/') || 
      urlPath.includes('/ghost/') ||
      (urlPath.includes('/feed') && !hostname.includes('medium'))) return 'ghost';
  
  return 'unknown';
};

export function CrossPostingSettings({ blogAddress }: CrossPostingSettingsProps) {
  const [sources, setSources] = useState<CrossPostingSource[]>([]);
  const [crossPostedContent, setCrossPostedContent] = useState<CrossPostedContent[]>([]);
  const [accountManager, setAccountManager] = useState<AccountManagerStatus>({
    is_delegated: false,
    status: 'none'
  });
  const [newRssUrl, setNewRssUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDelegating, setIsDelegating] = useState(false);

  // Load existing sources and account manager status
  useEffect(() => {
    loadData();
  }, [blogAddress]);

  // Set up SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource(`/api/blogs/${blogAddress}/cross-posting/events`);
    
    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'content_updated') {
          console.log('🔄 Real-time update: New cross-posted content detected');
          
          // Add new content to the list
          setCrossPostedContent(prev => {
            const exists = prev.some(item => 
              item.external_post_id === message.data.external_post_id
            );
            
            if (!exists) {
              const newContent = {
                id: `content-${Date.now()}`,
                ...message.data
              };
              
              // Show toast notification
              toast.success(`New post imported: ${message.data.title}`);
              
              return [newContent, ...prev]; // Add to beginning (newest first)
            }
            
            return prev;
          });
        } else if (message.type === 'connected') {
          console.log('🔗 Connected to cross-posting updates');
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [blogAddress]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load cross-posting sources
      const sourcesResponse = await fetch(`/api/blogs/${blogAddress}/cross-posting`);
      if (sourcesResponse.ok) {
        const sourcesData = await sourcesResponse.json();
        setSources(sourcesData.sources || []);
      }

      // Load account manager status
      const managerResponse = await fetch(`/api/blogs/${blogAddress}/account-manager`);
      if (managerResponse.ok) {
        const managerData = await managerResponse.json();
        setAccountManager(managerData);
      }

      // Load cross-posted content
      const contentResponse = await fetch(`/api/blogs/${blogAddress}/cross-posting/content`);
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setCrossPostedContent(contentData.content || []);
      }
    } catch (error) {
      console.error('Error loading cross-posting data:', error);
      toast.error('Failed to load cross-posting settings');
    } finally {
      setIsLoading(false);
    }
  };

  const validateRssUrl = (url: string): boolean => {
    try {
      // Just validate it's a proper URL - let the server validate if it's actually RSS
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addRssSource = async () => {
    if (!newRssUrl.trim()) {
      toast.error('Please enter an RSS URL');
      return;
    }

    if (!validateRssUrl(newRssUrl)) {
      toast.error('Please enter a valid RSS feed URL');
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(`/api/blogs/${blogAddress}/cross-posting/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rss_url: newRssUrl,
          platform: detectPlatform(newRssUrl)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add RSS source');
      }

      const newSource = await response.json();
      setSources(prev => [...prev, newSource]);
      setNewRssUrl("");
      
      if (newSource.websub_supported) {
        toast.success('RSS source added and subscribed to WebSub notifications');
      } else {
        toast.success('RSS source added successfully');
      }
    } catch (error) {
      console.error('Error adding RSS source:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add RSS source');
    } finally {
      setIsAdding(false);
    }
  };

  const removeSource = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/blogs/${blogAddress}/cross-posting/sources/${sourceId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove RSS source');
      }

      setSources(prev => prev.filter(s => s.id !== sourceId));
      toast.success('RSS source removed');
    } catch (error) {
      console.error('Error removing RSS source:', error);
      toast.error('Failed to remove RSS source');
    }
  };

  const toggleAutoPublish = async (sourceId: string, enabled: boolean) => {
    if (enabled && !accountManager.is_delegated) {
      toast.error('Please enable Account Manager first to use auto-publishing');
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blogAddress}/cross-posting/sources/${sourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_publish: enabled })
      });

      if (!response.ok) {
        throw new Error('Failed to update auto-publish setting');
      }

      setSources(prev => prev.map(s => 
        s.id === sourceId ? { ...s, auto_publish: enabled } : s
      ));
      
      toast.success(`Auto-publishing ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating auto-publish:', error);
      toast.error('Failed to update auto-publish setting');
    }
  };

  const handleDelegateAccount = async () => {
    setIsDelegating(true);
    try {
      const response = await fetch(`/api/blogs/${blogAddress}/account-manager/delegate`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delegate account');
      }

      const result = await response.json();
      setAccountManager(result);
      toast.success('Account Manager enabled successfully');
    } catch (error) {
      console.error('Error delegating account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enable Account Manager');
    } finally {
      setIsDelegating(false);
    }
  };

  const handleRevokeDelegate = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogAddress}/account-manager/delegate`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to revoke delegation');
      }

      setAccountManager({
        is_delegated: false,
        status: 'none'
      });
      
      // Disable auto-publish for all sources
      setSources(prev => prev.map(s => ({ ...s, auto_publish: false })));
      
      toast.success('Account Manager disabled');
    } catch (error) {
      console.error('Error revoking delegation:', error);
      toast.error('Failed to disable Account Manager');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            Cross-posting
          </CardTitle>
          <CardDescription>Loading cross-posting settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Manager Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Manager
          </CardTitle>
          <CardDescription>
            Enable auto-publishing by granting Fountain permission to post on your behalf
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={accountManager.is_delegated ? "default" : "secondary"}>
                  {accountManager.is_delegated ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Disabled
                    </>
                  )}
                </Badge>
                {accountManager.is_delegated && (
                  <Zap className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              {accountManager.is_delegated && accountManager.expires_at && (
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(accountManager.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              {accountManager.is_delegated ? (
                <Button variant="destructive" size="sm" onClick={handleRevokeDelegate}>
                  Disable
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={handleDelegateAccount}
                  disabled={isDelegating}
                >
                  {isDelegating ? 'Enabling...' : 'Enable Account Manager'}
                </Button>
              )}
            </div>
          </div>

          {accountManager.is_delegated && (
            <Alert className="mt-4">
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Account Manager is enabled. You can now turn on auto-publishing for your RSS sources.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Cross-posting Sources Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            RSS Sources
          </CardTitle>
          <CardDescription>
            Connect your existing blogs to automatically cross-post content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add new RSS source */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="https://example.substack.com/feed"
                  value={newRssUrl}
                  onChange={(e) => setNewRssUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isAdding && newRssUrl.trim()) {
                      e.preventDefault();
                      addRssSource();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={addRssSource} 
                disabled={isAdding || !newRssUrl.trim()}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isAdding ? 'Adding...' : 'Add RSS'}
              </Button>
            </div>

            {/* Platform instructions */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>RSS URL examples:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Substack: <code>yourname.substack.com/feed</code></li>
                  <li>• Medium: <code>medium.com/@username/feed</code> or <code>username.medium.com/feed</code></li>
                  <li>• Ghost: <code>yourdomain.com/rss/</code> or <code>yourdomain.com/feed/</code></li>
                  <li>• Beehiiv: <code>yournewsletter.beehiiv.com/feed</code></li>
                  <li>• WordPress: <code>yoursite.wordpress.com/feed</code> or <code>yourdomain.com/feed</code></li>
                </ul>
                <p className="mt-2 text-sm">
                  Make sure your source blog is configured to include full article content in the RSS feed.
                </p>
              </AlertDescription>
            </Alert>
          </div>

          {sources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Rss className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No RSS sources connected yet</p>
              <p className="text-sm">Add your first RSS feed above to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sources.map((source) => (
                <Card key={source.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">
                        {platformIcons[source.platform]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">
                            {source.title || new URL(source.rss_url).hostname}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {platformNames[source.platform]}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {source.rss_url}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {source.websub_supported ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                WebSub supported
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-orange-500" />
                                WebSub not supported
                              </>
                            )}
                          </div>
                          
                          {source.status === 'active' ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              Active
                            </div>
                          ) : source.status === 'error' ? (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-red-500" />
                              Error
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-gray-500" />
                              Paused
                            </div>
                          )}

                          {source.last_checked_at && (
                            <span>
                              Last checked: {new Date(source.last_checked_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {source.error_message && (
                          <Alert className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              {source.error_message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* Auto-publish toggle */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`auto-publish-${source.id}`} className="text-sm">
                          Auto-publish
                        </Label>
                        <Switch
                          id={`auto-publish-${source.id}`}
                          checked={source.auto_publish}
                          onCheckedChange={(checked) => toggleAutoPublish(source.id, checked)}
                          disabled={!accountManager.is_delegated}
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSource(source.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cross-posted Content Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Cross-posted Content
          </CardTitle>
          <CardDescription>
            Articles that have been imported from your connected RSS sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {crossPostedContent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No content cross-posted yet</p>
              <p className="text-sm">Articles will appear here when they're imported from your RSS sources</p>
            </div>
          ) : (
            <div className="space-y-4">
              {crossPostedContent.map((content) => (
                <Card key={content.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">
                        {platformIcons[content.platform]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">
                            {content.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {platformNames[content.platform]}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>
                            Published: {new Date(content.published_at).toLocaleDateString()}
                          </span>
                          
                          {content.status === 'published' ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              Published on Fountain
                            </div>
                          ) : content.status === 'failed' ? (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-red-500" />
                              Failed to publish
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-orange-500" />
                              Draft created
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <a 
                            href={content.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View original
                          </a>
                          
                          {content.fountain_url && (
                            <a 
                              href={content.fountain_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View on Fountain
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}