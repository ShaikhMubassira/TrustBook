import { FiBookOpen, FiHome, FiPlusCircle, FiUsers, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'new', label: 'New Entry', icon: FiPlusCircle },
    { id: 'accounts', label: 'Accounts', icon: FiUsers },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
              <FiBookOpen className="text-white text-lg" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent tracking-tight">
              TrustBook
            </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                  ${activeTab === id
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}

            {/* Separator */}
            <div className="w-px h-6 bg-slate-200 mx-2" />

            {/* User info / Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer
                ${activeTab === 'profile'
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-100'
                  : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                }`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate hidden md:block">{user?.name?.split(' ')[0] || 'User'}</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              title="Logout"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-indigo-100">
        <div className="flex justify-around py-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all cursor-pointer
                ${activeTab === id
                  ? 'text-indigo-600'
                  : 'text-slate-400'
                }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all cursor-pointer
              ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <FiUser size={20} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
          <button
            onClick={logout}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all cursor-pointer text-slate-400"
          >
            <FiLogOut size={20} />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
