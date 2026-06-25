# 🚀 Freelancer Task Manager Pro

Premium SaaS-style Client & Project Management Dashboard for Freelancers, Digital Marketers & Web Developers.

---

## ✨ Features

- 🔐 JWT Authentication (Supabase Auth)
- 📊 Real-time Dashboard with Charts
- 👥 Full Client Management (CRUD)
- ✅ Task & Reminder System
- 🔔 Browser Push Notifications + Sound Alerts + In-App Popups
- 📅 Calendar View (Monthly/Weekly/Daily)
- 📈 Reports with PDF & Excel Export
- 🌙 Dark / Light Mode
- 📱 Fully Responsive (Mobile-first)
- ⚡ Fast loading with Code Splitting

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS + Framer Motion |
| State | Zustand + React Query |
| Backend | Supabase (Auth + Database) |
| Charts | Recharts |
| Forms | React Hook Form |
| Notifications | Web Push API + Service Worker |
| Export | jsPDF + SheetJS |

---

## 📦 STEP 1 — Install Prerequisites

Make sure you have:
- **Node.js** v18 or higher → https://nodejs.org
- **npm** v9 or higher (comes with Node)

Check versions:
```bash
node --version   # Should show v18+
npm --version    # Should show v9+
```

---

## 🗄️ STEP 2 — Set Up Supabase (Free)

1. Go to **https://supabase.com** → Sign up free
2. Click **"New Project"**
3. Enter Project Name: `freelancer-task-manager`
4. Set a strong database password (save it!)
5. Choose a region close to you (e.g., Singapore for India)
6. Click **"Create new project"** — wait 2 minutes

### Run Database Schema

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `src/lib/supabase.js` in this project
4. Copy all SQL from the big comment block (lines starting with `--`)
5. Paste into Supabase SQL Editor
6. Click **"Run"** (Ctrl+Enter)

### Get Your API Keys

1. Go to **Settings → API** in Supabase
2. Copy:
   - **Project URL** (looks like: `https://xxxx.supabase.co`)
   - **anon / public key** (long string starting with `eyJ...`)

---

## ⚙️ STEP 3 — Configure Environment

1. In the project folder, copy the example env file:
```bash
cp .env.example .env
```

2. Open `.env` file and fill in your Supabase values:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📥 STEP 4 — Install Dependencies

Open terminal in the project folder and run:
```bash
npm install
```

This installs all packages. Takes 1-2 minutes.

---

## 🏃 STEP 5 — Run Development Server

```bash
npm run dev
```

App opens at: **http://localhost:5173**

---

## 🔔 STEP 6 — Enable Notifications

When the app opens:
1. Click **Settings** in sidebar
2. Go to **Notifications** tab
3. Click **"Enable"** button
4. Allow browser permission when asked

---

## 🚀 DEPLOY TO VERCEL (Recommended — Free)

### Option A: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build the project
npm run build

# 3. Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: freelancer-task-manager
# - Directory: ./
# - Override settings? N
```

After deploy, add environment variables in Vercel:
1. Go to https://vercel.com → Your Project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = your supabase url
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Redeploy: `vercel --prod`

### Option B: Deploy via GitHub + Vercel (Easiest)

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/freelancer-task-manager.git
git push -u origin main
```

2. Go to https://vercel.com → Import Project → Select your GitHub repo
3. Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
4. Click Deploy → Done! 🎉

---

## 🌐 DEPLOY TO HOSTINGER

### Step 1: Build
```bash
npm run build
```
This creates a `dist/` folder.

### Step 2: Upload to Hostinger
1. Log in to Hostinger hPanel
2. Go to **Files → File Manager**
3. Navigate to `public_html/`
4. Delete existing files (index.html etc.)
5. Upload ALL files from your `dist/` folder
6. Also upload `dist/sw.js` to root

### Step 3: Fix Routing (Important!)
Create a `.htaccess` file in `public_html/`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### Step 4: Add Environment Variables
Since Hostinger is static hosting, env vars are baked at build time.
Before running `npm run build`, set your `.env` file with real values.

---

## 📱 Mobile App-Like Experience

The app is a PWA (Progressive Web App):

**On Android Chrome:**
- Open the app URL
- Tap ⋮ menu → "Add to Home Screen"
- App icon appears on home screen!

**On iPhone Safari:**
- Open the app URL
- Tap Share → "Add to Home Screen"

---

## 🔑 First Time Use

1. Open the app
2. Click **"Create one free"** on login page
3. Register with your email & password
4. Check email for confirmation link (if Supabase email confirmation is ON)
5. Login and start adding clients!

---

## 📁 Project Structure

```
freelancer-task-manager/
├── public/
│   ├── sw.js              # Service Worker
│   └── manifest.json      # PWA Manifest
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.jsx     # Sidebar + Header
│   │   ├── notifications/
│   │   │   └── NotificationPopup.jsx
│   │   └── ui/
│   │       ├── LoadingScreen.jsx
│   │       ├── AddQuickModal.jsx
│   │       └── GlobalSearch.jsx
│   ├── lib/
│   │   ├── supabase.js    # Supabase client + Schema SQL
│   │   └── api.js         # All API functions
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ClientsPage.jsx
│   │   ├── ClientProfilePage.jsx
│   │   ├── TasksPage.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── NotificationsPage.jsx
│   │   └── SettingsPage.jsx
│   ├── store/
│   │   ├── authStore.js   # Auth state (Zustand)
│   │   └── appStore.js    # UI state (Zustand)
│   ├── utils/
│   │   └── notifications.js  # Reminder logic
│   ├── App.jsx            # Routes
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

---

## 🔧 Common Issues

### "Invalid API key" error
→ Check your `.env` file has correct Supabase URL and anon key

### Notifications not working
→ Allow browser notifications in Settings → enable them in the app

### Calendar not showing
→ Run `npm install` again, the react-big-calendar package needs CSS

### Build fails
→ Make sure Node.js v18+ is installed: `node --version`

---

## 💡 Pro Tips

1. **Test Reminders**: In Tasks page, hover any task → click 🔔 icon to test reminder instantly
2. **Quick Add**: Click the floating **+** button (bottom right) to quickly add clients/tasks
3. **Global Search**: Press **Cmd+K** or click the search bar to search everything
4. **Export Reports**: Go to Reports → click PDF or Excel button for client reports
5. **Dark/Light Mode**: Click sun/moon icon in top bar

---

## 📞 Support

Built with ❤️ for Freelancers, Digital Marketers & Web Developers.

For issues, check:
- Supabase docs: https://supabase.com/docs
- React Query docs: https://tanstack.com/query
- Tailwind CSS: https://tailwindcss.com/docs
