# VoluLink Benchmarking Tool — CLAUDE.md

## Project Overview

Full-stack benchmarking platform for hospitality/facility organizations. Facility managers and federation managers can enter yearly operational metrics, compare performance across categories, and generate reports. Three distinct user roles drive most of the conditional UI and permission logic.

**Repos:**
- `Benchmarking-Tool/` — Next.js 16 frontend
- `Benchmarking-Tool-Backend/` — Django 6 + DRF backend

Both services run in Docker on an external `volulink` Docker network.

---

## Architecture

```
Browser
  └─► Next.js (port 3000)
        ├─ login server action    ← calls Django, sets JWT cookies
        ├─ /api/auth/{logout,refresh} ← clears / rotates cookies
        └─ /api/proxy/[...path]    ← forwards requests to Django with Authorization header
              └─► Django DRF (port 8000)
                    ├─ /api/v1/auth/
                    ├─ /api/v1/         (facilities, categories, benchmarks)
                    └─ /api/v1/dashboard/
```

**Authentication flow:**
1. Login → the `(auth)/login/actions.ts` **server action** posts to `/api/v1/auth/login/`, receives JWT tokens (it does *not* go through `/api/proxy`)
2. Tokens stored as cookies: `access` and `refresh` are **httpOnly**; `user` is a non-httpOnly JSON cookie so `auth-context` / `getServerUser()` can read the role client- and server-side
3. All authenticated requests go through `/api/proxy/[...path]` which injects `Authorization: Bearer <access>` (except `PUBLIC_PATHS`: login, signup, token-refresh, invitations, unapproved-* — sent without auth). The proxy also forwards `multipart/form-data` for uploads
4. Token expiry → `/api/auth/refresh/` calls Django `/api/v1/auth/token-refresh/` to rotate the pair
5. Logout → `/api/auth/logout/` clears cookies; Django blacklists the refresh token

---

## Tech Stack

### Frontend
| Dependency | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | React framework (App Router) |
| React | 19.2.3 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| SASS | 1.97.2 | SCSS design tokens/theme |
| Zod | 4.3.5 | Client-side validation |
| Chart.js + react-chartjs-2 | 4.5.1 / 5.3.1 | Data visualization |
| ExcelJS | 4.1.1 | Excel export |
| jsPDF + jspdf-autotable | 4.2.0 / 5.0.7 | PDF generation |
| FontAwesome | react-fontawesome 3.1.1 + free-*-svg-icons 7.1.0 | Icons |

> Notes: there is **no test framework or runner** configured (`npm` scripts are `dev`/`build`/`start`/`lint` only). `package.json` pins transitive overrides for `minimatch`/`glob`/`rimraf`.

### Backend
| Dependency | Version | Purpose |
|---|---|---|
| Django | 6.0.1 | Web framework |
| djangorestframework | 3.16.1 | REST API |
| djangorestframework-simplejwt | 5.5.1 | JWT auth |
| django-cors-headers | 4.9.0 | CORS |
| django-environ | 0.12.0 | Env var loading |
| mysqlclient | 2.2.7 | MySQL driver |
| gunicorn + uvicorn | 23.0.0 / 0.34.0 | ASGI production server |
| openpyxl | 3.1.5 | Excel import |
| Pillow | 12.1.0 | Image handling |

**Database:** MySQL 8.0.39

---

## Frontend Structure (`Benchmarking-Tool/src/`)

```
app/
  (auth)/                   # Public auth pages
    login/                  # page.tsx + actions.ts (login server action)
    signup/                 # page.tsx + actions.ts
    forgot-password/        # request OTP
    reset-password/         # submit OTP + new password
    invitations/[token]/    # accept-invitation flow (page + form + actions)
    _components/            # loginForm, signup-form, no-auth
  (dashboard)/              # Protected routes (wrapped by layout.tsx with sidebar)
    page.tsx                # entry — renders main.tsx → role dashboard
    main.tsx, sidebar.tsx, dashboard.tsx
    admin-dashboard.tsx
    facility-manager-dashboard.tsx
    federation-manager-dashboard.tsx
    _components/            # dashboard-shared components
      dashboard/            # benchmark-attempts, facilities, user-activities,
                            #   user-approvals, user-join-requests
    categories/             # list + create + [categoryId]/(detail|update), _components/
    facilities/             # list + create + [facilityId]/... + detail/[detailId], _components/
    internal-benchmark/
    category-benchmark/
    master-data/            # admin Excel master-data upload (page + upload form)
    profile/
    user-invitations/
    joining-requests/
    [...catchAll]/          # catch-all 404 (page.tsx + not-found.tsx)
  api/
    auth/logout/route.ts    # NOTE: login is a server action, not an API route
    auth/refresh/route.ts
    proxy/[...path]/route.ts  # Catch-all proxy to Django
  styles/
    _tokens.scss            # Design tokens (colors, spacing)
    _theme.scss             # Theme variables
    _style.scss             # Global styles
    globals.scss            # @use entry point

components/                 # Truly shared helpers/UI
  benchmark-chart.ts        # Chart.js dataset/config builders
  notify.ts                 # toast / notification helper
  public.ts, require-auth.ts # route guards
  searchable-select.tsx     # reusable select component
context/
  auth-context.tsx          # useAuth() hook — reads user cookie, manages hydration
lib/
  api/
    index.ts                # serverFetch() utility (server-side, attaches auth header)
    auth.ts                 # signup, profile, password-change API calls
    categories.ts
    facilities.ts
    facilities-server.ts    # Server-component fetch variants
    dashboard.ts
    user-invitations.ts
  auth/
    server.ts               # getServerUser() — reads user cookie in server components
  types/
    auth.ts                 # User, AuthUser, AuthResponse, DashboardResult
    facilities.ts
    benchmark.ts
    user-invitations.ts
    response.ts             # ApiMessageResponse
    index.ts                # barrel re-exports
  validators/               # Zod schemas (loginSchema, signupSchema, etc.)
    auth.ts
    category.ts
    facility.ts
    user-invitation.ts
```

