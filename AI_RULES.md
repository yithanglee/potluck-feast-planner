# AI Rules

## Tech Stack
- **React** + **TypeScript** — UI framework and type safety
- **React Router** — client-side routing (routes live in `src/App.tsx`)
- **shadcn/ui** — prebuilt UI components (do not edit them)
- **Tailwind CSS** — all styling (layout, spacing, colors, design)
- **Radix UI** — unstyled, accessible primitive components used by shadcn/ui
- **lucide-react** — icons
- **React Hook Form** + **Zod** — form handling and validation
- **TanStack Query** — data fetching, caching, and state
- **Express.js** + **tsx** — server-side API routes (in `server/`)
- **Neon** — serverless PostgreSQL (if a database is needed)

## Library Usage Rules

### UI & Styling
- Always use shadcn/ui components (imported from `src/components/ui/`) for UI elements. Do not edit these files — create new custom components if you need to extend them.
- Use Tailwind CSS classes extensively for layout, spacing, colors, and all other design aspects.
- Use Radix UI primitives through shadcn/ui only; never drop to raw Radix for things shadcn already provides.
- Use lucide-react for all icons — no other icon library.
- Avoid custom CSS files; style exclusively with Tailwind.

### Forms & Validation
- Use React Hook Form for all form handling.
- Use Zod for schema-based validation.
- Validate at system boundaries (user input, external APIs) — both client-side and server-side.

### Routing & Structure
- Use React Router; keep route definitions in `src/App.tsx`.
- Put pages in `src/pages/` and components in `src/components/`.
- The main/default page is `src/pages/Index.tsx` — always update it to render new components.
- Keep all source code under `src/`.

### Data Fetching & State
- Use TanStack Query for server state (fetching, caching, loading/error handling).
- Use React state (`useState`/`useReducer`/`useContext`) only for local/client-only UI state.
- Do not add extra global state libraries unless there is a demonstrated need.

### Server Layer
- When you need server-side code (API routes, webhooks, secrets, database clients), enable the Nitro server layer first.
- For database-backed features, set up a database provider (Supabase or Neon) via the integration flow before writing server code. Neon automatically provisions the Nitro layer; do not call `enable_nitro` again after a Neon integration.
- Put server code in `server/`.

### TypeScript & Quality
- Write all code in TypeScript (strict mode).
- Type all components, props, and function signatures.
- Follow ESLint and Prettier rules.

### Accessibility
- Rely on shadcn/ui and Radix UI for built-in accessibility.
- Ensure keyboard navigation and ARIA labels are preserved when customizing components.

### Performance & Security
- Use code splitting/lazy loading for heavy routes and components.
- Sanitize and validate all inputs; never trust client data.
- Store secrets (API keys, database URLs) in environment variables; never commit them.

## Where to Create New Files
| Type | Location |
|---|---|
| Page | `src/pages/<Name>.tsx` |
| UI component | `src/components/ui/<Name>.tsx` (shadcn) |
| Custom component | `src/components/<Name>.tsx` |
| API route | `server/routes/<name>.ts` |
| Utility/helper | `src/utils/<name>.ts` |
| Custom hook | `src/hooks/<name>.ts` |
| Types | `src/types/<name>.ts` |
