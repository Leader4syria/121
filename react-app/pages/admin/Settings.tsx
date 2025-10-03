import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AdminLayout from '@/react-app/components/admin/AdminLayout';
import { 
  Save, 
  Globe, 
  DollarSign, 
  Shield,
  Bell,
  Type
} from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else if (response.status === 401 || response.status === 403) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Settings saved successfully');
        
        // Update local settings from server response
        if (responseData.config) {
          setSettings(responseData.config);
        }
        
        // Apply theme changes immediately
        if (settings.primary_color || settings.secondary_color) {
          // Broadcast color change to all clients
          const colorChangeEvent = new CustomEvent('themeColorChange', { 
            detail: { primaryColor: settings.primary_color, secondaryColor: settings.secondary_color } 
          });
          window.dispatchEvent(colorChangeEvent);
        }
        
        // Apply site info changes immediately
        if (settings.site_name || settings.site_name_en || settings.site_logo_url !== undefined) {
          const siteInfoChangeEvent = new CustomEvent('siteInfoChange', {
            detail: { 
              siteName: settings.site_name, 
              siteNameEn: settings.site_name_en,
              siteLogoUrl: settings.site_logo_url 
            }
          });
          window.dispatchEvent(siteInfoChangeEvent);
        }
        
        // Force refresh of all cached configs
        const configRefreshEvent = new CustomEvent('configRefresh');
        window.dispatchEvent(configRefreshEvent);
        
        // Show success message
        alert('تم حفظ الإعدادات بنجاح!');
      } else {
        console.error('Error saving settings');
        alert('حدث خطأ أثناء حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
            <h1 className="text-3xl font-bold text-white" dir="rtl">إعدادات الموقع</h1>
            <p className="text-gray-400" dir="rtl">إدارة الإعدادات العامة للموقع</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors"
          >
            <Save className="w-5 h-5" />
            <span dir="rtl">{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <Globe className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-white" dir="rtl">الإعدادات العامة</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  اسم الموقع (عربي)
                </label>
                <input
                  type="text"
                  value={settings.site_name || ''}
                  onChange={(e) => updateSetting('site_name', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  اسم الموقع (إنجليزي)
                </label>
                <input
                  type="text"
                  value={settings.site_name_en || ''}
                  onChange={(e) => updateSetting('site_name_en', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  dir="ltr"
                  placeholder="Market Halab"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  وصف الموقع
                </label>
                <textarea
                  value={settings.site_description || ''}
                  onChange={(e) => updateSetting('site_description', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  رابط الشعار
                </label>
                <input
                  type="url"
                  value={settings.site_logo_url || ''}
                  onChange={(e) => updateSetting('site_logo_url', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  dir="ltr"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <Type className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-white" dir="rtl">إعدادات التصميم</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  اللون الأساسي
                </label>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <input
                    type="color"
                    value={settings.primary_color || '#dc2626'}
                    onChange={(e) => updateSetting('primary_color', e.target.value)}
                    className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                  <input
                    type="text"
                    value={settings.primary_color || '#dc2626'}
                    onChange={(e) => updateSetting('primary_color', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  اللون الثانوي
                </label>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <input
                    type="color"
                    value={settings.secondary_color || '#059669'}
                    onChange={(e) => updateSetting('secondary_color', e.target.value)}
                    className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                  <input
                    type="text"
                    value={settings.secondary_color || '#059669'}
                    onChange={(e) => updateSetting('secondary_color', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <DollarSign className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-white" dir="rtl">إعدادات المدفوعات</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  الحد الأدنى للإيداع (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.min_deposit_amount || '10'}
                  onChange={(e) => updateSetting('min_deposit_amount', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  الحد الأقصى للإيداع (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.max_deposit_amount || '1000'}
                  onChange={(e) => updateSetting('max_deposit_amount', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Announcement Settings */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <Bell className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-white" dir="rtl">الإعلانات</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  نص الإعلان المتحرك
                </label>
                <textarea
                  value={settings.announcement_text || ''}
                  onChange={(e) => updateSetting('announcement_text', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  dir="rtl"
                  placeholder="أدخل نص الإعلان الذي سيظهر في الشريط المتحرك"
                />
              </div>

              <div className="flex items-center space-x-3 space-x-reverse">
                <input
                  type="checkbox"
                  id="enable_registrations"
                  checked={settings.enable_registrations === '1'}
                  onChange={(e) => updateSetting('enable_registrations', e.target.checked ? '1' : '0')}
                  className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                />
                <label htmlFor="enable_registrations" className="text-white" dir="rtl">
                  السماح بالتسجيل الجديد
                </label>
              </div>
            </div>
          </div>

          {/* Contact Settings */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 lg:col-span-2">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <Shield className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-white" dir="rtl">معلومات التواصل</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  البريد الإلكتروني للدعم
                </label>
                <input
                  type="email"
                  value={settings.support_email || ''}
                  onChange={(e) => updateSetting('support_email', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={settings.support_phone || ''}
                  onChange={(e) => updateSetting('support_phone', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  رابط فيسبوك
                </label>
                <input
                  type="url"
                  value={settings.facebook_url || ''}
                  onChange={(e) => updateSetting('facebook_url', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2" dir="rtl">
                  رابط تويتر
                </label>
                <input
                  type="url"
                  value={settings.twitter_url || ''}
                  onChange={(e) => updateSetting('twitter_url', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
