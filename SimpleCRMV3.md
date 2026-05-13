# SimpleCRM — Architecture Reference

> Internal CRM for lead nurturing and team management.  
> Desktop-first. TypeScript end-to-end. Built locally, pushed to GitHub, deployed via Coolify on Contabo VPS.  
> Designed for AI agent development — one human orchestrator, agent does the building.

---

## 1. Product Vision

A lightweight internal CRM with three jobs:

1. **Capture** leads from one or more public-facing forms (no auth required for submitter)
2. **Triage** incoming leads — admin reviews and assigns them to members
3. **Nurture** — each member works their assigned leads through the pipeline with reminders, notes, and status tracking

---

## 2. Roles & Access Model

Two roles only: **Admin** and **Member**.

| Capability | Admin | Member |
|---|---|---|
| See ALL unassigned leads (inbox) | ✅ | ❌ |
| See all leads across all members | ✅ | ❌ |
| See teammates' leads (name + status only) | ✅ | ✅ |
| Edit / work own assigned leads | ✅ | ✅ |
| Assign / reassign leads | ✅ | ❌ |
| Create / manage members | ✅ | ❌ |
| View full analytics | ✅ | ❌ |
| Export to CSV | ✅ | ❌ |
| Access capture form builder | ✅ | ❌ |
| Set follow-up reminders | ✅ | ✅ (own leads) |
| View reminders across all members | ✅ | ❌ |

### Role definitions

**Admin** — global visibility. Sees every lead the moment it arrives. Manages members, assigns leads, exports data, builds forms, monitors the full pipeline.

**Member** — scoped view. Works only their assigned leads. Can see teammates' name, status, and rating for situational awareness. Cannot open or edit other members' leads.

---

## 3. Lead Lifecycle

```
Public Form Submitted  (one or more source forms)
        │
        ▼
  [Unassigned Inbox]  ← Admin only
        │
  Admin selects one or more leads
  Admin assigns → Member X
        │
        ▼
  [Member X's Queue]
        │
  Member works lead: status, notes, contact log, reminders
        │
        ▼
  [Closed]
```

### Visibility rule

All members can see every assigned lead's name, status, assignee name, and rating — read-only. They cannot open the detail panel for leads not assigned to them.

---

## 4. Data Model

### User

```
id                String   @id @default(cuid())
name              String
email             String   @unique
passwordHash      String
role              Role     (ADMIN | MEMBER)
avatarInitials    String   (2 chars, auto-derived)
isActive          Boolean  @default(true)
createdAt         DateTime @default(now())
updatedAt         DateTime @updatedAt
```

### Lead

```
id              String     @id @default(cuid())
name            String
phone           String
location        String?
status          LeadStatus @default(FRESH)
rating          Int        @default(0)   // 0–5
assignedToId    String?    → User.id     (null = unassigned / inbox)
lastContacted   DateTime?
createdAt       DateTime   @default(now())
updatedAt       DateTime   @updatedAt
```

### LeadSource  *(junction — multiple sources per lead)*

```
id        String   @id @default(cuid())
leadId    String   → Lead.id
source    Source   (FACEBOOK_AD | INSTAGRAM | WEBSITE | REFERRAL | COLD_OUTREACH | WALK_IN | OTHER)
formId    String?  → CaptureForm.id  (null if added manually)
createdAt DateTime @default(now())
```

> Duplicate phone on form submit → new LeadSource row on existing lead. No duplicate lead created.

### Note  *(append-only)*

```
id        String   @id @default(cuid())
leadId    String   → Lead.id
authorId  String   → User.id
body      String
createdAt DateTime @default(now())
```

### Reminder

```
id          String         @id @default(cuid())
leadId      String         → Lead.id
createdById String         → User.id
dueAt       DateTime
note        String?
status      ReminderStatus @default(PENDING)  // PENDING | DISMISSED | RESCHEDULED
createdAt   DateTime       @default(now())
updatedAt   DateTime       @updatedAt
```

### ActivityLog  *(immutable audit trail)*

```
id        String         @id @default(cuid())
leadId    String         → Lead.id
actorId   String         → User.id
action    ActivityAction // CREATED | STATUS_CHANGED | ASSIGNED | REASSIGNED |
                         // RATING_CHANGED | NOTE_ADDED | CONTACTED |
                         // REMINDER_SET | REMINDER_DISMISSED
fromValue String?
toValue   String?
createdAt DateTime       @default(now())
```

### CaptureForm

