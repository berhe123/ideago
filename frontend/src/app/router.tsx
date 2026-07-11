import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MarketingLayout } from '@/widgets/layout/MarketingLayout';
import { AppShell } from '@/widgets/layout/AppShell';
import { RequireAuth, RequireAdmin } from '@/features/auth/guards';
import { PageLoader } from '@/shared/ui/page-loader';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import NewIdeaPage from '@/pages/idea/NewIdeaPage';
import IdeaPage from '@/pages/idea/IdeaPage';

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const MarketplacePage = lazy(() => import('@/pages/marketplace/MarketplacePage'));
const ExpertPage = lazy(() => import('@/pages/marketplace/ExpertPage'));

const RequestsPage = lazy(() => import('@/pages/marketplace/RequestsPage'));
const ExpertSetupPage = lazy(() => import('@/pages/marketplace/ExpertSetupPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminIdeas = lazy(() => import('@/pages/admin/AdminIdeas'));

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/experts/:id" element={<ExpertPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/ideas/new" element={<NewIdeaPage />} />
            <Route path="/ideas/:id" element={<IdeaPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/expert/setup" element={<ExpertSetupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<RequireAdmin />}>
          <Route element={<AppShell admin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/ideas" element={<AdminIdeas />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
