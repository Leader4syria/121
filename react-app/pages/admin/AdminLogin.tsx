import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { Shield, Crown, ChevronRight, UserCheck, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const { user, redirectToLogin } = useAuth();
  const navigate = useNavigate();
  const [needsFirstAdmin, setNeedsFirstAdmin] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      // First check if user has admin access
      const dashboardResponse = await fetch('/api/admin/dashboard');
      if (dashboardResponse.ok) {
        navigate('/admin/dashboard');
        return;
      }
      
      // If dashboard access failed, check if any admin exists
      const checkResponse = await fetch('/api/admin/check');
      if (checkResponse.status === 404) {
        // No admins exist, show first admin setup
        setNeedsFirstAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
    }
  };

  const handleLogin = async () => {
    await redirectToLogin();
  };

  const handleCreateFirstAdmin = async () => {
    if (!user) return;
    
    setCreatingAdmin(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/create-first-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        navigate('/admin/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'حدث خطأ أثناء إنشاء حساب المشرف');
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setCreatingAdmin(false);
    }
  };

  if (user && needsFirstAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-red-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Admin Setup Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <UserCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2" dir="rtl">إعداد أول مشرف</h1>
            <p className="text-gray-400" dir="rtl">لا يوجد مشرفون في النظام حالياً</p>
          </div>

          {/* Setup Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="space-y-6">
              {/* Welcome Message */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <div>
                    <h3 className="text-yellow-400 font-medium text-sm" dir="rtl">مرحباً بك!</h3>
                    <p className="text-gray-300 text-xs mt-1" dir="rtl">
                      أنت أول مستخدم يصل إلى هذه الصفحة
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  {user.google_user_data?.picture ? (
                    <img
                      src={user.google_user_data.picture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Crown className="w-8 h-8 text-white" />
                  )}
                </div>
                <h3 className="text-white font-medium mb-1">
                  {user.google_user_data?.name || user.email}
                </h3>
                <p className="text-gray-400 text-sm mb-4" dir="rtl">
                  سيتم منحك صلاحيات المشرف الكاملة
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Create Admin Button */}
              <button
                onClick={handleCreateFirstAdmin}
                disabled={creatingAdmin}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 space-x-reverse"
              >
                {creatingAdmin ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span dir="rtl">جاري الإنشاء...</span>
                  </>
                ) : (
                  <>
                    <span dir="rtl">إنشاء حساب المشرف</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Info List */}
              <div className="space-y-3 pt-4">
                <h4 className="text-white font-medium text-sm" dir="rtl">ستحصل على صلاحيات:</h4>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span>إدارة كاملة للمستخدمين</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span>إدارة المنتجات والفئات</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span>إدارة المدفوعات والمعاملات</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span>الوصول إلى التقارير والإحصائيات</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-red-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Admin Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" dir="rtl">لوحة التحكم الإدارية</h1>
          <p className="text-gray-400" dir="rtl">سوق حلب - Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          <div className="space-y-6">
            {/* Security Notice */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Shield className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-red-400 font-medium text-sm" dir="rtl">منطقة مقيدة</h3>
                  <p className="text-gray-300 text-xs mt-1" dir="rtl">
                    هذه المنطقة مخصصة للمشرفين المعتمدين فقط
                  </p>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 space-x-reverse"
            >
              <span dir="rtl">تسجيل الدخول بجوجل</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Features List */}
            <div className="space-y-3 pt-4">
              <h4 className="text-white font-medium text-sm" dir="rtl">ميزات لوحة التحكم:</h4>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>إدارة المستخدمين والطلبات</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>إدارة المنتجات والفئات</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>إدارة المدفوعات والمعاملات</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>التقارير والإحصائيات</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm" dir="rtl">
            تسجيل الدخول آمن ومشفر
          </p>
        </div>
      </div>
    </div>
  );
}