```
id        String   @id @default(cuid())
name      String   (internal label)
slug      String   @unique  → public URL: /form/:slug
sourceTag Source   (auto-applied to leads from this form)
fields    Json     { location: bool, message: bool }
isActive  Boolean  @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

---

## 5. Lead Status & Colors

| Enum | Label | Color |
|---|---|---|
| `FRESH` | Fresh | Teal `#1D9E75` |
| `INTERESTED` | Interested | Blue `#378ADD` |
| `THINKING` | Thinking | Coral `#D85A30` |
| `NO_RESPOND` | No respond | Amber `#BA7517` |
| `NOT_INTERESTED` | Not interested | Red `#E24B4A` |
| `CLOSED` | Closed | Purple `#534AB7` |

---

## 6. Follow-up Reminder System

**Setting:** "Set reminder" button on Lead Detail panel → date + time + optional note → Reminder row created.

**Surfaces:**
- **List view** — clock badge on lead row. Grey = pending. Amber = overdue.
- **Reminders view** — sidebar nav, own pending reminders by due date. Inline dismiss / reschedule.
- **Notification** — in-app bell fires at `dueAt`. Optional email per-user setting (off by default).

**Admin** sees all pending reminders across all members, filterable.

---

## 7. Tech Stack

> **Language: TypeScript everywhere.** Chosen because AI coding agents (Cursor, Windsurf, Claude Code) have the deepest TypeScript training data, produce the most reliable output, and the entire stack shares one type system with zero language context-switching.

### Stack map

```
┌──────────────────────────────────────────────────┐
│                    FRONTEND                       │
│   Next.js 14 (App Router)  ·  TypeScript          │
│   Tailwind CSS  ·  shadcn/ui                      │
│   TanStack Query  (server state management)       │
└────────────────────┬─────────────────────────────┘
                     │  Server Actions / API Routes
┌────────────────────▼─────────────────────────────┐
│                    BACKEND                        │
│   Next.js API Routes  ·  TypeScript               │
│   Zod (input validation)                          │
│   Jose + bcryptjs (JWT sessions + passwords)      │
└────────────────────┬─────────────────────────────┘
                     │  Prisma Client
┌────────────────────▼─────────────────────────────┐
│                    DATABASE                       │
│   PostgreSQL  (local Docker in dev)               │
│   Prisma ORM  (schema = single source of truth)  │
└──────────────────────────────────────────────────┘
```

### Package list

| Layer | Package | Role |
|---|---|---|
| Framework | `next` | Full-stack framework |
| Language | `typescript` | End-to-end type safety |
| Styling | `tailwindcss` | Utility-first CSS |
| Components | `shadcn/ui` | Accessible UI primitives |
| ORM | `prisma` | Schema, migrations, typed client |
| Validation | `zod` | Runtime validation on all inputs |
| Auth | `jose` + `bcryptjs` | JWT tokens + password hashing |
| Server state | `@tanstack/react-query` | Client data fetching and caching |
| Notifications | `sonner` | Toast notifications |
| Date handling | `date-fns` | Reminder scheduling, display |
| Email | `resend` | Transactional email (reminders, invites) |
| CSV export | `papaparse` | Server-side CSV generation |

---

## 8. Folder Structure (Modular)

