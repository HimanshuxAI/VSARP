import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AnimatePresence, motion } from 'framer-motion';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import StudentDashboard from './pages/student/Dashboard';
import SubmitActivity from './pages/student/SubmitActivity';
import AcademicActivity from './pages/student/AcademicActivity';
import SemesterResults from './pages/student/SemesterResults';
import PlacementHub from './pages/student/PlacementHub';
import FacultyReview from './pages/faculty/Review';
import PublishResearch from './pages/faculty/PublishResearch';
import AdminOverview from './pages/admin/Overview';
import UserApprovals from './pages/admin/UserApprovals';
import VerificationPage from './pages/public/VerificationPage';
import SeedPage from './pages/public/SeedPage';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';
import Configuration from './pages/admin/Configuration';
import Profile from './pages/common/Profile';

import CareerNavigator from './pages/student/CareerNavigator';
import CareerGoalDefinition from './pages/student/CareerGoalDefinition';
import ResumeBuilder from './pages/student/ResumeBuilder';
import Portfolio from './pages/public/Portfolio';
import PlacementDashboard from './pages/admin/PlacementDashboard';
import StudentFilter from './pages/admin/StudentFilter';

// HOD Pages
import DepartmentDashboard from './pages/hod/DepartmentDashboard';
import AccreditationReports from './pages/hod/AccreditationReports';
import FacultyMonitoring from './pages/hod/FacultyMonitoring';

// Placement Cell Pages
import PlacementDrives from './pages/placement/PlacementDrives';
import PlacementStudentFilter from './pages/placement/PlacementStudentFilter';

// Transition Variants
const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.02 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

const MotionDiv = motion.div;

const P = ({ children }) => (
  <MotionDiv initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
    {children}
  </MotionDiv>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<P><LoginPage /></P>} />
          <Route path="/register" element={<P><RegisterPage /></P>} />
          <Route path="/verify/:hash" element={<P><VerificationPage /></P>} />
          <Route path="/seed" element={<SeedPage />} />
          <Route path="/portfolio/:studentId" element={<Portfolio />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Dashboard Layout Routes (Protected) */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="profile" element={<P><Profile /></P>} />

          {/* Student Routes */}
            <Route path="/student">
            <Route path="dashboard" element={<P><StudentDashboard /></P>} />
            <Route path="academics" element={<P><AcademicActivity /></P>} />
            <Route path="results" element={<P><SemesterResults /></P>} />
            <Route path="placements" element={<P><PlacementHub /></P>} />
            <Route path="career-navigator" element={<P><CareerNavigator /></P>} />
            <Route path="career-goals" element={<P><CareerGoalDefinition /></P>} />
            <Route path="submit" element={<P><SubmitActivity /></P>} />
            <Route path="resume" element={<P><ResumeBuilder /></P>} />
          </Route>

          {/* Faculty Routes */}
          <Route path="/faculty">
            <Route path="review" element={<P><FacultyReview /></P>} />
            <Route path="publish-research" element={<P><PublishResearch /></P>} />
          </Route>

          {/* HOD Routes */}
          <Route path="/hod">
            <Route path="dashboard" element={<P><DepartmentDashboard /></P>} />
            <Route path="accreditation" element={<P><AccreditationReports /></P>} />
            <Route path="faculty-monitoring" element={<P><FacultyMonitoring /></P>} />
          </Route>

          {/* Placement Cell Routes */}
          <Route path="/placement">
            <Route path="drives" element={<P><PlacementDrives /></P>} />
            <Route path="filter" element={<P><PlacementStudentFilter /></P>} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin">
            <Route path="overview" element={<P><AdminOverview /></P>} />
            <Route path="approvals" element={<P><UserApprovals /></P>} />
            <Route path="reports" element={<P><Reports /></P>} />
            <Route path="audit" element={<P><AuditLogs /></P>} />
            <Route path="settings" element={<P><Configuration /></P>} />
            <Route path="placement" element={<P><PlacementDashboard /></P>} />
            <Route path="shortlist" element={<P><StudentFilter /></P>} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AnimatedRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
