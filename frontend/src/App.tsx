import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/admin/Students';
import { StudentCreate } from './pages/admin/StudentCreate';
import { Companies } from './pages/admin/Companies';
import { CompanyCreate } from './pages/admin/CompanyCreate';
import { Placements } from './pages/placements/Placements';
import { PlacementCreate } from './pages/placements/PlacementCreate';
import { MyInternship } from './pages/student/MyInternship';
import { Teachers } from './pages/admin/Teachers';
import { TeacherCreate } from './pages/admin/TeacherCreate';
import { AttendanceControl } from './pages/admin/AttendanceControl';
import { Evaluation } from './pages/admin/Evaluation';
import { InspectionSchedule } from './pages/admin/InspectionSchedule';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const RoleGuard = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        {/* Common Routes */}
        <Route path="/" element={<Dashboard />} />

        {/* Admin Only */}
        <Route element={<RoleGuard allowedRoles={['Admin']} />}>
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teachers/new" element={<TeacherCreate />} />
        </Route>

        {/* Admin & Teacher */}
        <Route element={<RoleGuard allowedRoles={['Admin', 'Teacher']} />}>
          <Route path="/students" element={<Students />} />
          <Route path="/students/new" element={<StudentCreate />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/new" element={<CompanyCreate />} />
          <Route path="/placements" element={<Placements />} />
          <Route path="/placements/new" element={<PlacementCreate />} />
          <Route path="/placements/new" element={<PlacementCreate />} />
          <Route path="/attendance" element={<AttendanceControl />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/inspection" element={<InspectionSchedule />} />
        </Route>

        {/* Student Only */}
        <Route element={<RoleGuard allowedRoles={['Student']} />}>
          <Route path="/my-internship" element={<MyInternship />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