```
simpleCRM/
├── prisma/
│   ├── schema.prisma          ← single source of truth for all data
│   └── migrations/            ← auto-generated, never edit manually
│
├── src/
│   ├── app/                   ← Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (app)/             ← protected routes (auth-guarded layout)
│   │   │   ├── layout.tsx     ← sidebar + session check
│   │   │   ├── dashboard/
│   │   │   ├── inbox/         ← admin only
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx               ← server entry, initial data fetch
│   │   │   │   ├── leads-client.tsx       ← thin client wrapper
│   │   │   │   └── pipeline/              ← ✅ BUILT — Sprint 1
│   │   │   │       ├── pipeline-workspace.tsx    (orchestrator, <60 lines)
│   │   │   │       ├── pipeline-lead-modal.tsx   (detail view — Sprint 2)
│   │   │   │       ├── table-container.tsx
│   │   │   │       ├── workspace-modals.tsx
│   │   │   │       ├── hooks/
│   │   │   │       │   ├── use-leads.ts
│   │   │   │       │   ├── use-table-state.ts
│   │   │   │       │   ├── use-column-state.ts
│   │   │   │       │   ├── use-inline-row.ts
│   │   │   │       │   └── use-workspace-dnd.ts
│   │   │   │       ├── columns/
│   │   │   │       │   ├── column-definitions.tsx
│   │   │   │       │   ├── column-header.tsx
│   │   │   │       │   ├── column-header-dropdown.tsx
│   │   │   │       │   ├── column-resizer.tsx
│   │   │   │       │   └── add-column-popover.tsx
│   │   │   │       ├── rows/
│   │   │   │       │   ├── lead-row.tsx
│   │   │   │       │   ├── ghost-row.tsx
│   │   │   │       │   ├── group-header-row.tsx
│   │   │   │       │   └── row-drag-handle.tsx
│   │   │   │       ├── cells/
│   │   │   │       │   ├── status-cell.tsx
│   │   │   │       │   ├── member-cell.tsx
│   │   │   │       │   ├── rating-cell.tsx
│   │   │   │       │   ├── source-cell.tsx
│   │   │   │       │   └── cell-editor.tsx
│   │   │   │       ├── toolbar/
│   │   │   │       │   └── pipeline-toolbar.tsx
│   │   │   │       └── dialogs/
│   │   │   │           ├── filter-dialog.tsx
│   │   │   │           ├── customize-dialog.tsx
│   │   │   │           └── create-attribute-dialog.tsx
│   │   │   ├── reminders/
│   │   │   ├── analytics/     ← admin only
│   │   │   ├── forms/         ← admin only
│   │   │   ├── team/          ← admin only
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── leads/
│   │   │   │   ├── route.ts              ← GET (list) + POST (create)
│   │   │   │   ├── [id]/route.ts         ← GET + PATCH + DELETE
│   │   │   │   └── reorder/route.ts      ← ✅ PATCH bulk reorder
│   │   │   ├── reminders/
│   │   │   ├── forms/
│   │   │   ├── users/
│   │   │   │   └── route.ts              ← ✅ GET ?role=MEMBER
│   │   │   └── export/
│   │   └── form/[slug]/       ← public capture form (no auth)
│   │
│   ├── modules/               ← domain business logic
│   │   ├── leads/
│   │   │   ├── leads.service.ts
│   │   │   ├── leads.schema.ts
│   │   │   └── leads.types.ts
│   │   ├── reminders/
│   │   ├── forms/
│   │   ├── users/
│   │   └── activity/
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── session.ts
│   │   └── email.ts
│   │
│   └── components/
│       ├── ui/                ← shadcn primitives
│       └── shared/
│
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── .gitignore
```

> **AI agent rule:** every new feature lives in its own module folder. No file exceeds 200 lines. The orchestrator (`pipeline-workspace.tsx`) is a composition root only — no logic, no state, no JSX beyond layout.

---

## 9. Development Workflow

### The full journey: local → GitHub → production

```
1. BUILD LOCALLY
   ├── Run Postgres in Docker (docker-compose up)
   ├── Run Next.js dev server (npm run dev)
   ├── Develop feature → test in browser at localhost:3000
   └── Repeat until the app is complete and stable

2. PUSH TO GITHUB
   ├── Create a GitHub repo (private)
   ├── git init → git remote add origin → git push
   └── main branch = production-ready code only

3. DEPLOY VIA COOLIFY
   ├── Coolify connects to the GitHub repo
   ├── Every push to main → Coolify auto-builds Docker image
   ├── Runs prisma migrate deploy inside container on startup
   └── App live at your domain via Coolify reverse proxy (HTTPS auto)
```

### Local environment setup (Sprint 0)

```bash
# 1. Scaffold the project
npx create-next-app@latest simpleCRM --typescript --tailwind --app --src-dir

# 2. Install dependencies
npm install prisma @prisma/client zod jose bcryptjs date-fns papaparse resend sonner @tanstack/react-query
npm install -D @types/bcryptjs @types/papaparse

# 3. Init Prisma
npx prisma init

# 4. Paste schema.prisma (already written — see schema.prisma artifact)

# 5. Start local Postgres
docker-compose up -d

# 6. Run first migration
npx prisma migrate dev --name init

# 7. Seed admin user (one-time script)
npx prisma db seed

# 8. Start dev server
npm run dev
```

### `.env` (local only — never commit)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/simplecrm"
JWT_SECRET="your-local-secret-min-32-chars"
RESEND_API_KEY="re_xxxxxxxxxxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### `docker-compose.yml` (local Postgres only)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: simplecrm
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### `Dockerfile` (production — used by Coolify)

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

> `prisma migrate deploy` runs automatically on every container start. New migrations you've tested locally are applied to production Postgres on deploy — zero manual steps.

---

## 10. Coolify Deployment Config

Once the app is complete and pushed to GitHub:

