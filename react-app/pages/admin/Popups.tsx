import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Palette, Monitor, Settings, Image as ImageIcon, Type, RefreshCcw, Expand } from 'lucide-react';
import AdminLayout from '@/react-app/components/admin/AdminLayout';

interface Popup {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  button_color: string;
  popup_width: number;
  popup_height: number;
  image_width: number;
  image_height: number;
  button_position: string;
  background_color: string;
  text_color: string;
  border_radius: number;
  show_on_pages: string;
  is_active: boolean;
  show_once_per_session: boolean;
  delay_seconds: number;
  created_at: string;
}

const presetThemes = [
  {
    name: 'الكلاسيكي',
    background_color: '#ffffff',
    text_color: '#1f2937',
    button_color: '#dc2626',
    border_radius: 12
  },
  {
    name: 'الداكن',
    background_color: '#1f2937',
    text_color: '#ffffff',
    button_color: '#3b82f6',
    border_radius: 16
  },
  {
    name: 'الذهبي',
    background_color: '#fef3c7',
    text_color: '#92400e',
    button_color: '#d97706',
    border_radius: 20
  },
  {
    name: 'النعناعي',
    background_color: '#ecfdf5',
    text_color: '#065f46',
    button_color: '#059669',
    border_radius: 12
  }
];

const initialPopup: Omit<Popup, 'id' | 'created_at'> = {
  title: 'عرض خاص!',
  content: 'اكتشف أحدث المنتجات والخدمات المميزة بأسعار خاصة لفترة محدودة.',
  image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
  button_text: 'اطلع على العروض',
  button_url: '/categories',
  button_color: '#dc2626',
  popup_width: 600,
  popup_height: 450,
  image_width: 300,
  image_height: 200,
  button_position: 'center',
  background_color: '#ffffff',
  text_color: '#1f2937',
  border_radius: 16,
  show_on_pages: 'all',
  is_active: true,
  show_once_per_session: false,
  delay_seconds: 3
};

