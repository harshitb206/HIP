import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, CheckCircle, RefreshCw, AlertTriangle, Cpu, Activity, ScanLine, Aperture, ArrowLeft, MapPin, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CaptureFlowProps {
  onComplete: (data: { image: string, mockEmbedding: number[], location: { city: string, ip: string }, audioData: string }) => void;
}

const RollingCode = () => {
    const [code, setCode] = useState<string[]>([]);
    useEffect(() => {
        const interval = setInterval(() => {
            const line = `0x${Math.random().toString(16).substr(2, 8).toUpperCase()} // VECT_ANALYSIS_${Math.floor(Math.random() * 99)}`;
            setCode(prev => [line, ...prev].slice(0, 6));
        }, 100);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="font-mono text-[10px] text-cyan-600/70 absolute top-4 right-4 text-right space-y-1">
            {code.map((line, i) => <div key={i} style={{opacity: 1 - i * 0.15}}>{line}</div>)}
        </div>
    );
};

export const CaptureFlow: React.FC<CaptureFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0); 
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedAudio, setCapturedAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [locationData, setLocationData] = useState({ city: "Unknown", ip: "0.0.0.0" });
  
  // Face Guide States
  const [faceWarning, setFaceWarning] = useState<string | null>(null);

  useEffect(() => {
    // 1. IP Simulation (Always available)
    const randomIp = `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    setLocationData(prev => ({ ...prev, ip: randomIp }));

    // 2. Strict Geolocation Request
    requestLocation();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const requestLocation = () => {
      setGeoStatus('requesting');
      if (!navigator.geolocation) {
          setGeoStatus('denied');
          return;
      }
      navigator.geolocation.getCurrentPosition(
          (pos) => {
              const { latitude, longitude } = pos.coords;
              // In a real app, we'd reverse geocode here. For now, we use high-precision coords as "City" identifier for cyber feel.
              setLocationData(prev => ({
                  ...prev,
                  city: `LAT:${latitude.toFixed(4)} LON:${longitude.toFixed(4)}`
              }));
              setGeoStatus('granted');
          },
          (err) => {
              console.error("Location Denied:", err);
              setGeoStatus('denied');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
  };

  const startCamera = async () => {
    if (geoStatus !== 'granted') return; // Enforce location
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      
      // Simulate face tracking logic
      const warnings = ["ALIGN FACE", "TOO FAR", "HOLD STILL", "PERFECT"];
      let i = 0;
      const interval = setInterval(() => {
          setFaceWarning(warnings[i]);
          i = (i + 1) % warnings.length;
          if (i === warnings.length - 1) setTimeout(() => setFaceWarning(null), 1000);
      }, 2000);
      return () => clearInterval(interval);

    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      // UPDATED: Reduced resolution to prevent LocalStorage Quota Exceeded errors
      const size = 300; 
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const video = videoRef.current;
        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - minDim) / 2;
        const sy = (video.videoHeight - minDim) / 2;

        ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, size, size);
        
        // Lower quality JPEG (0.6) to reduce string length
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setCapturedImage(dataUrl);
        
        if (stream) stream.getTracks().forEach(t => t.stop());
        setStep(2);
      }
    }
  };

  const startAudioCapture = async () => {
    try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(audioStream);
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64Audio = reader.result as string;
                setCapturedAudio(base64Audio);
                setStep(3);
                finalizeCapture(base64Audio);
            };
            audioStream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        
        // Stop after 3 seconds
        setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
                setIsRecording(false);
            }
        }, 3000);

    } catch (e) {
        console.error("Mic Error", e);
        // Fallback for demo if mic fails
        setStep(3);
        finalizeCapture(""); 
    }
  };

  const finalizeCapture = (audioData: string) => {
    const mockEmbedding = Array.from({ length: 128 }, () => Math.random());
    setTimeout(() => {
        onComplete({ 
            image: capturedImage || '', 
            mockEmbedding,
            location: locationData,
            audioData: audioData
        });
    }, 3000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto hud-border bg-slate-900/80 p-1 rounded-sm hud-corner relative overflow-hidden">
      
      <div className="flex justify-between items-center p-4 border-b border-cyan-500/20 bg-black/40">
        <div className="flex items-center gap-4 text-cyan-400">
             <Link to="/" className="hover:text-white transition-colors flex items-center gap-2 border border-cyan-900 px-3 py-1 rounded-sm bg-cyan-950/30">
                <ArrowLeft size={16} /> <span>BACK</span>
             </Link>
             <div className="flex items-center gap-2 ml-4">
                 <Aperture className="animate-spin-slow" />
                 <span className="font-mono text-lg tracking-widest hidden sm:inline">BIOMETRIC INGESTION</span>
             </div>
        </div>
        <div className="flex gap-2">
            <div className={`h-2 w-8 ${geoStatus === 'granted' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <div className="h-2 w-2 bg-cyan-500 animate-pulse"></div>
        </div>
      </div>

      <div className="p-8 relative min-h-[400px] flex flex-col justify-center">
        {step === 0 && (
            <div className="text-center space-y-8 animate-in zoom-in duration-500">
                <div className="w-24 h-24 mx-auto border-4 border-cyan-500 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 border-t-4 border-transparent border-t-cyan-200 rounded-full animate-spin"></div>
                    <Cpu size={48} className="text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-mono text-white mb-2">INITIATE SEQUENCE</h2>
                    <p className="text-cyan-400/60 font-mono text-sm uppercase tracking-widest">
                        Zero-Knowledge Proof Generation
                    </p>
                </div>
                
                {/* Geolocation Gating UI */}
                <div className="flex flex-col items-center gap-2 text-[10px] font-mono">
                    <div className={`flex items-center gap-2 px-4 py-2 border ${geoStatus === 'granted' ? 'border-green-500 bg-green-900/20 text-green-400' : 'border-red-500 bg-red-900/20 text-red-400'}`}>
                         <MapPin size={12}/> 
                         {geoStatus === 'requesting' && "TRIANGULATING POSITION..."}
                         {geoStatus === 'denied' && "GPS SIGNAL LOST // ACCESS DENIED"}
                         {geoStatus === 'granted' && locationData.city}
                    </div>
                    {geoStatus === 'denied' && (
                        <div className="text-red-500 animate-pulse mt-2 flex items-center gap-2">
                            <Lock size={12}/>
                            CRITICAL: ENABLE DEVICE LOCATION TO PROCEED
                        </div>
                    )}
                    {geoStatus === 'denied' && (
                        <button onClick={requestLocation} className="mt-4 px-4 py-2 border border-red-500 hover:bg-red-500 hover:text-white transition-colors">
                            RETRY CONNECTION
                        </button>
                    )}
                </div>

                <button 
                    onClick={() => { setStep(1); startCamera(); }}
                    disabled={geoStatus !== 'granted'}
                    className={`group relative px-8 py-3 bg-transparent border font-mono transition-all overflow-hidden inline-flex items-center gap-2 ${geoStatus === 'granted' ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 hover:text-white cursor-pointer' : 'border-slate-700 text-slate-700 cursor-not-allowed'}`}
                >
                    <span className="relative z-10 flex items-center gap-2"><ScanLine /> ACTIVATE SENSORS</span>
                    {geoStatus === 'granted' && <div className="absolute inset-0 bg-cyan-500/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>}
                </button>
            </div>
        )}

        {step === 1 && (
            <div className="relative w-full h-full max-w-xl mx-auto">
                <div className="relative aspect-video bg-black overflow-hidden border border-cyan-900 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                    
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="scan-line"></div>
                        <RollingCode />
                        
                        {/* Face Guide Box */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 transition-colors duration-300 ${faceWarning === 'PERFECT' ? 'border-green-500' : 'border-red-500/50'} rounded-[2rem]`}>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-current"></div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-current"></div>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-1 bg-current"></div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-1 bg-current"></div>
                        </div>

                        {/* Warnings Overlay */}
                        {faceWarning && faceWarning !== 'PERFECT' && (
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-40 bg-red-900/80 text-white px-4 py-1 text-xs font-mono border border-red-500 animate-pulse">
                                 ⚠ {faceWarning}
                             </div>
                        )}

                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500"></div>
                        
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-cyan-500 font-mono text-xs bg-black/70 px-2 py-1">
                            TRACKING: LOCKED
                        </div>
                    </div>
                </div>
                <button 
                    onClick={capturePhoto}
                    className="w-full mt-4 py-4 bg-cyan-900/50 hover:bg-cyan-600/50 border border-cyan-500 text-cyan-200 font-mono tracking-widest uppercase transition-all"
                >
                    Capture Biometric Frame
                </button>
            </div>
        )}

        {step === 2 && (
            <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in">
                <div className="relative">
                    <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center ${isRecording ? 'border-red-500 animate-pulse' : 'border-cyan-500'}`}>
                        <Mic size={40} className={isRecording ? "text-red-500" : "text-cyan-500"} />
                    </div>
                    {isRecording && (
                        <div className="absolute -inset-8 flex items-center justify-center gap-1 opacity-50">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="w-1 bg-cyan-400 animate-[pulse_0.5s_ease-in-out_infinite]" style={{height: `${Math.random() * 60 + 20}px`, animationDelay: `${Math.random() * 0.5}s`}}></div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-mono text-white">VOICE PRINT CALIBRATION</h3>
                    <p className="text-cyan-400/50 text-sm mt-2 font-mono">"MY VOICE IS MY PASSPORT"</p>
                </div>
                <button 
                    onClick={startAudioCapture}
                    disabled={isRecording}
                    className="px-8 py-3 border border-cyan-500/50 hover:bg-cyan-500/20 text-cyan-400 font-mono tracking-wider transition-all disabled:opacity-50"
                >
                    {isRecording ? "RECORDING..." : "START VOICE CAPTURE"}
                </button>
            </div>
        )}

        {step === 3 && (
             <div className="flex flex-col items-center justify-center py-10 space-y-6">
                 <div className="relative w-40 h-40">
                     <div className="absolute inset-0 border-4 border-cyan-900 rounded-full"></div>
                     <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin"></div>
                     <div className="absolute inset-4 border-4 border-cyan-900 rounded-full"></div>
                     <div className="absolute inset-4 border-l-4 border-fuchsia-500 rounded-full animate-spin-reverse"></div>
                     <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold text-white animate-pulse">
                         {Math.floor(Math.random() * 99)}%
                     </div>
                 </div>
                 
                 <div className="font-mono text-center space-y-1">
                     <h3 className="text-xl text-white tracking-widest">BUILDING DIGITAL TWIN</h3>
                     <p className="text-xs text-cyan-500">Location Tag: {locationData.city}</p>
                 </div>

                 <div className="w-full max-w-sm bg-black/50 border border-slate-800 p-2 font-mono text-[10px] text-green-500 h-20 overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
                     <div className="space-y-1 opacity-70">
                         <div>> INITIATING NEURAL LINK... OK</div>
                         <div>> VECTORIZING FACE MESH... OK</div>
                         <div>> AUDIO_BLOB_SIZE: {capturedAudio?.length || 0} BYTES... OK</div>
                         <div>> GEO_TAGGING: {locationData.city}... OK</div>
                         <div>> GENERATING ZERO-KNOWLEDGE PROOF...</div>
                     </div>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};