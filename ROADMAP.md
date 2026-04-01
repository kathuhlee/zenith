# ============================================================
# PRODUCT REQUIREMENTS DOCUMENT
# Zenith — Focus & Triathlon Training Tracker
# Version 2.0
# ============================================================


# ============================================================
# 1. PRODUCT OVERVIEW
# ============================================================

Product Name: Zenith
Tagline: Train your mind. Train your body. Track both.

What it is:
A personal productivity and triathlon training app that tracks
deep work sessions alongside swim/bike/run training. Built for
athletes who treat their career development the same way they
treat race preparation — with intention, data, and consistency.

Who it's for:
You. A software engineer in active job search mode and is training
for a triathlon. The app reflects the real parallel between athletic
training and skill building — both require progressive overload,
recovery, and tracking.


# ============================================================
# 2. CURRENT STATE (V1 — what's already built)
# ============================================================

BACKEND (Node/Express/PostgreSQL on Railway):

  Auth:
  - POST /auth/register  — bcrypt hashed password, returns JWT
  - POST /auth/login     — validates credentials, returns JWT
  - middleware/auth.js   — JWT verification on protected routes

  Sessions:
  - GET    /sessions     — fetch all sessions for logged-in user
  - POST   /sessions     — log a new focus session
  - DELETE /sessions/:id — delete own session

  Database tables:
  - users    (id, email, password_hash, created_at)
  - sessions (id, user_id, task, duration, focus_score, notes, created_at)

FRONTEND (React/Vite on Vercel):

  Pages:
  - Login.jsx     — register + login with tab toggle
  - Dashboard.jsx — main shell with stats bar + tab navigation

  Components:
  - LogSession.jsx   — form to log a focus session
  - SessionList.jsx  — history list with delete
  - StatsChart.jsx   — bar charts (daily minutes + avg focus score)

  Infrastructure:
  - axios.js         — base URL config + JWT interceptor
  - CSS Modules      — scoped styles throughout
  - localStorage     — token persistence across refreshes


# ============================================================
# 3. V2 FEATURE ROADMAP
# ============================================================

Priority tiers:
  P0 = must have for V2 launch
  P1 = high value, build after P0
  P2 = nice to have, future iteration


# ============================================================
# 3A. TRIATHLON TRAINING TRACKER (P0)
# ============================================================

FEATURE: Log a training workout

  What it does:
  User logs a swim, bike, or run workout with key metrics
  per discipline. Each discipline has different relevant fields.

  Fields per discipline:

    SWIM
    - discipline: "swim"
    - distance (yards or meters)
    - duration (minutes)
    - stroke type (freestyle, backstroke, etc — optional)
    - perceived effort (1-10)
    - notes (optional)

    BIKE
    - discipline: "bike"
    - distance (miles or km)
    - duration (minutes)
    - elevation gain (feet — optional)
    - perceived effort (1-10)
    - notes (optional)

    RUN
    - discipline: "run"
    - distance (miles or km)
    - duration (minutes)
    - perceived effort (1-10)
    - notes (optional)

  Calculated fields (derived, not stored):
    - pace (duration / distance) — shown in display, not saved
    - weekly volume per discipline

  New database table:
    CREATE TABLE workouts (
      id               SERIAL PRIMARY KEY,
      user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
      discipline       TEXT NOT NULL,        -- "swim" | "bike" | "run"
      distance         DECIMAL,
      distance_unit    TEXT,                 -- "miles" | "km" | "yards" | "meters"
      duration         INTEGER NOT NULL,     -- minutes
      elevation_gain   INTEGER,              -- feet, optional
      stroke_type      TEXT,                 -- swim only, optional
      perceived_effort INTEGER NOT NULL,     -- 1-10
      workout_date     DATE DEFAULT NOW(),   -- allow backdating
      notes            TEXT,
      created_at       TIMESTAMP DEFAULT NOW()
    );

  New API routes:
    GET    /workouts           — fetch all workouts for user
    POST   /workouts           — log a new workout
    DELETE /workouts/:id       — delete a workout
    GET    /workouts/stats     — aggregate stats (weekly volume etc)

