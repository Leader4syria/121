import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import Layout from '@/react-app/components/Layout';

interface PaymentMethod {
  id: number;
  name_ar: string;
  name_en: string;
  image_url: string;
  description_ar: string;
  description_en: string;
  is_active: boolean;
}

export default function AddFunds() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch('/api/public/payment-methods');
        if (response.ok) {
          const data = await response.json();
          setPaymentMethods(data);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4" dir="rtl">يجب تسجيل الدخول لإضافة رصيد</p>
            <Link to="/login" className="bg-red-600 text-white px-6 py-3 rounded-xl">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 space-x-reverse mb-4">
              <Link 
                to="/wallet"
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800/50"
              >
                <ArrowLeft className="w-6 h-6 rotate-180" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white" dir="rtl">إضافة رصيد</h1>
                <p className="text-gray-400" dir="rtl">اختر طريقة الدفع المناسبة لك</p>
              </div>
            </div>
            
            {/* Current Balance */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 mb-1" dir="rtl">رصيدك الحالي</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-white">${user.balance?.toFixed(2) || '0.00'}</span>
                    <span className="text-gray-400">USD</span>
                  </div>
                </div>
                <div className="bg-red-500/20 rounded-xl p-3">
                  <CreditCard className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6" dir="rtl">طرق الدفع المتاحة</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paymentMethods.map((method) => (
                  <Link
                    key={method.id}
                    to={`/payment/${method.id}`}
                    className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    {/* Payment Method Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={method.image_url || 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=400&h=300&fit=crop'}
                        alt={method.name_ar}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                          متاح
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2" dir="rtl">
                        {method.name_ar}
                      </h3>
                      <p className="text-gray-400 text-sm mb-1" dir="ltr">
                        {method.name_en}
                      </p>
                      <p className="text-gray-300 text-sm" dir="rtl">
                        {method.description_ar}
                      </p>
                      
                      {/* Action Indicator */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-red-400 text-sm font-medium" dir="rtl">
                          اضغط للمتابعة
                        </span>
                        <ArrowLeft className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform rotate-180" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4" dir="rtl">تحتاج مساعدة؟</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-blue-400 font-medium mb-2" dir="rtl">الحد الأدنى للإيداع</h4>
                <p className="text-gray-300" dir="rtl">$10.00 USD</p>
              </div>
              <div>
                <h4 className="text-blue-400 font-medium mb-2" dir="rtl">الحد الأقصى للإيداع</h4>
                <p className="text-gray-300" dir="rtl">$1,000.00 USD</p>
              </div>
              <div>
                <h4 className="text-blue-400 font-medium mb-2" dir="rtl">وقت المعالجة</h4>
                <p className="text-gray-300" dir="rtl">5-30 دقيقة</p>
              </div>
              <div>
                <h4 className="text-blue-400 font-medium mb-2" dir="rtl">الدعم الفني</h4>
                <p className="text-gray-300" dir="rtl">متاح 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
