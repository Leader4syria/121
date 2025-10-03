import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';

export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loading screen when location changes
    setIsLoading(true);
    setShowLoadingScreen(true);

    // Hide loading screen after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowLoadingScreen(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return {
    isLoading,
    showLoadingScreen
  };
}
