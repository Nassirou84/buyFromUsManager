# FAdmin: project guide for coding agents

FAdmin is the admin dashboard for the BuyFromUs dropshipping store. Admins use it to manage the product catalog (scraped from Amazon, eBay and similar), pricing and markup, categories, and what is listed on the storefront.

## Backend

The backend lives in **`~/Desktop/buyFromUs`** (`/Users/nassirou/Desktop/buyFromUs`), a separate repo. It is a Symfony / PHP API (controllers in `src/Controller`, entities in `src/Entity`, Docker Compose, PHPUnit, PHPStan).

- Before adding or changing an API call here, read the matching controller in the backend (for example `src/Controller/ProductController.php`) to confirm the route, HTTP method, payload and response shape.
- Backend changes are made in that repo, not this one. If a frontend task needs a new or changed endpoint, say so and make the change there only when asked.
- The frontend reaches it through `NEXT_PUBLIC_HOST_API` (see `src/config-global.ts`). Never print or commit `.env` / `.env.local` values.

## Stack

- Next.js 16 (App Router, Turbopack dev), React 19, TypeScript (strict), path alias `@/*` → `src/*`
- Tailwind CSS 3, Radix UI primitives (shadcn-style, `components.json`), `lucide-react` icons, `motion`
- TanStack Query v5 for server state, `react-hook-form` for forms
- `i18next` / `react-i18next` for translations (English and French)
- `sonner` for toasts, `axios` for HTTP
- Vitest + Testing Library (jsdom)
- Package manager: pnpm (`pnpm-lock.yaml`)

## Commands

```bash
pnpm dev          # next dev --turbopack
pnpm build
pnpm lint
pnpm test         # vitest run
npx tsc --noEmit -p .   # type check (no script for it)
```

## Layout

```
src/
  app/              App Router routes (auth/, dashboard/, layout, loading, not-found)
  api/              One file per request, grouped by domain: product/, categories/, user/
  auth/             auth context, guard, hooks
  layouts/          auth/ and dashboard/ (Header, Sidebar, layout)
  sections/
    auth/           login and password views
    dashbord/       the dashboard feature (note the spelling "dashbord")
      aside/        catalog view, table, grid, filter bar, bulk actions bar, summary cards
      modals/       add-product/, edit-product/, categories/, price and markup modals
      types/ data/  feature types and mock data
  components/       shared UI (ui/ = shadcn primitives, lucide-icon wrapper)
  locales/          i18n config and langs/en.json, langs/fr.json
  types/            shared types, e.g. product.d.ts
  utils/axios.ts    configured axios instance, `fetcher`, `endpoints`
  provider/         React Query provider
middleware.ts       route protection
```

## Conventions

### API layer (`src/api/<domain>/`)
- Import the shared instance: `import axios from "@/utils/axios"`. Its response interceptor rejects with `error.response.data`.
- Each file exports the plain request function (default and/or named) and a `use…` hook built on `useMutation` / `useQuery`. Keep both, because some callers use the raw function.
- Query keys: products use `['GET_ALL_PRODUCTS', page, filters]`, the summary uses the exported `GET_SUMMARY_QUERY_KEY`. Reuse these constants and don't invent new strings for the same data.

### Mutations in the catalog (`sections/dashbord/aside/CatalogView.tsx`)
The bulk actions (relist, delist, apply markup) and the price update all follow the same pattern:
1. Call the mutation with `mutate(vars, { onSuccess, onError })`.
2. On success, update the cached listing with `queryClient.setQueriesData({ queryKey: ['GET_ALL_PRODUCTS'] }, …)` so the UI changes immediately, then `invalidateQueries` for `GET_ALL_PRODUCTS` and `GET_SUMMARY_QUERY_KEY` so the server data wins.
3. Clear the selection, close any modal, and show `toast.success(t('…'))`.
4. On error, show `toast.error(t('…'))` and keep the selection and modal open so the user can retry.

Backend routes behind these actions: `/product/bulk-mark-as-available`, `/product/bulk-mark-as-unavailable`, `/product/bulk-apply-margin`, `/product/change-price`.

### i18n
- Never hardcode user-visible text. Use `const { t } = useLocales()` from `@/locales/use-locales`.
- Every new key goes in **both** `src/locales/langs/en.json` and `fr.json`, and both files must stay valid JSON.
- Wording: the UI says **"markup"**, not "margin". In French use **"majoration"**, not "marge". Existing keys and identifiers still contain `margin` (`apply_margin`, `ApplyMarginModal`, `useBulkApplyMargin`, the `/bulk-apply-margin` endpoint). That is deliberate, so don't rename them unless asked.

### UI
- Toasts come from `sonner` (`toast.success` / `toast.error`).
- Match the surrounding Tailwind patterns, including dark-mode classes (`dark:`), when adding UI.
- Products are identified by `uid` (fall back to `String(id)`). `isAvailable === false` means delisted.

## Working rules

- Match the style of the surrounding code (comment density, naming, formatting). Don't reformat unrelated code.
- After changes, run `npx tsc --noEmit -p .` and fix errors in the files you touched. The tree already has uncommitted work, so don't revert changes you didn't make.
- Don't commit, push or open PRs unless asked. Work happens on the `dev` branch; `main` is the main branch.
- Don't touch `.env*` files or lockfiles unless the task requires it.
