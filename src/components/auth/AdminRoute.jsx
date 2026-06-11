import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { clearAuthSession } from '../../utils/auth';

export default function AdminRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('adminToken');
  const userRaw = localStorage.getItem('user') || localStorage.getItem('adminUser');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);

  let user = null;

  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminSession() {
      setIsVerifying(true);

      if (!token || !user) {
        if (isMounted) {
          setIsAuthorized(false);
          setRedirectTo('/login');
          setIsVerifying(false);
        }
        return;
      }

      if (user.role !== 'admin') {
        if (isMounted) {
          setIsAuthorized(false);
          setRedirectTo('/');
          setIsVerifying(false);
        }
        return;
      }

      try {
        const response = await api.get('/admin/verify');
        const admin = response.data?.admin;

        if (!isMounted) {
          return;
        }

        if (admin?.role !== 'admin') {
          clearAuthSession();
          setIsAuthorized(false);
          setRedirectTo('/');
          return;
        }

        localStorage.setItem('user', JSON.stringify(admin));
        localStorage.setItem('adminUser', JSON.stringify(admin));
        setIsAuthorized(true);
        setRedirectTo(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        clearAuthSession();
        setIsAuthorized(false);
        setRedirectTo('/login');
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    verifyAdminSession();

    return () => {
      isMounted = false;
    };
  }, [token, user?.id, user?.role]);

  if (isVerifying) {
    return <div className="min-h-screen bg-[#fbf8fa]" />;
  }

  if (!isAuthorized) {
    if (redirectTo === '/') {
      return <Navigate to="/" replace />;
    }

    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