---

FEATURE: Training dashboard

  What it shows:
  - Weekly volume summary: total swim yards, bike miles, run miles
  - This week vs last week comparison per discipline
  - Streak counter — consecutive days with at least one workout
  - Upcoming race countdown (if race date is set in profile)

---

FEATURE: Discipline-specific stats charts

  Swim chart:
  - Weekly yardage bar chart (last 8 weeks)

  Bike chart:
  - Weekly mileage bar chart (last 8 weeks)

  Run chart:
  - Weekly mileage bar chart (last 8 weeks)

  Combined chart:
  - Total training hours per week across all disciplines


# ============================================================
# 3B. TRAINING PLAN BUILDER (P0)
# ============================================================

FEATURE: Create a training plan

  What it does:
  User sets a race date and target race type. App generates
  a simple weekly training plan with suggested workout volumes
  per discipline based on weeks until race.

  Race types:
  - Sprint triathlon   (750m swim / 20km bike / 5km run)
  - Olympic triathlon  (1.5km swim / 40km bike / 10km run)
  - 70.3 Half Ironman  (1.9km swim / 90km bike / 21.1km run)
  - Ironman            (3.8km swim / 180km bike / 42.2km run)

  Plan phases (based on weeks to race):
  - Base building    (12+ weeks out) — low intensity, high volume
  - Build phase      (8-12 weeks out) — increase intensity
  - Peak phase       (4-8 weeks out)  — race-specific workouts
  - Taper            (1-3 weeks out)  — reduce volume, maintain intensity
  - Race week        (race week)      — very light, stay fresh

  New database tables:
    CREATE TABLE training_plans (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
      race_name   TEXT NOT NULL,
      race_type   TEXT NOT NULL,
      race_date   DATE NOT NULL,
      created_at  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE planned_workouts (
      id          SERIAL PRIMARY KEY,
      plan_id     INTEGER REFERENCES training_plans(id) ON DELETE CASCADE,
      week_number INTEGER NOT NULL,
      discipline  TEXT NOT NULL,
      target_distance DECIMAL,
      distance_unit   TEXT,
      target_duration INTEGER,    -- minutes
      workout_type    TEXT,       -- "easy" | "tempo" | "long" | "brick"
      notes           TEXT
    );

  New API routes:
    GET    /plans              — fetch user's training plans
    POST   /plans              — create a new plan
    GET    /plans/:id          — get plan with all planned workouts
    DELETE /plans/:id          — delete a plan


---

FEATURE: Plan vs actual comparison

  What it does:
  Shows planned workout targets alongside what was actually logged.
  Simple visual — green if hit target, yellow if close, red if missed.


# ============================================================
# 3C. FOCUS SESSION UPGRADES (P1)
# ============================================================

FEATURE: Session categories

  Add a category field to sessions:
  - Job search (applying, networking)
  - Coding (building, debugging)
  - Learning (courses, reading, study)
  - Interview prep (LeetCode, mock interviews)

  This makes your focus data more meaningful — you can see
  how your time is actually distributed across job search activities.

  Schema change:
  ALTER TABLE sessions ADD COLUMN category TEXT;

  New chart: Time by category — donut or pie chart showing
  how your deep work hours break down across categories.

---

FEATURE: Edit a session

  Currently you can only delete. Add edit functionality so
  you can correct a session after logging it.

  New API route:
  PUT /sessions/:id — update task, duration, focus_score, notes, category

---

FEATURE: Session streak

  Track consecutive days with at least one focus session.
  Show streak on dashboard header — "🔥 7 day streak"
  Motivating and adds gamification without being gimmicky.


# ============================================================
# 3D. DASHBOARD UPGRADES (P1)
# ============================================================

FEATURE: Unified weekly overview

  Top-level view that shows both focus work and training
  in a single weekly calendar grid.

  Each day shows:
  - Focus sessions logged (total minutes)
  - Workouts completed (swim/bike/run icons with distance)
  - Color coded: green = both done, blue = workout only,
    purple = focus only, gray = rest day

  This is the flagship feature of V2 — the thing that makes
  Zenith different from any generic tracker.

---

FEATURE: Profile page

  Simple settings page where user can set:
  - Display name
  - Preferred distance units (miles vs km, yards vs meters)
  - Upcoming race name and date (drives countdown + plan)

  Schema change:
  ALTER TABLE users ADD COLUMN display_name TEXT;
  ALTER TABLE users ADD COLUMN distance_unit TEXT DEFAULT 'miles';
  ALTER TABLE users ADD COLUMN race_date DATE;
  ALTER TABLE users ADD COLUMN race_name TEXT;


# ============================================================
# 3E. UI/UX UPGRADES (P1)
# ============================================================

FEATURE: Triathlon-themed design system

  Update color palette to reflect the sport:
  - Swim: ocean blue (#0ea5e9)
  - Bike: energetic orange (#f97316)
  - Run: forest green (#22c55e)
  - Focus work: deep purple (#6366f1) — existing accent

  Each discipline consistently uses its color throughout
  — in forms, charts, history cards, and plan views.

---

FEATURE: Mobile responsive layout

  Current layout works on desktop. Add responsive breakpoints
  so it works on phone — important for logging workouts
  immediately after a training session.

---

FEATURE: Empty states with personality

  Instead of "No sessions yet" show contextual messages:
  - No workouts: "Your first brick workout is waiting. Log it."
  - No focus sessions: "Deep work builds careers. Start a session."
  - No plan: "Race day is closer than you think. Build a plan."


# ============================================================
# 4. TECHNICAL ARCHITECTURE ADDITIONS
# ============================================================

NEW FILES NEEDED:

  server/routes/
  ├── workouts.js        ← new
  └── plans.js           ← new

  client/src/components/
  ├── LogWorkout.jsx     ← new (discipline-aware form)
  ├── WorkoutList.jsx    ← new
  ├── TrainingChart.jsx  ← new (recharts, per discipline)
  ├── WeeklyOverview.jsx ← new (unified calendar grid)
  └── RaceCountdown.jsx  ← new

  client/src/pages/
  ├── Training.jsx       ← new page
  └── Plans.jsx          ← new page

  client/src/hooks/
  ├── useSessions.js     ← extract session logic from Dashboard
  └── useWorkouts.js     ← workout data fetching + state

NEW DATABASE TABLES:
  workouts
  training_plans
  planned_workouts

SCHEMA CHANGES TO EXISTING TABLES:
  sessions: ADD COLUMN category TEXT
  users:    ADD COLUMN display_name, distance_unit, race_date, race_name


# ============================================================
# 5. BUILD ORDER
# ============================================================

Phase 1 — Database + Backend (do this first, test with Postman)
  1. Add workouts table to setup.sql
  2. Add training_plans + planned_workouts tables
  3. Alter sessions table (add category)
  4. Alter users table (add profile fields)
  5. Build routes/workouts.js (GET, POST, DELETE)
  6. Build routes/plans.js (GET, POST, DELETE)
  7. Test all new routes in Postman before touching frontend

Phase 2 — Frontend Core
  8. Add category field to LogSession form
  9. Build LogWorkout component (discipline switcher)
  10. Build WorkoutList component
  11. Build Training page (LogWorkout + WorkoutList)
  12. Update Dashboard stats bar to include training data

Phase 3 — Charts + Plans
  13. Build TrainingChart (per discipline bar charts)
  14. Build Plans page (race setup + plan generator)
  15. Build WeeklyOverview (unified calendar grid)

Phase 4 — Polish
  16. Update design system with triathlon colors
  17. Add mobile responsive styles
  18. Add empty states with personality
  19. Add session categories chart (donut)
  20. Update README with new features + screenshots
