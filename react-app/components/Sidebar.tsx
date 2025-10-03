import { Link, useLocation } from 'react-router';
import { 
  X, 
  Home, 
  User, 
  Wallet, 
  Plus, 
  ShoppingBag, 
  Sun, 
  Moon, 
  Globe, 
  LogOut,
  Crown
} from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout, redirectToLogin } = useAuth();
  const location = useLocation();

  const handleLogin = () => {
    onClose();
    redirectToLogin();
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const menuItems = [
    { icon: Home, label: 'الصفحة الرئيسية', path: '/', color: 'text-blue-400' },
    { icon: ShoppingBag, label: 'طلباتي', path: '/my-orders', requiresAuth: true, color: 'text-purple-400' },
    { icon: Wallet, label: 'محفظتي', path: '/wallet', requiresAuth: true, color: 'text-green-400' },
    { icon: Plus, label: 'إضافة رصيد', path: '/add-funds', requiresAuth: true, color: 'text-yellow-400' },
    { icon: User, label: 'مدفوعاتي', path: '/my-payments', requiresAuth: true, color: 'text-pink-400' },
  ];

  const adminItems = [
    { icon: Crown, label: 'لوحة التحكم', path: '/admin/dashboard', color: 'text-red-400' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 bg-gradient-to-b from-gray-900 via-gray-900/98 to-gray-900/95 backdrop-blur-xl shadow-2xl z-50 transform transition-all duration-300 ease-out flex flex-col overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 blur-xl"></div>
          <div className="relative flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">س</span>
              </div>
              <h2 className="text-xl font-bold text-white" dir="rtl">القائمة</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-700/50">
          {user ? (
            <div className="text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  {user.google_user_data?.picture ? (
                    <img
                      src={user.google_user_data.picture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                {user.localUser?.is_admin && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-yellow-500 rounded-full p-1.5">
                    <Crown className="w-3 h-3 text-yellow-900" />
                  </div>
                )}
              </div>
              <h3 className="text-white font-semibold mb-1 truncate">
                {user.google_user_data?.name || user.email}
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                {user.localUser?.is_admin ? 'مشرف النظام' : `ID: ${user.localUser?.id?.toString().padStart(4, '0') || '0001'}`}
              </p>
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
                <p className="text-gray-400 text-xs mb-2" dir="rtl">الرصيد المتاح</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ${user.localUser?.balance?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-xs text-gray-400">USD</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600/30">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-4" dir="rtl">مرحباً بك في سوق حلب</p>
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                dir="rtl"
              >
                تسجيل الدخول
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {/* Main Menu Items */}
            {menuItems.map((item) => {
              if (item.requiresAuth && !user) return null;
              
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`group flex items-center space-x-3 space-x-reverse py-3 px-4 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-red-600/20 to-red-500/20 text-white border border-red-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-red-400' : item.color} group-hover:scale-110 transition-transform`} />
                  <span dir="rtl" className="font-medium">{item.label}</span>
                  {isActive && <div className="w-2 h-2 bg-red-400 rounded-full ml-auto"></div>}
                </Link>
              );
            })}

            {/* Admin Section */}
            {user?.localUser?.is_admin && (
              <>
                <div className="pt-4 pb-2">
                  <div className="flex items-center space-x-2 space-x-reverse px-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
                    <span className="text-xs text-gray-500 font-medium" dir="rtl">إدارة النظام</span>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
                  </div>
                </div>
                {adminItems.map((item) => {
                  const isActive = isActivePath(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`group flex items-center space-x-3 space-x-reverse py-3 px-4 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-red-600/20 to-red-500/20 text-white border border-red-500/30' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-red-400' : item.color} group-hover:scale-110 transition-transform`} />
                      <span dir="rtl" className="font-medium">{item.label}</span>
                      {isActive && <div className="w-2 h-2 bg-red-400 rounded-full ml-auto"></div>}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Quick Settings */}
          <div className="mt-auto p-4 border-t border-gray-700/50">
            <h3 className="text-white font-medium mb-3 text-sm" dir="rtl">إعدادات سريعة</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  document.body.classList.remove('dark');
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('theme', 'light');
                  // You can add light theme logic here
                  console.log('Light theme applied');
                }}
                className="flex items-center justify-center space-x-1 space-x-reverse bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white py-2 px-2 rounded-lg text-xs transition-all duration-200 hover:scale-105"
              >
                <Sun className="w-3 h-3" />
                <span dir="rtl">فاتح</span>
              </button>
              <button 
                onClick={() => {
                  document.body.classList.add('dark');
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
                  console.log('Dark theme applied');
                }}
                className="flex items-center justify-center space-x-1 space-x-reverse bg-gray-700 text-white py-2 px-2 rounded-lg text-xs"
              >
                <Moon className="w-3 h-3" />
                <span dir="rtl">داكن</span>
              </button>
              <button 
                onClick={() => {
                  document.documentElement.dir = 'rtl';
                  document.body.dir = 'rtl';
                  localStorage.setItem('language', 'ar');
                  console.log('Arabic language applied');
                  window.location.reload(); // Reload to apply RTL properly
                }}
                className="flex items-center justify-center space-x-1 space-x-reverse bg-gray-700 text-white py-2 px-2 rounded-lg text-xs"
              >
                <Globe className="w-3 h-3" />
                <span>العربية</span>
              </button>
              <button 
                onClick={() => {
                  document.documentElement.dir = 'ltr';
                  document.body.dir = 'ltr';
                  localStorage.setItem('language', 'en');
                  console.log('English language applied');
                  window.location.reload(); // Reload to apply LTR properly
                }}
                className="flex items-center justify-center space-x-1 space-x-reverse bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white py-2 px-2 rounded-lg text-xs transition-all duration-200 hover:scale-105"
              >
                <Globe className="w-3 h-3" />
                <span>English</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        {user && (
          <div className="p-4 border-t border-gray-700/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 space-x-reverse text-gray-300 hover:text-white hover:bg-red-600/20 py-3 px-4 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span dir="rtl" className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
