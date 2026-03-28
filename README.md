# IWS Workspace

Monorepo for the IWS project with:

- `frontend/` (React + Vite admin UI)
- `backend/` (Flask API)
- `mobile/` (mobile app workspace)

## Backend tests

Automated backend tests are in `backend/tests` and include:

- role-by-role RBAC smoke matrices (split by domain)
- API fallback behavior checks for `/api/*` unknown endpoints
- endpoint payload/data-validation suites (invalid JSON, malformed ids/dates/months, non-numeric values)

Run locally:

```bash
python -m unittest discover -s backend/tests -p "test_*.py" -v
```

Run only validation suites:

```bash
python -m unittest discover -s backend/tests -p "test_validation_*.py" -v
```

CI:

- GitHub Actions workflow: `.github/workflows/backend-tests.yml`
- Runs two backend jobs on every push and pull request:
  - RBAC + API fallback
  - payload/data-validation suites

## Live RBAC smoke check (real MongoDB)

When you want to run the role-by-role endpoint smoke matrix against a real MongoDB database:

```bash
python backend/tests/run_live_rbac_smoke.py \
  --mongo-uri "$MONGO_URI" \
  --mongo-db-name "$MONGO_DB_NAME" \
  --jwt-secret-key "$JWT_SECRET_KEY"
```

Notes:

- The script always runs in an isolated temporary DB named `<MONGO_DB_NAME>_smoke_<suffix>`.
- The script seeds data and then runs the RBAC matrix from `backend/tests/rbac_cases.py`.
- It also verifies API fallback behavior for unknown `/api/*` routes.
- By default it drops the smoke database at the end; use `--keep-db` if you want to inspect data.
