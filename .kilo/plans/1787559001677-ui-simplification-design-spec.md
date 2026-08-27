# PFMS UI Simplification & Professionalization — Technical Specification

## 1. Objective

Simplify and professionalize the PFMS frontend (`client/`, Next.js 15 App Router + Tailwind CSS v4 + shadcn/ui) while:

- Maintaining brand consistency via a single color system derived from the existing primary brand color **#22577A** (currently `--color-primary`).
- Providing **full light and dark mode** support across every surface (landing, auth, user app, admin).
- Removing competing component libraries, orphaned prototypes, and dead styling code.

### Decisions locked with the user

| Decision | Choice |
|---|---|
| Brand color treatment | **Restrained** — neutral surfaces, primary reserved for CTAs/links/active states/brand moments |
| Cleanup scope | **Full cleanup** — remove antd + flowbite, delete orphaned/prototype files and legacy hooks |
| Typography | **Geist via `next/font`** (already a dependency), remove the Times New Roman `font-display` fallback |
| User app shell | **Sidebar layout** (reuse existing shadcn `components/ui/sidebar.tsx`), replace the primary-tinted top navbar |

### Defaults applied (reversible, flagged in task list)

- `ThemeProvider` `defaultTheme` changes from `"light"` to `"system"` (respect OS, manual toggle still available).
- Restore base font size to a fixed `16px` (remove the responsive 17/18/19px scaling) for consistency with shadcn defaults. Keep the `--fs-*` scale variables.
- Fold the `enhanced-card` CSS utility into standard shadcn `Card` usage (`bg-card border-border shadow-sm`) and delete the utility class.
- Replace `react-scroll` smooth-scroll links in the landing navbar with native `scroll-behavior: smooth` anchors (optional; can be kept).
- Unify all toast usage on **sonner** (already mounted in `app/layout.tsx`); remove `react-toastify`.

---

## 2. Current State Analysis (findings)

### 2.1 Brand/color chaos — the core problem

Three incompatible color systems coexist:

