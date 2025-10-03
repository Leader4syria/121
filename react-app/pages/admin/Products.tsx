import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AdminLayout from '@/react-app/components/admin/AdminLayout';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  DollarSign,
  Package,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Product, Category } from '@/shared/types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    category_id: 0,
    name_ar: '',
    name_en: '',
    description: '',
    price: 0,
    image_url: '',
    service_type: 'package',
    min_quantity: 1,
    max_quantity: 1000,
    is_active: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else if (response.status === 401 || response.status === 403) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSaveProduct = async () => {
    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchProducts();
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          is_active: !product.is_active
        })
      });

      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        category_id: product.category_id || 0,
        name_ar: product.name_ar,
        name_en: product.name_en,
        description: product.description || '',
        price: product.price,
        image_url: product.image_url || '',
        service_type: product.service_type,
        min_quantity: product.min_quantity,
        max_quantity: product.max_quantity,
        is_active: product.is_active
      });
    } else {
      setEditingProduct(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      category_id: 0,
      name_ar: '',
      name_en: '',
      description: '',
      price: 0,
      image_url: '',
      service_type: 'package',
      min_quantity: 1,
      max_quantity: 1000,
      is_active: true
    });
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return 'بدون تصنيف';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name_ar : 'تصنيف محذوف';
  };

  const filteredProducts = products.filter(product =>
    product.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name_en.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" dir="rtl">إدارة المنتجات</h1>
            <p className="text-gray-400" dir="rtl">إضافة وتعديل المنتجات والخدمات</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span dir="rtl">إضافة منتج</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في المنتجات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              dir="rtl"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">المنتج</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">التصنيف</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">السعر</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">النوع</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الكمية</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name_ar}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium line-clamp-1" dir="rtl">{product.name_ar}</p>
                          <p className="text-gray-400 text-sm line-clamp-1" dir="ltr">{product.name_en}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm" dir="rtl">
                        {getCategoryName(product.category_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">{product.price.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs ${
                        product.service_type === 'package' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {product.service_type === 'package' ? 'باقة' : 'خدمة'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm">
                        {product.min_quantity} - {product.max_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`flex items-center space-x-2 space-x-reverse ${
                          product.is_active ? 'text-green-400' : 'text-gray-400'
                        }`}
                      >
                        {product.is_active ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                        <span className="text-xs" dir="rtl">
                          {product.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openModal(product)}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4" dir="rtl">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2" dir="rtl">
                      الاسم بالعربية
                    </label>
                    <input
                      type="text"
                      value={formData.name_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2" dir="rtl">
                      الاسم بالإنجليزية
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    dir="rtl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2" dir="rtl">
                      التصنيف
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: parseInt(e.target.value) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      dir="rtl"
                    >
                      <option value={0}>بدون تصنيف</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2" dir="rtl">
                      السعر (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">
                    رابط الصورة
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    dir="ltr"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2" dir="rtl">
                      نوع الخدمة
                    </label>
                    <select
                      value={formData.service_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      dir="rtl"
                    >
                      <option value="package">باقة</option>
                      <option value="service">خدمة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2" dir="rtl">
                      الحد الأدنى
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.min_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_quantity: parseInt(e.target.value) || 1 }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2" dir="rtl">
                      الحد الأقصى
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_quantity: parseInt(e.target.value) || 1000 }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2" dir="rtl">
                      الحالة
                    </label>
                    <select
                      value={formData.is_active ? '1' : '0'}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === '1' }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      dir="rtl"
                    >
                      <option value="1">نشط</option>
                      <option value="0">معطل</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse pt-4">
                  <button
                    onClick={handleSaveProduct}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
