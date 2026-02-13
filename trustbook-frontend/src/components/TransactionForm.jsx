import { useState, useEffect } from 'react';
import { FiPlusCircle, FiMinusCircle, FiSave, FiCalendar, FiFileText, FiDollarSign, FiUsers } from 'react-icons/fi';
import { addTransaction, fetchMyAccounts } from '../services/api';
import toast from 'react-hot-toast';

const TransactionForm = ({ onTransactionAdded }) => {
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    type: 'CR',
    narration: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyAccounts()
      .then(({ data }) => setAccounts(data.accounts))
      .catch(() => toast.error('Failed to load accounts'))
      .finally(() => setLoadingAccounts(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountId) {
      toast.error('Please select an account');
      return;
    }
    if (!formData.amount || !formData.narration.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (Number(formData.amount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    try {
      setSubmitting(true);
      await addTransaction({
        ...formData,
        amount: Number(formData.amount),
        narration: formData.narration.trim(),
      });
      const acct = accounts.find(a => a._id === formData.accountId);
      toast.success(
        `${formData.type === 'CR' ? 'Credit' : 'Debit'} of ₹${Number(formData.amount).toLocaleString('en-IN')} saved to ${acct?.partyName}!`,
        { icon: formData.type === 'CR' ? '✅' : '🔴' }
      );
      setFormData({ accountId: formData.accountId, amount: '', type: 'CR', narration: '', date: new Date().toISOString().split('T')[0] });
      if (onTransactionAdded) onTransactionAdded();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save transaction';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isCR = formData.type === 'CR';

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 px-6 py-5">
          <h2 className="text-xl font-bold text-white">New Transaction</h2>
          <p className="text-indigo-200 text-sm mt-1">Record a credit or debit entry</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Account Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Account *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <FiUsers size={16} />
              </span>
              {loadingAccounts ? (
                <div className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 text-sm text-slate-400">
                  Loading accounts...
                </div>
              ) : accounts.length === 0 ? (
                <div className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-amber-200 bg-amber-50 text-sm text-amber-700">
                  No accounts yet — create one in the Accounts tab first
                </div>
              ) : (
                <select
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm text-slate-800 transition-all bg-white appearance-none cursor-pointer"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  required
                >
                  <option value="">Select an account...</option>
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>{acc.partyName}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'CR' })}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border-2
                  ${isCR
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-100'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
              >
                <FiPlusCircle size={18} />
                Credit (+)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'DR' })}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border-2
                  ${!isCR
                    ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm shadow-rose-100'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
              >
                <FiMinusCircle size={18} />
                Debit (-)
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <FiDollarSign size={16} />
              </span>
              <input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-lg font-semibold text-slate-800 transition-all placeholder:text-slate-300"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">INR</span>
            </div>
          </div>

          {/* Narration */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Narration / Description
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400">
                <FiFileText size={16} />
              </span>
              <input
                type="text"
                placeholder="What is this transaction for?"
                maxLength={200}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm text-slate-800 transition-all placeholder:text-slate-300"
                value={formData.narration}
                onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                required
              />
            </div>
            <p className="mt-1 text-xs text-slate-300 text-right">{formData.narration.length}/200</p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Date
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <FiCalendar size={16} />
              </span>
              <input
                type="date"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm text-slate-800 transition-all"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || accounts.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg
              ${isCR
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-200'
                : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-200'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave size={18} />
                SAVE TO TRUSTBOOK
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
