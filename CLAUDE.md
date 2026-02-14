# CLAUDE.md — Trellis

## Project Overview

Trellis is a personal finance app with AI-powered transaction intelligence and a modular, user-built dashboard system. Users connect financial accounts via Plaid and build custom dashboards using natural language or pre-built widgets. See `spec.md` for the full product spec.

---

## Architecture Philosophy

This codebase follows **Domain-Driven Design (DDD)** with a strict layered architecture. Business logic lives in OOP services and domain entities — never in React components, API routes, or hooks. React components are purely functional and presentational. The backend uses classes, inheritance, interfaces, and design patterns extensively.

**The golden rule: zero repeated code.** Every piece of logic exists in exactly one place. If something is used twice, it gets abstracted.

---

## Project Structure

```
trellis/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (providers, global styles)
│   │   ├── page.tsx                  # Landing page
│   │   ├── global-error.tsx          # Root error boundary
│   │   ├── not-found.tsx
│   │   ├── (auth)/                   # Auth route group (no /auth in URL)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (marketing)/              # Marketing pages
│   │   │   ├── layout.tsx
│   │   │   └── pricing/page.tsx
│   │   ├── dashboard/                # Main app (authenticated)
│   │   │   ├── layout.tsx            # Dashboard shell (sidebar + header)
│   │   │   ├── page.tsx              # Default dashboard view
│   │   │   ├── error.tsx             # Dashboard error boundary
│   │   │   ├── loading.tsx           # Dashboard skeleton
│   │   │   ├── accounts/page.tsx
│   │   │   ├── transactions/page.tsx
│   │   │   ├── investments/page.tsx
│   │   │   ├── insights/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── _components/          # Dashboard-specific components
│   │   └── api/                      # API routes
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── register/route.ts
│   │       │   └── logout/route.ts
│   │       ├── plaid/
│   │       │   ├── link-token/route.ts
│   │       │   ├── exchange-token/route.ts
│   │       │   └── webhooks/route.ts
│   │       ├── accounts/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── transactions/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── categorize/route.ts
│   │       ├── investments/
│   │       │   ├── route.ts
│   │       │   └── holdings/route.ts
│   │       ├── widgets/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── generate/route.ts
│   │       ├── dashboards/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── insights/
│   │       │   └── route.ts
│   │       └── query/
│   │           └── route.ts
│   │
│   ├── domain/                       # Domain layer — entities & interfaces
│   │   ├── entities/
│   │   │   ├── base.entity.ts        # Abstract BaseEntity (id, createdAt, updatedAt)
│   │   │   ├── user.entity.ts
│   │   │   ├── account.entity.ts     # Abstract, extended by BankAccount, CreditCard, InvestmentAccount
│   │   │   ├── transaction.entity.ts
│   │   │   ├── category.entity.ts
│   │   │   ├── widget.entity.ts
│   │   │   ├── dashboard.entity.ts
│   │   │   ├── holding.entity.ts
│   │   │   ├── insight.entity.ts
│   │   │   └── goal.entity.ts
│   │   ├── value-objects/
│   │   │   ├── money.vo.ts           # Immutable money type (amount + currency)
│   │   │   ├── date-range.vo.ts
│   │   │   ├── email.vo.ts
│   │   │   └── confidence-score.vo.ts
│   │   ├── interfaces/
│   │   │   ├── repositories/         # Repository interfaces (contracts only)
│   │   │   │   ├── base.repository.ts
│   │   │   │   ├── user.repository.ts
│   │   │   │   ├── account.repository.ts
│   │   │   │   ├── transaction.repository.ts
│   │   │   │   ├── widget.repository.ts
│   │   │   │   └── dashboard.repository.ts
│   │   │   └── services/             # Service interfaces
│   │   │       ├── categorization.service.ts
│   │   │       ├── transfer-detection.service.ts
│   │   │       └── widget-generation.service.ts
│   │   ├── enums/
│   │   │   ├── account-type.enum.ts
│   │   │   ├── transaction-type.enum.ts
│   │   │   ├── category.enum.ts
│   │   │   └── widget-type.enum.ts
│   │   └── errors/
│   │       ├── base.error.ts         # Abstract AppError extends Error
│   │       ├── validation.error.ts
│   │       ├── not-found.error.ts
│   │       ├── unauthorized.error.ts
│   │       ├── plaid.error.ts
│   │       └── ai.error.ts
│   │
│   ├── services/                     # Service layer — one service per domain entity
│   │   ├── base.service.ts           # Abstract BaseService with shared CRUD logic
│   │   ├── user.service.ts
│   │   ├── account.service.ts
│   │   ├── transaction.service.ts
│   │   ├── categorization.service.ts # AI-powered categorization
│   │   ├── transfer-detection.service.ts
│   │   ├── widget.service.ts
│   │   ├── widget-generation.service.ts  # AI widget builder
│   │   ├── dashboard.service.ts
│   │   ├── investment.service.ts
│   │   ├── insight.service.ts        # AI insights & anomaly detection
│   │   ├── forecast.service.ts
│   │   ├── plaid.service.ts          # Plaid API wrapper
│   │   ├── ai.service.ts            # Base AI/LLM service
│   │   └── query.service.ts         # Natural language query handler
│   │
│   ├── repositories/                 # Repository implementations
│   │   ├── base.repository.ts        # Abstract BaseRepository implements IBaseRepository
│   │   ├── prisma/                   # Prisma-specific implementations
│   │   │   ├── user.repository.ts
│   │   │   ├── account.repository.ts
│   │   │   ├── transaction.repository.ts
│   │   │   ├── widget.repository.ts
│   │   │   └── dashboard.repository.ts
│   │   └── index.ts                  # Repository factory/registry
│   │
│   ├── dtos/                         # Data Transfer Objects
│   │   ├── auth/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── account/
│   │   │   ├── create-account.dto.ts
│   │   │   └── account-response.dto.ts
│   │   ├── transaction/
│   │   │   ├── transaction-response.dto.ts
│   │   │   ├── categorize-transaction.dto.ts
│   │   │   └── transaction-filter.dto.ts
│   │   ├── widget/
│   │   │   ├── create-widget.dto.ts
│   │   │   ├── generate-widget.dto.ts
│   │   │   └── widget-response.dto.ts
│   │   └── dashboard/
│   │       ├── create-dashboard.dto.ts
│   │       ├── update-layout.dto.ts
│   │       └── dashboard-response.dto.ts
│   │
│   ├── mappers/                      # Entity <-> DTO mappers
│   │   ├── base.mapper.ts            # Abstract BaseMapper<Entity, ResponseDto>
│   │   ├── user.mapper.ts
│   │   ├── account.mapper.ts
│   │   ├── transaction.mapper.ts
│   │   ├── widget.mapper.ts
│   │   └── dashboard.mapper.ts
│   │
│   ├── strategies/                   # Strategy pattern implementations
│   │   ├── categorization/
│   │   │   ├── categorization.strategy.ts    # Interface
│   │   │   ├── ai-categorization.strategy.ts
│   │   │   ├── rule-based-categorization.strategy.ts
│   │   │   └── user-override-categorization.strategy.ts
│   │   └── transfer-detection/
│   │       ├── transfer-detection.strategy.ts
│   │       ├── amount-matching.strategy.ts
│   │       ├── venmo-detection.strategy.ts
│   │       └── credit-card-payment.strategy.ts
│   │
│   ├── factories/                    # Factory pattern implementations
│   │   ├── account.factory.ts        # Creates BankAccount, CreditCard, InvestmentAccount
│   │   ├── widget.factory.ts         # Creates widget instances by type
│   │   └── chart.factory.ts          # Creates chart configs by type
│   │
│   ├── components/                   # Shared React components
│   │   ├── ui/                       # Atomic UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx              # Compound component (Card, Card.Header, Card.Body, Card.Footer)
│   │   │   ├── Modal.tsx             # Compound component
│   │   │   ├── Dropdown.tsx          # Compound component
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── index.ts             # Barrel export
│   │   ├── charts/                   # Chart wrapper components
│   │   │   ├── BaseChart.tsx         # Shared chart config (theme, responsive, tooltips)
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── AreaChart.tsx
│   │   │   └── index.ts
│   │   ├── layout/                   # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   └── index.ts
│   │   ├── forms/                    # Form abstractions
│   │   │   ├── FormField.tsx         # Generic field wrapper (label, error, hint)
│   │   │   ├── FormSelect.tsx
│   │   │   ├── FormDatePicker.tsx
│   │   │   └── index.ts
│   │   └── feedback/                 # Loading, error, empty states
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorDisplay.tsx
│   │       ├── EmptyState.tsx
│   │       └── index.ts
│   │
│   ├── features/                     # Feature modules
│   │   ├── accounts/
│   │   │   ├── components/
│   │   │   │   ├── AccountList.tsx
│   │   │   │   ├── AccountCard.tsx
│   │   │   │   └── PlaidLinkButton.tsx
│   │   │   └── hooks/
│   │   │       └── useAccounts.ts
│   │   ├── transactions/
│   │   │   ├── components/
│   │   │   │   ├── TransactionTable.tsx
│   │   │   │   ├── TransactionRow.tsx
│   │   │   │   ├── CategoryBadge.tsx
│   │   │   │   └── ReviewInbox.tsx
│   │   │   └── hooks/
│   │   │       ├── useTransactions.ts
│   │   │       └── useTransactionFilters.ts
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── DashboardGrid.tsx
│   │   │   │   ├── WidgetContainer.tsx   # Wrapper with drag/resize/delete
│   │   │   │   ├── WidgetRenderer.tsx    # Routes widget type -> component
│   │   │   │   ├── WidgetPromptBar.tsx   # AI widget generation input
│   │   │   │   ├── WidgetLibrary.tsx     # Pre-built widget picker
│   │   │   │   └── DashboardTabs.tsx
│   │   │   └── hooks/
│   │   │       ├── useDashboardLayout.ts
│   │   │       └── useWidgetData.ts
│   │   ├── widgets/                  # Individual widget implementations
│   │   │   ├── base/
│   │   │   │   └── BaseWidget.tsx    # Shared widget chrome (title, settings gear, refresh)
│   │   │   ├── spending-by-category/
│   │   │   │   └── SpendingByCategoryWidget.tsx
│   │   │   ├── net-worth/
│   │   │   │   └── NetWorthWidget.tsx
│   │   │   ├── account-balances/
│   │   │   │   └── AccountBalancesWidget.tsx
│   │   │   ├── income-vs-expenses/
│   │   │   │   └── IncomeVsExpensesWidget.tsx
│   │   │   ├── recent-transactions/
│   │   │   │   └── RecentTransactionsWidget.tsx
│   │   │   ├── subscription-tracker/
│   │   │   │   └── SubscriptionTrackerWidget.tsx
│   │   │   ├── savings-rate/
│   │   │   │   └── SavingsRateWidget.tsx
│   │   │   ├── budget-vs-actual/
│   │   │   │   └── BudgetVsActualWidget.tsx
│   │   │   ├── cash-flow-calendar/
│   │   │   │   └── CashFlowCalendarWidget.tsx
│   │   │   ├── holdings/
│   │   │   │   └── HoldingsWidget.tsx
│   │   │   ├── portfolio-performance/
│   │   │   │   └── PortfolioPerformanceWidget.tsx
│   │   │   ├── goal-tracker/
│   │   │   │   └── GoalTrackerWidget.tsx
│   │   │   ├── ai-generated/
│   │   │   │   └── AiGeneratedWidget.tsx
│   │   │   └── registry.ts          # Widget type -> component mapping
│   │   ├── investments/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── insights/
│   │   │   ├── components/
│   │   │   │   ├── InsightCard.tsx
│   │   │   │   ├── AnomalyAlert.tsx
│   │   │   │   └── MonthlySummary.tsx
│   │   │   └── hooks/
│   │   └── forecasting/
│   │       ├── components/
│   │       │   ├── ForecastChart.tsx
│   │       │   └── ScenarioComparison.tsx
│   │       └── hooks/
│   │
│   ├── hooks/                        # Shared custom hooks
│   │   ├── useFetch.ts               # Generic data fetching
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePrevious.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── store/                        # Zustand stores
│   │   ├── dashboard.store.ts        # Layout, active tab, widget configs
│   │   ├── filters.store.ts          # Global date range, account filters
│   │   ├── auth.store.ts
│   │   └── ui.store.ts              # Sidebar open, theme, modals
│   │
│   ├── lib/                          # Core infrastructure
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── plaid.ts                  # Plaid client singleton
│   │   ├── ai.ts                     # AI/LLM client singleton
│   │   ├── api-client.ts             # Frontend fetch wrapper with auth headers
│   │   ├── auth.ts                   # Auth utilities (session, token verification)
│   │   └── logger.ts
│   │
│   ├── config/
│   │   ├── categories.ts             # Default category taxonomy
│   │   ├── theme.ts                  # Design tokens (colors, spacing, typography)
│   │   └── constants.ts
│   │
│   ├── types/                        # Global TypeScript types
│   │   ├── api.types.ts              # API request/response shapes
│   │   ├── chart.types.ts
│   │   ├── widget.types.ts
│   │   └── plaid.types.ts
│   │
│   └── utils/                        # Pure utility functions (no side effects)
│       ├── format.utils.ts           # formatCurrency, formatDate, formatPercent
│       ├── date.utils.ts
│       ├── math.utils.ts
│       └── validation.utils.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── strategies/
│   │   └── utils/
│   ├── integration/
│   │   ├── api/
│   │   └── repositories/
│   └── e2e/
│
├── CLAUDE.md                         # This file
├── spec.md                           # Product spec
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## TypeScript & OOP Rules

### Entities

Every domain entity extends `BaseEntity`:

```typescript
abstract class BaseEntity {
	readonly id: string;
	readonly createdAt: Date;
	updatedAt: Date;

