import React, { createContext, useContext, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { setUser, clearUser, setInitialized } from '@/store/userSlice';
import { getRouteConfig, verifyRouteAccess } from '@/router/route.utils';
import { getApperClient } from '@/services/apperClient';

// Create AuthContext for useAuth hook
const AuthContext = createContext(null);

// useAuth hook for components to access authentication
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthContext.Provider');
  }
  return context;
};

const Root = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitialized } = useSelector((state) => state.user);
  
  // Local state for controlling loading spinner (Gate 1)
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize authentication (runs once)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        const apperClient = getApperClient();
        
        if (!apperClient) {
          console.error('ApperClient not available');
          return;
        }

        ApperUI.setup(apperClient, {
          target: '#authentication',
          clientId: import.meta.env.VITE_APPER_PROJECT_ID,
          view: 'both',
          onSuccess: function (user) {
            setAuthInitialized(true);
            dispatch(setInitialized(true)); // Gate 2: Enable route guards
            
            if (user) {
              dispatch(setUser(JSON.parse(JSON.stringify(user))));
              handleNavigation(user);
            } else {
              dispatch(clearUser());
              handleNavigation(null);
            }
          },
          onError: function (error) {
            console.error("Authentication failed:", error);
            setAuthInitialized(true);
            dispatch(setInitialized(true));
            dispatch(clearUser());
          }
        });
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setAuthInitialized(true);
        dispatch(setInitialized(true));
      }
    };

    initializeAuth();
  }, []); // Empty deps - initialize only once

  // Handle post-authentication navigation
  const handleNavigation = (user) => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get("redirect");
    const authPages = ["/login", "/signup", "/callback"];
    const currentPath = window.location.pathname;
    const isOnAuthPage = authPages.some(page => currentPath.includes(page));

    if (user) {
      if (redirectPath) {
        navigate(redirectPath);
      } else if (isOnAuthPage) {
        navigate("/");
      }
      // Otherwise stay on current page
    } else {
      if (!isOnAuthPage) {
        navigate(`/login?redirect=${encodeURIComponent(currentPath + window.location.search)}`);
      }
    }
  };

  // Route guard effect (runs on every navigation when isInitialized is true)
  useEffect(() => {
    if (!isInitialized) return; // Gate 2: Don't run guards until auth is initialized

    const config = getRouteConfig(location.pathname);
    const accessCheck = verifyRouteAccess(config, user);

    if (!accessCheck.allowed) {
      const redirectTo = config?.allow?.redirectOnDeny || "/login";
      const excludeRedirectQuery = config?.allow?.excludeRedirectQuery || false;
      
      const redirectUrl = excludeRedirectQuery 
        ? redirectTo 
        : `${redirectTo}?redirect=${encodeURIComponent(location.pathname + location.search)}`;
        
      navigate(redirectUrl);
    }
  }, [isInitialized, user, location.pathname, location.search, navigate]);

  // Logout function
  const logout = async () => {
    try {
      const { ApperUI } = window.ApperSDK;
      await ApperUI.logout();
      dispatch(clearUser());
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Auth context value
  const authContextValue = {
    user,
    isAuthenticated: !!user,
    isInitialized,
    logout
  };

  // Show loading spinner until Gate 1 opens
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Outlet />
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="mt-16"
          toastClassName="rounded-xl shadow-lg"
          style={{ zIndex: 9999 }}
        />
      </div>
    </AuthContext.Provider>
  );
};

export default Root;