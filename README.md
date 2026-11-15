# Garv Arora, portfolio

Spring Boot (Java 21) backend + React/Vite/TypeScript frontend. Neon terminal look, with every visitor shown as a live avatar cursor over WebSockets.

## Run (production-style, one process)
```bash
cd frontend && npm install && npm run build   # writes into backend/src/main/resources/static
cd ../backend && mvn spring-boot:run          # http://localhost:8080
```

## Develop
```bash
cd backend && mvn spring-boot:run   # API + WebSocket on :8080
cd frontend && npm run dev          # Vite on :5173, proxies /api and /live
```

## Edit content
`backend/src/main/resources/data/profile.json` (everything on the page) and `data/resume.pdf`.

## Configuration (env vars)
- `PORTFOLIO_ADMIN_TOKEN`: enables `GET /api/admin/messages` (send as `X-Admin-Token`). Unset means disabled.
- `PORTFOLIO_ALLOWED_ORIGINS`: WebSocket origins, comma separated. Set to your domain when deploying.

Data lives in `backend/data/portfolio.mv.db` (H2 file, git-ignored).

## Structure
- `backend/.../{profile,stats,contact,guestbook,live}`: controller, service, repository per feature. `config/` holds the rate-limit and security-header filters and the global error handler. `live/` uses an observer hub (`LiveRegistry`) and one command class per message type.
- `frontend/src/terminal/commands.ts`: terminal commands as a registry (command pattern). `hooks/useLive.ts` is the WebSocket client, `lib/avatar.ts` the avatar factory.

## Tests
```bash
cd backend && mvn test
```
