import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { checkIn } from '../../api/bookingApi';
import { useAuth } from '../../contexts/AuthContext';
import { QrCode, Camera, CheckCircle2, XCircle, AlertTriangle, Clock, MapPin, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

interface CheckInResult {
  resourceName?: string;
  resourceLocation?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  purpose?: string;
}

export const QRScanner: React.FC = () => {
  const { user } = useAuth();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = () => {
    setScanState('scanning');
    setErrorMessage('');
    setResult(null);

    // Wait 100ms for React to mount the #qr-reader DOM element
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        };

        const handleSuccess = async (decodedText: string) => {
          await handleScan(decodedText);
          stopScanning();
        };

        const handleError = () => {};

        try {
          // First try the back camera (environment) which is ideal for phones
          await scanner.start({ facingMode: 'environment' }, config, handleSuccess, handleError);
        } catch (err: any) {
          console.warn('Environment camera failed, trying front/default camera...', err);
          // If that fails (e.g., on a desktop/laptop without a back camera), try the front/default camera
          try {
            await scanner.start({ facingMode: 'user' }, config, handleSuccess, handleError);
          } catch (fallbackErr: any) {
            console.error('Scanner fallback error:', fallbackErr);
            setScanState('error');
            // Extract the actual error name/message to help troubleshoot
            const errorMsg = fallbackErr?.name || fallbackErr?.message || String(fallbackErr);
            setErrorMessage(`Camera error: ${errorMsg}. Please ensure your camera is not used by another app and is properly connected.`);
          }
        }
      } catch (initErr: any) {
        console.error('Scanner initialization error:', initErr);
        setScanState('error');
        setErrorMessage('Failed to initialize the QR scanner. Please try again.');
      }
    }, 100);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
  };

  const handleScan = async (qrData: string) => {
    // Parse QR code: expected format "RESOURCE:<id>"
    const match = qrData.match(/^RESOURCE:(\d+)$/);
    if (!match) {
      setScanState('error');
      setErrorMessage('Invalid QR code. This does not appear to be a valid resource QR code.');
      return;
    }

    const resourceId = parseInt(match[1]);
    const userId = user?.id ? Number(user.id) : 0;

    if (!userId) {
      setScanState('error');
      setErrorMessage('User session not found. Please log in again.');
      return;
    }

    setProcessing(true);
    try {
      const booking = await checkIn(resourceId, userId);
      setResult({
        resourceName: booking.resourceName,
        resourceLocation: booking.resourceLocation,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        purpose: booking.purpose,
      });
      setScanState('success');
      toast.success('Check-in successful!');
    } catch (err: any) {
      setScanState('error');
      const message = err.response?.data?.error || err.response?.data?.message || 'Check-in failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    stopScanning();
    setScanState('idle');
    setErrorMessage('');
    setResult(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${m} ${ampm}`;
    } catch { return timeStr; }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">
          <QrCode size={14} /> QR Check-In
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Scan to Check In</h1>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Scan the QR code displayed at the resource location to confirm your attendance.
        </p>
      </div>

      {/* Idle State — Start Button */}
      {scanState === 'idle' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-12 text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera size={48} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Ready to Scan</h2>
          <p className="text-slate-500 mb-6">Position your camera at the QR code displayed on the wall of the resource location.</p>
          
          <button
            onClick={startScanning}
            className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 mx-auto"
          >
            <Camera size={24} /> Open Camera & Scan
          </button>

          <div className="mt-8 bg-slate-50 rounded-xl p-4 text-left space-y-2">
            <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" /> Check-in Requirements
            </h4>
            <ul className="text-sm text-slate-500 space-y-1 ml-5 list-disc">
              <li>You must have an <strong>approved booking</strong> for the resource</li>
              <li>Your booking must be for <strong>today</strong></li>
              <li>Check-in window: <strong>15 min before</strong> to <strong>30 min after</strong> start time</li>
              <li>You must be <strong>physically at the location</strong></li>
            </ul>
          </div>
        </div>
      )}

      {/* Scanning State — Camera View */}
      {scanState === 'scanning' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              Scanning...
            </div>
            <button onClick={resetScanner} className="text-sm font-semibold text-slate-500 hover:text-red-500 transition">
              Cancel
            </button>
          </div>
          <div className="relative">
            <div id="qr-reader" className="w-full" style={{ minHeight: '350px' }}></div>
          </div>
          <div className="p-4 text-center text-sm text-slate-500">
            Point your camera at the QR code on the wall
          </div>
        </div>
      )}

      {/* Processing State */}
      {processing && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-slate-800">Verifying Check-In...</h2>
          <p className="text-slate-500 mt-2">Validating your booking for this resource</p>
        </div>
      )}

      {/* Success State */}
      {scanState === 'success' && result && (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black">Check-In Successful!</h2>
            <p className="text-emerald-100 mt-1">Your attendance has been recorded</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-emerald-50 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-emerald-600" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Resource</p>
                  <p className="font-bold text-slate-800">{result.resourceName}</p>
                </div>
              </div>
              {result.resourceLocation && (
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-emerald-600" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Location</p>
                    <p className="font-bold text-slate-800">{result.resourceLocation}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-emerald-600" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Time Slot</p>
                  <p className="font-bold text-slate-800">
                    {result.bookingDate} · {formatTime(result.startTime)} – {formatTime(result.endTime)}
                  </p>
                </div>
              </div>
              {result.purpose && (
                <div className="flex items-center gap-3">
                  <QrCode size={18} className="text-emerald-600" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Purpose</p>
                    <p className="font-bold text-slate-800">{result.purpose}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={resetScanner}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {scanState === 'error' && !processing && (
        <div className="bg-white rounded-3xl border border-red-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={48} />
            </div>
            <h2 className="text-2xl font-black">Check-In Failed</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-red-50 rounded-xl p-5 text-center">
              <p className="text-red-700 font-semibold">{errorMessage}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetScanner}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
              >
                Go Back
              </button>
              <button
                onClick={() => { resetScanner(); setTimeout(startScanning, 100); }}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
