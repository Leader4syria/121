import { useState, useEffect, useRef } from 'react';
import { Plus, Wifi, WifiOff, RefreshCw, Download, Trash2, Edit2, CheckSquare, Terminal, DollarSign } from 'lucide-react';
import AdminLayout from '@/react-app/components/admin/AdminLayout';

interface ServiceProvider {
  id: number;
  name: string;
  api_url: string;
  api_token: string;
  is_active: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

interface ExternalCategory {
  id: string;
  name: string;
  description?: string;
  products?: ExternalProduct[];
}

interface ExternalProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  qty_values?: string;
  params?: string;
}

export default function ServiceProviders() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [externalData, setExternalData] = useState<{categories: ExternalCategory[], products: ExternalProduct[]}>({
    categories: [],
    products: []
  });
  const [importLoading, setImportLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{categories: string[], products: string[]}>({
    categories: [],
    products: []
  });
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [providerBalances, setProviderBalances] = useState<{[key: number]: string}>({});
  const [testing, setTesting] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const addToConsole = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    const logMessage = `[${timestamp}] ${message}`;
    setConsoleOutput(prev => [...prev, logMessage]);
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  };

  const clearConsole = () => {
    setConsoleOutput([]);
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/admin/providers');
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      addToConsole('❌ خطأ في جلب قائمة المزودين');
    }
  };

  const saveProvider = async (provider: Partial<ServiceProvider>) => {
    try {
      addToConsole(`حفظ مزود الخدمة: ${provider.name}...`);
      const url = provider.id ? `/api/admin/providers/${provider.id}` : '/api/admin/providers';
      const method = provider.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider)
      });

      if (response.ok) {
        await fetchProviders();
        setShowAddProvider(false);
        setEditingProvider(null);
        addToConsole(`✅ تم حفظ مزود الخدمة بنجاح`);
      } else {
        addToConsole('❌ فشل في حفظ مزود الخدمة');
      }
    } catch (error) {
      console.error('Error saving provider:', error);
      addToConsole('❌ خطأ في حفظ مزود الخدمة');
    }
  };

  const deleteProvider = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المزود؟')) return;
    
    try {
      addToConsole(`حذف مزود الخدمة ${id}...`);
      const response = await fetch(`/api/admin/providers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProviders();
        addToConsole('✅ تم حذف مزود الخدمة بنجاح');
      } else {
        addToConsole('❌ فشل في حذف مزود الخدمة');
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      addToConsole('❌ خطأ في حذف مزود الخدمة');
    }
  };

  const fetchProviderBalance = async (providerId: number) => {
    try {
      addToConsole(`جاري جلب الرصيد للمزود ${providerId}...`);
      
      const response = await fetch('/api/admin/providers/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: providerId })
      });
      
      const result = await response.json();
      if (result.success && result.balance) {
        setProviderBalances(prev => ({
          ...prev,
          [providerId]: result.balance
        }));
        addToConsole(`💰 الرصيد: ${result.balance}`);
        if (result.email) {
          addToConsole(`📧 البريد الإلكتروني: ${result.email}`);
        }
      } else {
        addToConsole('⚠️ لم يتم العثور على معلومات الرصيد');
      }
    } catch (error) {
      addToConsole('❌ خطأ في جلب الرصيد: ' + error);
    }
  };

  const testConnection = async (provider: ServiceProvider) => {
    try {
      setTesting(true);
      addToConsole(`بدء اختبار الاتصال مع المزود ${provider.id} (${provider.name})...`);
      
      const response = await fetch('/api/admin/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: provider.id })
      });

      const result = await response.json();
      if (result.success) {
        addToConsole('✅ اتصال ناجح!');
        // جلب الرصيد
        await fetchProviderBalance(provider.id);
      } else {
        addToConsole('❌ فشل الاتصال: ' + result.error);
      }
    } catch (error) {
      addToConsole('❌ خطأ في الاتصال: ' + error);
    } finally {
      setTesting(false);
    }
  };

  const fetchExternalData = async (provider: ServiceProvider) => {
    try {
      setImportLoading(true);
      setSelectedProvider(provider);
      addToConsole(`جاري جلب البيانات من المزود ${provider.name}...`);
      
      const [categoriesRes, productsRes] = await Promise.all([
        fetch('/api/admin/providers/fetch-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId: provider.id })
        }),
        fetch('/api/admin/providers/fetch-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId: provider.id })
        })
      ]);

      if (categoriesRes.ok && productsRes.ok) {
        const categories = await categoriesRes.json();
        const products = await productsRes.json();
        
        setExternalData({ categories, products });
        setShowImportModal(true);
        addToConsole(`✅ تم جلب ${categories.length} فئة و ${products.length} منتج`);
      } else {
        addToConsole('❌ فشل في جلب البيانات');
      }
    } catch (error) {
      console.error('Error fetching external data:', error);
      addToConsole('❌ خطأ في جلب البيانات من المزود');
    } finally {
      setImportLoading(false);
    }
  };

  const importSelectedItems = async () => {
    if (!selectedProvider) return;
    
    if (selectedItems.categories.length === 0 && selectedItems.products.length === 0) {
      addToConsole('⚠️ يرجى اختيار بيانات للاستيراد');
      return;
    }
    
    try {
      setImportLoading(true);
      addToConsole(`بدء استيراد البيانات... فئات: ${selectedItems.categories.length}, منتجات: ${selectedItems.products.length}`);
      
      const response = await fetch('/api/admin/providers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProvider.id,
          selectedCategories: selectedItems.categories,
          selectedProducts: selectedItems.products
        })
      });

      if (response.ok) {
        const result = await response.json();
        addToConsole(`✅ تم الاستيراد بنجاح! الفئات: ${result.imported.categories}, المنتجات: ${result.imported.products}`);
        setShowImportModal(false);
        setSelectedItems({ categories: [], products: [] });
        await fetchProviders();
      } else {
        addToConsole('❌ فشل الاستيراد');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      addToConsole('❌ خطأ في استيراد البيانات');
    } finally {
      setImportLoading(false);
    }
  };

  const toggleItemSelection = (type: 'categories' | 'products', id: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: prev[type].includes(id) 
        ? prev[type].filter(item => item !== id)
        : [...prev[type], id]
    }));
  };

  const selectAllItems = (type: 'categories' | 'products') => {
    const items = type === 'categories' ? externalData.categories : externalData.products;
    const allIds = items.map(item => item.id);
    
    setSelectedItems(prev => ({
      ...prev,
      [type]: prev[type].length === allIds.length ? [] : allIds
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">مزودي الخدمات</h1>
            <p className="text-gray-400">إدارة مزودي الخدمات الخارجية واستيراد المنتجات</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowConsole(!showConsole)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              كونسل
            </button>
            <button
              onClick={() => setShowAddProvider(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مزود جديد</span>
            </button>
          </div>
        </div>

        {/* Console */}
        {showConsole && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                سجل العمليات
              </h3>
              <button
                onClick={clearConsole}
                className="text-gray-400 hover:text-white text-sm"
              >
                مسح
              </button>
            </div>
            <div 
              ref={consoleRef}
              className="bg-black rounded p-3 h-32 overflow-y-auto text-green-400 font-mono text-sm"
            >
              {consoleOutput.length === 0 ? (
                <div className="text-gray-500">لا توجد رسائل...</div>
              ) : (
                consoleOutput.map((line, index) => (
                  <div key={index} className="mb-1">{line}</div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Wifi className="w-6 h-6 text-blue-400" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-400">إجمالي المزودين</p>
                <p className="text-2xl font-bold text-white">{providers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Wifi className="w-6 h-6 text-green-400" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-400">المزودين النشطين</p>
                <p className="text-2xl font-bold text-white">
                  {providers.filter(p => p.is_active).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <WifiOff className="w-6 h-6 text-red-400" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-400">المزودين المعطلين</p>
                <p className="text-2xl font-bold text-white">
                  {providers.filter(p => !p.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Providers List */}
        <div className="bg-gray-800 rounded-lg">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">قائمة المزودين</h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            {providers.map(provider => (
              <div key={provider.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className={`w-3 h-3 rounded-full ${
                      provider.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    
                    <div>
                      <h3 className="text-lg font-bold text-white">{provider.name}</h3>
                      <p className="text-sm text-gray-400">{provider.api_url}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {provider.last_sync_at && (
                          <p className="text-xs text-gray-500">
                            آخر مزامنة: {new Date(provider.last_sync_at).toLocaleString('ar-EG')}
                          </p>
                        )}
                        {providerBalances[provider.id] && (
                          <div className="flex items-center gap-1 bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs">
                            <DollarSign className="w-3 h-3" />
                            {providerBalances[provider.id]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => testConnection(provider)}
                      disabled={testing}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1 space-x-reverse"
                    >
                      {testing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wifi className="w-4 h-4" />
                      )}
                      <span>اختبار</span>
                    </button>
                    
                    <button
                      onClick={() => fetchExternalData(provider)}
                      disabled={importLoading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1 space-x-reverse"
                    >
                      {importLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>استيراد</span>
                    </button>
                    
                    <button
                      onClick={() => setEditingProvider(provider)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteProvider(provider.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {providers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Wifi className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا توجد مزودي خدمات</p>
                <p className="text-sm">ابدأ بإضافة مزود خدمة جديد</p>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Provider Modal */}
        {(showAddProvider || editingProvider) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingProvider ? 'تعديل مزود الخدمة' : 'إضافة مزود خدمة جديد'}
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const provider = {
                  id: editingProvider?.id,
                  name: formData.get('name') as string,
                  api_url: formData.get('api_url') as string,
                  api_token: formData.get('api_token') as string,
                  is_active: formData.get('is_active') === 'on'
                };
                saveProvider(provider);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      اسم المزود
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingProvider?.name}
                      required
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      رابط API
                    </label>
                    <input
                      type="url"
                      name="api_url"
                      defaultValue={editingProvider?.api_url}
                      required
                      placeholder="https://api.example.com"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      API Token
                    </label>
                    <input
                      type="text"
                      name="api_token"
                      defaultValue={editingProvider?.api_token}
                      required
                      placeholder="your-api-token-here"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      defaultChecked={editingProvider?.is_active ?? true}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="mr-2 text-sm text-gray-300">
                      مزود نشط
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 space-x-reverse mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProvider(false);
                      setEditingProvider(null);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && selectedProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  استيراد من {selectedProvider.name}
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Categories */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white">الفئات ({externalData.categories.length})</h4>
                    <button
                      onClick={() => selectAllItems('categories')}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      {selectedItems.categories.length === externalData.categories.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {externalData.categories.map(category => (
                      <div
                        key={category.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedItems.categories.includes(category.id)
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 bg-gray-700'
                        }`}
                        onClick={() => toggleItemSelection('categories', category.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-white">{category.name}</h5>
                            {category.description && (
                              <p className="text-sm text-gray-400">{category.description}</p>
                            )}
                          </div>
                          {selectedItems.categories.includes(category.id) && (
                            <CheckSquare className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Products */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white">المنتجات ({externalData.products.length})</h4>
                    <button
                      onClick={() => selectAllItems('products')}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      {selectedItems.products.length === externalData.products.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {externalData.products.map(product => (
                      <div
                        key={product.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedItems.products.includes(product.id)
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 bg-gray-700'
                        }`}
                        onClick={() => toggleItemSelection('products', product.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-white">{product.name}</h5>
                            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-400">
                              <span>${product.price}</span>
                              {product.description && (
                                <span>• {product.description.slice(0, 50)}...</span>
                              )}
                            </div>
                          </div>
                          {selectedItems.products.includes(product.id) && (
                            <CheckSquare className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  محدد: {selectedItems.categories.length} فئة، {selectedItems.products.length} منتج
                </div>
                
                <div className="flex items-center space-x-3 space-x-reverse">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={importSelectedItems}
                    disabled={importLoading || (selectedItems.categories.length === 0 && selectedItems.products.length === 0)}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse"
                  >
                    {importLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>استيراد المحدد</span>
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
