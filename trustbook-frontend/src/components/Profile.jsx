import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, login: refreshUser } = useAuth();
  const [tab, setTab] = useState('profile'); // profile | security
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return toast.error('Name is required');
    try {
      setSaving(true);
      const { data } = await updateProfile(profile);
      toast.success('Profile updated!');
      // Update local auth state
      if (data.user) {
        localStorage.setItem('tb_user', JSON.stringify(data.user));
      }
      window.location.reload(); // Quick refresh to propagate user data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) return toast.error('Fill all fields');
    if (passwords.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    try {
      setSaving(true);
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
          <span className="text-white text-3xl font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
        <p className="text-slate-400 text-sm">{user?.email}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-4 border-b border-slate-200">
        <button onClick={() => setTab('profile')}
          className={`pb-3 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${tab === 'profile' ? 'text-indigo-600 border-indigo-500' : 'text-slate-400 border-transparent'}`}>
          <FiUser size={14} /> Profile
        </button>
        <button onClick={() => setTab('security')}
          className={`pb-3 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${tab === 'security' ? 'text-indigo-600 border-indigo-500' : 'text-slate-400 border-transparent'}`}>
          <FiShield size={14} /> Security
        </button>
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 px-6 py-4">
            <h3 className="text-lg font-bold text-white">Edit Profile</h3>
            <p className="text-indigo-200 text-sm">Update your personal information</p>
          </div>
          <form onSubmit={handleProfileSave} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="text" placeholder="Your name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm"
                  value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="email" disabled value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="tel" placeholder="Optional"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm"
                  value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-indigo-800 transition-all cursor-pointer shadow-lg shadow-indigo-200 disabled:opacity-50">
              {saving ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><FiSave size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 px-6 py-4">
            <h3 className="text-lg font-bold text-white">Change Password</h3>
            <p className="text-indigo-200 text-sm">Update your password</p>
          </div>
          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Current Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="password" placeholder="Enter current password" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm"
                  value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="password" placeholder="At least 6 characters" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm"
                  value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="password" placeholder="Confirm new password" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm"
                  value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-indigo-800 transition-all cursor-pointer shadow-lg shadow-indigo-200 disabled:opacity-50">
              {saving ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><FiLock size={16} /> Change Password</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
