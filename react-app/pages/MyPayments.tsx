import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import Layout from '@/react-app/components/Layout';

interface Payment {
  id: number;
  amount: number;
  transaction_type: string;
  status: string;
  payment_method_name?: string;
  transaction_id?: string;
  created_at: string;
  admin_notes?: string;
}

export default function MyPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/wallet/transactions');
        if (response.ok) {
          const data = await response.json();
          setPayments(data.filter((payment: Payment) => payment.transaction_type === 'deposit'));
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قيد المراجعة';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'rejected':
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
            <p className="text-gray-400 mb-4" dir="rtl">يجب تسجيل الدخول لعرض المدفوعات</p>
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
            <h1 className="text-3xl font-bold text-white mb-2" dir="rtl">مدفوعاتي</h1>
            <p className="text-gray-400" dir="rtl">تاريخ جميع المدفوعات وحالة كل معاملة</p>
          </div>

          {/* Payments List */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
              </div>
            ) : payments.length > 0 ? (
              <div className="divide-y divide-gray-700/50">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse">
                        <div className="bg-gray-700/50 rounded-xl p-3">
                          <CreditCard className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 space-x-reverse mb-2">
                            <h3 className="text-lg font-semibold text-white" dir="rtl">
                              إيداع رصيد
                            </h3>
                            <span className="text-2xl font-bold text-green-400">
                              +${payment.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-400">
                            {payment.payment_method_name && (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span dir="rtl">طريقة الدفع:</span>
                                <span>{payment.payment_method_name}</span>
                              </div>
                            )}
                            {payment.transaction_id && (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span dir="rtl">رقم العملية:</span>
                                <span className="font-mono">{payment.transaction_id}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span dir="rtl">التاريخ:</span>
                              <span>{new Date(payment.created_at).toLocaleString('ar-EG')}</span>
                            </div>
                          </div>
                          {payment.admin_notes && (
                            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <div className="flex items-center space-x-2 space-x-reverse mb-1">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-blue-400" dir="rtl">ملاحظة الإدارة:</span>
                              </div>
                              <p className="text-sm text-gray-300" dir="rtl">{payment.admin_notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span dir="rtl">{getStatusText(payment.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2" dir="rtl">لا توجد مدفوعات</h3>
                <p className="text-gray-400 mb-6" dir="rtl">لم تقم بأي مدفوعات بعد</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
