import { useEffect, useState, useCallback } from 'react';
import {
  FiPlus, FiSearch, FiUsers, FiChevronRight, FiTrash2, FiEdit2, FiX,
  FiUser, FiMail, FiPhone, FiFileText, FiTrendingUp, FiTrendingDown,
  FiArrowLeft, FiShare2,
} from 'react-icons/fi';
import {
  fetchMyAccounts, fetchSharedAccounts, createAccount, updateAccount,
  deleteAccount, searchAccounts,
} from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

/* ──────────── Create / Edit Modal ──────────── */
const AccountModal = ({ account, onClose, onSaved }) => {
  const isEdit = !!account;
  const [form, setForm] = useState({
    partyName: account?.partyName || '',
    partyPhone: account?.partyPhone || '',
    partyEmail: account?.partyEmail || '',
    description: account?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.partyName.trim()) return toast.error('Party name is required');
    try {
      setSaving(true);
      if (isEdit) {
        await updateAccount(account._id, form);
        toast.success('Account updated');
      } else {
        await createAccount(form);
        toast.success('Account created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{isEdit ? 'Edit Account' : 'New Account'}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white cursor-pointer"><FiX size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Party Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Party Name *</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input type="text" placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm"
                value={form.partyName} onChange={e => setForm({ ...form, partyName: e.target.value })} required />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input type="tel" placeholder="Optional"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm"
                value={form.partyPhone} onChange={e => setForm({ ...form, partyPhone: e.target.value })} />
            </div>
          </div>

          {/* Email (for linking) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Email <span className="text-slate-400 normal-case">(auto-links if they have TrustBook)</span>
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input type="email" placeholder="Optional"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm"
                value={form.partyEmail} onChange={e => setForm({ ...form, partyEmail: e.target.value })} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <div className="relative">
              <FiFileText className="absolute left-3.5 top-3 text-slate-400" size={15} />
              <input type="text" placeholder="Optional note" maxLength={200}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-indigo-800 transition-all cursor-pointer shadow-lg shadow-indigo-200 disabled:opacity-50">
            {saving ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><FiPlus size={16} />{isEdit ? 'Update Account' : 'Create Account'}</>}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ──────────── Account Card ──────────── */
const AccountCard = ({ account, onSelect, onEdit, onDelete, isShared }) => {
  const bal = account.balance || 0;
  return (
    <div
      onClick={() => onSelect(account._id)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">{account.partyName?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">{account.partyName}</h4>
            {isShared && (
              <p className="text-[10px] text-indigo-500 font-medium flex items-center gap-1">
                <FiShare2 size={10} /> Shared by {account.owner?.name || 'someone'}
              </p>
            )}
            {!isShared && account.partyUser && (
              <p className="text-[10px] text-emerald-500 font-medium">Linked</p>
            )}
          </div>
        </div>

        {!isShared && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={(e) => { e.stopPropagation(); onEdit(account); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 cursor-pointer">
              <FiEdit2 size={13} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(account._id); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 cursor-pointer">
              <FiTrash2 size={13} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Balance</p>
          <p className={`text-lg font-bold ${bal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(bal)}
          </p>
        </div>
        <div className="flex gap-3 text-[10px]">
          <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
            <FiTrendingUp size={10} />{formatCurrency(account.totalCredits || 0)}
          </span>
          <span className="text-rose-500 font-semibold flex items-center gap-0.5">
            <FiTrendingDown size={10} />{formatCurrency(account.totalDebits || 0)}
          </span>
        </div>
      </div>

      {account.description && (
        <p className="text-xs text-slate-400 mt-2 truncate">{account.description}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
        <span className="text-[10px] text-slate-400">{account.transactionCount || 0} entries</span>
        <FiChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
      </div>
    </div>
  );
};

/* ──────────── Main Accounts Component ──────────── */
const Accounts = ({ onSelectAccount }) => {
  const [tab, setTab] = useState('my'); // 'my' | 'shared'
  const [accounts, setAccounts] = useState([]);
  const [sharedAccounts, setSharedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const [myRes, sharedRes] = await Promise.all([fetchMyAccounts(), fetchSharedAccounts()]);
      setAccounts(myRes.data.accounts);
      setSharedAccounts(sharedRes.data.accounts);
    } catch (err) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account? Only possible if it has no transactions.')) return;
    try {
      await deleteAccount(id);
      toast.success('Account deleted');
      loadAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    try {
      const { data } = await searchAccounts(searchQuery.trim());
      setSearchResults(data.accounts);
    } catch { setSearchResults([]); }
  };

  const displayAccounts = tab === 'my'
    ? (searchResults || accounts)
    : sharedAccounts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Accounts</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage your ledger accounts</p>
        </div>
        <button onClick={() => { setEditAccount(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white text-sm font-semibold hover:from-indigo-600 hover:to-indigo-800 transition-all cursor-pointer shadow-lg shadow-indigo-200">
          <FiPlus size={16} /> New Account
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200">
        <button onClick={() => { setTab('my'); setSearchResults(null); setSearchQuery(''); }}
          className={`pb-3 text-sm font-semibold transition-all cursor-pointer border-b-2 ${tab === 'my' ? 'text-indigo-600 border-indigo-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
          <FiUsers size={14} className="inline mr-1.5" />My Accounts ({accounts.length})
        </button>
        <button onClick={() => { setTab('shared'); setSearchResults(null); setSearchQuery(''); }}
          className={`pb-3 text-sm font-semibold transition-all cursor-pointer border-b-2 ${tab === 'shared' ? 'text-indigo-600 border-indigo-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
          <FiShare2 size={14} className="inline mr-1.5" />Shared With Me ({sharedAccounts.length})
        </button>
      </div>

      {/* Search (only for my accounts) */}
      {tab === 'my' && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search accounts..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all placeholder:text-slate-300"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (!e.target.value) setSearchResults(null); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>
      )}

      {/* Accounts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : displayAccounts.length === 0 ? (
        <div className="text-center py-16">
          <FiUsers className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-400 font-medium">
            {tab === 'shared' ? 'No accounts shared with you yet' : 'No accounts yet'}
          </p>
          {tab === 'my' && (
            <p className="text-sm text-slate-300 mt-1">Create your first account to start recording entries</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayAccounts.map(acc => (
            <AccountCard
              key={acc._id}
              account={acc}
              isShared={tab === 'shared'}
              onSelect={onSelectAccount}
              onEdit={(a) => { setEditAccount(a); setShowModal(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AccountModal
          account={editAccount}
          onClose={() => { setShowModal(false); setEditAccount(null); }}
          onSaved={loadAccounts}
        />
      )}
    </div>
  );
};

export default Accounts;
