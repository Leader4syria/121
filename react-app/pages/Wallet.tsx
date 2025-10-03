import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, Plus, Eye, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import Layout from '@/react-app/components/Layout';

interface Transaction {
  id: number;
  amount: number;
  transaction_type: string;
  status: string;
  created_at: string;
  payment_method_id?: number;
  payment_method_name?: string;
  transaction_id?: string;
  admin_notes?: string;
}

interface WalletStats {
  totalDeposits: number;
  totalSpent: number;
  totalTransactions: number;
  pendingTransactions: number;
}

export default function Wallet() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalDeposits: 0,
    totalSpent: 0,
    totalTransactions: 0,
    pendingTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/wallet/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
        
        // Calculate stats
        const deposits = data.filter((t: Transaction) => t.transaction_type === 'deposit' && t.status === 'completed');
        const withdrawals = data.filter((t: Transaction) => t.transaction_type === 'withdrawal' && t.status === 'completed');
        const purchases = data.filter((t: Transaction) => t.transaction_type === 'purchase' && t.status === 'completed');
        const pending = data.filter((t: Transaction) => t.status === 'pending');
        
        const totalDeposits = deposits.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        const totalWithdrawals = withdrawals.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        const totalPurchases = purchases.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        
        setStats({
          totalDeposits,
          totalSpent: totalWithdrawals + totalPurchases,
          totalTransactions: data.length,
          pendingTransactions: pending.length
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchTransactions(),
      refreshUser()
    ]);
    setRefreshing(false);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'withdrawal':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'purchase':
        return <WalletIcon className="w-5 h-5 text-blue-500" />;
      case 'admin_credit':
        return <Plus className="w-5 h-5 text-purple-500" />;
      default:
        return <WalletIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قيد المراجعة';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'إيداع رصيد';
      case 'withdrawal':
        return 'سحب رصيد';
      case 'purchase':
        return 'شراء';
      case 'admin_credit':
        return 'رصيد إداري';
      default:
        return 'معاملة';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.transaction_type === filter;
  });

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4" dir="rtl">يجب تسجيل الدخول لعرض المحفظة</p>
            <Link to="/login" className="bg-red-600 text-white px-6 py-3 rounded-xl">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2" dir="rtl">محفظتي</h1>
                <p className="text-gray-400" dir="rtl">إدارة رصيدك ومعاملاتك المالية</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span dir="rtl">تحديث</span>
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-lg mb-2" dir="rtl">الرصيد الحالي</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-bold text-white">${user.balance?.toFixed(2) || '0.00'}</span>
                  <span className="text-red-100 text-lg">USD</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <WalletIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/add-funds"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl flex items-center space-x-2 space-x-reverse transition-all"
              >
                <Plus className="w-5 h-5" />
                <span dir="rtl">إضافة رصيد</span>
              </Link>
              <Link
                to="/my-payments"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl flex items-center space-x-2 space-x-reverse transition-all"
              >
                <Eye className="w-5 h-5" />
                <span dir="rtl">المدفوعات</span>
              </Link>
              {stats.pendingTransactions > 0 && (
                <div className="bg-yellow-500/20 backdrop-blur-sm text-yellow-300 px-6 py-3 rounded-xl flex items-center space-x-2 space-x-reverse">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  <span dir="rtl">{stats.pendingTransactions} معاملة معلقة</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500/20 rounded-xl p-3">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-2xl font-bold text-white">+${stats.totalDeposits.toFixed(2)}</span>
              </div>
              <p className="text-gray-400" dir="rtl">إجمالي الإيداعات</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-500/20 rounded-xl p-3">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
                <span className="text-2xl font-bold text-white">-${stats.totalSpent.toFixed(2)}</span>
              </div>
              <p className="text-gray-400" dir="rtl">إجمالي المصروفات</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500/20 rounded-xl p-3">
                  <Eye className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.totalTransactions}</span>
              </div>
              <p className="text-gray-400" dir="rtl">عدد المعاملات</p>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white" dir="rtl">المعاملات الأخيرة</h2>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    dir="rtl"
                  >
                    <option value="all">جميع المعاملات</option>
                    <option value="deposit">الإيداعات</option>
                    <option value="withdrawal">السحب</option>
                    <option value="purchase">المشتريات</option>
                    <option value="admin_credit">رصيد إداري</option>
                  </select>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 space-x-reverse transition-colors">
                    <Filter className="w-4 h-4" />
                    <span dir="rtl">فلتر</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="divide-y divide-gray-700/50">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="bg-gray-700 rounded-xl p-3">
                            {getTransactionIcon(transaction.transaction_type)}
                          </div>
                          <div>
                            <h3 className="text-white font-medium" dir="rtl">
                              {getTypeText(transaction.transaction_type)}
                            </h3>
                            <p className="text-gray-400 text-sm" dir="rtl">
                              {new Date(transaction.created_at).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {transaction.payment_method_name && (
                              <p className="text-gray-500 text-xs" dir="rtl">
                                {transaction.payment_method_name}
                              </p>
                            )}
                            {transaction.transaction_id && (
                              <p className="text-gray-500 text-xs font-mono" dir="ltr">
                                ID: {transaction.transaction_id}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2 space-x-reverse mb-1">
                            <span className={`text-lg font-bold ${
                              transaction.transaction_type === 'deposit' || transaction.transaction_type === 'admin_credit' 
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
                              {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'admin_credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                            </span>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                            {getStatusText(transaction.status)}
                          </span>
                          {transaction.admin_notes && (
                            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg max-w-xs">
                              <p className="text-blue-400 text-xs font-medium mb-1" dir="rtl">ملاحظة الإدارة:</p>
                              <p className="text-gray-300 text-xs" dir="rtl">{transaction.admin_notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <WalletIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2" dir="rtl">لا توجد معاملات</h3>
                  <p className="text-gray-400 mb-6" dir="rtl">
                    {filter === 'all' 
                      ? 'لم تقم بأي معاملات مالية بعد'
                      : `لا توجد معاملات من نوع ${filter === 'deposit' ? 'الإيداعات' : filter === 'withdrawal' ? 'السحب' : filter === 'purchase' ? 'المشتريات' : 'الرصيد الإداري'}`
                    }
                  </p>
                  <Link
                    to="/add-funds"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl inline-flex items-center space-x-2 space-x-reverse transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span dir="rtl">إضافة رصيد</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
