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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
              <LoginPage />
            </motion.div>
          } />
          <Route path="/register" element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
              <RegisterPage />
            </motion.div>
          } />
          <Route path="/verify/:hash" element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
              <VerificationPage />
            </motion.div>
          } />
          <Route path="/seed" element={<SeedPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Dashboard Layout Routes (Protected) */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="profile" element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
              <Profile />
            </motion.div>
          } />

          {/* Student Routes */}
          <Route path="/student">
            <Route path="dashboard" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <StudentDashboard />
              </motion.div>
            } />
            <Route path="career-navigator" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <CareerNavigator />
              </motion.div>
            } />
            <Route path="career-goals" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <CareerGoalDefinition />
              </motion.div>
            } />
            <Route path="submit" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <SubmitActivity />
              </motion.div>
            } />
            <Route path="resume" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <ResumeBuilder />
              </motion.div>
            } />
          </Route>

          <Route path="/faculty">
            <Route path="review" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <FacultyReview />
              </motion.div>
            } />
            <Route path="publish-research" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <PublishResearch />
              </motion.div>
            } />
          </Route>

          <Route path="/admin">
            <Route path="overview" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <AdminOverview />
              </motion.div>
            } />
            <Route path="approvals" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <UserApprovals />
              </motion.div>
            } />
            <Route path="reports" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <Reports />
              </motion.div>
            } />
            <Route path="audit" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <AuditLogs />
              </motion.div>
            } />
            <Route path="settings" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full h-full">
                <Configuration />
              </motion.div>
            } />
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
