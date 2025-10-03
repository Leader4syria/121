import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AdminLayout from '@/react-app/components/admin/AdminLayout';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Image,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Category } from '@/shared/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    description: '',
    image_url: '',
    parent_id: null as number | null,
    sort_order: 0,
    is_active: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else if (response.status === 401 || response.status === 403) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchCategories();
        setShowModal(false);
        setEditingCategory(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...category,
          is_active: !category.is_active
        })
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name_ar: category.name_ar,
        name_en: category.name_en,
        description: category.description || '',
        image_url: category.image_url || '',
        parent_id: category.parent_id || null,
        sort_order: category.sort_order,
        is_active: category.is_active
      });
    } else {
      setEditingCategory(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name_ar: '',
      name_en: '',
      description: '',
      image_url: '',
      parent_id: null,
      sort_order: 0,
      is_active: true
    });
  };

  const filteredCategories = categories.filter(category =>
    category.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.name_en.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold text-white" dir="rtl">إدارة التصنيفات</h1>
            <p className="text-gray-400" dir="rtl">إضافة وتعديل تصنيفات المنتجات</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span dir="rtl">إضافة تصنيف</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في التصنيفات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              dir="rtl"
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">التصنيف</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الوصف</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الترتيب</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden">
                          {category.image_url ? (
                            <img 
                              src={category.image_url} 
                              alt={category.name_ar}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <p className="text-white font-medium" dir="rtl">{category.name_ar}</p>
                            {category.parent_id && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">فرعية</span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm" dir="ltr">{category.name_en}</p>
                          {category.parent_id && (
                            <p className="text-gray-500 text-xs" dir="rtl">
                              تحت: {categories.find(c => c.id === category.parent_id)?.name_ar}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm line-clamp-2" dir="rtl">
                        {category.description || 'بدون وصف'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{category.sort_order}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(category)}
                        className={`flex items-center space-x-2 space-x-reverse ${
                          category.is_active ? 'text-green-400' : 'text-gray-400'
                        }`}
                      >
                        {category.is_active ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                        <span className="text-xs" dir="rtl">
                          {category.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openModal(category)}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
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

        {/* Category Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4" dir="rtl">
                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </h3>
              
              <div className="space-y-4">
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

                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">
                    الفئة الأب
                  </label>
                  <select
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    dir="rtl"
                  >
                    <option value="">فئة رئيسية</option>
                    {categories.filter(cat => cat.id !== editingCategory?.id && !cat.parent_id).map((category) => (
                      <option key={category.id} value={category.id}>{category.name_ar}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2" dir="rtl">
                      ترتيب العرض
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
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
                    onClick={handleSaveCategory}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    {editingCategory ? 'حفظ التغييرات' : 'إضافة التصنيف'}
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