	constructor(id?: string) {
		this.id = id ?? crypto.randomUUID();
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}
}
```

Entities contain business logic methods. They are not anemic data bags. For example, `Transaction` should have methods like `isTransfer()`, `isRecurring()`, `belongsToCategory()`.

Account types use inheritance:

```
BaseEntity
  └── Account (abstract)
        ├── BankAccount
        ├── CreditCardAccount
        └── InvestmentAccount
```

### Value Objects

Use value objects for types that are defined by their value, not identity. They are immutable and self-validating:

- `Money` — amount + currency, with arithmetic methods
- `Email` — validates format on construction
- `DateRange` — start + end, with `contains()`, `overlaps()`, `duration()`
- `ConfidenceScore` — constrained to 0-1, with `isHigh()`, `isMedium()`, `isLow()`

### Interfaces vs Abstract Classes

- **Interfaces** for contracts/shapes that define what something does: `IUserRepository`, `ICategorizationStrategy`
- **Abstract classes** for shared implementation: `BaseRepository`, `BaseService`, `BaseEntity`
- Never use abstract classes just for type definition. If there's no shared implementation, use an interface.

### Services

One service per domain entity. Every service extends `BaseService`:

```typescript
abstract class BaseService {
  constructor(protected repository: IBaseRepository) {}

