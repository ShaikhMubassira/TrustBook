import { useEffect, useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity, FiArrowUpRight, FiArrowDownRight, FiBarChart2, FiRefreshCw } from 'react-icons/fi';
import { fetchDashboardStats } from '../services/api';
import { formatCurrency, formatDate, getGreeting, getMonthName } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

/* ───── Tiny Bar Chart (no library needed) ───── */
const MiniBarChart = ({ data }) => {
  if (!data?.length) return null;
  const maxVal = Math.max(...data.map(d => Math.max(d.credits, d.debits)), 1);

  return (
    <div className="flex items-end gap-2 sm:gap-3 h-40 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          {/* Bars */}
          <div className="flex gap-0.5 items-end w-full h-28">
            <div className="flex-1 rounded-t-md bg-emerald-400 transition-all duration-500"
              style={{ height: `${(d.credits / maxVal) * 100}%`, minHeight: d.credits > 0 ? '4px' : '0' }} />
            <div className="flex-1 rounded-t-md bg-rose-400 transition-all duration-500"
              style={{ height: `${(d.debits / maxVal) * 100}%`, minHeight: d.debits > 0 ? '4px' : '0' }} />
          </div>
          {/* Label */}
          <span className="text-[10px] text-slate-400 font-medium">
            {getMonthName(d.month).slice(0, 3)}
          </span>
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const { data } = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const balance = stats?.currentBalance || 0;
  const trend = stats?.monthlyTrend || [];
  const totalCredits = stats?.totalCredits || 0;
  const totalDebits = stats?.totalDebits || 0;
  const totalTxn = stats?.totalTransactions || 0;

  // Compute quick insights
  const creditPct = totalCredits + totalDebits > 0
    ? Math.round((totalCredits / (totalCredits + totalDebits)) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h2>
          <p className="text-slate-500 mt-1">Here's your financial overview</p>
        </div>
        <button
          onClick={() => loadStats(true)}
          disabled={refreshing}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          title="Refresh"
        >
          <FiRefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Total Balance — Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 p-6 sm:p-8 shadow-xl shadow-indigo-200">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiDollarSign className="text-white/70" size={18} />
              <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Total Balance</p>
            </div>
            <p className={`text-4xl sm:text-5xl font-extrabold ${balance >= 0 ? 'text-white' : 'text-red-200'}`}>
              {formatCurrency(balance)}
            </p>
            <p className="text-indigo-200 text-sm mt-2">
              Net of all credits and debits
            </p>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Credits</p>
              <p className="text-emerald-300 text-lg sm:text-xl font-bold mt-1">{formatCurrency(totalCredits)}</p>
            </div>
            <div className="w-px bg-white/20 self-stretch" />
            <div className="text-center">
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Debits</p>
              <p className="text-rose-300 text-lg sm:text-xl font-bold mt-1">{formatCurrency(totalDebits)}</p>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 shadow-lg shadow-emerald-200 transition-transform duration-200 hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Total Credits</p>
              <p className="text-2xl font-bold mt-2 text-white">{formatCurrency(totalCredits)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FiTrendingUp className="text-white" size={20} />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 p-5 shadow-lg shadow-rose-200 transition-transform duration-200 hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Total Debits</p>
              <p className="text-2xl font-bold mt-2 text-white">{formatCurrency(totalDebits)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FiTrendingDown className="text-white" size={20} />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-5 shadow-lg shadow-amber-200 transition-transform duration-200 hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Transactions</p>
              <p className="text-2xl font-bold mt-2 text-white">{totalTxn}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FiActivity className="text-white" size={20} />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Monthly Trend + Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Monthly Trend</h3>
              <p className="text-sm text-slate-400 mt-0.5">Last 6 months overview</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Credits</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Debits</span>
            </div>
          </div>

          {trend.length > 0 ? (
            <MiniBarChart data={trend} />
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-300">
              <div className="text-center">
                <FiBarChart2 size={32} className="mx-auto mb-2" />
                <p className="text-sm font-medium">No trend data yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Insights */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Quick Insights</h3>
            <p className="text-sm text-slate-400 mt-0.5">At a glance</p>
          </div>
          <div className="mt-5 space-y-4 flex-1">
            {/* Credit vs Debit ratio */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Credit ratio</span>
                <span className="font-semibold text-emerald-600">{creditPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${creditPct}%` }} />
              </div>
            </div>

            {/* Average per txn */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Avg per transaction</span>
              <span className="text-sm font-bold text-slate-700">
                {totalTxn ? formatCurrency((totalCredits + totalDebits) / totalTxn) : '—'}
              </span>
            </div>

            {/* Latest trend */}
            {trend.length >= 2 && (() => {
              const curr = trend[trend.length - 1];
              const prev = trend[trend.length - 2];
              const currNet = curr.credits - curr.debits;
              const prevNet = prev.credits - prev.debits;
              const improved = currNet >= prevNet;
              return (
                <div className={`flex items-center gap-3 p-3 rounded-xl ${improved ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center 
                    ${improved ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {improved ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${improved ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {improved ? 'Improving' : 'Declining'} Trend
                    </p>
                    <p className="text-[10px] text-slate-400">
                      vs {getMonthName(prev.month).slice(0, 3)} {prev.year}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Recent Transactions</h3>
          <p className="text-sm text-slate-400 mt-0.5">Last 5 entries</p>
        </div>

        {!stats?.recentTransactions?.length ? (
          <div className="px-6 py-12 text-center">
            <FiActivity className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-400 font-medium">No transactions yet</p>
            <p className="text-sm text-slate-300 mt-1">Add your first entry to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {stats.recentTransactions.map((txn) => (
              <div key={txn._id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${txn.type === 'CR' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                  >
                    {txn.type === 'CR' ? <FiArrowDownRight size={18} /> : <FiArrowUpRight size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 line-clamp-1">{txn.narration}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(txn.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${txn.type === 'CR' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {txn.type === 'CR' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Bal: {formatCurrency(txn.runningBalance)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
