import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Upload, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import Layout from '@/react-app/components/Layout';

interface PaymentMethod {
  id: number;
  name_ar: string;
  name_en: string;
  image_url: string;
  description_ar: string;
  instructions_ar: string;
  requires_receipt: boolean;
  requires_transaction_id: boolean;
  custom_fields?: string;
  min_amount: number;
  max_amount: number;
}

export default function PaymentDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    transaction_id: '',
    receipt_image: null as File | null,
    notes: ''
  });

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const response = await fetch(`/api/public/payment-methods/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPaymentMethod(data);
        }
      } catch (error) {
        console.error('Error fetching payment method:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaymentMethod();
    }
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, receipt_image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !paymentMethod) return;

    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('payment_method_id', paymentMethod.id.toString());
      formDataObj.append('amount', formData.amount);
      if (formData.transaction_id) {
        formDataObj.append('transaction_id', formData.transaction_id);
      }
      if (formData.receipt_image) {
        formDataObj.append('receipt_image', formData.receipt_image);
      }
      if (formData.notes) {
        formDataObj.append('notes', formData.notes);
      }

      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          amount: formData.amount,
          transaction_id: formData.transaction_id,
          notes: formData.notes,
          receipt_image_url: formData.receipt_image ? 'uploaded_receipt.jpg' : null // In production, upload file first
        })
      });

      if (response.ok) {
        navigate('/wallet?success=deposit_submitted');
      }
    } catch (error) {
      console.error('Error submitting deposit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4" dir="rtl">يجب تسجيل الدخول</p>
            <Link to="/login" className="bg-red-600 text-white px-6 py-3 rounded-xl">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!paymentMethod) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4" dir="rtl">طريقة الدفع غير موجودة</p>
            <Link to="/add-funds" className="bg-red-600 text-white px-6 py-3 rounded-xl">
              العودة
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
                to="/add-funds"
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800/50"
              >
                <ArrowLeft className="w-6 h-6 rotate-180" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white" dir="rtl">تفاصيل الدفع</h1>
                <p className="text-gray-400" dir="rtl">{paymentMethod.name_ar}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Method Info */}
            <div className="space-y-6">
              {/* Method Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
                <div className="h-48 overflow-hidden">
                  <img
                    src={paymentMethod.image_url}
                    alt={paymentMethod.name_ar}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2" dir="rtl">
                    {paymentMethod.name_ar}
                  </h2>
                  <p className="text-gray-400 mb-4" dir="rtl">
                    {paymentMethod.description_ar}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  <AlertCircle className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white" dir="rtl">تعليمات الدفع</h3>
                </div>
                <p className="text-gray-300 leading-relaxed" dir="rtl">
                  {paymentMethod.instructions_ar}
                </p>
              </div>

              {/* Process Steps */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6" dir="rtl">خطوات العملية</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                    <p className="text-gray-300" dir="rtl">أدخل المبلغ المطلوب</p>
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                    <p className="text-gray-300" dir="rtl">قم بالدفع حسب التعليمات</p>
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                    <p className="text-gray-300" dir="rtl">ارفق الإثبات المطلوب</p>
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                    <p className="text-gray-300" dir="rtl">انتظر التأكيد والإضافة للرصيد</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <CreditCard className="w-6 h-6 text-red-500" />
                <h3 className="text-2xl font-bold text-white" dir="rtl">إتمام الدفع</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount */}
                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">
                    المبلغ (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={paymentMethod.min_amount || 10}
                    max={paymentMethod.max_amount || 1000}
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="أدخل المبلغ"
                    dir="ltr"
                  />
                  <p className="text-gray-400 text-sm mt-1" dir="rtl">
                    الحد الأدنى: ${paymentMethod.min_amount || 10}.00 | الحد الأقصى: ${paymentMethod.max_amount || 1000}.00
                  </p>
                </div>

                {/* Transaction ID */}
                {paymentMethod.requires_transaction_id && (
                  <div>
                    <label className="block text-white font-medium mb-2" dir="rtl">
                      رقم العملية
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.transaction_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, transaction_id: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="أدخل رقم العملية"
                      dir="ltr"
                    />
                  </div>
                )}

                {/* Receipt Upload */}
                {paymentMethod.requires_receipt && (
                  <div>
                    <label className="block text-white font-medium mb-2" dir="rtl">
                      صورة الإيصال
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleFileChange}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-gray-400 cursor-pointer hover:bg-gray-600 transition-colors flex items-center justify-center space-x-3 space-x-reverse"
                      >
                        <Upload className="w-5 h-5" />
                        <span dir="rtl">
                          {formData.receipt_image ? formData.receipt_image.name : 'اختر صورة الإيصال'}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="أدخل أي ملاحظات إضافية"
                    dir="rtl"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-3 space-x-reverse"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span dir="rtl">جارٍ الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span dir="rtl">إرسال طلب الإيداع</span>
                    </>
                  )}
                </button>
              </form>

              {/* Processing Info */}
              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <h4 className="text-yellow-400 font-medium" dir="rtl">وقت المعالجة</h4>
                    <p className="text-gray-300 text-sm" dir="rtl">
                      سيتم مراجعة طلبك خلال 5-30 دقيقة وإضافة الرصيد لحسابك
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
