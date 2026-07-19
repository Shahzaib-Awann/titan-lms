# Titan LMS - AI Project Memory

## Purpose

This file is the project context for future development. Read this file before scanning the codebase. Update it when architecture, features, or conventions change.

## Project Overview

Titan LMS is a Learning Management System with three roles:

- Admin
- Trainer
- Student

Main goals:

- Role-based dashboards
- Course management
- Student/trainer workflows
- Secure authentication
- Scalable server-first architecture

## Tech Stack

- Framework: Next.js 16 App Router
- React: 19
- Language: TypeScript
- Auth: NextAuth v5 Credentials Provider
- Database: MySQL
- ORM: Drizzle ORM
- Styling: Tailwind CSS v4
- UI: shadcn/ui
- Forms: React Hook Form
- Validation: Zod

## Folder/File Structure Summary

- `/app`: Next.js routing.
  - `/(auth)`: Authentication routes like `/sign-in`.
  - `/(dashboard)`: Protected layouts and pages (`/admin`, `/trainer`, `/student`).
- `/components`:
  - `/ui`: shadcn/ui base components.
  - Root: Custom layouts (`app-sidebar`, `header`, `user-account-menu`).
- `/lib`:
  - `/actions`: Server actions for mutations/fetches.
  - `/db`: Drizzle schemas (`schema/index.ts`) and migrations.
  - `/zod`: Zod validation schemas.
- `auth.ts`: NextAuth configuration.
- `proxy.ts`: Next.js middleware handling access control.
- `DESIGN.md`: Source of truth for UI/UX patterns and constraints.

## Important Architecture Decisions

- **Stateless Sessions**: NextAuth uses the `jwt` strategy. Session state is derived entirely from the token, not a database session table.
- **Middleware-based Protection**: `proxy.ts` routes users based on their role and redirects unauthenticated users away from protected areas.
- **NanoIDs**: Database primary keys are 21-character NanoIDs (not auto-increment integers).

## Authentication and Authorization Flow

- **Provider**: NextAuth Credentials provider.
- **Credentials**: Users sign in using `cnic` (13 chars) and `password`.
- **Flow**: User submits form -> `getUserForSignin` verifies CNIC/status -> `bcrypt` verifies password -> JWT encodes `id`, `role`, and `status`.
- **Routing**: Successful sign-in redirects to the role's home page (e.g., `/admin`), or to an optional `redirect_url` if provided.

## Database/Schema Overview

- `users`: Base auth table (id, cnic, password, role, status, avatar).
- `trainer_profiles`: Linked 1-to-1 with `users`. Stores employee code, specialization, hourly rate.
- `student_profiles`: Linked 1-to-1 with `users`. Stores roll number, guardian details, admission date.
- `assets`: Centralized media/file storage tracker.

## Main Components and Reusable Utilities

- **shadcn/ui**: Comprehensive set of components (Card, Button, Dropdown, Data Table, Form/Field, Avatar, etc.).
- **Layouts**: `sidebar.tsx`, `nav-main.tsx` for navigation.
- **Utils**: `cn()` for Tailwind class merging, `getAvatarInitials()` for fallback avatars.

## API Routes and Server Actions

- **API**: `/api/auth/[...nextauth]` handles internal NextAuth REST operations.
- **Actions**: Database interactions occur through Server Actions (`lib/actions/*.ts`) rather than standard API routes.

## Environment/Configuration Notes

- Requires DB config: `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`.
- Requires NextAuth config: `AUTH_SECRET`.

## Current Working Features

- Drizzle ORM integrated and fully typed.
- Role-based NextAuth authentication workflow.
- Secure routing with Next.js middleware (`proxy.ts`).
- Scaffolded dashboard environments for all three roles.

## Known Issues

- Image loading optimizations are needed (LCP eager loading warnings).
- Minor credentials error handling on the auth front-end might need refinement.

## Pending Tasks / Roadmap

- Implement full feature sets for Admin, Trainer, and Student dashboards.
- Build interactive calendar/timeline components (refer to `DESIGN.md`).
- Implement course progression and attendance metrics.

## Development Rules and Coding Patterns

- **Styling**: Strictly adhere to `DESIGN.md`. Avoid heavy borders, use generous spacing/padding, and respect the layered surface paradigm.
- **Server-First**: Default to Server Components. Use `"use client"` only for interactive islands.
- **Data Validation**: Always validate data entering server actions using Zod schemas.
- **No db mutations in UI**: Offload database logic to `lib/actions/` and keep UI components focused on rendering.
