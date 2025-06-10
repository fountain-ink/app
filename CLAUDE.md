# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Fountain is a self-hostable web3 publishing platform - an alternative to Medium, Substack, and Mirror. It's a Next.js application with TypeScript that enables decentralized content publishing with ownership.

## Development Commands
```bash
# Run collaboration server (required for editor real-time sync)
bun run collab

# Run notifications server
bun run notifications

# Start production server
bun run start

# Code quality
bun run lint    # Run Biome linter
bun run format  # Run Biome formatter

# Database scripts
bun run db:generate-types  # Generate Supabase types
bun run db:backup          # Backup database
bun run db:restore         # Restore database from backup
bun run db:restore-to-remote # Restore to remote database
bun run db:reset-local     # Reset local database
bun run db:test            # Test database connection

# Font generation
bun run generate-fonts     # Generate font files
```

## Key Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Runtime**: Bun
- **Editor**: Plate.js (Slate-based rich text editor)
- **Styling**: Tailwind CSS with custom themes
- **State**: Zustand stores, React Query for data fetching
- **Web3**: Lens Protocol integration, Wagmi/Viem for wallet connections
- **Storage**: Supabase (off-chain), Grove/Arweave (decentralized)

### Project Structure
- `/src/app/` - Next.js app router pages and API routes
- `/src/components/` - Feature-based component organization (auth/, blog/, editor/, post/, etc.)
- `/src/lib/` - Core utilities organized by domain (auth/, db/, lens/, publish/, etc.)
- `/src/hooks/` - Custom React hooks
- `/src/components/ui/` - Reusable UI components (shadcn/ui based)

### Key Features & Patterns
1. **Authentication**: Custom JWT-based auth with guest support (see `/src/lib/auth/`)
2. **Editor**: Rich text editor with custom plugins for Web3 features (see `/src/components/editor/`)
3. **Publishing**: Multi-step publish flow with draft system (see `/src/lib/publish/`)
4. **Blogs**: Users can create multiple blogs with custom themes
5. **Newsletter**: Integrated with Listmonk for email campaigns
6. **Real-time Collaboration**: Yjs-based collaborative editing

### Code Style
- Biome for linting/formatting (configured in biome.json)
- 2 spaces indentation, 120 char line width
- No semicolons in TypeScript/JavaScript
- Prefer functional components with hooks

### Database & Security

#### Database Structure
- **Database**: Supabase (PostgreSQL)
- **Migrations**: Located in `/supabase/migrations/`
- **Key Tables**: users, blogs, posts, drafts, curated, feedback, banlist, chat_messages
- **Real-time**: Chat messages table has real-time enabled via Supabase publication

#### Row Level Security (RLS)
All tables have RLS enabled with a custom JWT authentication system:

**JWT Structure**:
```json
{
  "sub": "user_address",
  "metadata": {
    "isAdmin": boolean,
    "username": string,
    "address": string
  }
}
```

**Security Patterns**:
1. **Public Read Access**: blogs, posts, users, curated, banlist (for ban checking)
2. **Owner-Based Access**: Users can only modify their own data (blogs, posts, drafts, profiles)
3. **Contributor Access**: Draft collaborators can read/update shared drafts
4. **Admin Access**: Admins bypass RLS for moderation via `is_admin()` function checking JWT metadata
5. **Service Role**: Used for system operations that bypass RLS (migrations, admin APIs)

**Key Policies**:
- **Posts/Blogs**: Public read, owner write/delete
- **Drafts**: Private to author + contributors
- **Users**: Public profiles, self-update only
- **Chat**: Public read (non-deleted), authenticated insert, soft delete
- **Admin**: Full access when `metadata.isAdmin` is true in JWT

### Environment Variables
Required environment variables are defined in `/src/lib/environment.ts`. Key variables include:
- Database: `DATABASE_URL`, `DIRECT_URL`
- Auth: `APP_SECRET`
- Web3: Various blockchain and storage provider keys
- Email: Listmonk configuration
```

## Development Workflow Reminders
- Whenever we make a change run `bunx tsc --noEmit` and fix errors until there's none left. do not run `bun run dev` or `bun run build`. assume dev server is always runinng.

## Code Style
Prioritize having fewer files. Only create new files when absolutely necessary. Only use individual exports in files, do not create index files.