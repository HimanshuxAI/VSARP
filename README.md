# VSARP - AI Career Navigator & Student Portfolio

VSARP (Virtual Student Academic Resource Portal) is a comprehensive AI‑powered platform that guides students through their higher‑education journey. It connects academic achievements with career readiness by offering tools for goal setting, skill‑gap analysis, and portfolio management.

## Key Features

### Student Portal
- **Career Navigator**: AI‑driven career path recommendations based on interests.
- **VSARP Copilot**: AI assistant backed by a server‑side NVIDIA chat completion route, with local fallback for demos.
- **Goal Definition Wizard**: Interactive assessment to identify and set concrete career goals.
- **Skill Gap Analysis**: Visual comparison of current skills against industry requirements (mock implementation).
- **Portfolio Management**: Submit and track co‑curricular activities such as hackathons, papers, and sports.
- **Resume Builder**: (Coming soon) Auto‑generate resumes from portfolio data.

### Faculty Dashboard
- **Activity Review**: Approve or reject student activity submissions.
- **Research Publications**: Manage and publish academic research papers.
- **Student Progress Monitoring**: View aggregate data on student readiness.

### Admin & Security
- **Role‑Based Access Control (RBAC)**: Secure access for Students, Faculty, and Admins.
- **Audit Logging**: Comprehensive logs of critical actions (submissions, approvals, config changes).
- **Configuration**: Manage system categories and settings.

---

## Technology Stack

- **Frontend**: React with Vite
- **Styling**: Tailwind CSS + Radix UI
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Backend (Simulation)**: Uses `localStorage` for a zero‑config mock mode during development.
- **Database (Ready)**: Supabase SQL migrations are included for production.

---

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/HimanshuxAI/VSARP.git
   cd VSARP
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Run the development server
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

### Supabase Setup
1. Copy `.env.example` to `.env.local`.
2. Add your Supabase project URL and public anon key.
3. Add `NVIDIA_API_KEY` to `.env.local` for the AI assistant route.
4. The assistant posts to `/api/ai-assistant`, which keeps the NVIDIA key on the server side.
5. Run the SQL file at `supabase/schema.sql` in the Supabase SQL editor.

If no environment variables are present, the app falls back to browser `localStorage` for quick demos. Mock mode auto‑seeds ten Computer Science students with approved activities and aptitude attempts.

### Default Login Credentials
Use these credentials to test different roles:

**Student**
- Email: `student@test.com`
- Password: `password123`

**Faculty**
- Email: `faculty@test.com`
- Password: `password123`

**Admin**
- Email: `admin@test.com`
- Password: `password123`

---

## Project Structure
```
VSARP/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components (Buttons, Cards, etc.)
│   ├── context/         # Global State (AuthContext, DataContext)
│   ├── layouts/         # Page layouts (Dashboard, Public)
│   ├── lib/             # Utilities and API services (mock/real)
│   ├── pages/
│   │   ├── auth/        # Login & Register
│   │   ├── student/     # Student‑specific pages (Dashboard, Career)
│   │   ├── faculty/     # Faculty pages (Review, Research)
│   │   └── admin/       # Admin pages
│   ├── App.jsx          # Main Routing Logic
│   └── main.jsx         # Entry Point
├── supabase/            # Database Migrations (SQL)
└── README.md            # Project Documentation
```
---

## Database Schema
Run the single schema file at `supabase/schema.sql` to create the backend structure:
- `users`: Core user profiles (linked to Auth).
- `activities`: Student submissions with status workflow.
- `career_paths`: Detailed career options and salaries.
- `skills`: Skill repository for tagging.
- `student_profiles`: Extended profile data for career matching.
- `career_goals`: Links students to their target careers.
- `research_papers`: Faculty publications.

To apply the backend:
1. Set up a Supabase project.
2. Copy keys to `.env.local` (see `.env.example`).
3. Run `supabase/schema.sql` in the Supabase Dashboard SQL Editor.

---

## Contributing

- Added ARIA labels for better accessibility
- Added Jest test for cn utility function
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

---

## License

This project is licensed under the MIT License – see the LICENSE file for details.
