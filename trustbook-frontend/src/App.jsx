import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import Accounts from './components/Accounts';
import AccountDetail from './components/AccountDetail';
import Profile from './components/Profile';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const handleTransactionAdded = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setActiveTab('accounts');
  }, []);

  const handleSelectAccount = useCallback((id) => {
    setSelectedAccountId(id);
    setActiveTab('account-detail');
  }, []);

  const handleBackToAccounts = useCallback(() => {
    setSelectedAccountId(null);
    setActiveTab('accounts');
  }, []);

  // Loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading TrustBook...</p>
        </div>
      </div>
    );
  }

  // Show auth page when not logged in
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
        {activeTab === 'dashboard' && <Dashboard key={refreshKey} />}
        {activeTab === 'new' && <TransactionForm onTransactionAdded={handleTransactionAdded} />}
        {activeTab === 'accounts' && <Accounts onSelectAccount={handleSelectAccount} />}
        {activeTab === 'account-detail' && selectedAccountId && (
          <AccountDetail accountId={selectedAccountId} onBack={handleBackToAccounts} />
        )}
        {activeTab === 'profile' && <Profile />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '14px 20px',
            fontSize: '14px',
            fontWeight: 500,
          },
        }}
      />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
