# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fountain is a web3-enabled publishing platform (alternative to Medium/Substack) built with:
- Next.js 14.2.22 with App Router
- TypeScript (strict mode)
- Bun runtime (v1.2.5+)
- Lens Protocol for decentralized social features
- Grove for decentralized storage
- Plate.js editor with Y.js for collaborative editing

## Key Commands

```bash
# Development
bun run dev          # Start Next.js dev server (runs font generation first)
bun run collab       # Start collaboration server (required for editor sync)
bun run notifications # Start notifications server

# Build & Production
bun run build        # Build for production (includes font generation)
bun run start        # Start production server

# Code Quality
bun run lint         # Lint and fix with Biome
bun run format       # Format code with Biome
```

## Architecture Overview

### Frontend Structure
- `/src/app/` - Next.js App Router pages and API routes
  - `/api/` - Backend API endpoints
  - `/b/[blog]/` - Blog pages
  - `/p/[user]/[post]/` - Post pages
  - `/u/[user]/` - User profile pages
  - `/settings/` - Settings pages
  - `/admin/` - Admin panel

### Component Organization
- `/src/components/` - React components organized by feature
  - `/ui/` - Base UI components (shadcn/ui + custom)
  - `/editor/` - Plate.js editor components and plugins
  - `/auth/` - Authentication components
  - `/blog/`, `/post/`, `/user/` - Feature-specific components

### Key Services
- **Main App**: Next.js server handling web UI and API
- **Collaboration Server**: Express + Hocuspocus for Y.js sync (`src/srv/collaboration.ts`)
- **Notifications Server**: Express server for real-time notifications (`src/srv/notifications/server.ts`)

### State Management
- React Context for UI state
- Y.js for collaborative editor state
- Local storage for drafts and settings
- Lens Protocol for decentralized content

### Styling
- Tailwind CSS with custom theme
- CSS Modules for article styling (`/src/styles/article.css`)
- Custom font system with dynamic loading

## Development Guidelines

### Code Style
- Biome for linting and formatting
- 2-space indentation
- 120 character line width
- TypeScript strict mode enabled
- Some rules disabled: `noUnusedVariables`, `useExhaustiveDependencies`, `noExplicitAny`

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure required services (Lens, Supabase, Listmonk)
3. Run all three services for full functionality

### Working with the Editor
- Plate.js plugins are in `/src/components/editor/plugins/`
- Custom elements in `/src/components/ui/` (e.g., `heading-element.tsx`)
- Y.js integration through Hocuspocus collaboration server

### API Routes
- All API routes use Next.js Route Handlers
- Authentication via custom app tokens (see `/src/lib/auth/`)
- Admin routes protected by middleware

### Database & Storage
- Supabase for off-chain data
- Grove/Arweave for decentralized content storage
- Local draft storage in browser

### Web3 Integration
- wagmi/viem for Ethereum interactions
- ConnectKit for wallet UI
- Lens Protocol SDK for social features

## Development Workflow

### Branch & PR Strategy
All new feature development follows this process:
When starting work on a new feature or fix:

1. **Create a new branch** from `main` with a descriptive name:
   ```bash
   git checkout -b feature/description-here
   ```

2. **Immediately create a draft PR** after the first commit:
   - Push the branch: `git push -u origin feature/description-here`
   - Use GitHub CLI to create a draft PR:
   ```bash
   gh pr create --draft --title "Feature: Description here" --body "Work in progress..."
   ```
   - Or create via GitHub web interface and mark as "Draft"

3. **Continue development** by committing to the branch:
   - Make regular, atomic commits
   - Push frequently to keep the PR updated
   - The draft PR will automatically update with new commits

4. **When ready for review**:
   - Ensure all tests pass and code is linted
   - Update the PR description with a clear summary
   - Convert from draft to ready for review
   - Request review from the team lead

This workflow ensures:
- Early visibility of work in progress
- Easier collaboration and feedback
- Better tracking of feature development
- Code review before merging to main

## Commit & PR Guidelines

### Commit Messages
- Use conventional commit format when appropriate
- Focus on what changed and why
- Keep commit messages professional and concise
- Do not mention Claude AI or AI assistance in commit messages

### Pull Requests
- Create draft PRs immediately after starting new branches
- Include clear summary of changes in PR description
- Add test plan with checkboxes for manual testing
- Keep PR descriptions focused on the technical changes
- Do not mention Claude AI or AI assistance in PR descriptions
- Convert to "Ready for review" only when feature is complete