```
Coolify dashboard
├── New Resource → Application → GitHub repo
├── Build pack: Dockerfile
├── Branch: main
├── Environment variables:
│   ├── DATABASE_URL  → postgresql://... (Coolify-managed Postgres service)
│   ├── JWT_SECRET    → strong random string
│   ├── RESEND_API_KEY
│   └── NEXT_PUBLIC_APP_URL → https://yourdomain.com
└── Deploy → done
```

Coolify provides the Postgres service on the same VPS. The `DATABASE_URL` it gives you points to that internal service. Everything else is identical to local — same schema, same migrations, same code.

---

## 11. Application Screens

### Admin

| Screen | Notes |
|---|---|
| Inbox | Unassigned leads, multi-select + bulk assign |
| All Leads | Full pipeline, all members, groupable by any field |
| Lead Detail | Status, rating, notes, activity log, reminders |
| Team | Member list, invite, deactivate, reassign on deactivation |
| Analytics | Funnel, per-member stats, source breakdown |
| Reminders | All pending across all members |
| Capture Forms | Builder, slug, source tag, embed code |
| CSV Export | From All Leads, respects active filters |
| Settings | Profile, notification prefs |

### Member

| Screen | Notes |
|---|---|
| My Leads | Own queue, grouped by status |
| Team View | All workspace leads, read-only |
| Lead Detail | Own leads only |
| Reminders | Own pending reminders |
| Settings | Profile, notification prefs |

---

## 12. UX Conventions

- **Desktop-first.** Min-width 1024px. No mobile breakpoints in v1.
- **Inbox badge** always visible in admin sidebar — real-time unassigned count.
- **Lead rows not editable inline** — all edits inside the Lead Detail panel.
- **Grouping is client-side** — any field can be the group key. Default: Status.
- **Notes are append-only** — no edit or delete after creation.
- **Source pills** — multiple sources shown as stacked color-coded pills.
- **Reminder badge on row** — grey = pending, amber = overdue.
- **Deactivated members** — admin prompted to reassign open leads before confirming.

---

## 13. Decisions Log

| Question | Decision |
|---|---|
| Team Lead role? | Removed — two roles only: Admin and Member |
| Members see teammates? | Yes — name, status, assignee, rating. Read-only. No detail access. |
| Multiple sources per lead? | Yes — LeadSource junction. Duplicate phone = new source row, no duplicate lead. |
| Follow-up reminders? | Yes — per-lead, date + time + note, in-app + optional email, admin sees all |
| CSV export? | Admin only |
| Sub-groups / teams? | Removed. Flat member list under one admin. |
| Desktop or mobile first? | Desktop-first, 1024px min, no mobile in v1 |
| Language / stack? | TypeScript end-to-end — best AI agent support |
| Database? | PostgreSQL — local Docker in dev, Coolify-managed in production |
| Auth? | Custom JWT with Jose + bcrypt — no external auth vendor |
| Dev workflow? | Build locally → push to GitHub → Coolify auto-deploys on push to main |

---

---

## 14. Sprint Log

### ✅ Sprint 0 — Foundation
Project scaffolded, Prisma schema written, Docker Postgres running, 
migrations applied, seed script in place, dev server live.

### ✅ Sprint 1 — Pipeline Workspace (Leads List)
Full leads grid built and modularized. Features shipped:
- Draggable rows (`@dnd-kit`) with server-side order persistence
- Excel-style ghost row inline creation (Tab / Enter / Escape)
- Resizable columns with localStorage persistence
- Reorderable columns with localStorage persistence
- Column pinning (sticky left, calculated offsets)
- Column header dropdown (Rename, Hide, Sort ↑↓, Pin, Group by)
- Add Column popover with 9 premade attributes + custom attribute builder
- Custom attributes saved to localStorage, appear as live columns
- Status cell: color-coded pills + picker popover (2026 design)
- Member cell: avatar picker with role-based access (admin assigns, member reads)
- Rating cell: clickable star rating
- Source cell: multi-source pill badges
- Role-based access: member picker locked for non-admin
- API routes: PATCH /api/leads/reorder, GET /api/users?role=MEMBER

### ✅ Sprint 2 — Lead Detail Modal
Full side-panel detail view for a single lead. Features shipped:
- Sheet panel (640px, right-side) with header, actions, notes, activity, reminders
- Header: avatar (status-tinted), name, phone, location, source pills, assigned member
- Actions bar: status pill, star rating, Log Contact, Set Reminder
- Set Reminder button: amber bell + "in 2 days" / red "3 hours ago" badge via date-fns
- Notes section: append-only, optimistic add, newest first, author + relative time
- Activity log: full 9-action timeline with color-coded dots, newest first
- Reminder section: pending reminders with dismiss + reschedule
- Set Reminder dialog: date + time + note, Zod validated on backend
- Hooks: use-lead-detail (4 data slices), use-lead-mutations (4 mutations, optimistic)
- API routes: notes GET+POST, activity GET+POST, reminders POST+PATCH — all Zod validated
- All routes: 400 response with flattened Zod errors on invalid input

