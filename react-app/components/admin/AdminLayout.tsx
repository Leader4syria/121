import { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/react-app/hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Settings,
  LogOut,
  Menu,
  X,
  Image,
  DollarSign,
  ChevronLeft,
  Layers,
  Shield
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    // Fetch settings for site name and theme
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          
          // Apply theme color
          if (data.primary_color) {
            document.documentElement.style.setProperty('--primary-color', data.primary_color);
            // Update CSS variables for the new color
            const root = document.documentElement;
            const colorValue = data.primary_color;
            
            // Convert hex to RGB for opacity variations
            const hex = colorValue.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            
            root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const menuItems = [
    {
      name: 'لوحة التحكم',
      href: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'إدارة المستخدمين',
      href: '/admin/users',
      icon: Users
    },
    {
      name: 'إدارة الكتالوج',
      href: '/admin/catalog',
      icon: Layers
    },
    {
      name: 'مزودي الخدمات',
      href: '/admin/providers',
      icon: Package
    },
    {
      name: 'إدارة الطلبات',
      href: '/admin/orders',
      icon: ShoppingCart
    },
    {
      name: 'طرق الدفع',
      href: '/admin/payment-methods',
      icon: CreditCard
    },
    {
      name: 'إدارة المعاملات',
      href: '/admin/transactions',
      icon: DollarSign
    },
    {
      name: 'إدارة البانرات',
      href: '/admin/banners',
      icon: Image
    },
    {
      name: 'الإعلانات المنبثقة',
      href: '/admin/popups',
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      )
    },
    {
      name: 'إدارة المشرفين',
      href: '/admin/admins',
      icon: Shield
    },
    {
      name: 'الإعدادات',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  const isActive = (href: string) => location.pathname === href;

  const siteName = settings.site_name || 'لوحة التحكم';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3 space-x-reverse">
            {settings.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
            )}
            <h1 className="text-lg font-bold text-white">{siteName}</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center space-x-3 space-x-reverse px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(item.href)
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
              {isActive(item.href) && (
                <ChevronLeft className="w-4 h-4 mr-auto" />
              )}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 space-x-reverse mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.google_user_data?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.google_user_data?.name || user?.email}
              </p>
              <p className="text-xs text-gray-400 truncate">مدير النظام</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 space-x-reverse px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:mr-64">
        {/* Top Header */}
        <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
