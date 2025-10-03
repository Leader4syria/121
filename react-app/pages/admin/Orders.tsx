import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AdminLayout from '@/react-app/components/admin/AdminLayout';
import { 
  Search, 
  Eye,
  Package,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Order {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  price: number;
  status: string;
  order_data: string | null;
  external_order_id: string | null;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  product_name_ar: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401 || response.status === 403) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleEditOrder = (order: Order) => {
    // Placeholder for edit functionality
    alert(`تعديل الطلب #${order.id}: ${order.product_name_ar}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قيد الانتظار';
      case 'processing':
        return 'قيد المعالجة';
      case 'cancelled':
        return 'ملغى';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" dir="rtl">إدارة الطلبات</h1>
            <p className="text-gray-400" dir="rtl">عرض ومتابعة جميع الطلبات</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-400">
            <span>إجمالي الطلبات: {orders.length}</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في الطلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              dir="rtl"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500" 
            dir="rtl"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="processing">قيد المعالجة</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغى</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الطلب</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">العميل</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">المنتج</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الكمية</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">المبلغ</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">التاريخ</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Package className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">#{order.id}</p>
                          {order.external_order_id && (
                            <p className="text-gray-400 text-xs" dir="ltr">
                              {order.external_order_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-white text-sm">{order.username}</p>
                          <p className="text-gray-400 text-xs">{order.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm line-clamp-2" dir="rtl">
                        {order.product_name_ar}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{order.quantity.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">
                          {(order.price * order.quantity).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className={`flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-lg text-xs ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{getStatusText(order.status)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {new Date(order.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-400 hover:text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 p-2 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                              className="text-blue-400 hover:text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 p-2 rounded-lg transition-colors text-xs"
                              title="بدء المعالجة"
                            >
                              معالجة
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                              className="text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30 p-2 rounded-lg transition-colors text-xs"
                              title="إلغاء"
                            >
                              إلغاء
                            </button>
                          </>
                        )}
                        
                        {order.status === 'processing' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                            className="text-green-400 hover:text-green-300 bg-green-500/20 hover:bg-green-500/30 p-2 rounded-lg transition-colors text-xs"
                            title="إكمال"
                          >
                            إكمال
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-yellow-400 hover:text-yellow-300 bg-yellow-500/20 hover:bg-yellow-500/30 p-2 rounded-lg transition-colors text-xs"
                          title="تعديل الطلب"
                        >
                          تعديل
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4" dir="rtl">
                تفاصيل الطلب #{selectedOrder.id}
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-400" dir="rtl">العميل:</span>
                    <div className="text-right">
                      <p className="text-white">{selectedOrder.username}</p>
                      <p className="text-gray-400 text-sm">{selectedOrder.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400" dir="rtl">المنتج:</span>
                    <span className="text-white text-right max-w-48" dir="rtl">
                      {selectedOrder.product_name_ar}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400" dir="rtl">الكمية:</span>
                    <span className="text-white">{selectedOrder.quantity.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400" dir="rtl">السعر الإجمالي:</span>
                    <span className="text-green-400 font-medium">
                      ${(selectedOrder.price * selectedOrder.quantity).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400" dir="rtl">الحالة:</span>
                    <div className={`flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-lg text-xs ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span>{getStatusText(selectedOrder.status)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400" dir="rtl">تاريخ الطلب:</span>
                    <span className="text-white">
                      {new Date(selectedOrder.created_at).toLocaleString('ar-EG')}
                    </span>
                  </div>
                  
                  {selectedOrder.external_order_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-400" dir="rtl">معرف خارجي:</span>
                      <span className="text-gray-300 font-mono text-sm">
                        {selectedOrder.external_order_id}
                      </span>
                    </div>
                  )}
                </div>

                {selectedOrder.order_data && (
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-2" dir="rtl">بيانات إضافية:</h4>
                    <pre className="text-gray-300 text-sm overflow-auto">
                      {JSON.stringify(JSON.parse(selectedOrder.order_data), null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex space-x-3 space-x-reverse pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2" dir="rtl">لا توجد طلبات</h3>
            <p className="text-gray-500" dir="rtl">
              {searchTerm || statusFilter !== 'all' ? 'لم يتم العثور على طلبات تطابق المعايير المحددة' : 'لا توجد طلبات حتى الآن'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
