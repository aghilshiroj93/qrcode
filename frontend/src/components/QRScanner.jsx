import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api';
import { CheckCircle, XCircle, RefreshCw, User, Camera, ShieldAlert, Zap } from 'lucide-react';



export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isScannerStarted, setIsScannerStarted] = useState(false);
  const html5QrCode = useRef(null);

  useEffect(() => {
    // Small delay to ensure DOM is ready and previous instances are gone
    const timer = setTimeout(() => {
      startScanner();
    }, 500);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      const readerElement = document.getElementById("reader");
      if (!readerElement) return;
      readerElement.innerHTML = ""; // Force clear content

      html5QrCode.current = new Html5Qrcode("reader");
      
      const config = {
        fps: 20,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.current.start(
        { facingMode: "environment" },
        config,
        onScanSuccess
      );
      setIsScannerStarted(true);
    } catch (err) {
      console.error("Scanner start error:", err);
    }
  };

  const stopScanner = async () => {
    if (html5QrCode.current) {
      try {
        if (html5QrCode.current.isScanning) {
          await html5QrCode.current.stop();
        }
        html5QrCode.current.clear();
      } catch (err) {
        console.error("Scanner stop error:", err);
      }
    }
  };

  const onScanSuccess = (decodedText) => {
    // Only process if not currently validating and no result shown
    if (!isValidating && !scanResult) {
      validateQR(decodedText);
    }
  };

  const validateQR = async (qrDataRaw) => {
    setIsValidating(true);
    let identifier = qrDataRaw;
    
    // Support both raw ID and JSON format
    try {
      if (qrDataRaw.startsWith('{')) {
        const parsed = JSON.parse(qrDataRaw);
        identifier = parsed.id || qrDataRaw;
      }
    } catch (e) {}

    try {
      const res = await api.post('/scan/validate', { identifier });
      if (res.data.status === 'ACCEPTED') {
        setScanResult({ status: 'SUCCESS', data: res.data.data });
      } else {
        setScanResult({ status: 'REJECTED', message: 'KODE TIDAK DIKENALI' });
      }
    } catch (err) {
      setScanResult({ status: 'REJECTED', message: 'KODE QR TIDAK TERDAFTAR' });
    } finally {
      setIsValidating(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <div className="bg-blue-600 p-3 rounded-2xl w-fit mx-auto text-white shadow-xl shadow-blue-600/20 mb-3">
          <Zap size={24} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">SCANNER QR</h2>
        <p className="text-slate-500 font-medium text-xs px-10">Posisikan kode QR di dalam kotak untuk validasi otomatis.</p>
      </div>

      <div className="relative">
        <div className={`bg-white p-3 rounded-[3rem] border-4 border-white shadow-premium overflow-hidden relative transition-all duration-500 ${scanResult ? 'opacity-10 scale-90 blur-sm' : 'opacity-100 scale-100'}`}>
          <div id="reader" className="w-full overflow-hidden rounded-[2.2rem] bg-slate-900 min-h-[320px]"></div>
          
          {!scanResult && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-60 h-60 border-2 border-white/30 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl animate-pulse" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Floating Results Overlay */}
        {scanResult && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
            <div className={`w-full p-8 rounded-[3.5rem] border-4 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300 shadow-2xl bg-white ${
              scanResult.status === 'SUCCESS' ? 'border-emerald-500 shadow-emerald-500/20' : 'border-red-500 shadow-red-500/20'
            }`}>
              {scanResult.status === 'SUCCESS' ? (
                <>
                  <div className="relative">
                    {scanResult.data.foto ? (
                      <img src={scanResult.data.foto} className="w-36 h-36 rounded-[2.5rem] object-cover border-4 border-emerald-500 shadow-xl" />
                    ) : (
                      <div className="w-36 h-36 rounded-[2.5rem] bg-slate-50 flex items-center justify-center border-4 border-emerald-500 shadow-xl">
                        <User size={64} className="text-slate-300" />
                      </div>
                    )}
                    <div className="bg-emerald-500 text-white p-2 rounded-full absolute -bottom-2 left-1/2 -translate-x-1/2 border-4 border-white shadow-lg">
                      <CheckCircle size={20} strokeWidth={3} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-emerald-500 tracking-tighter italic uppercase">DITERIMA</h3>
                    <div className="space-y-1">
                      <p className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">{scanResult.data.nama}</p>
                      <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest inline-block">{scanResult.data.divisi}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-red-50 p-6 rounded-full shadow-inner">
                    <ShieldAlert size={64} className="text-red-500 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-red-500 tracking-tighter italic uppercase">DITOLAK!</h3>
                    <p className="text-slate-500 font-bold text-sm max-w-[200px] mx-auto">{scanResult.message}</p>
                  </div>
                </>
              )}
              
              <button 
                onClick={resetScanner}
                className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 font-black text-sm tracking-widest transition-all active:scale-95 shadow-xl ${
                  scanResult.status === 'SUCCESS' 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                    : 'bg-red-50 text-white shadow-red-500/30'
                }`}
              >
                <RefreshCw size={18} strokeWidth={3} />
                SCAN LAGI
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-3 text-center justify-center">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Sensor Validasi Aktif</span>
      </div>
    </div>
  );
}
