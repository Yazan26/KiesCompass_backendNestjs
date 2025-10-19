CI Secrets needed for GitHub Actions

Add these repository secrets (Settings -> Secrets and variables -> Actions):

- TEST_CONNECTION_STRING
  - Example value: mongodb+srv://user:pass@host:port/dbname
  - Used to run e2e tests in CI.

- JWT_SECRET
  - Example value: some_long_random_secret_string
  - Used by the app to sign JWT tokens in tests.

- JWT_EXPIRES_IN
  - Example value: 15m
  - Matches your local `.env` value.

- APP_URL
  - Example value: http://localhost:3000
  - Used by tests or code expecting APP_URL.

Notes:
- The workflow maps `TEST_CONNECTION_STRING` to `MONGODB_URI` for the app in CI. If you prefer to expose `MONGODB_URI` directly as a secret, you can do that instead (same value).
- Keep secrets private — do not commit real secrets into repository files.
- After adding secrets, trigger your workflow (push or run via Actions -> workflow_dispatch).
