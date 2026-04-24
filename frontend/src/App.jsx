import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import DataManagement from './components/DataManagement';
import QRScanner from './components/QRScanner';
import Login from './components/Login';
import { LayoutDashboard, Users, Scan, LogOut } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('dashboard');
  };

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard, protected: true },
    { id: 'data', label: 'Data', icon: Users, protected: true },
    { id: 'scan', label: 'Scanner', icon: Scan, protected: false },
  ];

  if (loading) return null;

  // If not logged in and trying to access protected tabs, show Login
  const currentTabItem = navItems.find(item => item.id === activeTab);
  if (!user && currentTabItem?.protected) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col shadow-sm sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-600/20">
              <Scan size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 italic uppercase">QRPRO</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="text-[14px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        {user && (
          <div className="p-6 border-t border-slate-100 space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                {user.username[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 uppercase truncate">{user.username}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut size={16} /> KELUAR
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-8 relative">
        <header className="md:hidden bg-white/80 backdrop-blur-lg sticky top-0 z-30 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-xl">
              <Scan size={20} className="text-white" />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase">QRPRO</span>
          </div>
          {user && (
            <button onClick={handleLogout} className="p-2 text-slate-400">
              <LogOut size={20} />
            </button>
          )}
        </header>

        <div className="max-w-6xl mx-auto p-6 md:p-10">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'data' && <DataManagement />}
          {activeTab === 'scan' && <QRScanner />}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 flex justify-between items-center z-40 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1.5 px-6 py-1 transition-all relative ${
              activeTab === item.id ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            {activeTab === item.id && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-lg shadow-blue-600/50" />
            )}
            <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
