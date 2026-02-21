import { useEffect, useState, useCallback } from 'react';
import {
  FiArrowLeft, FiChevronLeft, FiChevronRight, FiTrash2, FiSearch,
  FiArrowUpRight, FiArrowDownRight, FiDownload, FiFileText, FiPlusCircle,
  FiMinusCircle, FiSave, FiCalendar, FiDollarSign, FiShare2, FiFile,
} from 'react-icons/fi';
import {
  fetchAccountStatement, fetchAccountDetail, addTransaction,
  deleteTransaction, exportPDF, exportExcel,
} from '../services/api';
import { formatCurrency, formatDate, getMonthName } from '../utils/helpers';
import toast from 'react-hot-toast';

/* ──── Quick Add Transaction Modal ──── */
const QuickAddModal = ({ accountId, onClose, onAdded }) => {
  const [form, setForm] = useState({
    type: 'CR', amount: '', narration: '', date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.narration.trim()) return toast.error('Fill all fields');
    if (Number(form.amount) <= 0) return toast.error('Amount must be > 0');
    try {
      setSubmitting(true);
      await addTransaction({ accountId, ...form, amount: Number(form.amount) });
      toast.success(`${form.type === 'CR' ? 'Credit' : 'Debit'} saved!`, { icon: form.type === 'CR' ? '✅' : '🔴' });
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSubmitting(false); }
  };

  const isCR = form.type === 'CR';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">New Entry</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white cursor-pointer text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setForm({ ...form, type: 'CR' })}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm cursor-pointer border-2 transition-all
              ${isCR ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'}`}>
              <FiPlusCircle size={16} /> Credit
            </button>
            <button type="button" onClick={() => setForm({ ...form, type: 'DR' })}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm cursor-pointer border-2 transition-all
              ${!isCR ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-400'}`}>
              <FiMinusCircle size={16} /> Debit
            </button>
          </div>

          {/* Amount */}
          <div className="relative">
            <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input type="number" placeholder="Amount" min="0.01" step="0.01" required
              className="w-full pl-10 pr-14 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-lg font-semibold"
              value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">INR</span>
          </div>

          {/* Narration */}
          <div className="relative">
            <FiFileText className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input type="text" placeholder="Narration" maxLength={200} required
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm"
              value={form.narration} onChange={e => setForm({ ...form, narration: e.target.value })} />
          </div>

          {/* Date */}
          <div className="relative">
            <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input type="date"
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm"
              value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>

          <button type="submit" disabled={submitting}
            className={`w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50
            ${isCR ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-200' : 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-200'}`}>
            {submitting ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><FiSave size={16} /> Save Entry</>}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ──── Main Account Detail ──── */
const AccountDetail = ({ accountId, onBack }) => {
  const now = new Date();
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState('owner');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState({ transactions: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDetail = useCallback(async () => {
    try {
      const { data: d } = await fetchAccountDetail(accountId);
      setAccount(d.account);
      setRole(d.role);
    } catch (err) {
      toast.error('Failed to load account');
    }
  }, [accountId]);

  const loadStatement = useCallback(async () => {
    try {
      setLoading(true);
      const { data: result } = await fetchAccountStatement(accountId, year, month);
      setData(result);
    } catch (err) {
      toast.error('Failed to load statement');
    } finally {
      setLoading(false);
    }
  }, [accountId, year, month]);

  useEffect(() => { loadDetail(); }, [loadDetail]);
  useEffect(() => { loadStatement(); }, [loadStatement]);

  const handlePrev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const handleNext = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      setDeleting(id);
      await deleteTransaction(id);
      toast.success('Deleted');
      loadStatement();
      loadDetail();
    } catch (err) {
      toast.error('Failed to delete');
    } finally { setDeleting(null); }
  };

  const handleExport = async (type) => {
    try {
      const response = type === 'pdf'
        ? await exportPDF(accountId, year, month)
        : await exportExcel(accountId, year, month);
      
      const blob = response.data;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `TrustBook_${account?.partyName || 'statement'}_${getMonthName(month)}_${year}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`${type.toUpperCase()} downloaded!`);
    } catch (err) {
      toast.error('Export failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredTxns = searchQuery.trim()
    ? data.transactions.filter(t => t.narration.toLowerCase().includes(searchQuery.toLowerCase()))
    : data.transactions;
  const { summary } = data;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">{account?.partyName || '...'}</h2>
              {role === 'party' && (
                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <FiShare2 size={10} /> Shared
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">{account?.description || 'Account statement'}</p>
          </div>
        </div>

        {role === 'owner' && (
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white text-sm font-semibold hover:from-indigo-600 hover:to-indigo-800 transition-all cursor-pointer shadow-lg shadow-indigo-200">
            <FiPlusCircle size={16} /> New Entry
          </button>
        )}
      </div>

      {/* Month nav + Export + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
            <FiChevronLeft size={18} />
          </button>
          <div className="text-center min-w-[140px]">
            <p className="text-lg font-bold text-slate-800">{getMonthName(month)} {year}</p>
          </div>
          <button onClick={handleNext} className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
            <FiChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search..."
              className="w-full sm:w-44 pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all placeholder:text-slate-300"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

          {/* Export buttons */}
          <button onClick={() => handleExport('pdf')} title="Export PDF"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer">
            <FiFile size={16} />
          </button>
          <button onClick={() => handleExport('excel')} title="Export Excel"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer">
            <FiDownload size={16} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Opening', value: summary.openingBalance, color: 'text-slate-700' },
            { label: 'Credits', value: summary.totalCredits, color: 'text-emerald-600' },
            { label: 'Debits', value: summary.totalDebits, color: 'text-rose-600' },
            { label: 'Closing', value: summary.closingBalance, color: summary?.closingBalance >= 0 ? 'text-indigo-600' : 'text-rose-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className={`text-base sm:text-lg font-bold mt-1 ${color}`}>{formatCurrency(value || 0)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : !filteredTxns?.length ? (
          <div className="py-16 text-center">
            <FiFileText className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-400 font-medium">No transactions found</p>
            <p className="text-sm text-slate-300 mt-1">
              {searchQuery ? 'Try a different search' : 'No entries for this month'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Narration</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Credit</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Debit</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Balance</th>
                    {role === 'owner' && <th className="px-4 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTxns.map(txn => (
                    <tr key={txn._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDate(txn.date)}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium max-w-[250px] truncate">{txn.narration}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {txn.type === 'CR' ? <span className="text-emerald-600 font-semibold">{formatCurrency(txn.amount)}</span> : <span className="text-slate-200">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {txn.type === 'DR' ? <span className="text-rose-600 font-semibold">{formatCurrency(txn.amount)}</span> : <span className="text-slate-200">—</span>}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${txn.runningBalance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                        {formatCurrency(txn.runningBalance)}
                      </td>
                      {role === 'owner' && (
                        <td className="px-4 py-4">
                          <button onClick={() => handleDelete(txn._id)} disabled={deleting === txn._id}
                            className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-30">
                            {deleting === txn._id ? <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" /> : <FiTrash2 size={14} />}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-slate-50">
              {filteredTxns.map(txn => (
                <div key={txn._id} className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${txn.type === 'CR' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {txn.type === 'CR' ? <FiArrowDownRight size={16} /> : <FiArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 line-clamp-1">{txn.narration}</p>
                      <p className="text-xs text-slate-400">{formatDate(txn.date)}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className={`text-sm font-semibold ${txn.type === 'CR' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {txn.type === 'CR' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                      <p className="text-xs text-slate-400">{formatCurrency(txn.runningBalance)}</p>
                    </div>
                    {role === 'owner' && (
                      <button onClick={() => handleDelete(txn._id)} disabled={deleting === txn._id}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer">
                        <FiTrash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Count */}
      {summary?.transactionCount > 0 && (
        <p className="text-center text-xs text-slate-400">
          {summary.transactionCount} transaction{summary.transactionCount > 1 ? 's' : ''} in {getMonthName(month)} {year}
        </p>
      )}

      {/* Quick Add Modal */}
      {showAddModal && (
        <QuickAddModal
          accountId={accountId}
          onClose={() => setShowAddModal(false)}
          onAdded={() => { loadStatement(); loadDetail(); }}
        />
      )}
    </div>
  );
};

export default AccountDetail;
