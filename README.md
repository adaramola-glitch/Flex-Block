# Flex Block

A scheduling app for Da Vinci Schools' Flex Block, replacing Edficiency and
SmartPass. Teachers post sessions, students browse and book their own spot,
and admins have full oversight — including assigning students into required
sessions and pulling attendance reports.

## What it does

- **Students** see what's happening during Flex each day and book themselves
  into a session (one per day). They can cancel and pick something else.
- **Teachers** post sessions (title, room, time, capacity), see who's
  booked, and mark attendance.
- **Admins** see every session across the school, can create sessions for
  any teacher, force-assign a specific student into a session (e.g. a
  required intervention), manage everyone's role, and download an
  attendance CSV for any date range.

Sign-in is done with your school's Google account (Google Workspace SSO), so
there are no separate passwords to manage.

## Running it locally

You'll need [Node.js](https://nodejs.org) 20 or newer installed.

```bash
npm install
cp .env.example .env
npm run setup   # creates the local database and adds a few sample sessions
npm run dev
```

Then open <http://localhost:3000>.

The database is a single file (`prisma/dev.db`) — there's no separate
database server to install or run.

### Signing in without Google set up yet

Until you add Google credentials (see below), the login page shows a
"Dev sign-in" box where you can type any `@davincischools.org` email and
sign in as that person for testing. The sample accounts created by
`npm run setup` are:

| Email | Role |
| --- | --- |
| `adaramola@davincischools.org` | Admin |
| `teacher@davincischools.org` | Teacher |
| `student1@davincischools.org` (through `student6@…`) | Student |

Once real Google credentials are added to `.env`, the dev sign-in box
disappears automatically and everyone signs in with their real school
account instead.

## Setting up real Google sign-in

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth Client ID (type: Web application).
3. Add an authorized redirect URI: `https://your-app-domain.com/api/auth/callback/google`
   (use `http://localhost:3000/api/auth/callback/google` while testing locally).
4. Copy the Client ID and Client Secret into `.env`:
   ```
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```
5. Generate a session secret and add it too: `openssl rand -base64 32` → `AUTH_SECRET`.
6. Restart the app.

## Who gets which role

- `ALLOWED_EMAIL_DOMAIN` in `.env` restricts sign-in to your school's Google
  domain (defaults to `davincischools.org`).
- `ADMIN_EMAILS` is a comma-separated list of emails that always get the
  Admin role — put your own email here so you're never locked out.
- `TEACHER_EMAILS` (optional) does the same for teachers.
- Everyone else who signs in for the first time gets the Student role. An
  admin can change anyone's role afterwards from **Admin → People**.

## Everyday admin commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app for local use/testing |
| `npm run build` && `npm start` | Build and run the production version |
| `npm run db:studio` | Open a visual browser for the database |
| `npm run db:seed` | Re-add the sample sessions (safe to run again) |
| `npm run db:reset` | ⚠️ Wipes the local database and starts over |

## Deploying

This is a standard Next.js app, so it can be deployed anywhere Next.js runs
(Vercel, Render, Railway, a school-managed server, etc.). Before your first
deploy:

1. Set the environment variables from `.env.example` on your hosting
   provider (use a strong, randomly generated `AUTH_SECRET`).
2. Point `DATABASE_URL` at a persistent file location (or swap in a
   different database later — the data model doesn't rely on anything
   SQLite-specific).
3. Run `npm run setup` once against the production database (or just
   `prisma migrate deploy` if you don't want the sample data).

## Project layout

```
prisma/schema.prisma      the data model (users, sessions, bookings, attendance)
prisma/seed.ts            sample data for trying the app out
src/lib/auth.ts           sign-in configuration (Google + dev sign-in)
src/actions/              server-side logic (create a session, book, cancel, mark attendance, change roles)
src/app/student/          student-facing pages
src/app/teacher/          teacher-facing pages
src/app/admin/            admin-facing pages
```
