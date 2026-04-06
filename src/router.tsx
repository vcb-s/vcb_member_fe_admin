import { useEffect } from 'react';
import { useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';

import { setNavigate, setLocation } from '@/utils/navigate';

import LoadingPage from '@/components/loading';

// Pages — lazy loaded
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('@/pages/login/index'));
const PersonLayout = lazy(() => import('@/pages/person/uid/_layout'));
const PersonCardPage = lazy(() => import('@/pages/person/uid/card/index'));
const PersonMemberPage = lazy(() => import('@/pages/person/uid/member/index'));
const PersonEditPage = lazy(() => import('@/pages/person/uid/edit'));
const CardEditPage = lazy(
  () => import('@/pages/person/uid/card/edit/CardEdit'),
);
const PassCalcPage = lazy(() => import('@/pages/tools/pass-calc/index'));

/** Keeps the navigate / location singletons in sync with the current router state */
function NavigateSetter() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    setLocation(location);
  }, [location]);

  return null;
}

function RootLayout() {
  return (
    <>
      <NavigateSetter />
      <Suspense fallback={<LoadingPage />}>
        <Outlet />
      </Suspense>
    </>
  );
}

const base = '/vcbs_member/admin';

export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { index: true, element: <Navigate to='/login' replace /> },
        { path: 'login', element: <LoginPage /> },
        {
          path: 'person/:uid',
          element: <PersonLayout />,
          children: [
            { index: true, element: <Navigate to='card' replace /> },
            { path: 'card', element: <PersonCardPage /> },
            { path: 'member', element: <PersonMemberPage /> },
            { path: 'edit', element: <PersonEditPage /> },
            { path: 'card/edit/:editID?', element: <CardEditPage /> },
          ],
        },
        { path: 'tools/pass-calc', element: <PassCalcPage /> },
      ],
    },
  ],
  { basename: base },
);
