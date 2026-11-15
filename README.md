# Garv Arora, portfolio

Spring Boot (Java 21) backend + React/Vite/TypeScript frontend. Neon terminal look, with every visitor shown as a live avatar cursor over WebSockets.

## Make it yours
Give Claude your resume and it builds this same site with your content. Install the skill from [`.claude/skills/portfolio-from-resume`](.claude/skills/portfolio-from-resume/README.md).

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

## Deploy (free: Render)
`render.yaml` is a Render Blueprint. In Render: **New, Blueprint**, pick this repo, and apply. Render builds the `Dockerfile` on the free plan and gives you an `https://portfolio-xxxx.onrender.com` address. The free instance sleeps when idle (the first visit then takes about a minute) and has no persistent disk, so guestbook entries and contact messages reset on restart.

## Deploy (Fly.io, paid, keeps data)
The repo ships a `Dockerfile` (builds frontend + backend into one image) and a `fly.toml` for [Fly.io](https://fly.io). Any host that runs Docker, allows WebSockets and offers a persistent volume works the same way.

```bash
# one time
fly auth login
fly launch --no-deploy --copy-config      # accept the existing fly.toml; pick a unique app name
fly volumes create portfolio_data --size 1 --region bom
# edit PORTFOLIO_ALLOWED_ORIGINS in fly.toml to https://<your-app>.fly.dev (or your domain)

# every deploy
fly deploy
fly secrets set PORTFOLIO_ADMIN_TOKEN=<long random string>   # optional: enables GET /api/admin/messages
```
Notes:
- `PORTFOLIO_ALLOWED_ORIGINS` must match the public URL, or the live cursors cannot connect.
- Data (guestbook, contact messages, visit count) lives in the `/data` volume. Without a volume it resets on every deploy.
- Custom domain: `fly certs add yourdomain.com`, then add the DNS records Fly prints, and add the domain to `PORTFOLIO_ALLOWED_ORIGINS` (comma separated).
- Hosts without volumes (for example Render's free tier) lose data on restart; use a paid disk or switch `spring.datasource.url` to Postgres.

## Tests
```bash
cd backend && mvn test
```