export default function PopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [formData, setFormData] = useState(initialPopup);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const response = await fetch('/api/admin/popups');
      if (response.ok) {
        const data = await response.json();
        setPopups(data);
      }
    } catch (error) {
      console.error('Error fetching popups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (popup?: Popup) => {
    if (popup) {
      setEditingPopup(popup);
      setFormData({
        title: popup.title,
        content: popup.content,
        image_url: popup.image_url || '',
        button_text: popup.button_text || '',
        button_url: popup.button_url || '',
        button_color: popup.button_color,
        popup_width: popup.popup_width,
        popup_height: popup.popup_height,
        image_width: popup.image_width,
        image_height: popup.image_height,
        button_position: popup.button_position,
        background_color: popup.background_color,
        text_color: popup.text_color,
        border_radius: popup.border_radius,
        show_on_pages: popup.show_on_pages,
        is_active: popup.is_active,
        show_once_per_session: popup.show_once_per_session,
        delay_seconds: popup.delay_seconds
      });
    } else {
      setEditingPopup(null);
      setFormData(initialPopup);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPopup(null);
    setFormData(initialPopup);
    setActiveTab('content');
  };

  const handleSave = async () => {
    try {
      const url = editingPopup ? `/api/admin/popups/${editingPopup.id}` : '/api/admin/popups';
      const method = editingPopup ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchPopups();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving popup:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان المنبثق؟')) return;

    try {
      const response = await fetch(`/api/admin/popups/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchPopups();
      }
    } catch (error) {
      console.error('Error deleting popup:', error);
    }
  };

  const handleResetSessions = async (id: number) => {
    if (!confirm('هل تريد إعادة إظهار هذا الإعلان لجميع الزوار؟')) return;

    try {
      const response = await fetch(`/api/admin/popups/${id}/reset-sessions`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.shouldBroadcast) {
          // Broadcast reset to all clients
          const resetEvent = new CustomEvent('popupSessionReset', { 
            detail: { popupId: id } 
          });
          window.dispatchEvent(resetEvent);
        }
        alert('تم إعادة تعيين جلسات الإعلان بنجاح. سيظهر الإعلان مرة أخرى لجميع الزوار.');
      }
    } catch (error) {
      console.error('Error resetting popup sessions:', error);
    }
  };

  const applyTheme = (theme: typeof presetThemes[0]) => {
    setFormData({
      ...formData,
      background_color: theme.background_color,
      text_color: theme.text_color,
      button_color: theme.button_color,
      border_radius: theme.border_radius
    });
  };

  const buttonPositionClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }[formData.button_position] || 'justify-center';

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white" dir="rtl">الإعلانات المنبثقة</h1>
            <p className="text-gray-400 mt-2" dir="rtl">صمم إعلانات منبثقة جذابة لزيادة التفاعل</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-6 py-3 rounded-xl flex items-center space-x-3 space-x-reverse shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">إنشاء إعلان جديد</span>
          </button>
        </div>

        {/* Popups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popups.map((popup) => (
            <div key={popup.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:bg-gray-800/70 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2" dir="rtl">
                    {popup.title || 'بدون عنوان'}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2" dir="rtl">
                    {popup.content}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  popup.is_active ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'
                }`}>
                  {popup.is_active ? (
                    <>
                      <Eye className="w-3 h-3 ml-1" />
                      نشط
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 ml-1" />
                      غير نشط
                    </>
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span dir="rtl">
                  الصفحات: {popup.show_on_pages === 'all' ? 'جميع الصفحات' : popup.show_on_pages}
                </span>
                <span>
                  {popup.delay_seconds}ث
                </span>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <button
                  onClick={() => openModal(popup)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1 space-x-reverse"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleResetSessions(popup.id)}
                  className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-2 rounded-lg text-sm transition-colors border border-green-600/30"
                  title="إعادة إظهار للجميع"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(popup.id)}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors border border-red-600/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="flex h-full">
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm"></div>
              
              <div className="relative flex w-full max-w-7xl mx-auto bg-gray-900 shadow-2xl">
                {/* Form Section */}
                <div className="flex-1 flex flex-col">
                  {/* Header */}
                  <div className="bg-gray-800/50 px-8 py-6 border-b border-gray-700/50 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white" dir="rtl">
                      {editingPopup ? 'تعديل الإعلان المنبثق' : 'إنشاء إعلان جديد'}
                    </h2>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="bg-gray-800/30 px-8 py-4 border-b border-gray-700/50">
                    <div className="flex space-x-1 space-x-reverse">
                      {[
                        { id: 'content', name: 'المحتوى', icon: Type },
                        { id: 'design', name: 'التصميم', icon: Palette },
                        { id: 'settings', name: 'الإعدادات', icon: Settings }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'bg-red-600 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          <span>{tab.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'content' && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">
                            <Type className="w-4 h-4 inline mr-2" />
                            عنوان الإعلان
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            placeholder="أدخل عنوان جذاب للإعلان"
                            dir="rtl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">
                            <Type className="w-4 h-4 inline mr-2" />
                            نص الإعلان
                          </label>
                          <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                            placeholder="اكتب محتوى الإعلان هنا..."
                            dir="rtl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">
                            <ImageIcon className="w-4 h-4 inline mr-2" />
                            رابط الصورة (اختياري)
                          </label>
                          <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">نص الزر</label>
                            <input
                              type="text"
                              value={formData.button_text}
                              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                              placeholder="اطلع على العروض"
                              dir="rtl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">رابط الزر</label>
                            <input
                              type="url"
                              value={formData.button_url}
                              onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                              placeholder="/categories"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'design' && (
                      <div className="space-y-6">
                        {/* Preset Themes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">
                            <Palette className="w-4 h-4 inline mr-2" />
                            قوالب جاهزة
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {presetThemes.map((theme) => (
                              <button
                                key={theme.name}
                                onClick={() => applyTheme(theme)}
                                className="p-4 rounded-xl border border-gray-600/50 hover:border-red-500/50 transition-all group"
                                style={{ backgroundColor: theme.background_color + '20' }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-white" dir="rtl">{theme.name}</span>
                                  <div className="flex space-x-1 space-x-reverse">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.background_color }}></div>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.text_color }}></div>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.button_color }}></div>
                                  </div>
                                </div>
                                <div 
                                  className="w-full h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                                  style={{ 
                                    backgroundColor: theme.background_color,
                                    color: theme.text_color,
                                    borderRadius: `${theme.border_radius}px`
                                  }}
                                >
                                  معاينة
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">عرض النافذة</label>
                            <input
                              type="range"
                              min="400"
                              max="800"
                              value={formData.popup_width}
                              onChange={(e) => setFormData({ ...formData, popup_width: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider mb-2"
                            />
                            <div className="text-center text-sm text-gray-400">{formData.popup_width}px</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">ارتفاع النافذة</label>
                            <input
                              type="range"
                              min="300"
                              max="600"
                              value={formData.popup_height}
                              onChange={(e) => setFormData({ ...formData, popup_height: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider mb-2"
                            />
                            <div className="text-center text-sm text-gray-400">{formData.popup_height}px</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">
                              <Expand className="w-4 h-4 inline mr-2" />
                              عرض الصورة
                            </label>
                            <input
                              type="range"
                              min="100"
                              max="400"
                              value={formData.image_width}
                              onChange={(e) => setFormData({ ...formData, image_width: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider mb-2"
                            />
                            <div className="text-center text-sm text-gray-400">{formData.image_width}px</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">
                              <Expand className="w-4 h-4 inline mr-2" />
                              ارتفاع الصورة
                            </label>
                            <input
                              type="range"
                              min="80"
                              max="300"
                              value={formData.image_height}
                              onChange={(e) => setFormData({ ...formData, image_height: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider mb-2"
                            />
                            <div className="text-center text-sm text-gray-400">{formData.image_height}px</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">لون الخلفية</label>
                            <div className="relative">
                              <input
                                type="color"
                                value={formData.background_color}
                                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                                className="w-full h-12 rounded-xl border border-gray-600/50 cursor-pointer"
                              />
                              <div className="absolute inset-2 rounded-lg pointer-events-none" style={{ backgroundColor: formData.background_color }}></div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">لون النص</label>
                            <div className="relative">
                              <input
                                type="color"
                                value={formData.text_color}
                                onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                                className="w-full h-12 rounded-xl border border-gray-600/50 cursor-pointer"
                              />
                              <div className="absolute inset-2 rounded-lg pointer-events-none" style={{ backgroundColor: formData.text_color }}></div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">لون الزر</label>
                            <div className="relative">
                              <input
                                type="color"
                                value={formData.button_color}
                                onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
                                className="w-full h-12 rounded-xl border border-gray-600/50 cursor-pointer"
                              />
                              <div className="absolute inset-2 rounded-lg pointer-events-none" style={{ backgroundColor: formData.button_color }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">موضع الزر</label>
                            <select
                              value={formData.button_position}
                              onChange={(e) => setFormData({ ...formData, button_position: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="left">يسار</option>
                              <option value="center">وسط</option>
                              <option value="right">يمين</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">انحناء الحواف</label>
                            <input
                              type="range"
                              min="0"
                              max="30"
                              value={formData.border_radius}
                              onChange={(e) => setFormData({ ...formData, border_radius: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider mb-2"
                            />
                            <div className="text-center text-sm text-gray-400">{formData.border_radius}px</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'settings' && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">
                            <Monitor className="w-4 h-4 inline mr-2" />
                            الصفحات المستهدفة
                          </label>
                          <input
                            type="text"
                            value={formData.show_on_pages}
                            onChange={(e) => setFormData({ ...formData, show_on_pages: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            placeholder="all أو /categories,/wallet"
                            dir="rtl"
                          />
                          <p className="text-xs text-gray-400 mt-2" dir="rtl">
                            اكتب "all" لجميع الصفحات أو مسارات محددة مفصولة بفاصلة
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3" dir="rtl">تأخير الظهور (ثواني)</label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={formData.delay_seconds}
                            onChange={(e) => setFormData({ ...formData, delay_seconds: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider mb-2"
                          />
                          <div className="text-center text-sm text-gray-400">{formData.delay_seconds} ثانية</div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                          <div dir="rtl">
                            <h3 className="text-white font-medium">تنشيط الإعلان</h3>
                            <p className="text-gray-400 text-sm">هل تريد عرض هذا الإعلان للزوار؟</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.is_active}
                              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                          <div dir="rtl">
                            <h3 className="text-white font-medium">عرض مرة واحدة فقط</h3>
                            <p className="text-gray-400 text-sm">إظهار الإعلان مرة واحدة لكل زائر في الجلسة</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.show_once_per_session}
                              onChange={(e) => setFormData({ ...formData, show_once_per_session: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-800/50 px-8 py-6 border-t border-gray-700/50 flex justify-end space-x-4 space-x-reverse">
                    <button
                      onClick={closeModal}
                      className="px-6 py-3 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-all duration-200"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 space-x-reverse shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ الإعلان</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Section */}
                <div className="w-96 bg-gray-100 flex flex-col">
                  <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center space-x-3 space-x-reverse">
                    <Monitor className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900" dir="rtl">معاينة مباشرة</h3>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-200">
                    <div 
                      className="relative transform shadow-2xl"
                      style={{
                        width: `${Math.min(formData.popup_width * 0.7, 280)}px`,
                        height: `${Math.min(formData.popup_height * 0.7, 200)}px`,
                        backgroundColor: formData.background_color,
                        color: formData.text_color,
                        borderRadius: `${formData.border_radius}px`
                      }}
                    >
                      <button className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        ×
                      </button>

                      <div className="p-4 h-full flex flex-col text-xs">
                        {formData.title && (
                          <h2 className="font-bold mb-2 text-center" dir="rtl" style={{ fontSize: '0.7rem' }}>
                            {formData.title}
                          </h2>
                        )}

                        {formData.image_url && (
                          <div className="flex justify-center mb-2">
                            <img
                              src={formData.image_url}
                              alt={formData.title || 'إعلان'}
                              className="rounded object-cover"
                              style={{
                                width: `${Math.min(formData.image_width * 0.5, 120)}px`,
                                height: `${Math.min(formData.image_height * 0.5, 80)}px`,
                                maxWidth: '80%',
                                maxHeight: '40%'
                              }}
                            />
                          </div>
                        )}

                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-center leading-tight" dir="rtl" style={{ fontSize: '0.6rem', lineHeight: '1.2' }}>
                            {formData.content}
                          </p>
                        </div>

                        {formData.button_text && (
                          <div className={`flex ${buttonPositionClass} mt-2`}>
                            <button
                              className="px-3 py-1.5 rounded font-semibold text-white text-xs"
                              style={{ 
                                backgroundColor: formData.button_color,
                                fontSize: '0.6rem'
                              }}
                            >
                              {formData.button_text}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 border-t border-gray-200">
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between" dir="rtl">
                        <span>عرض النافذة:</span>
                        <span>{formData.popup_width}px</span>
                      </div>
                      <div className="flex justify-between" dir="rtl">
                        <span>ارتفاع النافذة:</span>
                        <span>{formData.popup_height}px</span>
                      </div>
                      <div className="flex justify-between" dir="rtl">
                        <span>عرض الصورة:</span>
                        <span>{formData.image_width}px</span>
                      </div>
                      <div className="flex justify-between" dir="rtl">
                        <span>ارتفاع الصورة:</span>
                        <span>{formData.image_height}px</span>
                      </div>
                      <div className="flex justify-between" dir="rtl">
                        <span>التأخير:</span>
                        <span>{formData.delay_seconds}ث</span>
                      </div>
                      <div className="flex justify-between" dir="rtl">
                        <span>الصفحات:</span>
                        <span>{formData.show_on_pages === 'all' ? 'الكل' : 'محدد'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </AdminLayout>
  );
}
