import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AdminLayout from '@/react-app/components/admin/AdminLayout';
import { 
  Filter, 
  Search, 
  Eye, 
  Check, 
  X, 
  DollarSign, 
  User,
  Calendar,
  Download,
  CreditCard,
  ImageIcon,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface WalletTransaction {
  id: number;
  user_id: number;
  amount: number;
  transaction_type: string;
  status: string;
  payment_method_id: number | null;
  receipt_image_url: string | null;
  transaction_id: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  payment_method_name: string | null;
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else if (response.status === 401 || response.status === 403) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async () => {
    if (!selectedTransaction) return;

    try {
      const response = await fetch(`/api/admin/transactions/${selectedTransaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approvalAction === 'approve' ? 'completed' : 'rejected',
          admin_notes: adminNotes
        })
      });

      if (response.ok) {
        await fetchTransactions();
        setShowApprovalModal(false);
        setSelectedTransaction(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleExportTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting transactions:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesType = filterType === 'all' || transaction.transaction_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'rejected':
        return 'مرفوضة';
      default:
        return 'معلقة';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
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
            <h1 className="text-3xl font-bold text-white" dir="rtl">إدارة المعاملات المالية</h1>
            <p className="text-gray-400" dir="rtl">عرض وإدارة جميع المعاملات المالية ({transactions.length} معاملة)</p>
          </div>
          <button 
            onClick={handleExportTransactions}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors"
          >
            <Download className="w-5 h-5" />
            <span dir="rtl">تصدير البيانات</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في المعاملات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                dir="rtl"
              />
            </div>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500" 
              dir="rtl"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">معلقة</option>
              <option value="completed">مكتملة</option>
              <option value="rejected">مرفوضة</option>
            </select>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500" 
              dir="rtl"
            >
              <option value="all">جميع الأنواع</option>
              <option value="deposit">إيداع</option>
              <option value="admin_credit">رصيد إداري</option>
              <option value="purchase">شراء</option>
            </select>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-colors">
              <Filter className="w-5 h-5" />
              <span dir="rtl">تصفية متقدمة</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/80">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">المستخدم</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">المبلغ</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">النوع</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">طريقة الدفع</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">التاريخ</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-300" dir="rtl">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{transaction.username}</p>
                          <p className="text-gray-400 text-sm">{transaction.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">${transaction.amount.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-xs">
                        {transaction.transaction_type === 'deposit' ? 'إيداع' : 
                         transaction.transaction_type === 'admin_credit' ? 'رصيد إداري' : 'شراء'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{transaction.payment_method_name || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {getStatusIcon(transaction.status)}
                        <span className={`px-2 py-1 rounded-lg text-xs ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">
                          {new Date(transaction.created_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 p-2 rounded-lg transition-colors" 
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {transaction.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setApprovalAction('approve');
                                setShowApprovalModal(true);
                              }}
                              className="text-green-400 hover:text-green-300 bg-green-500/20 hover:bg-green-500/30 p-2 rounded-lg transition-colors" 
                              title="موافقة"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setApprovalAction('reject');
                                setShowApprovalModal(true);
                              }}
                              className="text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30 p-2 rounded-lg transition-colors" 
                              title="رفض"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Details Modal */}
        {showDetailsModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white" dir="rtl">تفاصيل المعاملة</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Transaction Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-2" dir="rtl">معلومات المعاملة</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">رقم المعاملة:</span>
                        <span className="text-white">#{selectedTransaction.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">المبلغ:</span>
                        <span className="text-green-400 font-medium">${selectedTransaction.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">النوع:</span>
                        <span className="text-white">
                          {selectedTransaction.transaction_type === 'deposit' ? 'إيداع' : 
                           selectedTransaction.transaction_type === 'admin_credit' ? 'رصيد إداري' : 'شراء'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">الحالة:</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedTransaction.status)}`}>
                          {getStatusText(selectedTransaction.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-2" dir="rtl">معلومات المستخدم</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">اسم المستخدم:</span>
                        <span className="text-white">{selectedTransaction.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">البريد الإلكتروني:</span>
                        <span className="text-white">{selectedTransaction.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">طريقة الدفع:</span>
                        <span className="text-white">{selectedTransaction.payment_method_name || 'غير محدد'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                {selectedTransaction.transaction_id && (
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-2" dir="rtl">تفاصيل الدفع</h4>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400">رقم المعاملة:</span>
                      <span className="text-white font-mono">{selectedTransaction.transaction_id}</span>
                    </div>
                  </div>
                )}

                {/* Receipt Image */}
                {selectedTransaction.receipt_image_url && (
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3" dir="rtl">صورة الإيصال</h4>
                    <div className="flex items-center justify-center">
                      <img 
                        src={selectedTransaction.receipt_image_url} 
                        alt="إيصال الدفع"
                        className="max-w-full max-h-64 object-contain rounded-lg border border-gray-600"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                      <a 
                        href={selectedTransaction.receipt_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center space-x-2 space-x-reverse"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>عرض الصورة بالحجم الكامل</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedTransaction.admin_notes && (
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-2" dir="rtl">ملاحظات الإدارة</h4>
                    <p className="text-gray-300 text-sm">{selectedTransaction.admin_notes}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-2" dir="rtl">التواريخ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">تاريخ الإنشاء:</span>
                      <p className="text-white">{new Date(selectedTransaction.created_at).toLocaleString('ar-EG')}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">آخر تحديث:</span>
                      <p className="text-white">{new Date(selectedTransaction.updated_at).toLocaleString('ar-EG')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval/Rejection Modal */}
        {showApprovalModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4" dir="rtl">
                {approvalAction === 'approve' ? 'موافقة على المعاملة' : 'رفض المعاملة'}
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">المستخدم:</span>
                      <span className="text-white">{selectedTransaction.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">المبلغ:</span>
                      <span className="text-green-400">${selectedTransaction.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2" dir="rtl">
                    ملاحظات الإدارة
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="أدخل ملاحظات إضافية..."
                    dir="rtl"
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={handleApproveReject}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                      approvalAction === 'approve'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {approvalAction === 'approve' ? 'موافقة' : 'رفض'}
                  </button>
                  <button
                    onClick={() => {
                      setShowApprovalModal(false);
                      setSelectedTransaction(null);
                      setAdminNotes('');
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
