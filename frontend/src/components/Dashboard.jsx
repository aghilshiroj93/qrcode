import { useEffect, useState } from 'react';
import api from '../api';
import { Users, Building2, QrCode, TrendingUp, Activity, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, divisions: 0, scans: 0 });

  useEffect(() => {
    api.get('/members').then(res => setStats(res.data.stats)).catch(console.error);
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Halo, Admin 👋</h2>
          <p className="text-slate-500 font-medium mt-1">Selamat datang kembali di sistem QR PRO.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 w-fit">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Sistem Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Total Members Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-blue-500 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 bg-blue-50 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
          <div className="bg-blue-600 p-4 rounded-2xl w-fit mb-6 shadow-lg shadow-blue-600/20">
            <Users className="text-white" size={28} />
          </div>
          <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Total Personel</h3>
          <div className="flex items-end gap-3 mt-2">
            <p className="text-5xl font-black text-slate-900 leading-none">{stats.total}</p>
            <span className="text-emerald-500 text-xs font-black bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1 mb-1">
              <TrendingUp size={12} /> +2%
            </span>
          </div>
          <p className="text-slate-400 text-xs font-medium mt-4">Terdaftar di semua divisi</p>
        </div>

        {/* Divisions Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-emerald-500 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 bg-emerald-50 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
          <div className="bg-emerald-500 p-4 rounded-2xl w-fit mb-6 shadow-lg shadow-emerald-500/20">
            <Building2 className="text-white" size={28} />
          </div>
          <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Unit/Divisi</h3>
          <p className="text-5xl font-black text-slate-900 mt-2 leading-none">{stats.divisions}</p>
          <p className="text-slate-400 text-xs font-medium mt-4">Aktif saat ini</p>
        </div>

        {/* Activity Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-purple-500 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 bg-purple-50 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
          <div className="bg-purple-600 p-4 rounded-2xl w-fit mb-6 shadow-lg shadow-purple-600/20">
            <QrCode className="text-white" size={28} />
          </div>
          <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Aktivitas Scan</h3>
          <p className="text-5xl font-black text-slate-900 mt-2 leading-none">{stats.scans}</p>
          <p className="text-slate-400 text-xs font-medium mt-4">Terpantau real-time</p>
        </div>
      </div>

      {/* Modern Info Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 space-y-4 text-center md:text-left">
          <div className="bg-white/20 px-4 py-1.5 rounded-full w-fit mx-auto md:mx-0 flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-xs font-black uppercase tracking-widest">Sistem Terenkripsi</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight">Keamanan Data & Validasi QR Code yang Ketat.</h3>
          <p className="text-blue-100 font-medium text-sm md:text-base max-w-xl">Hanya identitas yang terdaftar secara resmi di database yang akan mendapatkan akses dan status 'Diterima' oleh scanner.</p>
        </div>
        <div className="relative z-10 hidden lg:block bg-white/10 p-8 rounded-full backdrop-blur-3xl animate-bounce duration-[3000ms]">
          <Activity size={80} className="text-white/40" />
        </div>
      </div>
    </div>
  );
}
