---
name: portfolio-from-resume
description: Build a personal portfolio website from a resume. Use when the user gives a resume (PDF or text) and wants a portfolio site, or says "make me the same portfolio", "create my portfolio from my resume", or asks to customise the Garv Arora portfolio template (Spring Boot + React, live avatar cursors, algorithms page, Rubik's cube solver) with their own details.
---

# Portfolio from a resume

Goal: the user gives you their resume, and you produce a running copy of this portfolio site with their content. Work from the resume first and ask as little as possible. Never invent facts: every claim and number must come from their resume, repos, or answers.

## 0. Get the template
- If the current folder already contains `backend/`, `frontend/` and `backend/src/main/resources/data/profile.json`, you are inside the template. Use it.
- Otherwise clone it into a new folder and work there:
  ```bash
  gh repo clone aspiringgarv/portfolio <their-name>-portfolio   # or: git clone https://github.com/aspiringgarv/portfolio.git
  cd <their-name>-portfolio && rm -rf .git                      # their copy gets its own history
  ```
  Check prerequisites first: `java -version` (21+), `mvn -v`, `node -v` (20+). Tell the user what is missing instead of failing halfway.

## 1. Read the resume
Read the file the user gave (PDF with the Read tool; DOCX or pasted text as given). Extract: name, contact details, education, experience (company, roles, dates, bullets), projects (name, stack, bullets, links), skills, coding profiles and ratings, achievements, positions of responsibility.

## 2. Enrich from GitHub (if they give a username or the resume links repos)
For each featured project: `gh api repos/<owner>/<repo>/readme -H "Accept: application/vnd.github.raw"`. Use it to write accurate project descriptions and to find a project page URL. Do not claim anything the README or resume does not support.

## 3. Ask only what is missing, in one message
- Which contact details may be public (email, phone, resume download). Warn that a public repo exposes everything in `profile.json` and `resume.pdf`; the phone is hidden behind a "reveal" click on the page but is still in the JSON.
- Which projects to feature if the resume lists many.
- Handles for LeetCode, Codeforces, AtCoder, LinkedIn if the resume lacks them.

## 4. Write the content
1. Copy the resume to `backend/src/main/resources/data/resume.pdf`.
2. Rewrite `backend/src/main/resources/data/profile.json` with the same shape:
   `name, handle, title, roles[], tagline, about, email, phone, links{github,linkedin,leetcode,codeforces,atcoder}, stats[{value,label,note}], experience[{company, roles[{title,period}], points[]}], projects[{title,subtitle,stack[],points[],links[{label,url}]}], skills{group:[...]}, achievements[], leadership[{title,org,period,text}], education[{school,degree,period,grade}], profiles[{id,name,handle,url,note}]`.
   - `profiles[].id` must be one of `github, leetcode, codeforces, atcoder, linkedin` (icons in `frontend/src/components/Icons.tsx`).
   - `roles` rotate in the hero and `tagline` sits under the name: both must say precisely what the person does (technology plus purpose), never slogans like "builder" or "ninja".
   - `stats` are four headline numbers taken from the resume (ratings, ranks, CGPA). Skip any you cannot source.
3. Replace the original author's text everywhere (find it with `grep -rn "Garv\|LumberFi\|GoPay\|aspiringgarv" frontend/src frontend/index.html backend/src README.md`):
   - `frontend/index.html` title and description; `components/Layout.tsx` footer name; `ProfileController.java` download filename; `ApiTest.java` name assertion; `README.md` title.
   - `components/lab/PipelineLab.tsx`, `PaymentLab.tsx`, `PaymentLab.java`, `terminal/commands.ts` describe the author's own work (LumberFi pipelines, GoPay). Rewrite the intro paragraphs to match the user's experience, or remove those demos from `components/lab/Lab.tsx` if they have nothing similar. Never leave someone else's claims on their site.
   - `components/OwnerAvatar.tsx`: hair, skin and hoodie colors so the hero avatar resembles them (ask for hair and skin tone only if they care).
4. Leave the algorithms page, cube solver, tricks and visitor avatars as they are; they are generic.

## 5. Build, test, run
```bash
cd frontend && npm install && npm run build      # builds into backend/src/main/resources/static
cd ../backend && mvn test && mvn spring-boot:run # http://localhost:8080
```
Open the site and check: hero text, experience and project content against the resume, every link, terminal commands (`help`, `projects`, `contact`), contact form, guestbook, `/algorithms`, `/cube` (scramble then solve), resume download. Fix problems before reporting. State plainly what you did not check.

## 6. Hand over
Tell the user: where the folder is, how to start it again (`cd backend && mvn spring-boot:run`), and where to edit content later (`profile.json`). Offer, but do not do unprompted: publishing to GitHub (`gh repo create <name> --public --source . --push`, confirm visibility first), and deploying (`mvn package`, `java -jar backend/target/portfolio-1.0.0.jar`, with `PORTFOLIO_ALLOWED_ORIGINS` set to their domain and optionally `PORTFOLIO_ADMIN_TOKEN` to read contact messages at `GET /api/admin/messages` with header `X-Admin-Token`).
