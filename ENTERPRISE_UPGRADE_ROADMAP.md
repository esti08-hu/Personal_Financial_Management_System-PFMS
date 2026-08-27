
# PFMS Enterprise Upgrade Roadmap

> Transforming from a simple CRUD application to a production-ready, enterprise-level fintech startup.

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Critical Issues & Solutions](#critical-issues--solutions)
3. [Architecture Improvements](#architecture-improvements)
4. [New Features Roadmap](#new-features-roadmap)
5. [Security Hardening](#security-hardening)
6. [DevOps & Infrastructure](#devops--infrastructure)
7. [Performance & Scalability](#performance--scalability)
8. [Monetization & Business Features](#monetization--business-features)
9. [Implementation Priority](#implementation-priority)

## Current State Analysis

### Tech Stack
- **Backend**: NestJS 10, Drizzle ORM, PostgreSQL 16, JWT, Passport, ConfigModule + Joi
- **Frontend**: Next.js 15.2.x, Zustand, Radix UI/shadcn, TailwindCSS 4, Ant Design + Flowbite
- **AI**: Google Gemini (`@google/generative-ai`) with AI module, rate-limit tables, and health endpoint
- **Infra**: Docker Compose (dev only), single PostgreSQL instance, no CI workflow in repo yet

### Current Features
- User registration/login (email + Google OAuth)
- Email confirmation & password reset
- Account management (bank, credit cards, cash)
- Transaction CRUD (deposit, withdrawal, transfer)
- Budget planning
- AI financial assistant (Gemini-powered)
- Admin panel with user management
- Role-based access (USER, ADMIN)

### Current Strengths
- Well-structured AI module with orchestration, caching, rate limiting, anomaly detection
- Drizzle ORM with proper relations and indexes
- JWT with refresh token rotation
- Account lockout mechanism on failed logins
- Swagger API documentation
- Input validation with class-validator
- Soft delete pattern for users

## Critical Issues & Solutions

### 1. Security Vulnerabilities

| Issue | Location | Severity | Solution |
|-------|----------|----------|----------|
| Plaintext password stored in `passwordInit` column | `database-schema.ts:36` | **CRITICAL** | Remove `passwordInit` column entirely. Never store plaintext passwords. |
| Hardcoded JWT secret via `process.env` (bypasses ConfigService) | `auth.module.ts:33` | **HIGH** | Use ConfigService consistently: `secret: configService.get('JWT_ACCESS_TOKEN_SECRET')` |
| `@Public()` on sensitive financial/user endpoints | `transaction.controller.ts`, `budget.controller.ts`, `users.controller.ts` | **HIGH** | Remove `@Public()` from any endpoint returning financial or user data; allow only auth + health endpoints. |
| CORS hardcoded to `localhost:3000` | `main.ts:23` | **MEDIUM** | Use ConfigService: `origin: configService.get('CORS_ORIGINS').split(',')` |
| No rate limiting on auth endpoints | `auth.controller.ts` | **HIGH** | Add `@nestjs/throttler` to login/register endpoints to prevent brute force. |
| Balance calculation on client-side | `transactionStore.tsx:87-93` | **HIGH** | Move all balance logic to server-side. Client should never compute financial state. |

### 2. Code Quality Issues

| Issue | Location | Severity | Solution |
|-------|----------|----------|----------|
| Excessive `Promise<any>` return types | `users.service.ts` (throughout) | **MEDIUM** | Define proper return type interfaces for all service methods. |
| Raw SQL mixed with Drizzle query builder | `transaction.service.ts:66-68`, `budget.service.ts:21-24` | **MEDIUM** | Use Drizzle's type-safe insert/update builders consistently. |
| Unused import `createDecipheriv` | `transaction.service.ts:1` | **LOW** | Remove unused import. |
| Package name is `nest002` | `server/package.json:2` | **LOW** | Rename to `@pfms/server`. |
| Typo: `getResentTransactions` | `transaction.service.ts:25` | **LOW** | Rename to `getRecentTransactions`. |
| No return value from `create` controller | `transaction.controller.ts:60-62` | **MEDIUM** | Return the created resource with proper HTTP 201 status. |
| No return value from account create controller | `account.controller.ts:15-17` | **MEDIUM** | Return the created account with proper HTTP 201 status. |
| Duplicate seed files | `database/seed.ts`, `database/seedd.ts` | **LOW** | Consolidate into a single seed script. |

### 3. Architecture Issues

| Issue | Impact | Solution |
|-------|--------|----------|
| No pagination on list endpoints | Memory/performance issues at scale | Implement cursor-based pagination with `limit`, `offset`, and `cursor` params. |
| No filtering/sorting API | Poor UX for data-heavy users | Add query params for date range, type, amount range, search text. |
| No response interceptor | Inconsistent API responses | Create a global `TransformInterceptor` wrapping all responses in `{ data, meta, status }`. |
| No global exception filter | Inconsistent error formats | Create `AllExceptionsFilter` returning `{ error, message, statusCode, timestamp }`. |
| No API versioning | Breaking changes affect all clients | Prefix routes with `/api/v1/` and implement header-based versioning. |
| No health check endpoint | No container orchestration support | Add `@nestjs/terminus` with DB health, memory, and disk indicators. |
| State management fetches userId on every action | Redundant API calls | Store userId in auth state after login; pass from context. |
| Incomplete environment validation | Misconfigurations slip to runtime | Expand Joi schema to cover DB, JWT, email, CORS, and AI config; fail fast on missing values. |

## Architecture Improvements

### 3.1 Backend Architecture (Modular Monolith)

---
```
server/src/
├── common/                    # Shared utilities
│   ├── decorators/            # Custom decorators (@CurrentUser, @Paginate)
│   ├── dto/                   # Shared DTOs (PaginationDto, ApiResponseDto)
│   ├── filters/               # Global exception filters
│   ├── guards/                # Shared guards
│   ├── interceptors/          # Response transform, logging, timeout
│   ├── interfaces/            # Shared interfaces
│   ├── pipes/                 # Custom validation pipes
│   └── utils/                 # Helper functions
├── config/                    # Configuration module
│   ├── app.config.ts          # App config validation schema
│   ├── database.config.ts     # DB config
│   └── auth.config.ts         # Auth config
├── modules/
│   ├── auth/                  # Authentication & Authorization
│   ├── users/                 # User management
│   ├── accounts/              # Financial accounts
│   ├── transactions/          # Transaction processing
│   ├── budgets/               # Budget management
│   ├── analytics/             # NEW: Financial analytics & reports
│   ├── notifications/         # NEW: Push, email, in-app notifications
│   ├── subscriptions/         # NEW: Subscription/billing management
│   ├── goals/                 # NEW: Savings goals
│   ├── recurring/             # NEW: Recurring transactions
│   ├── categories/            # NEW: Transaction categorization
│   ├── export/                # NEW: Data export (CSV, PDF)
│   ├── audit/                 # NEW: Audit trail
│   └── ai/                    # AI assistant (existing)
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema/                # Split schema into per-module files
├── queue/                     # NEW: Bull/BullMQ job processing
│   ├── processors/
│   └── jobs/
└── events/                    # NEW: Event-driven architecture
    ├── handlers/
    └── events/
```
---

### 3.2 Frontend Architecture

---
```
client/
├── app/
│   ├── (auth)/                # Auth route group (login, signup, forgot)
│   ├── (dashboard)/           # Authenticated user dashboard
│   │   ├── accounts/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── goals/             # NEW
│   │   ├── analytics/         # NEW
│   │   ├── settings/
│   │   └── ai-assistant/
│   ├── (admin)/               # Admin panel
│   └── (marketing)/           # NEW: Landing, pricing, about
├── components/
│   ├── ui/                    # Base UI components (shadcn)
│   ├── forms/                 # Form components
│   ├── charts/                # Chart components
│   ├── tables/                # Data table components
│   └── layouts/               # Layout components
├── hooks/
│   ├── use-auth.ts
│   ├── use-pagination.ts      # NEW
│   ├── use-debounce.ts        # NEW
│   └── use-optimistic.ts      # NEW
├── stores/                    # Zustand stores (moved from pages)
├── services/                  # API service layer
│   ├── api-client.ts          # Axios instance with interceptors
│   ├── auth.service.ts
│   ├── transaction.service.ts
│   └── ...
├── types/                     # TypeScript type definitions
└── lib/
    ├── validators/            # Zod schemas
    └── formatters/            # Currency, date formatters
```
---

### 3.3 Event-Driven Architecture

Introduce an event bus for decoupled module communication:

- `TransactionCreatedEvent` → triggers budget check, notification, analytics update
- `BudgetExceededEvent` → triggers notification, AI insight
- `UserRegisteredEvent` → triggers welcome email, default setup
- `GoalAchievedEvent` → triggers celebration notification
- `AnomalyDetectedEvent` → triggers alert notification

### 3.4 Caching Layer (Redis)

Add Redis for:
- Session management
- API response caching (dashboard aggregates)
- Rate limiting (replace in-memory)
- Real-time pub/sub for notifications
- Queue backend (BullMQ)

## New Features Roadmap

### Phase 1: Core Financial Features

#### 4.1 Transaction Categories & Tags
- Predefined categories (Food, Transport, Housing, Entertainment, etc.)
- Custom user categories with color/icon
- Auto-categorization using AI
- Category-based spending insights

#### 4.2 Recurring Transactions
- Schedule recurring income/expenses (salary, subscriptions, bills)
- Frequency: daily, weekly, bi-weekly, monthly, yearly
- Auto-creation via cron jobs (BullMQ)
- Edit/pause/cancel recurring series

#### 4.3 Savings Goals
- Create savings goals with target amount and deadline
- Link to specific accounts
- Progress tracking with visual indicators
- AI-powered suggestions for reaching goals faster
- Milestone celebrations

#### 4.4 Multi-Currency Support
- Support multiple currencies per account
- Real-time exchange rates (via external API)
- Currency conversion in transactions
- Base currency setting per user
- Historical exchange rate tracking

#### 4.5 Financial Reports & Analytics
- Monthly/yearly spending reports
- Category breakdown charts
- Income vs. Expense trends
- Net worth tracking over time
- Cash flow forecasting (AI-powered)
- Export to PDF/CSV

#### 4.6 Smart Notifications
- Budget threshold alerts (50%, 75%, 90%, 100%)
- Unusual spending detection
- Bill payment reminders
- Goal milestone notifications
- Weekly/monthly financial summary emails
- Push notifications (web + mobile)

### Phase 2: Growth & Engagement Features

#### 4.7 Bill Management & Reminders
- Track upcoming bills
- Due date reminders
- Payment status tracking
- Link bills to recurring transactions

#### 4.8 Shared Accounts & Family Finance
- Invite family members to shared accounts
- Shared budgets
- Split expenses
- Permission levels (view-only, contribute, manage)

#### 4.9 Financial Insights Dashboard
- AI-generated weekly insights
- Spending pattern analysis
- Subscription tracking and optimization suggestions
- "Money saved" gamification
- Comparison with anonymized averages

#### 4.10 Bank Connection (Open Banking)
- Plaid/Tink integration for automatic transaction import
- Real-time balance sync
- Multi-bank aggregation
- Transaction reconciliation

### Phase 3: Monetization Features

#### 4.11 Subscription Tiers
- **Free**: Basic features, 2 accounts, 100 transactions/month
- **Pro** ($9.99/mo): Unlimited accounts, AI insights, export, recurring
- **Business** ($24.99/mo): Multi-user, advanced analytics, API access, priority support

#### 4.12 Premium AI Features
- Advanced financial forecasting
- Tax optimization suggestions
- Investment portfolio tracking
- Debt payoff optimizer
- Custom AI assistant training on user patterns

## Security Hardening

### 5.1 Authentication Upgrades

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| Two-Factor Authentication (2FA) | **HIGH** | TOTP (Google Authenticator) + SMS backup codes |
| Session Management | **HIGH** | Track active sessions, allow remote logout |
| Password Strength Enforcement | **HIGH** | Minimum length, complexity, breach database check (HaveIBeenPwned API) |
| OAuth Expansion | **MEDIUM** | Add Apple, GitHub, Microsoft sign-in |
| Biometric Auth (Mobile) | **LOW** | Fingerprint/Face ID for mobile app |

### 5.2 Data Protection

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| Encryption at Rest | **HIGH** | Encrypt sensitive fields (balance, transaction amounts) using AES-256 |
| Field-Level Encryption | **HIGH** | Encrypt PII (phone, email in non-lookup contexts) |
| Audit Trail | **HIGH** | Log all data mutations with actor, timestamp, old/new values |
| Data Export (GDPR) | **HIGH** | Allow users to export all their data |
| Account Deletion (GDPR) | **HIGH** | Complete data erasure with 30-day grace period |
| CSP Headers | **MEDIUM** | Strict Content-Security-Policy headers |
| HSTS | **MEDIUM** | HTTP Strict Transport Security |

### 5.3 API Security

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| Request Signing | **MEDIUM** | HMAC-based request signing for sensitive operations |
| IP Allowlisting (Admin) | **MEDIUM** | Restrict admin access by IP |
| API Key Management | **MEDIUM** | Rotatable API keys for external integrations |
| Request ID Tracing | **HIGH** | UUID per request for debugging and audit |
| Input Sanitization | **HIGH** | XSS prevention, SQL injection protection beyond ORM |

## DevOps & Infrastructure

### 6.1 CI/CD Pipeline
Current status: no `.github/workflows` pipeline committed yet.

---
```yaml
# Recommended GitHub Actions Pipeline
stages:
  - lint          # Biome (server) + ESLint (client)
  - type-check    # TypeScript strict mode
  - test-unit     # Jest unit tests (80%+ coverage target)
  - test-e2e      # Playwright E2E tests
  - security-scan # Snyk/Trivy dependency + container scanning
  - build         # Docker multi-stage builds
  - deploy-staging
  - deploy-production
```
---

### 6.2 Infrastructure (Production)

| Component | Current | Target |
|-----------|---------|--------|
| Hosting | Docker Compose (local) | Kubernetes (EKS/GKE) or AWS ECS |
| Database | Single PostgreSQL | Managed RDS/CloudSQL with read replicas |
| Cache | None (in-memory) | Redis Cluster (ElastiCache) |
| Queue | None | BullMQ + Redis |
| Storage | None | S3/CloudStorage for exports, receipts |
| CDN | None | CloudFront/Vercel Edge |
| Monitoring | None | Prometheus + Grafana + Sentry |
| Logging | Console.log | Structured logging (Pino) → ELK/CloudWatch |
| Secrets | .env files | AWS Secrets Manager / Vault |
| DNS/SSL | None | Route53 + ACM / Cloudflare |

### 6.3 Environment Strategy

- **Development**: Docker Compose (local)
- **Staging**: Mirror of production, feature flag testing
- **Production**: HA deployment, auto-scaling, blue-green deployments

### 6.4 Monitoring & Observability

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking + performance monitoring |
| Prometheus + Grafana | Metrics (latency, throughput, error rates) |
| ELK Stack / Loki | Centralized structured logging |
| Uptime Robot / Pingdom | Uptime monitoring + alerting |
| OpenTelemetry | Distributed tracing |

### 6.5 Database Strategy

- **Migrations**: Formalize with `drizzle-kit` and CI enforcement
- **Backups**: Automated daily backups with point-in-time recovery
- **Read Replicas**: For analytics/reporting queries
- **Connection Pooling**: PgBouncer for efficient connection management
- **Indexing Audit**: Review slow queries quarterly, add targeted indexes

## Performance & Scalability

### 7.1 Backend Performance

| Optimization | Description |
|--------------|-------------|
| Response Caching | Cache dashboard aggregates (Redis, 5-min TTL) |
| Query Optimization | Replace N+1 queries with proper joins; use `EXPLAIN ANALYZE` |
| Pagination | Cursor-based pagination on all list endpoints |
| Connection Pooling | PgBouncer with pool_mode=transaction |
| Compression | Enable gzip/brotli for API responses |
| Lazy Loading | Load relations only when requested (sparse fieldsets) |

### 7.2 Frontend Performance

| Optimization | Description |
|--------------|-------------|
| Code Splitting | Route-based code splitting (Next.js dynamic imports) |
| Image Optimization | next/image with WebP, lazy loading |
| Bundle Analysis | Audit and tree-shake unused packages |
| Prefetching | Prefetch likely navigation targets |
| Optimistic Updates | Update UI before server confirmation |
| Virtual Scrolling | For long transaction lists (react-virtuoso) |
| Service Worker | Offline support for viewing recent data |

### 7.3 Scalability Targets

| Metric | Current Estimate | Target (Year 1) |
|--------|-----------------|------------------|
| Concurrent Users | ~10 | 10,000 |
| Transactions/Day | ~100 | 1,000,000 |
| API Latency (p95) | Unknown | < 200ms |
| Uptime SLA | None | 99.9% |
| Database Size | < 1GB | Up to 100GB |

## Monetization & Business Features

### 8.1 Subscription System

- Implement Stripe integration for payment processing
- Tier management (Free, Pro, Business)
- Trial periods (14-day free Pro trial)
- Usage metering for API access tier
- Invoice generation and billing history
- Promo codes and referral system

### 8.2 Admin Dashboard Enhancements

- Real-time user analytics (DAU, MAU, retention)
- Revenue metrics (MRR, ARR, churn rate)
- Feature usage heatmaps
- Support ticket system integration
- User impersonation for debugging
- A/B testing framework

### 8.3 Developer API (Business Tier)

- RESTful API with OAuth2 for third-party apps
- Webhook system for event notifications
- API key management portal
- Rate limiting per tier
- API documentation portal (public)
- SDK generation (TypeScript, Python)

### 8.4 Mobile Application

- React Native or Flutter mobile app
- Push notifications
- Biometric authentication
- Offline-first with sync
- Receipt scanning (OCR)
- Quick transaction entry widget

## Implementation Priority

### Sprint 1-2 : Foundation & Critical Fixes

- [ ] Remove `passwordInit` column (security critical)
- [ ] Remove `@Public()` from transaction, budget, and user/account endpoints
- [ ] Fix hardcoded CORS and port configuration (use ConfigService)
- [ ] Use ConfigService for JWT secret and expand env validation (DB, JWT, email, CORS, AI)
- [ ] Add rate limiting on auth endpoints (`@nestjs/throttler`)
- [ ] Move balance calculation to server-side
- [ ] Return created resources in transaction/account controllers (HTTP 201)
- [ ] Add global exception filter and response interceptor
- [ ] Add API versioning (`/api/v1/`)
- [ ] Add health check endpoint
- [ ] Set up CI/CD pipeline (lint + test + build)
- [ ] Add proper TypeScript types (eliminate `any`)
- [ ] Add pagination to all list endpoints

### Sprint 3-4 : Core Improvements

- [ ] Integrate Redis for caching and rate limiting
- [ ] Add transaction categories and tags
- [ ] Implement recurring transactions
- [ ] Add structured logging (Pino)
- [ ] Add request ID tracing
- [ ] Implement audit trail
- [ ] Add 2FA (TOTP)
- [ ] Set up Sentry for error tracking
- [ ] Implement proper session management
- [ ] Add budget threshold notifications (email)

### Sprint 5-6 : Growth Features

- [ ] Savings goals feature
- [ ] Multi-currency support
- [ ] Financial reports & analytics dashboard
- [ ] Push notifications (web)
- [ ] Data export (CSV/PDF)
- [ ] GDPR compliance (data export, deletion)
- [ ] Implement BullMQ for async jobs
- [ ] Add E2E test coverage (Playwright)

### Sprint 7-8 : Monetization & Scale

- [ ] Stripe subscription integration
- [ ] Tier-based feature gating
- [ ] Advanced AI features (forecasting, recommendations)
- [ ] Bank connection (Plaid/Tink)
- [ ] Deploy to production cloud (AWS/GCP)
- [ ] Set up monitoring and alerting
- [ ] Performance optimization pass
- [ ] Launch preparation (landing page, documentation)

## Summary

| Category | Current State | Enterprise Target |
|----------|---------------|-------------------|
| Security | Basic JWT + lockout | 2FA, encryption, audit trail, GDPR |
| Testing | Minimal (few specs) | 80%+ unit, E2E, integration coverage |
| Infra | Docker Compose local | K8s/ECS, Redis, queues, CDN |
| Performance | No caching, no pagination | Sub-200ms p95, cursor pagination, caching |
| Features | CRUD + basic AI chat | Categories, goals, recurring, analytics, notifications |
| Monetization | None | Stripe subscriptions, tiered access |
| Observability | console.log | Structured logs, metrics, tracing, alerting |
| API Design | Inconsistent responses | Versioned, paginated, documented, typed |

*Document created: May 7, 2025*
*Next review: After Sprint 2 completion*