  async findById(id: string): Promise { ... }
  async findAll(filters?: FilterDto): Promise { ... }
  async create(data: CreateDto): Promise { ... }
  async update(id: string, data: UpdateDto): Promise { ... }
  async delete(id: string): Promise { ... }
}
```

Domain-specific logic goes in the concrete service. For example, `TransactionService` adds `categorize()`, `detectTransfers()`, `getByDateRange()`.

Services call repositories — never the database directly. Services call other services when cross-domain logic is needed.

### Repositories

One repository per entity. Every repository extends `BaseRepository` which implements `IBaseRepository`. The base provides generic CRUD — the concrete adds entity-specific queries.

Repository interfaces live in `domain/interfaces/repositories/`. Implementations live in `repositories/prisma/`. This separation means we can swap Prisma for anything else without touching services.

### DTOs

Use Zod schemas for DTOs. Every DTO has:

- A Zod schema that defines shape + validation
- A TypeScript type inferred from the schema via `z.infer<>`

Separate DTOs for: create, update, response, and filter operations. DTOs never contain business logic.

### Mappers

One mapper per entity. Every mapper extends `BaseMapper`:

```typescript
abstract class BaseMapper {
	abstract toDto(entity: Entity): ResponseDto;
	abstract toDomain(dto: any): Entity;
	abstract toPersistence(entity: Entity): any;

