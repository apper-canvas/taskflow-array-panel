import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { getRouteConfig } from './route.utils';
import Root from '@/layouts/Root';

// Lazy load components
const Layout = lazy(() => import('@/components/organisms/Layout'));
const TasksPage = lazy(() => import('@/components/pages/TasksPage'));
const Login = lazy(() => import('@/components/pages/Login'));
const Signup = lazy(() => import('@/components/pages/Signup'));
const Callback = lazy(() => import('@/components/pages/Callback'));
const ErrorPage = lazy(() => import('@/components/pages/ErrorPage'));
const PromptPassword = lazy(() => import('@/components/pages/PromptPassword'));
const ResetPassword = lazy(() => import('@/components/pages/ResetPassword'));
const NotFoundPage = lazy(() => import('@/components/pages/NotFoundPage'));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
  </div>
);

// createRoute helper
const createRoute = ({ path, index, element, access, children, ...meta }) => {
  const configPath = index ? "/" : (path?.startsWith('/') ? path : `/${path}`);
  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;
  
  return {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<LoadingSpinner />}>{element}</Suspense> : element,
    handle: { access: finalAccess, ...meta },
    ...(children && { children })
  };
};

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />, // Layout component - NO createRoute wrapper
    children: [
      // Public routes
      createRoute({
        path: 'login',
        element: <Login />,
        title: 'Login'
      }),
      createRoute({
        path: 'signup',
        element: <Signup />,
        title: 'Sign Up'
      }),
      createRoute({
        path: 'callback',
        element: <Callback />,
        title: 'Authentication Callback'
      }),
      createRoute({
        path: 'error',
        element: <ErrorPage />,
        title: 'Error'
      }),
      createRoute({
        path: 'prompt-password/:appId/:emailAddress/:provider',
        element: <PromptPassword />,
        title: 'Prompt Password'
      }),
      createRoute({
        path: 'reset-password/:appId/:fields',
        element: <ResetPassword />,
        title: 'Reset Password'
      }),
      
      // Protected routes (main app layout)
      {
        path: '/',
        element: <Layout />, // Layout with Outlet - NO createRoute wrapper
        children: [
          createRoute({
            index: true,
            element: <TasksPage />,
            title: 'All Tasks'
          }),
          createRoute({
            path: 'category/:categoryId',
            element: <TasksPage />,
            title: 'Category Tasks'
          }),
          createRoute({
            path: 'priority/:priority',
            element: <TasksPage />,
            title: 'Priority Tasks'
          }),
          createRoute({
            path: 'overdue',
            element: <TasksPage />,
            title: 'Overdue Tasks'
          }),
          createRoute({
            path: 'today',
            element: <TasksPage />,
            title: 'Today Tasks'
          }),
          createRoute({
            path: 'upcoming',
            element: <TasksPage />,
            title: 'Upcoming Tasks'
          }),
          createRoute({
            path: 'completed',
            element: <TasksPage />,
            title: 'Completed Tasks'
          })
        ]
      },
      
      // 404 page
      createRoute({
        path: '*',
        element: <NotFoundPage />,
        title: 'Page Not Found'
      })
    ]
  }
]);