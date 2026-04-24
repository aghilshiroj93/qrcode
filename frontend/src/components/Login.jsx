import { useState } from 'react';
import api from '../api';
import { Lock, User, Scan, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLoginSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Username atau Password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
      <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <div className="bg-blue-600 p-4 rounded-[2.5rem] w-fit mx-auto shadow-2xl shadow-blue-600/20 rotate-12">
            <Scan size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase">QRPRO</h1>
            <p className="text-slate-500 font-medium mt-1">Sistem Manajemen & Validasi Identitas</p>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-premium border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" required
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl pl-14 pr-6 py-4 outline-none text-slate-800 font-bold transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl pl-14 pr-14 py-4 outline-none text-slate-800 font-bold transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black text-center border border-red-100 animate-bounce">
                {error}
              </div>
            )}

            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white py-5 rounded-[2rem] font-black shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  LOGIN SISTEM
                  <ArrowRight size={20} strokeWidth={3} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center space-y-2">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            Bantuan Administrator IT
          </p>
          <div className="flex justify-center gap-4">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-150" />
            <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse delay-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