	toDtoList(entities: Entity[]): ResponseDto[] {
		return entities.map((e) => this.toDto(e));
	}
}
```

### Error Hierarchy

```
AppError (abstract, extends Error)
  ├── ValidationError (400)
  ├── UnauthorizedError (401)
  ├── ForbiddenError (403)
  ├── NotFoundError (404)
  ├── ConflictError (409)
  ├── PlaidError (502)
  └── AiError (502)
```

Every error has a `statusCode` property. API route handlers catch errors and return the appropriate HTTP status. Always use custom errors — never throw raw `Error`.

### Strategy Pattern

Used for algorithms with multiple implementations:

**Categorization** — `ICategorizationStrategy` with implementations:

- `AiCategorizationStrategy` — sends to LLM
- `RuleBasedCategorizationStrategy` — user-defined rules
- `UserOverrideCategorizationStrategy` — previously corrected mappings

The `CategorizationService` chains these: check user overrides first, then rules, then AI fallback.

**Transfer Detection** — `ITransferDetectionStrategy` with implementations:

- `AmountMatchingStrategy` — matches debits/credits across accounts
- `VenmoDetectionStrategy` — parses Venmo memo/type
- `CreditCardPaymentStrategy` — matches payments to cards

### Factory Pattern

Used for creating objects with complex initialization:

- `AccountFactory.create(plaidAccountData)` — returns the right account subclass
- `WidgetFactory.create(type, config)` — returns the right widget instance
- `ChartFactory.create(type, data, options)` — returns chart configuration

---

## Next.js Patterns

### Server Components vs Client Components

**Default to Server Components.** Only add `'use client'` when you need:

- Event handlers (onClick, onChange)
- State (useState, useReducer)
- Effects (useEffect)
- Browser APIs (localStorage, window)

**Pattern:** Server components fetch data, client components handle interaction.

```
ServerComponent (fetches data)
  └── ClientComponent (handles clicks, state)
