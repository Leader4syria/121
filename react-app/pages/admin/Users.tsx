import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AdminLayout from '@/react-app/components/admin/AdminLayout';
import { 
  Search, 
  Filter, 
  Edit, 
  Eye,
  Crown,
  User,
  DollarSign,
  Check,
  X,
  Download,
  UserPlus,
  Mail,
  Calendar
} from 'lucide-react';

interface User {
  id: number;
  mocha_user_id: string;
  username: string;
  email: string;
  full_name: string;
  balance: number;
  is_admin: boolean;
  is_vip: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addNotes, setAddNotes] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users?page=${currentPage}&limit=20`);
      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else if (response.status === 401 || response.status === 403) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async () => {
    if (!selectedUser || !addAmount) return;

    try {
      const amount = parseFloat(addAmount);
      if (amount <= 0) return;

      const response = await fetch(`/api/admin/users/${selectedUser.id}/add-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          notes: addNotes || 'إضافة رصيد من لوحة التحكم'
        })
      });

      if (response.ok) {
        await fetchUsers();
        setShowAddBalanceModal(false);
        setSelectedUser(null);
        setAddAmount('');
        setAddNotes('');
      }
    } catch (error) {
      console.error('Error adding balance:', error);
    }
  };

  const handleToggleUserStatus = async (userId: number, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: newStatus
        })
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleToggleUserType = async (userId: number, type: 'admin' | 'vip', newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [type === 'admin' ? 'is_admin' : 'is_vip']: newStatus
        })
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user type:', error);
    }
  };

  const handleViewUser = (user: User) => {
    // You can implement a user details modal or navigate to a details page
    alert(`عرض تفاصيل المستخدم: ${user.username}`);
  };

  const handleEditUser = (user: User) => {
    // You can implement a user edit modal or navigate to an edit page
    alert(`تعديل المستخدم: ${user.username}`);
  };

  const handleExportUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && user.is_active) ||
                         (filterActive === 'inactive' && !user.is_active);
    
    const matchesType = filterType === 'all' ||
                       (filterType === 'admin' && user.is_admin) ||
                       (filterType === 'vip' && user.is_vip) ||
                       (filterType === 'regular' && !user.is_admin && !user.is_vip);
    
    return matchesSearch && matchesActive && matchesType;
  });

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
            <h1 className="text-3xl font-bold text-white" dir="rtl">إدارة المستخدمين</h1>
            <p className="text-gray-400" dir="rtl">عرض وإدارة جميع المستخدمين ({total} مستخدم)</p>
          </div>
          <div className="flex space-x-3 space-x-reverse">
            <button 
              onClick={handleExportUsers}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors"
            >
              <Download className="w-5 h-5" />
              <span dir="rtl">تصدير البيانات</span>
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors">
              <UserPlus className="w-5 h-5" />
              <span dir="rtl">إضافة مستخدم</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في المستخدمين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                dir="rtl"
              />
            </div>
            <select 
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500" 
              dir="rtl"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">معطل</option>
            </select>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500" 
              dir="rtl"
            >
              <option value="all">جميع الأنواع</option>
              <option value="admin">مشرف</option>
              <option value="vip">مميز</option>
              <option value="regular">عادي</option>
            </select>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-colors">
              <Filter className="w-5 h-5" />
              <span dir="rtl">تصفية متقدمة</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">المستخدم</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">البريد الإلكتروني</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الرصيد</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">النوع</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">تاريخ التسجيل</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-gray-400 text-sm">{user.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">{user.balance.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleToggleUserType(user.id, 'admin', !user.is_admin)}
                          className={`px-2 py-1 rounded-lg text-xs flex items-center space-x-1 transition-colors ${
                            user.is_admin 
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                              : 'bg-gray-500/20 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                          }`}
                          title={user.is_admin ? 'إزالة صلاحية المشرف' : 'منح صلاحية المشرف'}
                        >
                          <Crown className="w-3 h-3" />
                          <span>{user.is_admin ? 'مشرف' : 'عادي'}</span>
                        </button>
                        <button
                          onClick={() => handleToggleUserType(user.id, 'vip', !user.is_vip)}
                          className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                            user.is_vip 
                              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                              : 'bg-gray-500/20 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400'
                          }`}
                          title={user.is_vip ? 'إزالة العضوية المميزة' : 'منح العضوية المميزة'}
                        >
                          <span>{user.is_vip ? 'مميز' : 'عادي'}</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-lg text-xs ${
                          user.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {user.is_active ? 'نشط' : 'معطل'}
                        </span>
                        <button
                          onClick={() => handleToggleUserStatus(user.id, !user.is_active)}
                          className={`p-1 rounded ${
                            user.is_active
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                              : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                          }`}
                        >
                          {user.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">
                          {new Date(user.created_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="text-blue-400 hover:text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 p-2 rounded-lg transition-colors" 
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setShowAddBalanceModal(true);
                          }}
                          className="text-green-400 hover:text-green-300 bg-green-500/20 hover:bg-green-500/30 p-2 rounded-lg transition-colors" 
                          title="إضافة رصيد"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-yellow-400 hover:text-yellow-300 bg-yellow-500/20 hover:bg-yellow-500/30 p-2 rounded-lg transition-colors" 
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-700/50 flex items-center justify-between">
            <div className="text-sm text-gray-400" dir="rtl">
              عرض {filteredUsers.length} من {total} مستخدم
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                السابق
              </button>
              <span className="text-gray-400 text-sm">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        </div>

        {/* Add Balance Modal */}
        {showAddBalanceModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4" dir="rtl">
                إضافة رصيد للمستخدم
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center space-x-3 space-x-reverse mb-2">
                    <User className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">{selectedUser.username}</span>
                  </div>
                  <div className="text-sm text-gray-400" dir="rtl">
                    الرصيد الحالي: ${selectedUser.balance.toFixed(2)}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">
                    مبلغ الإضافة (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">
                    ملاحظات
                  </label>
                  <textarea
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="أدخل ملاحظات إضافية..."
                    dir="rtl"
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={handleAddBalance}
                    disabled={!addAmount || parseFloat(addAmount) <= 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    إضافة الرصيد
                  </button>
                  <button
                    onClick={() => {
                      setShowAddBalanceModal(false);
                      setSelectedUser(null);
                      setAddAmount('');
                      setAddNotes('');
                    }}
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
