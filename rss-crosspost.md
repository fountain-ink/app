# RSS Cross-Posting MVP Documentation

## Project Overview

Building a cross-posting feature for Fountain to help users migrate from other blogging platforms (Substack, Medium, Ghost, Beehiiv, etc.) without abandoning their existing content. The feature will automatically import posts from external RSS feeds and create drafts (or auto-publish) on Fountain.

**Inspiration**: Paragraph.com's cross-posting feature - https://paragraph.com/@blog/bringing-the-next-wave-of-writers-onchain

## Technical Approach

### WebSub (PubSubHubbub) Implementation

**What is WebSub?**
- W3C standard for real-time web feed notifications
- Publisher-Hub-Subscriber model
- Eliminates need for constant RSS polling
- Used by WordPress, Blogger, CNN, Fox News, Mastodon

**How it works:**
1. RSS feeds include `<link rel="hub" href="...">` tags
2. Subscriber registers with hub for specific feed URLs
3. When publisher updates content, they notify the hub
4. Hub pushes updates to all subscribers via webhooks

**Infrastructure Requirements:**
- Web-accessible webhook endpoint (`/api/webhooks/websub`)
- Challenge-response verification for subscriptions
- HMAC signature validation for security
- Fallback to polling for platforms without WebSub support

**Available Hubs:**
- Google's free hub: `pubsubhubbub.appspot.com` (Recommended for MVP)
- SuperFeedr (paid service)
- Self-hosted options (e.g., Aaron Parecki's Switchboard)

**Hub Strategy:**
- **Start with Google's hub**: Free, reliable, battle-tested, zero infrastructure overhead
- **Self-hosting consideration**: Only if we need more control or hit limitations later
- Google's hub has been running for years, used by WordPress.com, Blogger, and many platforms
- No API keys or registration required for basic usage

### RSS Feed Analysis by Platform

**Substack:**
- URL format: `{subdomain}.substack.com/feed`
- Content: Usually full content ✅
- WebSub: Not confirmed

**Medium:**
- URL format: `medium.com/@{username}/feed`
- Content: Often truncated to excerpts ⚠️
- WebSub: Not confirmed

**Ghost:**
- URL format: `{domain}/rss/`
- Content: Configurable (admin can set full vs excerpt)
- WebSub: Supported via plugins

**Beehiiv:**
- URL format: `{newsletter}.beehiiv.com/feed`
- Content: Varies by user settings
- WebSub: Not confirmed

**WordPress:**
- URL format: `{domain}/feed/`
- Content: Usually configurable
- WebSub: Supported via official plugin

### Content Processing Challenges

1. **Content completeness**: Some feeds only provide excerpts
2. **HTML sanitization**: Need to clean and standardize markup
3. **Image handling**: Convert relative URLs to absolute
4. **Deduplication**: Avoid importing same post multiple times
5. **Attribution**: Clearly mark as cross-posted content

## Lens Account Manager Integration

**Purpose**: Enable auto-publishing instead of just creating drafts

**Implementation:**
1. User connects wallet and grants posting permissions to Fountain
2. Fountain receives delegation token for posting on user's behalf
3. Settings UI shows delegation status with revoke/re-enable options
4. Use Lens API `/api/accounts/{accountId}/posts` endpoint to publish

**Documentation**: https://lens.xyz/docs/protocol/accounts/manager

**Benefits:**
- Seamless cross-posting experience
- No manual transaction signing for each post
- User retains control via delegation management

## Recommended MVP Architecture

### Database Schema

```sql
-- Store RSS feed connections
CREATE TABLE cross_posting_sources (
  id UUID PRIMARY KEY,
  blog_address VARCHAR NOT NULL, -- Foreign key to blogs
  rss_url VARCHAR NOT NULL,
  platform VARCHAR, -- 'substack', 'medium', 'ghost', etc.
  title VARCHAR, -- Feed title
  websub_supported BOOLEAN DEFAULT false,
  websub_hub_url VARCHAR,
  last_checked_at TIMESTAMP,
  last_post_date TIMESTAMP,
  status VARCHAR DEFAULT 'active', -- 'active', 'error', 'paused'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track imported posts to avoid duplicates
CREATE TABLE cross_posted_content (
  id UUID PRIMARY KEY,
  source_id UUID REFERENCES cross_posting_sources(id),
  external_post_id VARCHAR, -- Original post ID/URL
  external_url VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  published_at TIMESTAMP,
  fountain_draft_id VARCHAR, -- If created as draft
  fountain_post_id VARCHAR, -- If auto-published
  status VARCHAR DEFAULT 'draft', -- 'draft', 'published', 'failed'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Store Account Manager delegation status
CREATE TABLE account_manager_delegations (
  id UUID PRIMARY KEY,
  blog_address VARCHAR NOT NULL UNIQUE,
  lens_account_id VARCHAR NOT NULL,
  delegation_token VARCHAR,
  expires_at TIMESTAMP,
  permissions TEXT[], -- Array of granted permissions
  status VARCHAR DEFAULT 'active', -- 'active', 'revoked', 'expired'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```typescript
// Settings endpoints
GET /api/blogs/{blogAddress}/cross-posting - Get cross-posting sources
POST /api/blogs/{blogAddress}/cross-posting/sources - Add RSS source
DELETE /api/blogs/{blogAddress}/cross-posting/sources/{sourceId} - Remove source
PUT /api/blogs/{blogAddress}/cross-posting/sources/{sourceId} - Update source

// Account Manager endpoints
GET /api/blogs/{blogAddress}/account-manager - Get delegation status
POST /api/blogs/{blogAddress}/account-manager/delegate - Create delegation
DELETE /api/blogs/{blogAddress}/account-manager/delegate - Revoke delegation

// WebSub webhook endpoint
POST /api/webhooks/websub - Receive WebSub notifications
GET /api/webhooks/websub - Handle subscription verification challenges

// Content import
POST /api/cross-posting/import/{sourceId} - Manual import trigger
GET /api/cross-posting/content/{sourceId} - List imported content
```

### Component Structure

```
src/components/cross-posting/
├── cross-posting-settings.tsx         # Main settings page
├── rss-source-form.tsx                # Add/edit RSS source
├── rss-source-list.tsx                # List connected sources
├── account-manager-status.tsx         # Delegation status/controls
├── imported-content-list.tsx          # Show imported drafts/posts
└── platform-instructions.tsx         # Help finding RSS URLs
```

### Implementation Phases

**Phase 1: Basic RSS Import**
- Settings UI for adding RSS feeds
- Polling-based RSS checking (every 15-30 minutes)
- Create drafts from new posts
- Basic content sanitization

**Phase 2: WebSub Integration**
- WebSub subscriber implementation
- Challenge-response verification
- HMAC signature validation
- Fallback to polling for non-WebSub feeds

**Phase 3: Account Manager Auto-Publishing**
- Lens delegation setup UI
- Auto-publish toggle per RSS source
- Error handling and retry logic
- Delegation status monitoring

**Phase 4: Enhanced Features**
- Better content parsing (handle excerpts)
- Custom posting schedules
- Content filtering rules
- Analytics and reporting

## Technical Implementation Notes

### WebSub vs Polling Decision

Based on micro.blog WebSub guide (https://book.micro.blog/websub/):

**Polling problems:**
- "Slow and inefficient" 
- Repeated HTTP requests even when no new content exists
- Increases server load and network traffic
- "'Are we there yet?' syndrome" - constant checking without results

**WebSub benefits:**
- Real-time notifications (no delays)
- Eliminates unnecessary network requests
- Enables faster content distribution
- Much more efficient resource usage

**Recommended approach:**
1. **Primary**: WebSub using Google's free hub (`pubsubhubbub.appspot.com`)
2. **Fallback**: Polling every 30-60 minutes for feeds without WebSub support
3. **Future**: Consider self-hosting if we need more control

### WebSub Libraries

Need to research Node.js WebSub libraries, likely candidates:
- Custom implementation using Express webhooks
- Look for existing npm packages for WebSub subscribers

### RSS Parsing

Use `rss-parser` npm package for RSS/Atom feed parsing.

### Content Sanitization

Use libraries like `dompurify` or `sanitize-html` to clean imported content.

### Background Jobs

Implement using:
- Node.js cron jobs for polling
- Database-driven job queue for processing
- Consider using existing job libraries like `bull` or `agenda`

### Error Handling

- Graceful handling of feed downtime
- Retry logic with exponential backoff
- User notifications for persistent errors
- Logging and monitoring

## User Experience Flow

1. **Setup**: User goes to blog settings → Cross-posting section
2. **Connect**: Adds RSS URL, system validates and detects platform
3. **Configure**: Chooses draft vs auto-publish (requires Account Manager)
4. **Monitor**: Dashboard shows connected sources, import status, recent imports
5. **Manage**: Can pause/resume sources, view imported content, revoke permissions

## Security Considerations

- Validate all RSS URLs before subscribing
- Sanitize all imported content
- Rate limit WebSub webhook endpoint
- Verify HMAC signatures for WebSub notifications
- Secure storage of delegation tokens
- User control over delegation permissions

## Testing Strategy

- Mock RSS feeds for different platforms
- Test WebSub subscription flow
- Test content parsing edge cases
- Test Account Manager delegation flow
- Test error scenarios (feed down, invalid content, etc.)

## Open Questions for Implementation

1. Should we build custom WebSub subscriber or find existing library?
2. How to handle feeds that only provide excerpts vs full content?
3. What's the ideal polling frequency for non-WebSub feeds?
4. How to handle content that requires login/paywall on source platform?
5. Should we support custom RSS feed formats beyond standard RSS/Atom?

## Next Steps

1. Research and choose WebSub subscriber library/implementation
2. Create database migrations for new tables
3. Build basic settings UI for adding RSS sources
4. Implement RSS parsing and draft creation
5. Add WebSub webhook endpoint
6. Integrate Account Manager delegation