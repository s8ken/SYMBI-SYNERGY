// From javascript_google_analytics integration - Analytics hook for SYMBI platform
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';

export const useAnalytics = () => {
  const location = useLocation();
  const prevLocationRef = useRef(location.pathname);
  
  useEffect(() => {
    if (location.pathname !== prevLocationRef.current) {
      trackPageView(location.pathname);
      prevLocationRef.current = location.pathname;
    }
  }, [location.pathname]);
};