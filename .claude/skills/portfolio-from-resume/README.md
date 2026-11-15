# portfolio-from-resume (Claude Code skill)

Give Claude your resume and get this same portfolio site, with your content: experience, projects, skills, coding profiles, live avatar cursors, algorithms page and Rubik's cube solver.

## 1. Install the skill once
You need [Claude Code](https://claude.com/claude-code), JDK 21+, Maven 3.9+ and Node 20+. The [GitHub CLI](https://cli.github.com) (`gh auth login`) is optional but lets Claude read your repos' READMEs.

```bash
git clone --depth 1 https://github.com/aspiringgarv/portfolio.git /tmp/portfolio-template
mkdir -p ~/.claude/skills
cp -r /tmp/portfolio-template/.claude/skills/portfolio-from-resume ~/.claude/skills/
```

## 2. Use it from any folder
```bash
mkdir my-site && cd my-site
claude
```
Then tell Claude:

> Create my portfolio from my resume at ~/Downloads/resume.pdf. My GitHub is `<username>`.

(or run `/portfolio-from-resume`). Claude will:
1. Clone the template into a new folder and drop its git history.
2. Read your resume, and your GitHub repos' READMEs if you gave a username.
3. Ask one short question about anything missing (what contact details may be public, which projects to feature).
4. Write `profile.json`, copy your resume PDF, and replace the original author's name and text.
5. Build, run the tests, start the site on http://localhost:8080 and check it in a browser.

## What Claude changes
| File | Why |
| --- | --- |
| `backend/src/main/resources/data/profile.json` | All page content |
| `backend/src/main/resources/data/resume.pdf` | The resume download |
| `frontend/index.html`, `Layout.tsx`, `ProfileController.java`, `ApiTest.java` | Name in title, footer, download filename, test |
| `frontend/src/components/lab/*`, `terminal/commands.ts` | Demo text about the original author's work |
| `frontend/src/components/OwnerAvatar.tsx` | Hero avatar colors |

## Rules the skill follows
- Only facts from your resume, repos, or answers. No invented numbers.
- Roles and tagline must be specific, not slogans.
- Asks before publishing anything. A public repo exposes `profile.json` and your resume PDF.
- Reports what it verified and what it didn't.

## Without Claude
Clone the repo, edit `profile.json` and the files above, then:
```bash
cd frontend && npm install && npm run build
cd ../backend && mvn spring-boot:run
```