### TypeScript Path Alias
`@/*` maps to `src/*` — use `@/components/...`, `@/lib/...`, etc.

### Component Conventions
- **Default to Server Components**; add `"use client"` only when needed for hooks or browser APIs
- Forms use Next.js **server actions** with `useActionState`
- Validate with **Zod** before submitting; display field-level errors from `state.errors`
- Route groups `(auth)` and `(dashboard)` keep layouts separate without affecting the URL
- Co-locate page-specific components in `_components/` subdirectory of the route

### Styling Conventions
- **Tailwind CSS 4** for all utility classes (no `tailwind.config` file — uses `@tailwindcss/postcss` plugin)
- SCSS files in `src/app/styles/` hold design tokens and global resets only
- Import with `@use` (not `@import`) in SCSS files

### State Management
- **React Context** (`auth-context.tsx`) for global user state — no Redux/Zustand
- Component-local `useState` for UI state
- No global client-side data cache (re-fetch on navigation)

---

## Backend Structure (`Benchmarking-Tool-Backend/`)

```
core/
  settings.py
  urls.py           # /admin/, /api/v1/auth/, /api/v1/
  asgi.py / wsgi.py

apps/
  volulink/         # Shared utilities (base model, responses, exceptions, email)
  authentication/   # User model, JWT auth, OTP, invitations, activity log
  facilities/       # Category, Facility, FacilityDetail, benchmarks
  dashboard/        # Read-only aggregation views per role
```

### App Anatomy (consistent across all apps)
Each app follows this layout:
```
<app>/
  models.py
  serializers.py
  apis.py           # ViewSet-based views (named "apis" not "views")
  urls.py
  permissions.py    # App-specific permission classes
  constants.py      # Role names, status values, etc.
  admin.py
  apps.py
```

### URL Prefixes
| Prefix | App |
|---|---|
| `/api/v1/auth/` | authentication (login, token-refresh, signup, logout, email-verification, reset-password, me, user-invitations) |
| `/api/v1/categories/` | facilities |
| `/api/v1/facilities/` | facilities |
| `/api/v1/federations/` | facilities |
| `/api/v1/unapproved-facilities/` `/api/v1/unapproved-federations/` | facilities (admin approval queues) |
| `/api/v1/internal-benchmark/` | facilities |
| `/api/v1/category-wide-benchmark/` | facilities |
| `/api/v1/facility-master-data/` | facilities (`MasterDataApi` — Excel import) |
| `/api/v1/dashboard/` | dashboard |

Login is `POST /api/v1/auth/login/` (a `TokenObtainPairView` subclass); refresh is `POST /api/v1/auth/token-refresh/` (SimpleJWT `TokenRefreshView`). Both are registered outside the DRF router in `authentication/urls.py`.

### Key Models

**authentication.User** (custom AUTH_USER_MODEL)
- `email` (unique, login field), `first_name`, `last_name` (no single `name` field)
- `role` — `admin` | `federation_manager` | `facility_manager` (`ROLE_*` constants; display labels are German, e.g. `Verbandsmanager`)
- `is_email_verified`, `email_verified_at`, `is_active`, `is_staff`
- `change_password_at_first_login`, `password_changed_at`, `last_verification_email_sent_at`

**authentication** also has: `Otp` (one-time codes for password reset, with `request_type`), `EmailVerificationToken` (token-based email verification — distinct from OTP), `UserInvitation` (tokenized invites with expiry), `UserActivityLog`.

**facilities.Facility**
- `user` (FK → User), `category` (FK → Category)
- `is_federation` — True for federation parent nodes; `federation` (FK → self) — member facilities point to their federation
- `is_user_approved` — admin approval gate; `is_active`
- Structural attributes: `beds`, `rooms`, `opening_days_per_year`, `operational_building_area`, `total_property_area`, `federal_state`

