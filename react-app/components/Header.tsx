import { useState } from 'react';
import { Link } from 'react-router';
import { Menu } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useTheme } from '@/react-app/hooks/useTheme';
import Sidebar from './Sidebar';

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { siteName, siteNameEn, siteLogoUrl } = useTheme();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md shadow-2xl border-b border-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Name - Left Side */}
            <Link to="/" className="flex items-center space-x-3 space-x-reverse">
              {siteLogoUrl ? (
                <img 
                  src={siteLogoUrl} 
                  alt={siteName}
                  className="w-10 h-10 rounded-xl object-cover shadow-lg"
                  onError={(e) => {
                    // Fallback to default logo if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg ${siteLogoUrl ? 'hidden' : ''}`}>
                <span className="text-white font-bold text-xl">
                  {siteName ? siteName.charAt(0) : 'س'}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{siteName}</h1>
                <p className="text-xs text-gray-300">{siteNameEn}</p>
              </div>
            </Link>

            {/* User Balance and Login - Center */}
            <div className="flex-1 flex items-center justify-center">
              {user ? (
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center space-x-2 space-x-reverse text-right">
                    <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">$</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 leading-none" dir="rtl">الرصيد</p>
                      <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        ${user.balance?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="group flex items-center space-x-3 space-x-reverse bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-red-400/20"
                  dir="rtl"
                >
                  <svg className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="tracking-wide">دخول</span>
                  <div className="w-2 h-2 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors"></div>
                </Link>
              )}
            </div>

            {/* Menu Button - Right Side */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-300 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800/50"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
