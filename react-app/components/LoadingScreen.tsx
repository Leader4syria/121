import { useEffect, useState } from 'react';

interface SiteInfo {
  site_name: string;
  site_name_en: string;
  site_logo_url?: string;
}

interface LoadingScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
  delay?: number;
}

export default function LoadingScreen({ isVisible, onComplete, delay = 1000 }: LoadingScreenProps) {
  const [showScreen, setShowScreen] = useState(isVisible);
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({ site_name: 'سوق حلب', site_name_en: 'Market Halab' });

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const response = await fetch('/api/public/home');
        if (response.ok) {
          const data = await response.json();
          setSiteInfo({
            site_name: data.site_name || 'سوق حلب',
            site_name_en: data.site_name_en || 'Market Halab',
            site_logo_url: data.site_logo_url
          });
        }
      } catch (error) {
        console.error('Error fetching site info:', error);
      }
    };

    if (isVisible) {
      setShowScreen(true);
      fetchSiteInfo();
      
      const timer = setTimeout(() => {
        setShowScreen(false);
        if (onComplete) {
          onComplete();
        }
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowScreen(false);
    }
  }, [isVisible, delay, onComplete]);

  if (!showScreen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] backdrop-blur-sm bg-black/30 flex items-center justify-center transition-all duration-500 ${
      showScreen ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <div className="relative mb-4">
          {/* Rotating Ring Animation */}
          <div className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-red-500 border-r-red-400 rounded-full animate-spin"></div>
          <div className="absolute inset-2 w-28 h-28 border-2 border-transparent border-b-red-300 border-l-red-200 rounded-full animate-spin animation-reverse"></div>
          
          {/* Pulsing Glow */}
          <div className="absolute inset-4 w-24 h-24 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full animate-pulse blur-lg"></div>
          
          {/* Logo */}
          <div className="relative w-32 h-32 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border border-white/20">
            {siteInfo.site_logo_url ? (
              <img 
                src={siteInfo.site_logo_url} 
                alt={siteInfo.site_name}
                className="w-24 h-24 rounded-full object-cover animate-pulse"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <span className={`text-red-600 font-bold text-4xl animate-pulse ${siteInfo.site_logo_url ? 'hidden' : ''}`}>
              {siteInfo.site_name ? siteInfo.site_name.charAt(0) : 'س'}
            </span>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex items-center justify-center space-x-2 space-x-reverse mt-4">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-3 h-3 bg-red-300 rounded-full animate-bounce animation-delay-400"></div>
        </div>
      </div>

      <style>
        {`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }

        .animation-reverse {
          animation-direction: reverse;
        }
        `}
      </style>
    </div>
  );
}
