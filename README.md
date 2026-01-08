# AgenSee - Agency Management System

A secure, modular Agency Management System built with modern web technologies.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js (Express), TypeScript
- **Database & Auth**: Supabase (PostgreSQL, GoTrue Auth, Storage)
- **Architecture**: BFF (Backend for Frontend)

## Project Structure

```
agensee/
├── client/          # Next.js frontend application
├── server/          # Node.js/Express API server
├── shared/          # Shared types and utilities
└── schema.sql       # Database schema for Supabase
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both `client/` and `server/`
   - Fill in your Supabase credentials

4. Run the database schema in Supabase SQL Editor (`schema.sql`)

5. Start the development servers:
   ```bash
   npm run dev
   ```

## Development

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the Next.js client
- `npm run dev:server` - Start only the Express server
- `npm run build` - Build all packages
- `npm run lint` - Run linting across all packages
