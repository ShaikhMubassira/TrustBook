import { useEffect, useState, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight, FiTrash2, FiSearch, FiArrowUpRight, FiArrowDownRight, FiDownload } from 'react-icons/fi';
import { fetchMonthlyStatement, deleteTransaction, searchTransactions } from '../services/api';
import { formatCurrency, formatDate, getMonthName } from '../utils/helpers';
import toast from 'react-hot-toast';

const Statement = ({ refreshKey }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState({ transactions: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setSearchResults(null);
      setSearchQuery('');
      const { data: result } = await fetchMonthlyStatement(year, month);
      setData(result);
    } catch (err) {
      toast.error('Failed to load statement');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handlePrev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const handleNext = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      setDeleting(id);
      await deleteTransaction(id);
      toast.success('Transaction deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    try {
      setLoading(true);
      const { data: results } = await searchTransactions(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const displayTransactions = searchResults || data.transactions;
  const { summary } = data;

  return (
    <div className="space-y-6">
      {/* Month Selector & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Month Nav */}
        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer">
            <FiChevronLeft size={18} />
          </button>
          <div className="text-center min-w-[160px]">
            <p className="text-lg font-bold text-slate-800">{getMonthName(month)} {year}</p>
          </div>
          <button onClick={handleNext} className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer">
            <FiChevronRight size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search narration..."
              className="w-full sm:w-56 pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm text-slate-700 transition-all placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) setSearchResults(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-all cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {!searchResults && summary && (
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
        ) : !displayTransactions?.length ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 font-medium">No transactions found</p>
            <p className="text-sm text-slate-300 mt-1">
              {searchResults ? 'Try a different search term' : 'No entries for this month'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Narration</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Credit</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Debit</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Balance</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayTransactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDate(txn.date)}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium max-w-[250px] truncate">{txn.narration}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {txn.type === 'CR' ? (
                          <span className="text-emerald-600 font-semibold">{formatCurrency(txn.amount)}</span>
                        ) : <span className="text-slate-200">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {txn.type === 'DR' ? (
                          <span className="text-rose-600 font-semibold">{formatCurrency(txn.amount)}</span>
                        ) : <span className="text-slate-200">—</span>}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${txn.runningBalance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                        {formatCurrency(txn.runningBalance)}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDelete(txn._id)}
                          disabled={deleting === txn._id}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-30"
                        >
                          {deleting === txn._id ? (
                            <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                          ) : (
                            <FiTrash2 size={14} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-slate-50">
              {displayTransactions.map((txn) => (
                <div key={txn._id} className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                      ${txn.type === 'CR' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                    >
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
                    <button
                      onClick={() => handleDelete(txn._id)}
                      disabled={deleting === txn._id}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Transaction count */}
      {!searchResults && summary?.transactionCount > 0 && (
        <p className="text-center text-xs text-slate-400">
          {summary.transactionCount} transaction{summary.transactionCount > 1 ? 's' : ''} in {getMonthName(month)} {year}
        </p>
      )}
    </div>
  );
};

export default Statement;