1. **Design tokens** in `app/globals.css` — `--color-primary` (#22577A light / luminous blue `204 86% 60%` dark) plus shadcn tokens. Used correctly by the newer user-area components.
2. **Legacy brand hex `#00ABCD`** (cyan) — scattered across **~17 files** (auth forms, admin components, Loader, Breadcrumb, DropdownUsers, Settings, ChangePassword, ContactInfo, Dashboard, etc.). This is a *different* brand color and the biggest inconsistency.
3. **TailAdmin palette** — `bg-boxdark`, `dark:bg-meta-4`, `border-stroke`, `bg-gray-2`, `text-bodydark1`, `bg-white/black` etc. in the admin area. The `app/css/style.css` that used to define them is now **empty**, so these classes are **undefined** in Tailwind v4 → admin theming (incl. dark mode) is broken.
4. **Prototype `lib/design-system/`** uses a **teal** `#14b8a6` primary that matches nothing.

Additional defects found:

- `components/ui/button.tsx` variants reference `bg-danger-500`, `bg-success-500`, `bg-warning-500`, `bg-info-500` — **no such tokens exist**, so those variants render with no background (broken).
- `app/components/admin components/Charts/ChartThree.tsx` uses `hsl(var(--chart-1))` — missing `--color-` prefix, resolves to nothing.
- `font-display` falls back to **Times New Roman**; `--font-satoshi`/`--font-inter` variables are never set; Satoshi font-face CSS is commented out (missing font files).
- Hardcoded grays (`#6C7278`, `#37a5bb`, `#2dc6e5`, `#857E7E`, `#E5E5E5`, `#1ed9fe`), `text-gray-*`/`text-slate-*`, and `bg-white`/`bg-black` break dark mode in auth pages, Navbar, DropdownUsers, admin.
- `app/common/Loader/index.tsx` has a typo class `bg-hite` and `border-[#00ABCD]`.
- Chart component `components/ui/chart.tsx` already ships light/dark THEMES and works.
- Newer user components (UserDashboard, Report, TransactionList, ManageAccount, Budget, Models) are already token-based and dark-mode-safe — these are the reference pattern to propagate.

### 2.2 Component libraries

- **shadcn/ui (Radix)** dominates: 33 `@radix-ui/*` packages + ~50 `components/ui/*` files. Used by landing, all user pages, admin dashboard, AI chat.
- **antd**: 8 files (`terma&privacy.tsx` [orphaned], `TableThree.tsx`, `Settings.tsx`, `transactionStore.tsx`, `accountStore.tsx`, `budgetStore.tsx`, `ChangePassword.tsx`, `admin/users/page.tsx`).
- **flowbite**: installed, **zero real usage**.
- Parallel button/input systems: `.btn-primary/.btn-secondary/.btn-accent/.btn-destructive/.btn-outline` CSS classes + `EnhancedButton/EnhancedInput` wrappers in `app/components/ui/design-system.tsx` (used by LoginForm/SignUpForm), alongside shadcn `Button`/`Input`.

### 2.3 Toast duplication

- `react-toastify`: ~18 files (LoginForm, ForgotPasswordForm, ChangePassword, stores, Settings, Profile, DropdownUsers, admin sidebar/header/dashboard/settings/profile, UserDashboard, Model, UserNavbar, layouts).
- `sonner`: 4 files (SetBudget, AddAccount, AddTransactions, SignUpForm) + root layout `<Toaster />`.

### 2.4 Theme mechanisms

- **next-themes** (`ThemeProvider`, `attribute="class"`) — the live mechanism via `ThemeToggle` (landing navbar, UserNavbar, admin Header). Root layout sets `defaultTheme="light"`.
- **Legacy `app/hooks/useColorMode.tsx` + `useLocalStorage.tsx`** — only used by the unused `Header/DarkModeSwitcher.tsx`. Dead.

### 2.5 Routes / shells

| Surface | Shell | Current nav |
|---|---|---|
| Landing `/` | `app/layout.tsx` | `Navbar.tsx` (primary-tinted, react-scroll) + Footer |
| Auth `/pages/{login,signup,forgotpassword,setnewpassword}`, `/pages/about` | none (page-level `bg-gray-100`/`bg-[#E5E5E5]`) | — |
| User `/pages/user/**` | `app/pages/user/layout.tsx` | `UserNavbar.tsx` (primary-tinted top bar w/ dropdowns) + Footer + floating AI chat |
| Admin `/pages/admin/**` | `app/pages/admin/layout.tsx` (empty css import + Loader) + per-page `DefaultLayout` | black sidebar + Header |

Prototype routes to remove: `/design-system`, `/test-styles`.

---

## 3. Proposed Design Changes

### 3.1 Design language (restrained professional)

- **Surfaces**: page background = light blue-gray (`--color-background-secondary`); cards = `--color-card` (white light / elevated navy dark); borders = subtle blue-tinted `--color-border`.
- **Primary usage**: CTAs, links, active nav states, focus rings, brand logo/hero accents, chart series 1. Not used as full-width nav/section backgrounds.
- **Nav/header**: neutral translucent (`backdrop-blur` + `bg-background/80`) with `border-border`, not solid primary.
- **Semantic colors**: income green, expense red, savings cyan, investment purple, budget amber, destructive/warning/info/success — consistent light & dark variants.
- **Consistency**: single token system, single component set, no hardcoded hex anywhere except the brand anchor comment.

### 3.2 User app shell (sidebar)

Replace `UserNavbar` + marketing `Footer` in `app/pages/user/layout.tsx` with a shadcn **Sidebar** layout:

- `Sidebar` (desktop): Dashboard / Transactions (List, Add) / Budgets (Manage, Set) / Accounts (Manage, Add) / Reports / Profile / Settings; primary-tinted active item; logo top, theme toggle + logout bottom.
- `SidebarInset` + slim **top bar**: mobile sheet trigger, page title/breadcrumb, theme toggle, `DropdownUser` (right).
- Content area on `bg-background-secondary`; keep the floating AI chat button + `ChatWindow`; replace `ToastContainer` with sonner.
- Delete `UserNavbar.tsx` (or keep file unused — prefer delete), move the mobile `Sheet` menu into the sidebar.

### 3.3 Landing + auth

- `Navbar.tsx`: neutral translucent surface, primary links/CTAs, dark-mode-safe text (`text-foreground`/`text-muted-foreground`, `hover:bg-accent`).
- `Hero/Content/Services/Testimonial/Footer`: replace hardcoded grays and `#00ABCD`; `Footer` `btn-primary` → shadcn `Button`.
- Auth pages & forms: `bg-background-secondary` page shells; `text-[#22577A]` → `text-primary`, `text-[#6C7278]` → `text-muted-foreground`, `text-[#00ABCD]`/`#37a5bb` → `text-primary`; replace `EnhancedInput/EnhancedButton` with shadcn `Input`/`Button` and delete `app/components/ui/design-system.tsx`.
- Drop the sign-up confetti (`react-confetti`) for a professional feel.

### 3.4 Admin

- Sidebar: `bg-black` → `bg-card text-card-foreground border-r border-border`; replace `react-icons/hi` with `lucide-react`; active item = `bg-primary/10 text-primary`.
- Header: replace TailAdmin custom hamburger with shadcn `Sheet`/`Button`; `bg-white dark:bg-boxdark` → `bg-background/80 backdrop-blur border-b border-border`.
- Tables/CardDataStats/AdminDashboard/Settings/Profile/Users: swap TailAdmin undefined classes for tokens; fix `ChartThree` `--chart-1` → `--color-chart-1`.
- Remove the empty `app/css/style.css` import in `app/pages/admin/layout.tsx`; drop the artificial 1s `Loader`.

### 3.5 Component standardization

- `components/ui/button.tsx`: fix `destructive/success/warning/info` variants to use existing `--color-destructive/success/warning/info` tokens (and their foregrounds).
- Delete `.btn-*`, `enhanced-card`, `financial-card`, `income-card`, `expense-card`, custom `.text-*`/`.bg-*` fallback utilities in `globals.css`; migrate usages to Tailwind utilities that Tailwind v4 resolves from the CSS variables (verify each usage; `text-primary`, `bg-primary`, `text-muted`, `bg-background` etc. already exist as generated utilities).
- Keep `.bg-grid-pattern`, `input-enhanced`, `navbar-bg` helpers only if still needed post-restyle (prefer removal).
- Keep shadcn `Card`, `Table`, `Dialog`, `AlertDialog`, `Select`, `Pagination`, `Form`, `Input` as the single vocabulary.

---

## 4. Color System (derived from #22577A)

Brand anchor: `#22577A` → HSL **`203.86° 56.43% 30.59%`** (rounded: hue 204, sat 56, light 31).

### 4.1 Primary scale (light mode)

Hue 204, saturation 55–62%.

| Token | Value |
|---|---|
| `--color-primary-50` | `204 70% 96%` |
| `--color-primary-100` | `204 65% 91%` |
| `--color-primary-200` | `204 60% 82%` |
| `--color-primary-300` | `204 55% 70%` |
| `--color-primary-400` | `204 50% 54%` |
| `--color-primary-500` | `204 48% 42%` |
| `--color-primary-600` | `204 56% 31%` ← **#22577A** |
| `--color-primary-700` | `205 58% 25%` |
| `--color-primary-800` | `206 60% 19%` |
| `--color-primary-900` | `207 62% 14%` |
| `--color-primary-950` | `208 64% 9%` |

`--color-primary` (DEFAULT) = `204 56% 31%`. `--color-primary-foreground` = `0 0% 100%`. `--color-ring` = primary DEFAULT.

### 4.2 Dark-mode primary

Luminous accent for dark surfaces (retains current effective value):

- `--color-primary`: `204 86% 60%`
- `--color-primary-foreground`: `0 0% 100%`
- `--color-ring`: `204 86% 60%`

### 4.3 Neutrals (blue-tinted cool grays)

**Light**

| Token | Value |
|---|---|
| `--color-background` | `0 0% 100%` |
| `--color-background-secondary` | `210 35% 97%` |
| `--color-foreground` | `215 28% 15%` |
| `--color-card` / `--color-popover` | `0 0% 100%` |
| `--color-card-foreground` / `--color-popover-foreground` | `215 28% 15%` |
| `--color-secondary` / `--color-muted` | `210 30% 96%` |
| `--color-secondary-foreground` | `215 28% 20%` |
| `--color-muted-foreground` | `215 20% 45%` |
| `--color-accent` | `204 40% 95%` |
| `--color-accent-foreground` | `204 60% 22%` |
| `--color-border` | `214 25% 90%` |
| `--color-input` | `214 25% 88%` |

**Dark**

| Token | Value |
|---|---|
| `--color-background` | `215 45% 5%` |
| `--color-background-secondary` | `215 40% 7%` |
| `--color-foreground` | `210 40% 98%` |
| `--color-card` / `--color-popover` | `214 40% 8%` |
| `--color-card-foreground` / `--color-popover-foreground` | `210 40% 98%` |
| `--color-secondary` / `--color-muted` | `214 30% 16%` |
| `--color-secondary-foreground` | `210 40% 98%` |
| `--color-muted-foreground` | `215 20% 62%` |
| `--color-accent` | `204 35% 16%` |
| `--color-accent-foreground` | `204 60% 85%` |
| `--color-border` | `214 30% 16%` |
| `--color-input` | `214 30% 18%` |

### 4.4 Semantic / financial (unchanged values, kept in both modes)

| Token | Light | Dark |
|---|---|---|
| `--color-success` | `142 76% 36%` | `142 76% 45%` |
| `--color-warning` | `48 96% 53%` | `48 96% 60%` |
| `--color-destructive` | `0 84% 60%` | `0 72% 56%` |
| `--color-info` | `217 91% 60%` | `217 91% 65%` |
| `--color-income` | `142 76% 36%` | `142 76% 45%` |
| `--color-expense` | `0 84% 60%` | `0 84% 65%` |
| `--color-savings` | `188 100% 40%` | `188 100% 45%` |
| `--color-investment` | `262 83% 58%` | `262 83% 65%` |
| `--color-budget` | `48 96% 53%` | `48 96% 60%` |

Foregrounds: white for income/expense/savings/investment/success/destructive/info; near-black for warning/budget.

### 4.5 Chart colors

`--color-chart-1` = primary (204 56% 31% light / 204 86% 60% dark); `chart-2` = investment; `chart-3` = savings; `chart-4` = success; `chart-5` = destructive (per mode). Matches existing `components/ui/chart.tsx` theme contract.

### 4.6 Implementation notes

- Keep the `RGB` `--background`/`--foreground` pair (used by `body`) but set them equal to the HSL tokens' equivalent RGB to avoid a second source of truth; or migrate `body` to `hsl(var(--color-background))`.
- Keep `--radius: 0.5rem`; keep `--fs-*`/`--leading-base` but simplify to a fixed 16px base (`html { font-size: 16px }`, drop the media-query scaling).
- The `tailwind.config.ts` already maps colors to CSS vars — keep it as-is, only ensure every token referenced by components exists in `globals.css`. Do **not** add shade scales (`-500` etc.) for semantic colors; instead fix the two components that wrongly reference them.

---

## 5. Typography

- Add `GeistSans` from `geist/font/sans` in `app/layout.tsx` (`next/font`); set `--font-geist-sans`; map `font-sans` in `tailwind.config.ts` (and keep `--font-inter` mapping removed or aliased).
- `font-display`: use Geist with heavier weight + tighter tracking (e.g., `font-weight: 700; letter-spacing: -0.02em`) for h1–h3; remove the Times New Roman rules and the `.font-display` serif fallback.
- Remove `--font-satoshi` references and the commented Satoshi CSS.
- Base size: `html { font-size: 16px }` (fixed), keep the `--fs-*` variable scale for component-level size tokens.

---

## 6. Theme Architecture

- Single mechanism: **next-themes** (`attribute="class"`, `suppressHydrationWarning` already set in layout).
- Change `defaultTheme` to `"system"`, keep `enableSystem`, keep `disableTransitionOnChange`.
- Delete `app/hooks/useColorMode.tsx`, `app/hooks/useLocalStorage.tsx`, `Header/DarkModeSwitcher.tsx`.
- Ensure `ThemeToggle` appears on: landing navbar, user sidebar/top bar, admin header.
- Every surface must be visually verified in both modes (see Validation).

---

## 7. Component Library & Toast Consolidation

### 7.1 antd removal mapping

| File | antd usage | Replacement |
|---|---|---|
| `app/common/terma&privacy.tsx` | Button, Modal | **Delete** (orphaned) |
| `admin components/Tables/TableThree.tsx` | Form, message, Modal, Pagination, Select | shadcn `Dialog`, `Select`, `Pagination`, sonner `toast` |
| `user components/Settings/Settings.tsx` | Button | shadcn `Button` |
| `app/pages/store/{transaction,account,budget}Store.tsx` | message, Modal.confirm | sonner `toast` + shadcn `AlertDialog` in the owning list components |
| `app/components/ChangePassword.tsx` | Modal, Form, Input, Button | shadcn `Dialog`, `Input`, `Button` (keep behavior) |
| `app/pages/admin/users/page.tsx` | Select | shadcn `Select` |

### 7.2 Dependency removals (`client/package.json`)

Remove: `antd`, `flowbite`, `react-toastify`, `react-confetti`, `react-icons-kit` (replace with `lucide-react` in admin SignInForm). Optionally `react-scroll` (native anchors). Keep all `@radix-ui/*`, shadcn stack, `sonner`, `framer-motion`, `next-themes`, `geist`.

### 7.3 Toast unification (react-toastify → sonner)

- Replace `import { toast } from "react-toastify"` with `import { toast } from "sonner"` in ~18 files (API is compatible for `toast.success/error/info/warning`).
- Remove `ToastContainer` elements and `import "react-toastify/dist/ReactToastify.css"` from all files and from `app/layout.tsx`.
- Keep the root-layout sonner `<Toaster />` (optionally swap to `components/ui/sonner.tsx` for themed toasts).

---

## 8. Cleanup / Deletions (full)

Delete (after verifying no remaining imports):

1. `lib/design-system/` (8 files) + `components/design-system/DesignSystemShowcase.tsx`
2. `app/design-system/page.tsx` and `app/test-styles/page.tsx` (routes removed)
3. `app/styles/style.css`, `app/css/style.css` (empty), `app/css/satoshi.css`
4. `app/common/terma&privacy.tsx`
5. `app/components/GoogleButton.tsx`
6. `app/components/SetNewPasswordForm.tsx` (keep the `setnewpassword` page as a minimal placeholder or remove page if confirmed unused)
7. `app/components/admin components/Header/DarkModeSwitcher.tsx`
8. `components/ai/*` orphaned chat (keep `app/components/ai/*` — the active chat; jest tests import this one)
9. `app/hooks/useColorMode.tsx`, `app/hooks/useLocalStorage.tsx`
10. `components/ui/use-toast.ts`, `components/ui/toast.tsx`, `components/ui/toaster.tsx`, `components/ui/sonner.tsx` (verify unreferenced — root layout imports `Toaster` from `sonner` directly)
11. `app/components/ui/design-system.tsx` (Enhanced* wrappers) after migrating LoginForm/SignUpForm
12. Dead utility CSS in `globals.css` (`.btn-*`, `enhanced-card`, `financial-card`, `income-card`, `expense-card`, redundant `.text-*`/`.bg-*` fallbacks)

---

## 9. File-by-File Change Inventory (phased tasks)

### Phase 0 — Foundation (tokens, buttons, fonts, theme)

- [ ] Rewrite `app/globals.css` token blocks per Section 4; remove dead utility classes; fix `body`/`html` sizing; remove Times New Roman rules.
- [ ] Fix `components/ui/button.tsx` variants (`danger-500` etc. → `destructive`/`success`/`warning`/`info` tokens).
- [ ] Add Geist via `next/font` in `app/layout.tsx`; update `tailwind.config.ts` fontFamily.
- [ ] `app/layout.tsx`: `defaultTheme="system"`, drop react-toastify CSS import.
- [ ] Fix `app/common/Loader/index.tsx` (`border-primary`, remove `bg-hite`).
- [ ] Fix `admin components/Charts/ChartThree.tsx` (`--chart-1` → `--color-chart-1`).

### Phase 1 — Cleanup & deps

- [ ] Apply deletions from Section 8; remove deps from `package.json`; `pnpm install`.
- [ ] `pnpm build` checkpoint — fix any dangling imports surfaced.

### Phase 2 — User area shell & token pass

- [ ] Rebuild `app/pages/user/layout.tsx` with shadcn `Sidebar` shell (+ slim top bar, sonner toaster, keep AI chat button).
- [ ] New sidebar nav component (reuse nav data from `UserNavbar`); add active-item styling; theme toggle + logout.
- [ ] Delete `UserNavbar.tsx`; remove Footer from user shell (or minimal one-line footer).
- [ ] Token pass: `UserDashboard`, `Report/Report.tsx`, `Transaction/{AddTransactions,TransactionList}`, `Budget/*`, `Account/*`, `Model.tsx`, `Profile.tsx`, `Settings/Settings.tsx`, `DropdownUser.tsx`, `ContactInfo.tsx`, `Dashboard/DashboardCard.tsx`, `common/Breadcrumbs/Breadcrumb.tsx` — replace `#00ABCD`, `#22577A`, `text-green-600/red-600` (→ `text-income`/`text-expense`), TailAdmin classes, `bg-white` etc.
- [ ] Split oversized components if >600 lines per repo rule (Report.tsx 488 — split chart cards).

### Phase 3 — Landing & auth

- [ ] Restyle `Navbar.tsx` (neutral translucent + primary accents, dark-safe text).
- [ ] Token pass `Hero`, `Content`, `Services`, `Testimonial`, `Footer` (btn-primary → shadcn Button).
- [ ] Auth page shells → `bg-background-secondary`; token pass `LoginForm`, `SignUpForm`, `ForgotPasswordForm`, `ChangePassword`, `admin components/Auth/signin/SignInForm` (lucide icons, remove `#00ABCD` etc.); migrate `EnhancedInput/EnhancedButton`.
- [ ] Remove confetti from `SignUpForm`.

### Phase 4 — Admin

- [ ] Sidebar → neutral token sidebar (lucide icons).
- [ ] Header → tokenized, shadcn Sheet hamburger; drop empty css import + Loader delay in `app/pages/admin/layout.tsx`.
- [ ] Token pass `DefaultLayout`, `CardDataStats`, `Dashboard/AdminDashboard`, `Tables/{TableOne,TableTwo,TableThree}`, `Header/DropdownUser`.
- [ ] Admin pages: `dashboard`, `profile`, `settings`, `users` — token pass + antd `Select` → shadcn.

### Phase 5 — Toast & antd removal

- [ ] Migrate all `react-toastify` usages to sonner; remove `ToastContainer`s; remove dep.
- [ ] Replace antd in `TableThree`, `ChangePassword`, stores (AlertDialog + sonner), `Settings`, `admin/users`.
- [ ] Remove `antd`, `flowbite`, `react-confetti`, `react-icons-kit` deps.

### Phase 6 — Validation

- [ ] `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm test:e2e` (update Playwright chat selectors if layout change breaks `.fixed.bottom-4.right-4` — keep the AI chat button's position/aria label stable).
- [ ] Manual light/dark + responsive pass (see Validation plan).

---

## 10. Validation Plan

**Automated**
- `cd client && pnpm lint` (next lint) — no new errors.
- `cd client && pnpm build` (next build) — type-checks all imports; catches dangling imports after deps/cleanup.
- `cd client && pnpm test` (jest) — existing suite targets `app/components/ai/*` chat components; must stay green. If `ChatWindow` aria/class attributes change, update tests.
- `cd client && pnpm test:e2e` (playwright) — `e2e/ai-chat.spec.ts` depends on the floating chat button; keep it mounted with same position/labels or update the spec.

**Manual**
- Toggle light/dark on: landing, login/signup/forgot, user dashboard, transactions list/add, budgets, accounts, reports, profile, settings, AI chat, admin dashboard/profile/settings/users.
- Verify: contrast of primary on primary-foreground, muted text legibility, focus rings, active sidebar/nav states, charts render with correct series colors in both modes, no console errors, no leftover `#00ABCD`/`bg-boxdark`/undefined-class styling (`rg '00ABCD|boxdark|meta-4|gray-2|bodydark|danger-500|success-500|warning-500|info-500' client/` should return no matches except the brand comment).
- Responsive: 375px mobile (sidebar sheet), tablet, desktop.

---

## 11. Risks & Notes

- **Behavior preserved, not changed**: the redesign is visual/theming only. No API calls, routes, forms, validation logic, or store logic change (except swap of confirmation dialogs from antd `Modal.confirm` to shadcn `AlertDialog`/sonner).
- **Tailwind v4 + JS config**: keep `tailwind.config.ts`; do not migrate to CSS-first `@theme` in this effort (out of scope, higher risk).
- **`#00ABCD` removal**: verify with `rg` that only the brand anchor comment in `globals.css` mentions `22577A` and nothing references `00ABCD` after Phase 5.
- **Store dialogs**: `transaction/account/budgetStore` antd `Modal.confirm` are invoked from list components; wire the `AlertDialog` there so delete-confirm flows remain functional.
- **Playwright**: e2e chat spec already uses fragile `.or()` locators; keep chat button stable or update spec in Phase 6.
- **`app/pages/store` naming**: plain dir, not Next.js `pages/` routing — no conflict.
- **Known pre-existing bugs fixed as part of this work**: undefined `-500` button variants, broken `ChartThree` chart color, empty admin css import, `bg-hite` typo, broken Satoshi/Times fonts, unthemed admin dark mode.

---

## 12. Out of Scope

- Backend/server changes (NestJS untouched).
- Data model / API changes.
- New features (no new functionality; only visual/theming and dead-code removal).
- CSS-first `@theme` migration of Tailwind config.
