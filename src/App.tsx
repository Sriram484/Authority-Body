import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CertificateRequests from './pages/CertificateRequests';
import CourseClaims from './pages/CourseClaims';
import Agencies from './pages/Agencies';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import initialData from './data.json';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [appData, setAppData] = useState(initialData);

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated]);

  const handleUpdateCertificateRequest = (id: string, updates: any) => {
    setAppData((prev) => ({
      ...prev,
      certificateRequests: prev.certificateRequests.map((req) =>
        req.id === id ? { ...req, ...updates } : req
      ),
    }));
  };

  const handleUpdateCourseClaim = (id: string, updates: any) => {
    setAppData((prev) => ({
      ...prev,
      courseClaimRequests: prev.courseClaimRequests.map((claim) =>
        claim.id === id ? { ...claim, ...updates } : claim
      ),
    }));
  };

  const handleAddAgency = (agency: any) => {
    setAppData((prev) => ({
      ...prev,
      agencies: [...prev.agencies, agency],
    }));
  };

  const handleUpdateAgency = (id: string, updates: any) => {
    setAppData((prev) => ({
      ...prev,
      agencies: prev.agencies.map((agency) =>
        agency.id === id ? { ...agency, ...updates } : agency
      ),
    }));
  };

  const handleDeleteAgency = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      agencies: prev.agencies.filter((agency) => agency.id !== id),
    }));
  };

  const handleAddCourse = (course: any) => {
    setAppData((prev) => ({
      ...prev,
      courses: [...prev.courses, course],
    }));
  };

  const handleUpdateCourse = (id: string, updates: any) => {
    setAppData((prev) => ({
      ...prev,
      courses: prev.courses.map((course) => (course.id === id ? { ...course, ...updates } : course)),
    }));
  };

  const handleDeleteCourse = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      courses: prev.courses.filter((course) => course.id !== id),
    }));
  };

  if (!isAuthenticated) {
    if (authView === 'login') {
      return <Login onNavigateToRegister={() => setAuthView('register')} />;
    }
    return <Register onNavigateToLogin={() => setAuthView('login')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard data={appData} />;
      case 'certificates':
        return (
          <CertificateRequests
            data={appData}
            onUpdateRequest={handleUpdateCertificateRequest}
          />
        );
      case 'claims':
        return <CourseClaims data={appData} onUpdateClaim={handleUpdateCourseClaim} />;
      case 'agencies':
        return (
          <Agencies
            data={appData}
            onAddAgency={handleAddAgency}
            onUpdateAgency={handleUpdateAgency}
            onDeleteAgency={handleDeleteAgency}
          />
        );
      case 'courses':
        return (
          <Courses
            data={appData}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        );
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard data={appData} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
