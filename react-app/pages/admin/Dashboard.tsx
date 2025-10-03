import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AdminLayout from '@/react-app/components/admin/AdminLayout';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingTransactions: number;
  todayStats: {
    newUsers: number;
    newOrders: number;
    todayRevenue: number;
  };
  growthMetrics: {
    usersGrowth: number;
    ordersGrowth: number;
    revenueGrowth: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401 || response.status === 403) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    change?: number; 
    changeType?: 'increase' | 'decrease' | 'neutral';
  }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium" dir="rtl">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'increase' ? 'text-green-400' : 
              changeType === 'decrease' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {changeType === 'increase' && <TrendingUp className="w-4 h-4 mr-1" />}
              {changeType === 'decrease' && <TrendingDown className="w-4 h-4 mr-1" />}
              {changeType === 'neutral' && <Minus className="w-4 h-4 mr-1" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl">
          <Icon className="w-6 h-6 text-red-400" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-400" dir="rtl">فشل في تحميل البيانات</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white" dir="rtl">لوحة التحكم</h1>
          <p className="text-gray-400 mt-2" dir="rtl">مرحباً بك في لوحة التحكم الرئيسية</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="إجمالي المستخدمين"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            change={stats.growthMetrics.usersGrowth}
            changeType={
              stats.growthMetrics.usersGrowth > 0 ? 'increase' : 
              stats.growthMetrics.usersGrowth < 0 ? 'decrease' : 'neutral'
            }
          />
          <StatCard
            title="إجمالي الطلبات"
            value={stats.totalOrders.toLocaleString()}
            icon={ShoppingCart}
            change={stats.growthMetrics.ordersGrowth}
            changeType={
              stats.growthMetrics.ordersGrowth > 0 ? 'increase' : 
              stats.growthMetrics.ordersGrowth < 0 ? 'decrease' : 'neutral'
            }
          />
          <StatCard
            title="إجمالي الإيرادات"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            change={stats.growthMetrics.revenueGrowth}
            changeType={
              stats.growthMetrics.revenueGrowth > 0 ? 'increase' : 
              stats.growthMetrics.revenueGrowth < 0 ? 'decrease' : 'neutral'
            }
          />
          <StatCard
            title="المعاملات المعلقة"
            value={stats.pendingTransactions}
            icon={Clock}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4" dir="rtl">إجراءات سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/admin/users')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>إدارة المستخدمين</span>
            </button>
            <button 
              onClick={() => navigate('/admin/products')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>إدارة المنتجات</span>
            </button>
            <button 
              onClick={() => navigate('/admin/transactions')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              <span>إدارة المعاملات</span>
            </button>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-colors"
            >
              <Clock className="w-5 h-5" />
              <span>إدارة الطلبات</span>
            </button>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4" dir="rtl">نظرة عامة على النظام</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white" dir="rtl">إدارة المستخدمين</h3>
              <p className="text-gray-400 text-sm mt-1" dir="rtl">تحكم كامل في حسابات المستخدمين</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white" dir="rtl">إدارة المبيعات</h3>
              <p className="text-gray-400 text-sm mt-1" dir="rtl">متابعة الطلبات والمنتجات</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white" dir="rtl">إدارة المدفوعات</h3>
              <p className="text-gray-400 text-sm mt-1" dir="rtl">مراقبة المعاملات المالية</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
