import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AdminLayout from '@/react-app/components/admin/AdminLayout';
import { 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  ToggleLeft,
  Save,
  X
} from 'lucide-react';

interface PaymentMethod {
  id: number;
  name_ar: string;
  name_en: string;
  image_url: string;
  description_ar: string;
  description_en: string;
  instructions_ar: string;
  instructions_en: string;
  requires_receipt: boolean;
  requires_transaction_id: boolean;
  custom_fields: string;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface PaymentMethodForm {
  name_ar: string;
  name_en: string;
  image_url: string;
  description_ar: string;
  description_en: string;
  instructions_ar: string;
  instructions_en: string;
  requires_receipt: boolean;
  requires_transaction_id: boolean;
  custom_fields: string;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
  sort_order: number;
  custom_text: string;
  show_custom_text: boolean;
}

export default function AdminPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<PaymentMethodForm>({
    name_ar: '',
    name_en: '',
    image_url: '',
    description_ar: '',
    description_en: '',
    instructions_ar: '',
    instructions_en: '',
    requires_receipt: true,
    requires_transaction_id: false,
    custom_fields: '',
    min_amount: 10,
    max_amount: 1000,
    is_active: true,
    sort_order: 0,
    custom_text: '',
    show_custom_text: false
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/admin/payment-methods');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      } else if (response.status === 401 || response.status === 403) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      const customFields = method.custom_fields ? JSON.parse(method.custom_fields) : {};
      setFormData({
        name_ar: method.name_ar,
        name_en: method.name_en,
        image_url: method.image_url || '',
        description_ar: method.description_ar || '',
        description_en: method.description_en || '',
        instructions_ar: method.instructions_ar || '',
        instructions_en: method.instructions_en || '',
        requires_receipt: method.requires_receipt,
        requires_transaction_id: method.requires_transaction_id,
        custom_fields: method.custom_fields || '',
        min_amount: method.min_amount || 10,
        max_amount: method.max_amount || 1000,
        is_active: method.is_active,
        sort_order: method.sort_order || 0,
        custom_text: customFields.custom_text || '',
        show_custom_text: customFields.show_custom_text || false
      });
    } else {
      setEditingMethod(null);
      setFormData({
        name_ar: '',
        name_en: '',
        image_url: '',
        description_ar: '',
        description_en: '',
        instructions_ar: '',
        instructions_en: '',
        requires_receipt: true,
        requires_transaction_id: false,
        custom_fields: '',
        min_amount: 10,
        max_amount: 1000,
        is_active: true,
        sort_order: 0,
        custom_text: '',
        show_custom_text: false
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const customFields = {
        custom_text: formData.custom_text,
        show_custom_text: formData.show_custom_text
      };

      const submitData = {
        ...formData,
        custom_fields: JSON.stringify(customFields)
      };

      const url = editingMethod 
        ? `/api/admin/payment-methods/${editingMethod.id}`
        : '/api/admin/payment-methods';
      
      const method = editingMethod ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await fetchPaymentMethods();
        setShowModal(false);
        setEditingMethod(null);
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (method: PaymentMethod) => {
    try {
      const response = await fetch(`/api/admin/payment-methods/${method.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...method,
          is_active: !method.is_active
        })
      });

      if (response.ok) {
        await fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Error toggling payment method status:', error);
    }
  };

  const deleteMethod = async (method: PaymentMethod) => {
    if (!confirm('هل أنت متأكد من حذف طريقة الدفع هذه؟')) return;

    try {
      const response = await fetch(`/api/admin/payment-methods/${method.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

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
            <h1 className="text-3xl font-bold text-white" dir="rtl">إدارة طرق الدفع</h1>
            <p className="text-gray-400" dir="rtl">إضافة وتعديل طرق الدفع المتاحة</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span dir="rtl">إضافة طريقة دفع</span>
          </button>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method) => {
            const customFields = method.custom_fields ? JSON.parse(method.custom_fields) : {};
            
            return (
              <div key={method.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
                {/* Method Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={method.image_url || 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=400&h=300&fit=crop'}
                    alt={method.name_ar}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      method.is_active 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {method.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>

                {/* Method Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white" dir="rtl">
                        {method.name_ar}
                      </h3>
                      <p className="text-gray-400 text-sm" dir="ltr">
                        {method.name_en}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400" dir="rtl">الترتيب</p>
                      <p className="text-white font-medium">{method.sort_order}</p>
                    </div>
                  </div>

                  {/* Method Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400" dir="rtl">الحد الأدنى:</span>
                      <span className="text-white">${method.min_amount || 10}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400" dir="rtl">الحد الأقصى:</span>
                      <span className="text-white">${method.max_amount || 1000}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400" dir="rtl">يتطلب إيصال:</span>
                      <span className={method.requires_receipt ? 'text-green-400' : 'text-red-400'}>
                        {method.requires_receipt ? 'نعم' : 'لا'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400" dir="rtl">يتطلب رقم عملية:</span>
                      <span className={method.requires_transaction_id ? 'text-green-400' : 'text-red-400'}>
                        {method.requires_transaction_id ? 'نعم' : 'لا'}
                      </span>
                    </div>
                    {customFields.show_custom_text && (
                      <div className="flex justify-between">
                        <span className="text-gray-400" dir="rtl">نص مخصص:</span>
                        <span className="text-blue-400">متوفر</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {method.description_ar && (
                    <p className="text-gray-300 text-sm mt-3 line-clamp-2" dir="rtl">
                      {method.description_ar}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(method)}
                        className="text-blue-400 hover:text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 p-2 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(method)}
                        className={`p-2 rounded-lg transition-colors ${
                          method.is_active 
                            ? 'text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30'
                            : 'text-green-400 hover:text-green-300 bg-green-500/20 hover:bg-green-500/30'
                        }`}
                        title={method.is_active ? 'تعطيل' : 'تفعيل'}
                      >
                        <ToggleLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMethod(method)}
                        className="text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30 p-2 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      #{method.id}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {paymentMethods.length === 0 && (
          <div className="text-center py-16">
            <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2" dir="rtl">لا توجد طرق دفع</h3>
            <p className="text-gray-400 mb-6" dir="rtl">قم بإضافة أول طريقة دفع للموقع</p>
            <button
              onClick={() => openModal()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl inline-flex items-center space-x-2 space-x-reverse transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span dir="rtl">إضافة طريقة دفع</span>
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white" dir="rtl">
                    {editingMethod ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white" dir="rtl">المعلومات الأساسية</h4>
                    
                    <div>
                      <label className="block text-white font-medium mb-2" dir="rtl">
                        الاسم بالعربية *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name_ar}
                        onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="مثال: فيزا"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2" dir="rtl">
                        الاسم بالإنجليزية *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Example: Visa"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2" dir="rtl">
                        رابط الصورة
                      </label>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://example.com/image.jpg"
                        dir="ltr"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2" dir="rtl">
                          الحد الأدنى ($)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.min_amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, min_amount: Number(e.target.value) }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2" dir="rtl">
                          الحد الأقصى ($)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.max_amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_amount: Number(e.target.value) }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2" dir="rtl">
                        ترتيب العرض
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sort_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white" dir="rtl">الوصف والتعليمات</h4>
                    
                    <div>
                      <label className="block text-white font-medium mb-2" dir="rtl">
                        الوصف بالعربية
                      </label>
                      <textarea
                        value={formData.description_ar}
                        onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                        rows={3}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        placeholder="وصف مختصر لطريقة الدفع"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2" dir="rtl">
                        الوصف بالإنجليزية
                      </label>
                      <textarea
                        value={formData.description_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                        rows={3}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        placeholder="Brief description of payment method"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2" dir="rtl">
                        تعليمات الدفع بالعربية
                      </label>
                      <textarea
                        value={formData.instructions_ar}
                        onChange={(e) => setFormData(prev => ({ ...prev, instructions_ar: e.target.value }))}
                        rows={4}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        placeholder="تعليمات مفصلة للمستخدم حول كيفية إتمام الدفع"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2" dir="rtl">
                        تعليمات الدفع بالإنجليزية
                      </label>
                      <textarea
                        value={formData.instructions_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, instructions_en: e.target.value }))}
                        rows={4}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        placeholder="Detailed instructions for users on how to complete payment"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="mt-6 p-4 bg-gray-700/30 rounded-xl">
                  <h4 className="text-lg font-semibold text-white mb-4" dir="rtl">إعدادات متقدمة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white" dir="rtl">يتطلب رفع إيصال</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.requires_receipt}
                            onChange={(e) => setFormData(prev => ({ ...prev, requires_receipt: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white" dir="rtl">يتطلب رقم العملية</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.requires_transaction_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, requires_transaction_id: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white" dir="rtl">عرض نص مخصص</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.show_custom_text}
                            onChange={(e) => setFormData(prev => ({ ...prev, show_custom_text: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white" dir="rtl">نشط</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    </div>

                    {formData.show_custom_text && (
                      <div>
                        <label className="block text-white font-medium mb-2" dir="rtl">
                          النص المخصص
                        </label>
                        <textarea
                          value={formData.custom_text}
                          onChange={(e) => setFormData(prev => ({ ...prev, custom_text: e.target.value }))}
                          rows={4}
                          className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                          placeholder="نص مخصص يظهر بشكل مميز في صفحة الدفع"
                          dir="rtl"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex space-x-4 space-x-reverse mt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span dir="rtl">جارٍ الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span dir="rtl">{editingMethod ? 'تحديث' : 'إضافة'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
