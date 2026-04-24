import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit2, Trash2, Download, FileUp, QrCode, Search, User, ChevronLeft, ChevronRight, X, Save } from 'lucide-react';
import QRCode from 'qrcode';



export default function DataManagement() {
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama: '', divisi: '', foto: null, existingFoto: '', preview: null });
  const [importing, setImporting] = useState(false);
  const [qrPreviews, setQrPreviews] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    members.forEach(member => {
      generateQrPreview(member);
    });
  }, [members]);

  const fetchMembers = async () => {
    const res = await api.get('/members');
    setMembers(res.data.members);
  };

  const generateQrPreview = async (member) => {
    if (qrPreviews[member.id]) return;
    const qrData = JSON.stringify({ id: member.identifier, n: member.nama, d: member.divisi, p: member.foto });
    const dataUrl = await QRCode.toDataURL(qrData, { width: 80, margin: 1 });
    setQrPreviews(prev => ({ ...prev, [member.id]: dataUrl }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('nama', formData.nama);
    fd.append('divisi', formData.divisi);
    if (formData.foto) fd.append('foto', formData.foto);
    fd.append('existingFoto', formData.existingFoto || '');

    try {
      if (formData.id) {
        await api.put(`/members/${formData.id}`, fd);
      } else {
        await api.post('/members', fd);
      }
      setIsModalOpen(false);
      resetForm();
      fetchMembers();
    } catch (err) {
      alert('Gagal menyimpan data');
    }
  };

  const resetForm = () => {
    setFormData({ id: null, nama: '', divisi: '', foto: null, existingFoto: '', preview: null });
  };

  const handleEdit = (member) => {
    setFormData({ 
      id: member.id, 
      nama: member.nama, 
      divisi: member.divisi, 
      foto: null, 
      existingFoto: member.foto,
      preview: member.foto ? member.foto : null 
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, foto: file, preview: URL.createObjectURL(file) });
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus?')) {
      await api.delete(`/members/${id}`);
      fetchMembers();
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post('/members/import', fd);
      fetchMembers();
    } catch (err) {
      alert('Import gagal');
    }
    setImporting(false);
  };

  const downloadQR = async (member) => {
    const qrData = JSON.stringify({ id: member.identifier, n: member.nama, d: member.divisi, p: member.foto });
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    await QRCode.toCanvas(canvas, qrData, { width: 600, margin: 4, errorCorrectionLevel: 'H' });
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanName = member.nama.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `QR_${cleanName}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
  };

  // Logic for filtering and pagination
  const filteredMembers = members.filter(m => 
    m.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.divisi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">DATA PERSONEL</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Total: {members.length} Orang Terdaftar</p>
        </div>
        <div className="flex gap-2">
          <label className="flex-1 lg:flex-none bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all border border-slate-200 shadow-sm font-black text-[9px] uppercase tracking-widest">
            <FileUp size={16} className="text-blue-600" />
            <span>{importing ? '...' : 'Import'}</span>
            <input type="file" className="hidden" accept=".xlsx" onChange={handleImport} />
          </label>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 font-black text-[9px] uppercase tracking-widest"
          >
            <Plus size={16} />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
        <input 
          type="text" placeholder="Cari data..." value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3.5 outline-none focus:border-blue-500 transition-all font-bold text-slate-700 shadow-sm text-sm"
        />
      </div>

      {/* Optimized Desktop Table */}
      <div className="hidden md:block bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-premium">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <tr>
                <th className="p-5 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400">Profil</th>
                <th className="p-5 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400">Nama & Divisi</th>
                <th className="p-5 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 text-center">QR Code</th>
                <th className="p-5 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.map(member => (
                <tr key={member.id} className="hover:bg-blue-50/30 transition-all">
                  <td className="p-4">
                    {member.foto ? (
                      <img src={member.foto} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border-2 border-white">
                        <User size={20} className="text-slate-300" />
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-black text-slate-900 text-base leading-tight uppercase">{member.nama}</div>
                    <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">{member.divisi}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      {qrPreviews[member.id] && (
                        <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-50">
                          <img src={qrPreviews[member.id]} alt="QR" className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => downloadQR(member)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90">
                        <Download size={16} strokeWidth={3} />
                      </button>
                      <button onClick={() => handleEdit(member)} className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90">
                        <Edit2 size={16} strokeWidth={3} />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90">
                        <Trash2 size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Halaman {currentPage} dari {totalPages}</span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 bg-white rounded-lg border border-slate-200 disabled:opacity-30 active:scale-95 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 bg-white rounded-lg border border-slate-200 disabled:opacity-30 active:scale-95 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View with Pagination */}
      <div className="md:hidden space-y-4">
        {currentItems.map(member => (
          <div key={member.id} className="bg-white rounded-[1.8rem] border border-slate-100 shadow-premium overflow-hidden">
            <div className="p-4 flex items-center gap-4">
              {member.foto ? (
                <img src={member.foto} alt="" className="w-16 h-16 rounded-[1.2rem] object-cover border-2 border-slate-50" />
              ) : (
                <div className="w-16 h-16 rounded-[1.2rem] bg-slate-50 flex items-center justify-center">
                  <User size={24} className="text-slate-300" />
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <div className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{member.nama}</div>
                <div className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit uppercase tracking-widest mt-1">{member.divisi}</div>
              </div>
              <div className="bg-white p-1 rounded-lg border border-slate-50 shadow-sm">
                {qrPreviews[member.id] && <img src={qrPreviews[member.id]} alt="QR" className="w-10 h-10" />}
              </div>
            </div>
            <div className="grid grid-cols-3 bg-slate-50/30 p-1.5 gap-1.5 border-t border-slate-50">
              <button onClick={() => downloadQR(member)} className="flex items-center justify-center gap-1 py-3 bg-white text-blue-600 rounded-2xl font-black text-[8px] uppercase tracking-widest border border-slate-100 shadow-sm active:scale-95">
                <Download size={14} /> SIMPAN
              </button>
              <button onClick={() => handleEdit(member)} className="flex items-center justify-center gap-1 py-3 bg-white text-amber-600 rounded-2xl font-black text-[8px] uppercase tracking-widest border border-slate-100 shadow-sm active:scale-95">
                <Edit2 size={14} /> EDIT
              </button>
              <button onClick={() => handleDelete(member.id)} className="flex items-center justify-center gap-1 py-3 bg-white text-red-600 rounded-2xl font-black text-[8px] uppercase tracking-widest border border-slate-100 shadow-sm active:scale-95">
                <Trash2 size={14} /> HAPUS
              </button>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm disabled:opacity-20 active:scale-90 transition-all"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentPage} / {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm disabled:opacity-20 active:scale-90 transition-all"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>
        )}
      </div>

      {/* Modal Sheet Form (Refined) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-end md:items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-400 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900 tracking-tighter uppercase italic">FORM DATA</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-50 text-slate-400 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="flex flex-col items-center mb-2">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('photoInput').click()}>
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                    {formData.preview ? <img src={formData.preview} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-200" />}
                  </div>
                </div>
                <input id="photoInput" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Ketuk untuk ganti foto</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input 
                    type="text" required value={formData.nama}
                    onChange={e => setFormData({...formData, nama: e.target.value})}
                    className="w-full bg-slate-50 border-transparent border-2 focus:border-blue-600 rounded-xl px-4 py-3 outline-none text-slate-900 font-bold text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Divisi / Unit</label>
                  <input 
                    type="text" required value={formData.divisi}
                    onChange={e => setFormData({...formData, divisi: e.target.value})}
                    className="w-full bg-slate-50 border-transparent border-2 focus:border-blue-600 rounded-xl px-4 py-3 outline-none text-slate-900 font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] tracking-widest transition-all"
                >
                  BATAL
                </button>
                <button 
                  type="submit"
                  className="flex-[1.5] py-4 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] tracking-widest shadow-xl shadow-blue-600/30 transition-all"
                >
                  <Save size={16} /> SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
