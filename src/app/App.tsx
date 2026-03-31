import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Center, Spinner } from '@chakra-ui/react';
import { WorkspaceShell } from '@/layouts/WorkspaceShell';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { AuthPage } from '@/features/auth/AuthPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { GroupDetailPage } from '@/features/groups/GroupDetailPage';
import { C } from '@/lib/colors';

export function App() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <Center h="100vh" bg={C.canvas}>
        <Spinner size="xl" color="brand.500" thickness="3px" speed="0.8s" />
      </Center>
    );
  }

  return (
    <Routes>
      <Route path="/sign-in/*" element={<AuthPage mode="sign-in" />} />
      <Route path="/sign-up/*" element={<AuthPage mode="sign-up" />} />

      <Route
        element={
          <ProtectedRoute>
            <WorkspaceShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"       element={<DashboardPage />} />
        <Route path="/profile"         element={<ProfilePage />} />
        <Route path="/groups/:groupId" element={<GroupDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
