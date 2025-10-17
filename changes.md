# Changes

- Removed the obsolete `src/dao` duplicates and wired modules to reuse the single set of infrastructure DAOs.
- Refined `AuthService`, `VkmService`, and Nest modules to apply DRY helpers, typed responses, and reuse favorite resolution logic without altering behaviour.
- Modernized bootstrap and maintenance scripts, replacing emoji-laden logging, adding structured helpers, and tightening swagger/CORS setup.
- Smoothed utility surfaces such as the JWT adapter signature and recommendation DAO contract for consistent type usage.
