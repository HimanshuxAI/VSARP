# VSARP - AI Career Navigator & Student Portfolio

![VSARP Banner](/public/vite.svg) *Note: Add a project banner here*

VSARP (Virtual Student Academic Resource Portal) is a comprehensive, AI-powered platform designed to guide students through their higher education journey. It bridges the gap between academic achievements and career readiness by providing tools for goal setting, skill gap analysis, and portfolio management.

## 🚀 Key Features

### 🎓 Student Portal
- **Career Navigator**: AI-driven career path recommendations based on student interests.
- **Goal Definition Wizard**: Interactive assessment to identify and set concrete career goals.
- **Skill Gap Analysis**: Visualizes the difference between current skills and industry requirements (Mock Implementation).
- **Portfolio Management**: Submit and track co-curricular activities (hackathons, papers, sports).
- **Resume Builder**: (Coming Soon) Auto-generate resumes based on portfolio data.

### 🏫 Faculty Dashboard
- **Activity Review**: Approve or reject student activity submissions.
- **Research Publications**: Manage and publish academic research papers.
- **Student Progress Monitoring**: View aggregate data on student readiness.

### 🛡️ Admin & Security
- **Role-Based Access Control (RBAC)**: Secure access for Students, Faculty, and Admins.
- **Audit Logging**: Comprehensive logs of all critical actions (submissions, approvals, config changes).
- **Configuration**: Manage system categories and settings.

---

## 🛠️ Technology Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Backend (Simulation)**: Uses `localStorage` for a zero-config "Mock Mode" during development.
- **Database (Ready)**: [Supabase](https://supabase.com/) SQL migrations included for production.

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/HimanshuxAI/VSARP.git
    cd VSARP
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:5173`.

### 🔐 Supabase Setup
The app now supports both Supabase-backed mode and local mock mode.

1. Copy [.env.example](/Users/himanshu/Desktop/vs/VSARP/.env.example) to `.env.local`
2. Add your project URL and publishable key
3. Run the SQL file at [schema.sql](/Users/himanshu/Desktop/vs/VSARP/supabase/schema.sql) in the Supabase SQL editor

If no env vars are present, the app falls back to browser `localStorage` for quick demos.

### 🔑 Default Login Credentials
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

## 📂 Project Structure

```bash
VSARP/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components (Buttons, Cards, etc.)
│   ├── context/         # Global State (AuthContext, DataContext)
│   ├── layouts/         # Page layouts (Dashboard, Public)
│   ├── lib/             # Utilities and API services (mock/real)
│   ├── pages/
│   │   ├── auth/        # Login & Register
│   │   ├── student/     # Student-specific pages (Dashboard, Career)
│   │   ├── faculty/     # Faculty pages (Review, Research)
│   │   └── admin/       # Admin pages
│   ├── App.jsx          # Main Routing Logic
│   └── main.jsx         # Entry Point
├── supabase/            # Database Migrations (SQL)
└── README.md            # Project Documentation
```

---

## 🗄️ Database Schema

Run the single schema file at [schema.sql](/Users/himanshu/Desktop/vs/VSARP/supabase/schema.sql) to create the backend structure:

- `users`: Core user profiles (linked to Auth).
- `activities`: Student submissions with status workflow.
- `career_paths`: detailed career options and salaries.
- `skills`: Skill repository for tagging.
- `student_profiles`: Extended profile data for career matching.
- `career_goals`: Links students to their target careers.
- `research_papers`: Faculty publications.

To apply the backend:
1.  Set up a Supabase project.
2.  Copy keys to `.env.local` (see `.env.example`).
3.  Run `supabase/schema.sql` in the Supabase Dashboard SQL Editor.

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
# vsarpp
# vsarpp
