import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import Layout from '@/react-app/components/Layout';

interface Order {
  id: number;
  product_name_ar: string;
  quantity: number;
  price: number;
  status: string;
  created_at: string;
  order_data?: string;
}

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/users/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'processing':
        return 'قيد التنفيذ';
      case 'pending':
        return 'في الانتظار';
      case 'cancelled':
        return 'ملغى';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'pending':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4" dir="rtl">يجب تسجيل الدخول لعرض الطلبات</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2" dir="rtl">طلباتي</h1>
            <p className="text-gray-400" dir="rtl">تابع حالة طلباتك وتاريخ الشراء</p>
          </div>

          {/* Orders List */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="divide-y divide-gray-700/50">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse">
                        <div className="bg-gray-700/50 rounded-xl p-3">
                          <Package className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2" dir="rtl">
                            {order.product_name_ar}
                          </h3>
                          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-400">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span dir="rtl">الكمية:</span>
                              <span>{order.quantity}</span>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span dir="rtl">السعر:</span>
                              <span>${order.price.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span dir="rtl">التاريخ:</span>
                              <span>{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg border text-sm font-medium mb-2 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span dir="rtl">{getStatusText(order.status)}</span>
                        </div>
                        <div>
                          <button className="text-red-400 hover:text-red-300 text-sm flex items-center space-x-1 space-x-reverse transition-colors">
                            <Eye className="w-4 h-4" />
                            <span dir="rtl">عرض التفاصيل</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2" dir="rtl">لا توجد طلبات</h3>
                <p className="text-gray-400 mb-6" dir="rtl">لم تقم بأي طلبات بعد</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
