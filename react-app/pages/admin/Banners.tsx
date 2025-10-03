import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AdminLayout from '@/react-app/components/admin/AdminLayout';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Eye,
  Image,
  ToggleLeft,
  ToggleRight,
  ExternalLink
} from 'lucide-react';
import { Banner } from '@/shared/types';

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    sort_order: 0,
    is_active: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners');
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      } else if (response.status === 401 || response.status === 403) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBanner = async () => {
    try {
      const url = editingBanner 
        ? `/api/admin/banners/${editingBanner.id}`
        : '/api/admin/banners';
      
      const method = editingBanner ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchBanners();
        setShowModal(false);
        setEditingBanner(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا البانر؟')) return;
    
    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchBanners();
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...banner,
          is_active: !banner.is_active
        })
      });

      if (response.ok) {
        await fetchBanners();
      }
    } catch (error) {
      console.error('Error updating banner:', error);
    }
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        image_url: banner.image_url,
        link_url: banner.link_url || '',
        sort_order: banner.sort_order,
        is_active: banner.is_active
      });
    } else {
      setEditingBanner(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      sort_order: 0,
      is_active: true
    });
  };

  const filteredBanners = banners.filter(banner =>
    (banner.title || '').toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold text-white" dir="rtl">إدارة البانرات</h1>
            <p className="text-gray-400" dir="rtl">إضافة وتعديل بانرات الصفحة الرئيسية</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span dir="rtl">إضافة بانر</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في البانرات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              dir="rtl"
            />
          </div>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
              {/* Banner Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={banner.image_url}
                  alt={banner.title || 'بانر'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => window.open(banner.image_url, '_blank')}
                    className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Banner Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1" dir="rtl">
                      {banner.title || 'بدون عنوان'}
                    </h3>
                    {banner.link_url && (
                      <div className="flex items-center space-x-2 space-x-reverse text-blue-400 text-sm">
                        <ExternalLink className="w-4 h-4" />
                        <span className="truncate max-w-40" dir="ltr">
                          {banner.link_url}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">#{banner.sort_order}</span>
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`${
                        banner.is_active ? 'text-green-400' : 'text-gray-400'
                      }`}
                    >
                      {banner.is_active ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                  <span className={`px-2 py-1 rounded-lg text-xs ${
                    banner.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {banner.is_active ? 'نشط' : 'معطل'}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => openModal(banner)}
                      className="text-blue-400 hover:text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 p-2 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30 p-2 rounded-lg transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Banner Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4" dir="rtl">
                {editingBanner ? 'تعديل البانر' : 'إضافة بانر جديد'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">
                    العنوان (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    dir="rtl"
                    placeholder="عنوان البانر"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">
                    رابط الصورة <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    dir="ltr"
                    placeholder="https://example.com/banner.jpg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">
                    رابط الوجهة (اختياري)
                  </label>
                  <input
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    dir="ltr"
                    placeholder="https://example.com"
                  />
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
                    onClick={handleSaveBanner}
                    disabled={!formData.image_url}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    {editingBanner ? 'حفظ التغييرات' : 'إضافة البانر'}
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

        {/* Empty State */}
        {filteredBanners.length === 0 && (
          <div className="text-center py-12">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2" dir="rtl">لا توجد بانرات</h3>
            <p className="text-gray-500" dir="rtl">
              {searchTerm ? 'لم يتم العثور على بانرات تطابق البحث' : 'ابدأ بإضافة أول بانر'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