**facilities.FacilityDetail** — one row per `(facility, year)`, holds all yearly benchmark inputs:
- Volume: `guests`, `rooms_sold`, `overnight_stays`
- Income: `total_revenue`, `catering_income`, `accommodation_income`, `donations_subsidies_income`, `other_income`
- Costs: `personnel_costs`, `material_goods_costs`, `energy_costs`, `outsourced_services_costs`, `other_operating_costs`, `repair_maintenance_costs`, `depreciation_costs`, `rent_lease_costs`
- Groups/seminars: `total_groups`, `own_groups`, `own_participants`, `returning_groups`
- Per-department personnel hours + wage pairs: `pers_{admin,kitchen,cleaning,tech,edu}_{hours,wage}`
- `total_costs` (computed, `editable=False`), `is_published`, `last_published_at`
- `FacilityActivityLog` tracks mutations.

See `Calculation_Rules.md` and `sample_reports.md` (repo root) for the benchmark KPI formulas and report layouts derived from these fields.

**volulink.Model** (abstract base)
- Adds `created_at`, `updated_at` to every model

### Response Pattern
All API responses use custom wrapper classes from `apps/volulink/responses.py`:
```python
SuccessResponse()                          # {"status": "success"}
SuccessWithMessageResponse(message)        # {"status": "success", "message": "..."}
SuccessWithResultsResponse(name, data)     # {"status": "success", <name>: [...]}
ErrorWithMessageResponse(message)          # {"status": "error", "message": "..."}
```
Never return raw DRF `Response(data)` — always wrap with one of the above.

### Exception Handling
Custom handler in `apps/volulink/exceptions.py` — registered as `EXCEPTION_HANDLER` in settings:
- Validation errors → HTTP 422
- Not found → HTTP 404
- Other DRF exceptions → standard codes

### Permission Classes (`authentication/permissions.py`)
```python
IsAdmin                        # role == 'admin'
IsFacilityManager              # role == 'facility_manager'
IsFederationManager            # role == 'federation_manager'
MultiRolePermission(*roles)    # any of multiple roles
```
Views assign permissions dynamically via `get_permissions()`.

### ViewSet Pattern
```python
class SomeApi(ViewSet):
    def get_permissions(self):
        if self.action == 'create':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def list(self, request):
        ...
        return SuccessWithResultsResponse('items', serializer.data)
```

### Email
- `send_html_email()` in `apps/volulink/utils.py` — renders Django HTML template + plain text fallback
- Always called in a `threading.Thread` to avoid blocking the request

### JWT Settings
- Access token: **15 minutes**
- Refresh token: **7 days**, rotated + blacklisted on use
- Backend: `JWTAuthentication` as default DRF authentication

---

## User Roles & Access Control

| Role | Can Do |
|---|---|
| `admin` | Approve users/facilities, manage categories, all data |
| `federation_manager` | Manage federation + member facilities, view federation benchmarks |
| `facility_manager` | Manage own facility data, view internal/category benchmarks |

The dashboard `GET /api/v1/dashboard/` returns role-specific data. The frontend renders one of three dashboard components based on `user.role`.

---

## Environment Variables

### Frontend (`Benchmarking-Tool/.env`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Backend (`Benchmarking-Tool-Backend/core/.env`)
```
DEBUG=False
SECRET_KEY=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
APP_LINK=http://localhost:3000   # used in email links
```

---

## Running Locally

### Backend
```bash
cd Benchmarking-Tool-Backend
docker-compose up          # starts api (8000) + MySQL (3306)
# or without docker:
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd Benchmarking-Tool
npm install
npm run dev                # http://localhost:3000
```

### Production (Docker)
Both services require the external `volulink` Docker network:
```bash
docker network create volulink
# then in each project directory:
docker-compose up -d
```
Backend runs: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker core.asgi:application`

---

## Notable Conventions

- **Language**: UI labels, error messages, and email content are in **German** (`de`)
- **API versioning**: All routes under `/api/v1/`
- **Proxy pattern**: Frontend never calls Django directly from the browser; all requests go through `/api/proxy/[...path]`
- **Server actions**: Prefer Next.js server actions over client-side fetch for form submissions
- **Audit logs**: `UserActivityLog` and `FacilityActivityLog` track key mutations
- **Soft approval**: New users/facilities are inactive until admin approves (`is_user_approved`); admins work the queues via the `unapproved-facilities` / `unapproved-federations` endpoints
- **OTP reset**: Password reset uses a time-limited OTP (`Otp`) sent via email, not a link
- **Email verification**: Uses a tokenized link (`EmailVerificationToken`) — separate mechanism from the password-reset OTP
- **Publishing**: A `FacilityDetail` is a draft until `is_published` is set (`last_published_at` recorded); benchmarks compare published years
- **No comments by default**: Code should be self-documenting; only add comments for non-obvious WHY