### ✅ Sprint 2 Addendum — Auth hardening
getSession() applied to all API routes. firstAdmin hardcode fully removed.
Future-date validation added to POST /api/reminders. Zero TS errors confirmed.

### ✅ Sprint 3 — Admin Inbox
Full unassigned leads triage view for admin. Features shipped:
- Server-side admin guard on page.tsx (redirect if not ADMIN)
- inbox-workspace.tsx orchestrator <80 lines, Set<string> selection state
- inbox-toolbar.tsx: smooth CSS transition between default and selection mode
- inbox-table.tsx: 6 fixed columns, select-all checkbox with indeterminate state
- inbox-row.tsx: row click = toggle select, ExternalLink icon = open detail modal
- inbox-empty-state.tsx: two variants (empty inbox + no search results)
- assign-dialog.tsx: member picker with lead counts, single-select, sonner toast
- listUnassignedLeads() + bulkAssignLeads() (Prisma $transaction) in service layer
- bulkAssignSchema in leads.schema.ts
- GET /api/inbox, GET /api/inbox/count, POST /api/leads/assign — all Zod + auth
- Sidebar badge: 30s polling, hidden at 0, "99+" cap, bg-neutral-900
- Lead detail modal reused from Sprint 2 — no duplication
- Zero TypeScript errors confirmed

### 🔲 Sprint 4 — Reminders Page (next — prompt already written, paste to agent)
Dedicated /reminders page, clock badge on pipeline rows, in-app notification bell.



### ✅ Sprint 5 — Auth & Role Separation
JWT auth with HTTP-only cookies. Full RBAC enforced at middleware, API, and UI.
Features shipped:
- /login page with inline error handling, bcrypt validation, JWT cookie
- POST /api/auth/login + POST /api/auth/logout
- middleware.ts: all app routes protected, admin-only routes block members
- sidebar-admin.tsx + sidebar-member.tsx: role-conditional navigation
- AppHeader: user avatar, role badge, sign-out popover
- listLeads() scoped by role — member sees own leads only
- /leads: "My Leads" + "Team View" tabs for members
- GET /api/leads?view=team: all assigned leads, member-accessible, read-only
- Seed: admin@simplecrm.com / admin1234 + member@simplecrm.com / member1234
- Zero TypeScript errors confirmed

### ✅ Sprint 6 — Capture Form (95% lead form builder)
Public /form/[slug] page and branding system. Features shipped:
- Premium Purple Design System adopted for all public-facing surfaces
- High-fidelity Public Form: project logo integration, purple focus states, custom dropdowns
- Form Success State: consistent purple branding and typography
- Page Wrapper: radial background grid + high-contrast utility layout
- Trust Building: "Secure Data Encryption" interactive green badge with pulsing status indicator
- Form Settings: standardized "Edit Form" dialog with purple header and high-fidelity inputs
- Status Management: Premium 'UIVerse' toggle switch design with checkmark/cross icons and spring animations
- UI Refinement: Resolved transparency issues in all administrative dialogs and dropdown menus
- Visual Precision: Standardized icon alignment and increased menu widths for better readability
- API Stability: Fixed SSR crash in embed dialog and strengthened update validation
- Zero TypeScript errors confirmed

### 🔲 Sprint 4 — Reminders Page
Dedicated /reminders page, clock badge on pipeline rows, in-app notification bell.

### 🔲 Sprint 7 — Team Management
Member list, invite, deactivate, reassign on deactivation.

### 🔲 Sprint 8 — Analytics
Funnel chart, per-member stats, source breakdown, CSV export.

### 🔲 Sprint 9 — Production
GitHub push, Coolify config, env vars, first production deploy.


---

## 15. Refactor Backlog

Files that exceed the 200-line rule and need splitting in a future cleanup sprint.
Do not touch mid-sprint — schedule between sprints only.

| File | Lines | Suggested split |
|---|---|---|
| `pipeline/table-container.tsx` | 281 | → `table-header.tsx` + `table-body.tsx` |
| `pipeline/rows/lead-row.tsx` | 244 | → `lead-row.tsx` + `lead-row-cells.tsx` |

---

*Last updated: 2026-05-13 — Sprint 6 (Capture Form UI) 100% complete. Version: 95% lead form builder.*