```

Push `'use client'` as deep into the component tree as possible. A page can be a server component that passes data down to small client components.

### API Routes

- Every route handler validates input with Zod
- Every route handler catches errors and maps them to HTTP responses
- Use Server Actions for mutations from React components (form submissions, button actions)
- Use API routes for: webhooks (Plaid), external access, and complex operations

Route handler structure:

```typescript
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validated = CreateWidgetSchema.parse(body);
		const result = await widgetService.create(validated);
		return NextResponse.json(WidgetMapper.toDto(result), { status: 201 });
	} catch (error) {
		if (error instanceof AppError) {
			return NextResponse.json({ error: error.message }, { status: error.statusCode });
		}
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
```

### Layouts

- Root layout: providers (auth, theme, query client), global styles
- `(auth)` group layout: centered card layout, no sidebar
- `(marketing)` group layout: marketing header + footer
- `dashboard` layout: sidebar + header + main content area

Layouts never re-render on navigation. Use them for persistent UI.

### Error Handling

- Every route group has its own `error.tsx`
- `global-error.tsx` at root catches layout errors
- Server component errors bubble up to nearest `error.tsx`
- API routes handle errors explicitly with try/catch

### Middleware

Use for: auth checks on protected routes, redirect logic. Never for business logic.

---

## React Component Rules

### Shared UI Components (`components/ui/`)

- Every component is generic and reusable
- Use compound component pattern for complex components (Card, Modal, Dropdown, Tabs)
- Use polymorphic `as` prop for components that render different elements
- Props use TypeScript generics where applicable
- No business logic — purely presentational
- All components accept `className` for style overrides

### Feature Components (`features/`)

- Organized by feature, not by component type
- Each feature has its own `components/` and `hooks/`
- Feature components can import from `components/ui/` but never from other features
- Cross-feature communication goes through Zustand stores or shared hooks

### Widget Architecture

Every widget extends a common interface:

- `BaseWidget` component provides shared chrome: title bar, settings icon, refresh button, drag handle, resize handle
- Each widget implementation only handles its unique content area
- Widget configs are JSON-serializable for storage
- `WidgetRenderer` maps widget type string → React component via a registry
- AI-generated widgets render from a stored component definition

### Charts

- `BaseChart` wrapper handles: Trellis theme colors, responsive container, tooltip styling, loading state, empty state
- Individual chart components (LineChart, BarChart, etc.) extend BaseChart behavior
- Never configure chart theme/colors in individual widgets — always inherit from BaseChart
- Use the Trellis design tokens from `config/theme.ts`

### Forms

- Use React Hook Form for all forms
- `FormField` is a generic wrapper that handles: label, error message, hint text, required indicator
- Form validation uses the same Zod schemas as the DTOs
- One form component per use case, composed from shared FormField components

### State Management (Zustand)

- `dashboard.store.ts` — widget layouts, active tab, widget configs
- `filters.store.ts` — global date range, selected accounts (syncs across all widgets)
- `auth.store.ts` — user session, auth state
- `ui.store.ts` — sidebar collapsed, active modal, theme preference

Stores are small and focused. Never put everything in one store. Components select only the state they need.

### Hooks

- Shared hooks in `hooks/` — generic utilities used everywhere
- Feature hooks in `features/[name]/hooks/` — data fetching and logic for that feature
- Hooks call services/API client — never contain business logic themselves
- Every data-fetching hook returns `{ data, loading, error, refetch }`

---

## Design System

### Visual Direction

Trellis looks calm, minimal, and a little artsy — not typical loud fintech.

- **Color palette**: Muted, earthy — soft greens, warm grays, off-whites, clay/sage accents
- **Spacing**: Generous whitespace everywhere, nothing cramped
- **Borders**: Thin lines, rounded corners, soft shadows
- **Typography**: Clean sans-serif, generous letter-spacing and line-height. Type does the heavy lifting, not color.
- **Charts**: Elegant, editorial feel — more infographic than Bloomberg terminal. Use the muted palette.
- **Animations**: Gentle fades, smooth transitions. Nothing flashy or bouncy.
- **Widgets**: Feel like physical cards/tiles arranged on a surface
- **Dark mode**: Warm darks (not pure black), cozy feel. Not just "invert the colors."
- **Overall vibe**: Well-designed journal or art book, not a finance app

### Design Tokens

All design values live in `config/theme.ts`. Components reference tokens — never hardcode colors, spacing, or font sizes. This includes chart colors.

---

## Code Quality Rules

### No Duplication

- If a pattern appears twice, extract it
- Shared CRUD logic → `BaseService`, `BaseRepository`
- Shared component chrome → `BaseWidget`, `BaseChart`, `FormField`
- Shared type shapes → value objects or shared types
- Shared API call patterns → `api-client.ts`
- Shared formatting → `format.utils.ts`

### Naming Conventions

- Files: `kebab-case` for all files except React components
- React components: `PascalCase.tsx`
- Interfaces: prefix with `I` only for repository/service contracts (e.g. `IUserRepository`)
- Types: no prefix
- Enums: `PascalCase` with `PascalCase` members
- Services: `[name].service.ts`
- Repositories: `[name].repository.ts`
- DTOs: `[action]-[entity].dto.ts` (e.g. `create-widget.dto.ts`)
- Strategies: `[name].strategy.ts`
- Hooks: `use[Name].ts`
- Stores: `[name].store.ts`
- Utils: `[name].utils.ts`
- Entities: `[name].entity.ts`
- Value objects: `[name].vo.ts`

### Import Rules

- Use path aliases: `@/` maps to `src/`
- Import order: external packages → `@/domain` → `@/services` → `@/components` → `@/features` → `@/hooks` → `@/utils` → relative imports
- Feature components import from `@/components/ui` — never from other features
- Services import from `@/domain` and `@/repositories` — never from `@/components` or `@/features`
- API routes import from `@/services` and `@/dtos` — never from React components

### Data Flow

```
API Route → Service → Repository → Database
                ↓
React Component ← Hook ← API Client ← API Route
```

- Data flows down through props
- Events flow up through callbacks
- Shared state lives in Zustand stores
- Server-side data fetching in Server Components, passed as props to Client Components

### Testing

- Unit tests for: services, strategies, utils, mappers, value objects
- Integration tests for: API routes, repository queries
- E2E tests for: critical user flows (connect account, view dashboard, create widget)
- Test services by injecting mock repositories
- Test strategies in isolation with sample data
- Everytime you're done making changes run the tests we've created

---

## Key Technical Decisions

- **Prisma** for database ORM — TypeScript-first, great migrations
- **Zustand** for client state — simple, performant, no boilerplate
- **Zod** for validation — runtime validation with TypeScript inference
- **React Hook Form** for forms — minimal re-renders, Zod integration
- **Recharts** for pre-built charts, D3 available for AI-generated custom visualizations
- **react-grid-layout** for dashboard drag-and-drop grid
- **Plaid** for all financial data (bank, credit card, investment, Venmo)
- **Anthropic Claude API** for categorization, widget generation, insights, natural language queries
