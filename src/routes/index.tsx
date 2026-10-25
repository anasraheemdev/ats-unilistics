import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ExplorerLayout } from '@/components/layout/ExplorerLayout';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { CounsellorLayout } from '@/components/layout/CounsellorLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingState } from '@/components/common/LoadingState';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types';

// Code-split Public pages
const HomePage = React.lazy(() =>
  import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage }))
);
const ContactPage = React.lazy(() =>
  import('@/pages/public/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const NotFoundPage = React.lazy(() =>
  import('@/pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const SignUpPage = React.lazy(() =>
  import('@/pages/public/SignUpPage').then((m) => ({ default: m.SignUpPage }))
);
const PrivacyPolicyPage = React.lazy(() =>
  import('@/pages/public/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsPage = React.lazy(() =>
  import('@/pages/public/TermsPage').then((m) => ({ default: m.TermsPage }))
);
const SignInPage = React.lazy(() =>
  import('@/pages/public/SignInPage').then((m) => ({ default: m.SignInPage }))
);
const SetPasswordPage = React.lazy(() =>
  import('@/pages/public/SetPasswordPage').then((m) => ({ default: m.SetPasswordPage }))
);
const ForgotPasswordPage = React.lazy(() =>
  import('@/pages/public/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const RequestAccessPage = React.lazy(() =>
  import('@/pages/public/RequestAccessPage').then((m) => ({ default: m.RequestAccessPage }))
);
const RequestStatusPage = React.lazy(() =>
  import('@/pages/public/RequestStatusPage').then((m) => ({ default: m.RequestStatusPage }))
);

// Code-split Discovery & Explorer pages
const UniversitiesDiscoveryPage = React.lazy(() =>
  import('@/pages/discovery/UniversitiesDiscoveryPage').then((m) => ({ default: m.UniversitiesDiscoveryPage }))
);
const UniversityDetailPage = React.lazy(() =>
  import('@/pages/discovery/UniversityDetailPage').then((m) => ({ default: m.UniversityDetailPage }))
);
const ProgramsDiscoveryPage = React.lazy(() =>
  import('@/pages/discovery/ProgramsDiscoveryPage').then((m) => ({ default: m.ProgramsDiscoveryPage }))
);
const ProgramDetailPage = React.lazy(() =>
  import('@/pages/discovery/ProgramDetailPage').then((m) => ({ default: m.ProgramDetailPage }))
);
const ScholarshipsDiscoveryPage = React.lazy(() =>
  import('@/pages/discovery/ScholarshipsDiscoveryPage').then((m) => ({ default: m.ScholarshipsDiscoveryPage }))
);
const ScholarshipDetailPage = React.lazy(() =>
  import('@/pages/discovery/ScholarshipDetailPage').then((m) => ({ default: m.ScholarshipDetailPage }))
);
const SavedDiscoveryPage = React.lazy(() =>
  import('@/pages/discovery/SavedDiscoveryPage').then((m) => ({ default: m.SavedDiscoveryPage }))
);
const HelpCentrePage = React.lazy(() =>
  import('@/pages/help/HelpCentrePage').then((m) => ({ default: m.HelpCentrePage }))
);
const SupportDeskPage = React.lazy(() =>
  import('@/pages/support/SupportDeskPage').then((m) => ({ default: m.SupportDeskPage }))
);
const RequestSupportPage = React.lazy(() =>
  import('@/pages/explorer/RequestSupportPage').then((m) => ({ default: m.RequestSupportPage }))
);
const ExplorerAccountPage = React.lazy(() =>
  import('@/pages/explorer/ExplorerAccountPage').then((m) => ({ default: m.ExplorerAccountPage }))
);

// Code-split Managed Student pages
const StudentOverviewPage = React.lazy(() =>
  import('@/pages/student/StudentOverviewPage').then((m) => ({ default: m.StudentOverviewPage }))
);
const MyApplicationsPage = React.lazy(() =>
  import('@/pages/student/MyApplicationsPage').then((m) => ({ default: m.MyApplicationsPage }))
);
const ApplicationDetailPage = React.lazy(() =>
  import('@/pages/student/ApplicationDetailPage').then((m) => ({ default: m.ApplicationDetailPage }))
);
const StudentDocumentsPage = React.lazy(() =>
  import('@/pages/student/StudentDocumentsPage').then((m) => ({ default: m.StudentDocumentsPage }))
);
const StudentTasksPage = React.lazy(() =>
  import('@/pages/student/StudentTasksPage').then((m) => ({ default: m.StudentTasksPage }))
);
const StudentMessagesPage = React.lazy(() =>
  import('@/pages/student/StudentMessagesPage').then((m) => ({ default: m.StudentMessagesPage }))
);
const StudentJourneyPage = React.lazy(() =>
  import('@/pages/student/StudentJourneyPage').then((m) => ({ default: m.StudentJourneyPage }))
);

// Code-split Staff & Counsellor pages
const StaffDashboardPage = React.lazy(() =>
  import('@/pages/staff/StaffDashboardPage').then((m) => ({ default: m.StaffDashboardPage }))
);
const StaffCasesPage = React.lazy(() =>
  import('@/pages/staff/StaffCasesPage').then((m) => ({ default: m.StaffCasesPage }))
);
const StaffReviewQueuePage = React.lazy(() =>
  import('@/pages/staff/StaffReviewQueuePage').then((m) => ({ default: m.StaffReviewQueuePage }))
);
const StaffCataloguePage = React.lazy(() =>
  import('@/pages/staff/StaffCataloguePage').then((m) => ({ default: m.StaffCataloguePage }))
);
const StaffWorkflowsPage = React.lazy(() =>
  import('@/pages/staff/StaffWorkflowsPage').then((m) => ({ default: m.StaffWorkflowsPage }))
);
const StaffSettingsPage = React.lazy(() =>
  import('@/pages/staff/StaffSettingsPage').then((m) => ({ default: m.StaffSettingsPage }))
);
const StaffHelpEditorialPage = React.lazy(() =>
  import('@/pages/staff/StaffHelpEditorialPage').then((m) => ({ default: m.StaffHelpEditorialPage }))
);

// Code-split Admin pages
const AdminOverviewPage = React.lazy(() =>
  import('@/pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage }))
);

interface AppRoutesProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ currentRole, onRoleChange }) => {
  return (
    <Suspense fallback={<LoadingState message="Loading portal route..." minHeight="50vh" />}>
      <Routes>
        {/* 1. Public Experience (Dedicated Homepage, Contact, Sign In, Sign Up, Legal) - Navbar/Footer Only */}
        <Route element={<PublicLayout currentRole={currentRole} onRoleChange={onRoleChange} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/sign-in" element={<SignInPage onRoleChange={onRoleChange} />} />
          <Route path="/sign-up" element={<SignUpPage onRoleChange={onRoleChange} />} />
          <Route path="/set-password" element={<SetPasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/request-access" element={<RequestAccessPage />} />
          <Route path="/request-status" element={<RequestStatusPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* 2. Explorer Discovery Experience (Catalogue, Programs, Scholarships, Saved, Help) - Navbar/Footer Only */}
        <Route element={<ExplorerLayout currentRole={currentRole} onRoleChange={onRoleChange} />}>
          <Route path="/universities" element={<UniversitiesDiscoveryPage />} />
          <Route path="/universities/:id" element={<UniversityDetailPage />} />
          <Route path="/programs" element={<ProgramsDiscoveryPage />} />
          <Route path="/programs/:id" element={<ProgramDetailPage />} />
          <Route path="/scholarships" element={<ScholarshipsDiscoveryPage />} />
          <Route path="/scholarships/:id" element={<ScholarshipDetailPage />} />
          <Route path="/saved" element={<SavedDiscoveryPage />} />
          <Route path="/request-support" element={<RequestSupportPage />} />
          <Route path="/help" element={<HelpCentrePage currentRole={currentRole} />} />
          <Route path="/support" element={<SupportDeskPage />} />

          {/* Backward compatibility aliases for Explorer paths */}
          <Route path="/explorer" element={<Navigate to="/universities" replace />} />
          <Route path="/explorer/saved" element={<Navigate to="/saved" replace />} />
          <Route path="/explorer/help" element={<Navigate to="/help" replace />} />
          <Route path="/explorer/request-support" element={<Navigate to="/request-support" replace />} />
          <Route path="/explorer/support" element={<Navigate to="/support" replace />} />
          <Route path="/explorer/account" element={<ExplorerAccountPage />} />
        </Route>

        {/* 3. Managed Student Workspace (Protected Boundary: Persistent Sidebar & Dedicated Case Room) */}
        <Route element={<ProtectedRoute currentRole={currentRole} allowedRoles={['managed_student']} onRoleChange={onRoleChange} />}>
          <Route element={<StudentLayout currentRole={currentRole} onRoleChange={onRoleChange} />}>
            <Route path="/student" element={<StudentOverviewPage />} />
            <Route path="/student/journey" element={<StudentJourneyPage />} />
            <Route path="/student/applications" element={<MyApplicationsPage />} />
            <Route path="/student/applications/:id" element={<ApplicationDetailPage />} />
            <Route path="/student/documents" element={<StudentDocumentsPage />} />
            <Route path="/student/tasks" element={<StudentTasksPage />} />
            <Route path="/student/messages" element={<StudentMessagesPage />} />
            <Route path="/student/explore" element={<UniversitiesDiscoveryPage />} />
            <Route path="/student/scholarships" element={<ScholarshipsDiscoveryPage />} />
            <Route path="/student/saved" element={<SavedDiscoveryPage />} />
            <Route path="/student/help" element={<HelpCentrePage currentRole={currentRole} />} />
            <Route path="/student/support" element={<SupportDeskPage />} />
            <Route path="/student/account" element={<ExplorerAccountPage />} />
          </Route>
        </Route>

        {/* 4. Educational Counsellor Workspace (Protected Boundary: Assigned Students Desk) */}
        <Route element={<ProtectedRoute currentRole={currentRole} allowedRoles={['counsellor', 'admin', 'super_admin']} onRoleChange={onRoleChange} />}>
          <Route element={<CounsellorLayout currentRole={currentRole} onRoleChange={onRoleChange} />}>
            <Route path="/staff" element={<StaffDashboardPage />} />
            <Route path="/staff/cases" element={<StaffCasesPage />} />
            <Route path="/staff/cases/:id" element={<StaffCasesPage />} />
            <Route path="/staff/applications" element={<StaffCasesPage />} />
            <Route path="/staff/review-queue" element={<StaffReviewQueuePage />} />
            <Route path="/staff/tasks" element={<StaffDashboardPage />} />
            <Route path="/staff/messages" element={<StaffCasesPage />} />
            <Route path="/staff/workflows" element={<StaffWorkflowsPage />} />
            <Route path="/staff/settings" element={<StaffSettingsPage />} />
            <Route path="/staff/support" element={<SupportDeskPage />} />
          </Route>
        </Route>

        {/* 5. Administrator Operations Dashboard (Protected Boundary: Administrative Control) */}
        <Route element={<ProtectedRoute currentRole={currentRole} allowedRoles={['admin', 'super_admin']} onRoleChange={onRoleChange} />}>
          <Route element={<AdminLayout currentRole={currentRole} onRoleChange={onRoleChange} />}>
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route path="/admin/requests" element={<RequestAccessPage />} />
            <Route path="/admin/students" element={<StaffCasesPage />} />
            <Route path="/admin/applications" element={<StaffCasesPage />} />
            <Route path="/admin/staff-assignments" element={<StaffCasesPage />} />
            <Route path="/admin/review-queue" element={<StaffReviewQueuePage />} />
            <Route path="/admin/tasks" element={<StaffDashboardPage />} />
            <Route path="/admin/messages" element={<StaffCasesPage />} />
            <Route path="/admin/catalogue" element={<StaffCataloguePage />} />
            <Route path="/admin/programs" element={<StaffCataloguePage />} />
            <Route path="/admin/scholarships" element={<StaffCataloguePage />} />
            <Route path="/admin/imports" element={<StaffCataloguePage />} />
            <Route path="/admin/workflows" element={<StaffWorkflowsPage />} />
            <Route path="/admin/editorial" element={<StaffHelpEditorialPage />} />
            <Route path="/admin/notifications" element={<StaffDashboardPage />} />
            <Route path="/admin/audit" element={<StaffDashboardPage />} />
            <Route path="/admin/settings" element={<StaffSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};
