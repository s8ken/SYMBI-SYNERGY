// Enterprise analytics page view tracker for SYMBI platform
import { useAnalytics } from '../../hooks/useAnalytics';

const PageViewTracker = () => {
  // Track page views for enterprise analytics - must be inside Router context
  useAnalytics();
  return null; // This component only tracks, doesn't render anything
};

export default PageViewTracker;