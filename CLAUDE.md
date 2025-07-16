# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server with Next.js Turbo
- `pnpm build` - Run database migrations and build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js linting and Biome linting with auto-fix
- `pnpm format` - Format code with Biome
- `pnpm test` - Run Playwright e2e tests

### Database Commands
- `pnpm db:generate` - Generate database schema with Drizzle Kit
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:push` - Push schema changes to database
- `pnpm db:pull` - Pull schema from database

## Architecture Overview

This is a Next.js 15 AI chatbot application built with the AI SDK that supports multiple AI models and includes collaborative document editing features.

### Key Technologies
- **Framework**: Next.js 15 with App Router and PPR (Partial Prerendering)
- **AI Integration**: AI SDK with support for xAI (default), OpenAI, and other providers
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 beta
- **Styling**: Tailwind CSS with shadcn/ui components
- **File Storage**: Vercel Blob
- **Testing**: Playwright for e2e testing
- **Code Quality**: Biome for linting and formatting

### Directory Structure
- `app/` - Next.js App Router pages and API routes
  - `(auth)/` - Authentication pages and logic
  - `(chat)/` - Chat interface and chat-related API routes
- `components/` - Reusable React components including UI components
- `lib/` - Utility functions and core logic
  - `ai/` - AI model configurations, prompts, and tools
  - `db/` - Database schema, queries, and migrations
  - `artifacts/` - Artifact management (documents, code, images, sheets)
- `artifacts/` - Client and server components for different artifact types
- `hooks/` - Custom React hooks
- `tests/` - Playwright e2e tests and test utilities

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- `User` - User accounts with email/password authentication
- `Chat` - Chat sessions with visibility settings (public/private)
- `Message_v2` - Chat messages with parts and attachments (replaces deprecated Message)
- `Document` - Collaborative documents (text, code, image, sheet, notes types)
- `Suggestion` - Document edit suggestions
- `Vote_v2` - Message voting system
- `Stream` - Chat streaming sessions

### AI Integration
- Models are configured in `lib/ai/models.ts` with default chat and reasoning models
- AI tools are implemented in `lib/ai/tools/` for weather, document creation, and suggestions
- Prompts are centralized in `lib/ai/prompts.ts`
- Provider configuration is in `lib/ai/providers.ts`

### Authentication
- Uses NextAuth.js v5 beta with custom configuration in `app/(auth)/auth.ts`
- Supports email/password registration and guest sessions
- Session management integrated throughout the application

### Artifacts System
The application supports collaborative document editing with five artifact types:
- Text documents with rich editing capabilities
- Code editors with syntax highlighting
- Image editing and manipulation
- Spreadsheet/sheet functionality
- Notes for structured information with bullet points and organization

Each artifact type has dedicated client and server components in the `artifacts/` directory.

## Environment Setup

The application requires several environment variables defined in `.env.local`:
- `POSTGRES_URL` - PostgreSQL database connection string
- `AUTH_SECRET` - NextAuth.js secret key
- Additional AI provider API keys as needed

## Testing

The application uses Playwright for comprehensive e2e testing:
- Test files are located in `tests/e2e/`
- Page objects are in `tests/pages/`
- Test helpers and fixtures are in `tests/helpers.ts` and `tests/fixtures.ts`
- Run tests with `pnpm test`

## Development Notes

- The application uses PPR (Partial Prerendering) experimental feature
- Database migrations are automatically run during the build process
- The chat interface supports real-time streaming responses
- File uploads are handled through Vercel Blob storage
- The application includes comprehensive error handling and user feedback systems

## Memory

- Added new notes artifact to the artifacts system for collaborative document editing with structured information, bullet points, and organization features