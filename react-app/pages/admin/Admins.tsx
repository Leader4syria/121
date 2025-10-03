import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AdminLayout from '@/react-app/components/admin/AdminLayout';
import { 
  Search, 
  Plus, 
  Settings, 
  Trash, 
  Shield,
  Check,
  X
} from 'lucide-react';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  permissions: Record<string, boolean>;
}

const AVAILABLE_PERMISSIONS = [
  { key: 'dashboard_access', name: 'الوصول للوحة التحكم', description: 'إمكانية الوصول لصفحة لوحة التحكم' },
  { key: 'users_management', name: 'إدارة المستخدمين', description: 'عرض وتعديل وحذف المستخدمين' },
  { key: 'categories_management', name: 'إدارة الفئات', description: 'إضافة وتعديل وحذف الفئات' },
  { key: 'products_management', name: 'إدارة المنتجات', description: 'إضافة وتعديل وحذف المنتجات' },
  { key: 'orders_management', name: 'إدارة الطلبات', description: 'عرض وإدارة الطلبات' },
  { key: 'transactions_management', name: 'إدارة المعاملات', description: 'عرض وإدارة المعاملات المالية' },
  { key: 'payment_methods_management', name: 'إدارة طرق الدفع', description: 'إضافة وتعديل طرق الدفع' },
  { key: 'banners_management', name: 'إدارة البانرات', description: 'إضافة وتعديل البانرات' },
  { key: 'settings_management', name: 'إدارة الإعدادات', description: 'تعديل إعدادات النظام' },
  { key: 'admins_management', name: 'إدارة المشرفين', description: 'إضافة وتعديل صلاحيات المشرفين' }
];

export default function AdminsManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins');
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      } else if (response.status === 401 || response.status === 403) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdminEmail,
          permissions: selectedPermissions
        })
      });

      if (response.ok) {
        await fetchAdmins();
        setShowAddForm(false);
        setNewAdminEmail('');
        setSelectedPermissions({});
      }
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!editingAdmin) return;
    
    try {
      const response = await fetch(`/api/admin/admins/${editingAdmin.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedPermissions)
      });

      if (response.ok) {
        await fetchAdmins();
        setShowModal(false);
        setEditingAdmin(null);
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  const handleRemoveAdmin = async (id: number) => {
    if (!confirm('هل أنت متأكد من إزالة صلاحيات الإدارة من هذا المستخدم؟')) return;
    
    try {
      const response = await fetch(`/api/admin/admins/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAdmins();
      }
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  };

  const openPermissionsModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setSelectedPermissions(admin.permissions || {});
    setShowModal(true);
  };

  const openAddForm = () => {
    const defaultPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
      acc[perm.key] = perm.key === 'dashboard_access'; // Default dashboard access only
      return acc;
    }, {} as Record<string, boolean>);
    
    setSelectedPermissions(defaultPermissions);
    setShowAddForm(true);
  };

  const filteredAdmins = admins.filter(admin =>
    admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold text-white" dir="rtl">إدارة المشرفين</h1>
            <p className="text-gray-400" dir="rtl">إضافة وإدارة صلاحيات المشرفين</p>
          </div>
          <button 
            onClick={openAddForm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span dir="rtl">إضافة مشرف</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في المشرفين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              dir="rtl"
            />
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">المشرف</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الصلاحيات</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">تاريخ الإضافة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {admin.full_name?.charAt(0) || admin.email?.charAt(0) || 'A'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium" dir="rtl">{admin.full_name || admin.username}</p>
                          <p className="text-gray-400 text-sm" dir="ltr">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(admin.permissions || {}).filter(([, enabled]) => enabled).slice(0, 3).map(([key]) => {
                          const perm = AVAILABLE_PERMISSIONS.find(p => p.key === key);
                          return (
                            <span key={key} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
                              {perm?.name || key}
                            </span>
                          );
                        })}
                        {Object.values(admin.permissions || {}).filter(Boolean).length > 3 && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
                            +{Object.values(admin.permissions || {}).filter(Boolean).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center space-x-1 space-x-reverse text-sm ${
                        admin.is_active ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {admin.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span dir="rtl">{admin.is_active ? 'نشط' : 'معطل'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">
                        {new Date(admin.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openPermissionsModal(admin)}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded"
                          title="تعديل الصلاحيات"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRemoveAdmin(admin.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded"
                          title="إزالة صلاحيات الإدارة"
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

        {/* Add Admin Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4" dir="rtl">إضافة مشرف جديد</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="example@domain.com"
                    dir="ltr"
                  />
                  <p className="text-gray-400 text-sm mt-1" dir="rtl">
                    يجب أن يكون للمستخدم حساب موجود في النظام
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4" dir="rtl">الصلاحيات</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <div key={permission.key} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                        <div className="flex-1" dir="rtl">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-white font-medium">{permission.name}</span>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{permission.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={selectedPermissions[permission.key] || false}
                            onChange={(e) => setSelectedPermissions(prev => ({
                              ...prev,
                              [permission.key]: e.target.checked
                            }))}
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse pt-4">
                  <button
                    onClick={handleAddAdmin}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    إضافة المشرف
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Permissions Modal */}
        {showModal && editingAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4" dir="rtl">
                تعديل صلاحيات: {editingAdmin.full_name || editingAdmin.username}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission.key} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                      <div className="flex-1" dir="rtl">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">{permission.name}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{permission.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={selectedPermissions[permission.key] || false}
                          onChange={(e) => setSelectedPermissions(prev => ({
                            ...prev,
                            [permission.key]: e.target.checked
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3 space-x-reverse pt-4">
                  <button
                    onClick={handleUpdatePermissions}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    حفظ التغييرات
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
