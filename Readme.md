# GMC / GPA Intimation Dashboard

An admin portal for reviewing and managing "Intimation Form Under GMC / GPA" submissions. Built with React + Vite on the frontend and Node/Express + MongoDB on the backend.

---

## Project structure

```
Intimation Dashboard/
├── admin-table.html          ← Standalone UI preview (no backend needed)
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── requireAdmin.js   ← JWT verification on every admin route
│   ├── models/
│   │   ├── AdminUser.js
│   │   └── Submission.js
│   ├── routes/
│   │   ├── auth.js           ← POST /api/auth/login  /signup
│   │   └── admin.js          ← GET/PATCH /api/admin/submissions
│   ├── server.js
│   ├── .env                  ← Real secrets (gitignored)
│   └── .env.example
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx            ← Auth gate (no external router needed)
        ├── main.jsx
        ├── api/
        │   ├── auth.js
        │   └── submissions.js
        ├── components/
        │   ├── auth/
        │   │   ├── AuthBackground.jsx   ← Animated teal/navy blobs
        │   │   ├── AuthCard.jsx         ← Slide container (login ↔ signup)
        │   │   ├── LoginForm.jsx
        │   │   └── SignupForm.jsx
        │   └── admin/
        │       ├── Badges.jsx
        │       ├── EmptyState.jsx
        │       ├── FilterBar.jsx
        │       ├── Pagination.jsx
        │       ├── SubmissionDetailPanel.jsx
        │       ├── SubmissionRow.jsx
        │       └── SubmissionTable.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   └── useSubmissions.js
        ├── pages/
        │   ├── AuthPage.jsx
        │   └── AdminPage.jsx
        ├── styles/
        │   ├── auth.css
        │   ├── admin.css
        │   └── global.css
        └── utils/
            └── exportCsv.js
```

---

## Quick start

### 1 — Install dependencies

```powershell
# From the repo root
npm run install:all
```

Or individually:

```powershell
cd backend  ; npm install
cd frontend ; npm install
```

### 2 — Configure environment

```powershell
Copy-Item backend\.env.example backend\.env
```

Open `backend\.env` and set a strong `JWT_SECRET`. Do **not** commit this file.

### 3 — Run MongoDB

Make sure a local MongoDB instance is running on the default port (27017), or point `MONGO_URI` at your Atlas connection string.

### 4 — Start the servers

Open two terminals:

```powershell
# Terminal 1 — backend (port 5000)
cd backend
npm run dev

# Terminal 2 — frontend (port 3000)
cd frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.

> The Vite dev server proxies all `/api` requests to `http://localhost:5000`, so no CORS issues during development.

---

## Standalone preview

Open **`admin-table.html`** directly in any browser — no server required. It ships 14 realistic mock records covering all three form types and all four statuses, and supports filtering, search, pagination, row expansion, inline status changes, and CSV export.

---

## API reference

All admin routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/signup` | `{ name, email, password }` → `{ token, user }` |
| `POST` | `/api/auth/login`  | `{ email, password }` → `{ token, user }` |
| `GET`  | `/api/admin/submissions` | `?type=&status=&search=&page=1&pageSize=6` → `{ total, page, pageSize, records, typeCounts }` |
| `PATCH`| `/api/admin/submissions/:id/status` | `{ status }` → `{ record }` |

---

## Database integration

The dashboard reads from the **same MongoDB database** that the Intimation Form submission app writes to.

| Setting | Value |
|---|---|
| Database | `intimation-form` |
| Collection | `submissions` |
| Written by | `c:\Users\Harini\Intimation Form` (form submission app) |
| Read by | This dashboard's backend |

The dashboard's `Submission` model mirrors the flat schema of the form project exactly — same field names, same collection. The only field the dashboard **writes** is `status` (via `PATCH /api/admin/submissions/:id/status`).

### Field mapping — form schema → dashboard display

| Form field | Displayed as |
|---|---|
| `firstName` + `middleName` + `surname` | Employee Name |
| `employeeCode` | Employee Code |
| `formType` (GMC/GPA) + `intimationFor` | Type badge label |
| `patientName` | Patient |
| `relationship` | Relationship |
| `diagnosis`, `treatmentNature`, `admissionDateTime` | Medical Details (GMC) |
| `accidentLocation`, `accidentDescription`, `injuryDescription`, `accidentDateTime`, `firDetails` | Accident Details (GPA) |
| `doctorName`, `hospitalName`, `hospitalAddress`, `pincode` | Hospital Details |

### Type filter mapping

| Dashboard tab | DB query |
|---|---|
| Staff Mediclaim | `formType=GMC` AND `intimationFor IN [Staff, BrillexStaff]` |
| Marketing Mediclaim | `formType=GMC` AND `intimationFor=Marketing` |
| Personal Accident | `formType=GPA` |

---

1. User visits `/` → `App.jsx` checks localStorage for a JWT.
2. If none found → `AuthPage` renders the animated `AuthCard`.
3. The Login and Signup panels share one card container. Switching between them slides the card `translateX` over ~550 ms (instant swap for `prefers-reduced-motion: reduce`).
4. On successful signup the backend returns a JWT and the app **auto-logs in** — no second login step needed.
5. On successful login/signup the token and user object are stored in localStorage and the admin table is shown.
6. "Sign out" clears localStorage and returns to the auth screen.

---

## Key design decisions

- **No external router** — a single boolean `authed` state in `App.jsx` is sufficient for one protected route.
- **Optimistic status updates** — `useSubmissions` applies the new status immediately and rolls back on API failure. A `Set<id>` prevents duplicate in-flight PATCH requests.
- **Debounced search** — 350 ms debounce; the hook fires a new fetch only after the user stops typing.
- **Abort on re-fetch** — each new filter change aborts the previous `fetch` via `AbortController`.
- **JWT never hardcoded** — the secret lives exclusively in `backend/.env` and is read at runtime via `process.env.JWT_SECRET`.
- **bcrypt rounds = 12** — a reasonable default that's slow enough to resist brute-force.

---

## Form types and status values

**Form types**
- Staff Mediclaim
- Marketing Mediclaim
- Personal Accident

**Statuses**
- Pending
- Under review
- Approved
- Rejected
