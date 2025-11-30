# AI Usage Log

This document tracks where and how AI tools were used during development of Password Health Tracker.

Summary
-------
- GitHub Copilot (in-editor) was used to speed up code scaffolding for React components and small helper functions.
- ChatGPT (interactive sessions via the assistant) was used extensively for:
  - Designing Flask route handlers and decorators
  - Debugging Dockerfile and docker-compose issues
  - Writing and refining API request/response formats
  - Drafting documentation (README updates, sprint reports)
  - Generating test scripts and troubleshooting authentication flow issues
- Local AI-assisted linting and code completion used while writing components.

Where AI was used (examples)
---------------------------
- `frontend/src/pages/SignUp.js` and `Login.js` — Copilot suggested form state patterns and validation helpers.
- `backend/utils/password_analyzer.py` — ChatGPT helped design a recommendation generator and entropy calculation logic.
- `backend/routes/auth_routes.py` and `backend/utils/auth_helper.py` — ChatGPT recommended security patterns for token handling and error responses.
- `docker-compose.yml` and Dockerfiles — Copilot suggested best-practice ordering and caching layers; ChatGPT helped debug `npm ci` vs `npm install` issues.
- `QUICK_START.md`, `SPRINT1_COMPLETION.md`, `SPRINT1_MVP_READY.md` — ChatGPT assisted drafting and polishing these documents.
- `test_logout_login_flow.sh` — Generated as a runnable script to validate the logout/login fix.

Notes on responsible AI use
--------------------------
- AI outputs were treated as suggestions; all generated code and prose were reviewed and edited by a developer.
- Sensitive secrets (API keys, tokens) were never provided to the AI tools.
- AI was used to accelerate development, not to replace manual review or security checks.

If you want a more detailed per-file AI usage audit, I can generate a line-by-line annotation showing which blocks were AI-assisted.
