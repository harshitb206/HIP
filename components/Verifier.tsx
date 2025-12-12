import React, { useState, useEffect } from 'react';
import { CryptoService } from '../services/cryptoService';
import { ledgerService } from '../services/ledgerService';
import { SignedHipToken, VerificationResult, LedgerEntry, HipEvent, EventCategory } from '../types';
import { ShieldCheck, ShieldAlert, Lock, Activity, Globe, Database, Key, LogOut, Search, Scan, Terminal, AlertOctagon, Check, X, RefreshCw, MapPin, ArrowLeft, Mic, Eye, Calendar, Plus, Trash2, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HologramAvatar } from './HologramAvatar';

// --- Components ---

const RollingLog = () => {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      const msgs = [
        "PACKET_INTERCEPT :: 192.168.0.1",
        "ENCRYPTION_HANDSHAKE :: ACK",
        "LEDGER_SYNC :: BLOCK_9942",
        "BIOMETRIC_HASH_VERIFY :: OK",
        "HEARTBEAT :: ACTIVE",
        "NETSEC_DAEMON :: LISTENING"
      ];
      const msg = `${new Date().toISOString().split('T')[1].split('.')[0]} >> ${msgs[Math.floor(Math.random() * msgs.length)]}`;
      setLogs(prev => [msg, ...prev].slice(0, 8));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[10px] text-red-900/60 overflow-hidden h-full">
      {logs.map((l, i) => (
        <div key={i} style={{ opacity: 1 - i * 0.1 }}>{l}</div>
      ))}
    </div>
  );
};

// --- Login Screen ---
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
    const [pass, setPass] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pass === '0000') {
            onLogin();
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-[70vh] relative">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)] pointer-events-none"></div>
             
             <button onClick={() => navigate('/')} className="absolute top-0 left-0 m-8 text-red-500 hover:text-white flex items-center gap-2 font-mono text-xs border border-red-900 px-4 py-2">
                <ArrowLeft size={14} /> MAIN MENU
             </button>
            
            <div className={`p-10 bg-black/80 border border-red-900/50 backdrop-blur-sm rounded-sm max-w-sm w-full relative overflow-hidden transition-all duration-100 ${error ? 'translate-x-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : ''}`}>
                
                {/* HUD Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-600"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-600"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-600"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-600"></div>

                <div className="mb-8 text-center relative z-10">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-950/30 rounded-full flex items-center justify-center border border-red-500/30 animate-pulse">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-mono font-bold text-white tracking-[0.2em]">NETSEC</h2>
                    <p className="text-[10px] font-mono text-red-500 mt-1">RESTRICTED ACCESS // LEVEL 5</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-red-400/70 ml-1">SECURITY_CODE (Hint: 0000)</label>
                        <div className="relative group">
                            <Key className="absolute left-3 top-3.5 text-red-700 group-focus-within:text-red-500 transition-colors" size={16} />
                            <input 
                                type="password" 
                                value={pass}
                                onChange={e => setPass(e.target.value)}
                                placeholder="ENTER ACCESS CODE"
                                className="w-full bg-red-950/20 border border-red-900 rounded-sm py-3 pl-10 text-red-100 font-mono tracking-widest focus:border-red-500 focus:outline-none focus:bg-red-950/40 transition-all placeholder:text-red-900/50"
                                autoFocus
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/30 hover:border-red-500 py-3 font-mono text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 group">
                        <ShieldCheck size={16} className="group-hover:scale-110 transition-transform"/> Authenticate
                    </button>
                    {error && (
                        <div className="absolute inset-x-0 bottom-2 text-center">
                             <p className="text-red-500 text-[10px] font-mono animate-pulse bg-black/80 py-1">ERROR: INVALID CREDENTIALS</p>
                        </div>
                    )}
                </form>
            </div>
            <div className="mt-8 font-mono text-[10px] text-red-900/40 text-center space-y-1">
                <p>CONNECTION_SECURE: TRUE</p>
                <p>SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>
        </div>
    );
};

// --- Main Terminal ---
export const Verifier: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'verify' | 'ledger' | 'events' | 'gate'>('verify');
  const [inputData, setInputData] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [result, setResult] = useState<VerificationResult & { audio?: string } | null>(null);
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0 });
  const [selectedUser, setSelectedUser] = useState<LedgerEntry | null>(null);
  
  // Event State
  const [events, setEvents] = useState<HipEvent[]>([]);
  const [newEventName, setNewEventName] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<EventCategory>(EventCategory.CONCERT);
  const [activeGateEvent, setActiveGateEvent] = useState<HipEvent | null>(null);

  const navigate = useNavigate();

  // Load ledger & event data
  useEffect(() => {
    const updateData = () => {
        setLedgerData(ledgerService.getAllEntries());
        setStats(ledgerService.getStats());
        setEvents(ledgerService.getEvents());
    };
    updateData();
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
      setScanStatus('scanning');
      setResult(null);
      
      setTimeout(async () => {
        try {
            const token: SignedHipToken = JSON.parse(inputData);
            
            // Core Checks
            const isSigValid = await CryptoService.verify(token.publicKey, token.signature, JSON.stringify(token.payload));
            const ledgerEntry = ledgerService.getEntry(token.payload.hipId);
            const isLedgerActive = !!ledgerEntry && !ledgerEntry.revoked;
            const isRevoked = !!ledgerEntry && ledgerEntry.revoked;
            const isExpired = Date.now() > token.payload.exp;
            const isHashValid = ledgerEntry ? ledgerEntry.maskedHash === token.payload.maskedHash : false;

            const isValid = isSigValid && isLedgerActive && !isExpired && isHashValid;

            let message = "VERIFICATION_SUCCESSFUL";
            if (!isSigValid) message = "SIGNATURE_INVALID: CRYPTO_FAIL";
            if (isExpired) message = "TOKEN_EXPIRED";
            if (isRevoked) message = "IDENTITY_REVOKED: FLAG_RED";
            if (!isHashValid) message = "INTEGRITY_FAIL: HASH_MISMATCH";

            setResult({
                isValid,
                score: isValid ? 0.99 : 0.0,
                checks: { signature: isSigValid, ledger: isLedgerActive, expiry: !isExpired, biometricMatch: true },
                message,
                meta: { location: token.payload.meta.location, ip: token.payload.meta.ip },
                audioData: ledgerEntry?.audioData 
            });
            setScanStatus('complete');
        } catch (e) {
            setScanStatus('idle');
            setResult({
                isValid: false,
                score: 0,
                checks: { signature: false, ledger: false, expiry: false, biometricMatch: false },
                message: "MALFORMED_PAYLOAD_ERROR"
            });
        }
      }, 1500); 
  };

  const handleCreateEvent = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newEventName) return;
      ledgerService.createEvent(newEventName, newEventCategory);
      setNewEventName('');
      setEvents(ledgerService.getEvents());
  };

  const handleDeleteEvent = (id: string) => {
      if(confirm('Delete this event?')) {
          ledgerService.deleteEvent(id);
          setEvents(ledgerService.getEvents());
      }
  };

  const launchGate = (event: HipEvent) => {
      setActiveGateEvent(event);
      setView('gate');
      setInputData('');
      setResult(null);
      setScanStatus('idle');
  };

  const handleRevoke = (id: string) => {
      if (confirm(`CONFIRM PURGE: Revoke Identity ${id}? This cannot be undone.`)) {
          ledgerService.revokeHip(id);
          setLedgerData(ledgerService.getAllEntries());
      }
  };

  if (!isAuthenticated) {
      return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  // GATE VIEW SPECIFIC RENDER
  if (view === 'gate' && activeGateEvent) {
      return (
        <div className="min-h-screen bg-black text-red-100 font-mono relative flex flex-col">
            <header className="p-6 border-b border-red-900/50 bg-red-950/20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <div className="bg-red-600 text-black px-3 py-1 font-bold text-sm tracking-widest animate-pulse">GATE LIVE</div>
                     <div>
                         <h1 className="text-2xl font-bold text-white tracking-wider">{activeGateEvent.name}</h1>
                         <p className="text-xs text-red-400">{activeGateEvent.category} // SECURE CHANNEL</p>
                     </div>
                </div>
                <button onClick={() => setView('events')} className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-black px-4 py-2 transition-all">
                    TERMINATE SESSION
                </button>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-4 p-4">
                 {/* Scanner Input */}
                 <div className="flex-1 bg-black border border-red-900/50 p-8 flex flex-col items-center justify-center relative">
                      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                      {!result && scanStatus !== 'scanning' ? (
                          <div className="w-full max-w-md space-y-4 relative z-10">
                              <div className="text-center mb-8">
                                  <Scan size={64} className="mx-auto text-red-500 mb-4 animate-pulse" />
                                  <p className="text-sm tracking-[0.3em] text-red-500">AWAITING CREDENTIALS</p>
                              </div>
                              <textarea
                                value={inputData}
                                onChange={(e) => setInputData(e.target.value)}
                                className="w-full h-24 bg-red-950/10 border border-red-900 p-4 text-xs focus:outline-none focus:border-red-500 text-red-300 placeholder:text-red-900"
                                placeholder="PASTE TOKEN JSON HERE"
                                autoFocus
                              />
                              <button 
                                onClick={handleVerify}
                                disabled={!inputData}
                                className="w-full bg-red-600 hover:bg-red-500 text-black font-bold py-3 tracking-widest"
                              >
                                  SCAN
                              </button>
                          </div>
                      ) : (
                          <div className="w-full h-full flex items-center justify-center">
                              {scanStatus === 'scanning' && (
                                  <div className="text-center">
                                      <div className="w-24 h-24 border-t-4 border-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                                      <p className="tracking-widest text-red-500">DECRYPTING...</p>
                                  </div>
                              )}
                              {scanStatus === 'complete' && result && (
                                  <div className="text-center animate-in zoom-in duration-200">
                                      {result.isValid ? (
                                          <div className="flex flex-col items-center">
                                               <div className="w-40 h-40 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                                                   <Check size={80} className="text-black" />
                                               </div>
                                               <h2 className="text-5xl font-black text-white tracking-tighter mb-2">GRANTED</h2>
                                               <p className="text-green-500 tracking-widest">{result.message}</p>
                                          </div>
                                      ) : (
                                          <div className="flex flex-col items-center">
                                               <div className="w-40 h-40 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-bounce">
                                                   <X size={80} className="text-black" />
                                               </div>
                                               <h2 className="text-5xl font-black text-white tracking-tighter mb-2">DENIED</h2>
                                               <p className="text-red-500 tracking-widest">{result.message}</p>
                                          </div>
                                      )}
                                      <button onClick={() => { setResult(null); setInputData(''); setScanStatus('idle'); }} className="mt-12 text-xs border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-colors">
                                          RESET SCANNER
                                      </button>
                                  </div>
                              )}
                          </div>
                      )}
                 </div>

                 {/* Scan Details / Profile */}
                 {result && result.isValid && (
                     <div className="w-full md:w-1/3 bg-red-950/10 border border-red-900/50 p-6 animate-in slide-in-from-right">
                         <h3 className="text-xl text-white font-bold mb-6 border-b border-red-900 pb-2">IDENTITY MATCH</h3>
                         <div className="space-y-6">
                             {/* Find the user in ledger for the image */}
                             {ledgerService.getEntry(JSON.parse(inputData).payload.hipId)?.avatarImage && (
                                 <div className="w-40 mx-auto">
                                     <HologramAvatar 
                                        isMasked={false} 
                                        userImage={ledgerService.getEntry(JSON.parse(inputData).payload.hipId)?.avatarImage}
                                     />
                                 </div>
                             )}
                             <div className="space-y-2 text-xs font-mono">
                                 <div className="flex justify-between p-2 bg-red-900/20">
                                     <span className="text-red-400">SIGNATURE</span>
                                     <span className="text-white">VERIFIED (ECDSA)</span>
                                 </div>
                                 <div className="flex justify-between p-2 bg-red-900/20">
                                     <span className="text-red-400">LEDGER STATUS</span>
                                     <span className="text-green-400">ACTIVE</span>
                                 </div>
                                 <div className="flex justify-between p-2 bg-red-900/20">
                                     <span className="text-red-400">EVENT ACCESS</span>
                                     <span className="text-white">PERMITTED</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}
            </div>
        </div>
      );
  }

  // MAIN ADMIN DASHBOARD RENDER
  return (
    <div className="min-h-screen bg-black text-red-100 p-4 font-mono animate-in fade-in duration-500 relative">
        
        {/* Profile Modal */}
        {selectedUser && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                <div className="bg-red-950/20 border border-red-500/50 p-8 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-red-500 hover:text-white"><X size={24} /></button>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div>
                             <HologramAvatar 
                                isMasked={false} 
                                userImage={selectedUser.avatarImage} 
                             />
                             <div className="mt-4 text-center">
                                 <div className="text-2xl font-bold text-white tracking-widest">CITIZEN</div>
                                 <div className="text-[10px] text-red-500">{selectedUser.hipId.substring(0,8)}</div>
                             </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-xl text-red-400 font-bold border-b border-red-900 pb-2">IDENTITY_DOSSIER</h3>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div><span className="block text-red-600 text-[10px]">ORIGIN</span><span className="text-white">{selectedUser.location}</span></div>
                                <div><span className="block text-red-600 text-[10px]">IP ADDRESS</span><span className="text-white">{selectedUser.ip}</span></div>
                                <div><span className="block text-red-600 text-[10px]">STATUS</span><span className={selectedUser.revoked ? "text-red-500" : "text-green-500"}>{selectedUser.revoked ? "REVOKED" : "ACTIVE"}</span></div>
                                <div><span className="block text-red-600 text-[10px]">ISSUED</span><span className="text-white">{new Date(selectedUser.issuedAt).toLocaleDateString()}</span></div>
                            </div>
                            {selectedUser.audioData && (
                                <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50">
                                    <div className="flex items-center gap-2 mb-2 text-red-400 text-xs"><Mic size={14}/> VOICE_PRINT_RECORD</div>
                                    <audio controls src={selectedUser.audioData} className="w-full h-8 opacity-70 hover:opacity-100" />
                                </div>
                            )}
                            <div className="mt-8 pt-4 border-t border-red-900/30 flex justify-end gap-4">
                                {!selectedUser.revoked && (
                                    <button onClick={() => { handleRevoke(selectedUser.hipId); setSelectedUser(null); }} className="bg-red-600 hover:bg-red-500 text-black px-4 py-2 text-xs font-bold tracking-widest">REVOKE IDENTITY</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between border-b border-red-900/50 pb-4 mb-8 bg-red-950/10 p-4 rounded-t-lg backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <div className="relative"><ShieldAlert className="text-red-500 animate-pulse" size={32} /><div className="absolute inset-0 bg-red-500 blur-lg opacity-20"></div></div>
                <div>
                    <h1 className="text-2xl font-bold tracking-[0.2em] text-white">NETSEC<span className="text-red-500">_ADMIN</span></h1>
                    <div className="flex gap-4 text-[10px] text-red-400/60 mt-1"><span>REGION: NA-EAST</span><span>LATENCY: 12ms</span><span>ENCRYPTION: AES-256</span></div>
                </div>
            </div>
            <div className="flex gap-2">
                 <button onClick={() => setView('verify')} className={`px-4 py-2 text-xs border transition-all ${view === 'verify' ? 'bg-red-600 text-black border-red-500 font-bold' : 'border-red-900/50 hover:border-red-500 text-red-500'}`}><Scan className="inline mr-2 w-4 h-4"/>INTEL_SCAN</button>
                 <button onClick={() => setView('ledger')} className={`px-4 py-2 text-xs border transition-all ${view === 'ledger' ? 'bg-red-600 text-black border-red-500 font-bold' : 'border-red-900/50 hover:border-red-500 text-red-500'}`}><Database className="inline mr-2 w-4 h-4"/>LEDGER_FEED</button>
                 <button onClick={() => setView('events')} className={`px-4 py-2 text-xs border transition-all ${view === 'events' ? 'bg-red-600 text-black border-red-500 font-bold' : 'border-red-900/50 hover:border-red-500 text-red-500'}`}><Calendar className="inline mr-2 w-4 h-4"/>EVENT_MANAGER</button>
                 <button onClick={() => navigate('/')} className="px-3 border border-red-900/30 hover:bg-red-900/20 text-red-500 flex items-center gap-2"><ArrowLeft size={16} /> MENU</button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar Stats */}
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-red-950/10 border border-red-900/50 p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-20"><Activity size={48} /></div>
                    <p className="text-[10px] text-red-500 mb-1">GLOBAL_ISSUANCE</p>
                    <p className="text-4xl font-bold text-white">{stats.total}</p>
                    <div className="mt-2 text-[10px] flex justify-between text-red-400/60"><span>ACTIVE: {stats.active}</span><span>REVOKED: {stats.revoked}</span></div>
                </div>
                <div className="bg-black border border-red-900/30 h-64 p-2 relative">
                    <div className="absolute top-0 left-0 bg-red-900/20 px-2 py-1 text-[10px] text-red-500">LIVE_LOGS</div>
                    <div className="mt-6 h-full"><RollingLog /></div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 min-h-[500px] border border-red-900/30 bg-red-950/5 relative p-6">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-800"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-800"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-800"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-800"></div>

                {view === 'verify' && (
                    <div className="h-full flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-lg text-red-400 font-bold mb-2 flex items-center gap-2"><Terminal size={18} /> MANUAL_OVERRIDE // TOKEN_VERIFICATION</h3>
                            <p className="text-xs text-red-600/60 mb-4">Paste raw JSON payload or scan QR code stream to verify signature integrity against the immutable ledger.</p>
                            <textarea value={inputData} onChange={(e) => setInputData(e.target.value)} className="w-full h-32 bg-black border border-red-900/50 p-4 text-xs font-mono text-red-100 focus:border-red-500 focus:outline-none transition-all resize-none" placeholder="// AWAITING ENCRYPTED PAYLOAD..." />
                            <div className="flex justify-end mt-2"><button onClick={handleVerify} disabled={scanStatus === 'scanning' || !inputData} className="bg-red-600 hover:bg-red-500 text-black px-8 py-2 font-bold text-sm tracking-widest transition-colors disabled:opacity-50">{scanStatus === 'scanning' ? 'DECRYPTING...' : 'INITIATE_SCAN'}</button></div>
                        </div>
                        <div className="flex-1 border-t border-red-900/30 pt-6 relative">
                            {scanStatus === 'scanning' && <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10"><div className="w-24 h-24 border-4 border-red-900 border-t-red-500 rounded-full animate-spin"></div><p className="mt-4 text-red-500 animate-pulse tracking-widest">ANALYZING SIGNATURE</p></div>}
                            {scanStatus === 'complete' && result && (
                                <div className={`h-full flex flex-col items-center justify-center animate-in zoom-in duration-300 ${result.isValid ? 'text-green-500' : 'text-red-500'}`}>
                                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4 ${result.isValid ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>{result.isValid ? <Check size={64} /> : <AlertOctagon size={64} />}</div>
                                    <h2 className="text-3xl font-bold tracking-widest mb-2">{result.isValid ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</h2>
                                    <p className="font-mono text-sm opacity-80 mb-6">{result.message}</p>
                                    <div className="grid grid-cols-2 gap-4 text-xs font-mono w-full max-w-md">
                                        <div className="flex justify-between border-b border-gray-700 pb-1"><span className="text-gray-500">SIGNATURE</span><span>{result.checks.signature ? "VALID" : "INVALID"}</span></div>
                                        <div className="flex justify-between border-b border-gray-700 pb-1"><span className="text-gray-500">LEDGER</span><span>{result.checks.ledger ? "ACTIVE" : "REVOKED"}</span></div>
                                        {result.meta?.location && <div className="flex justify-between border-b border-gray-700 pb-1"><span className="text-gray-500">ORIGIN</span><span className="flex items-center gap-1"><MapPin size={10}/> {result.meta.location}</span></div>}
                                        <div className="flex justify-between border-b border-gray-700 pb-1"><span className="text-gray-500">SCORE</span><span>{(result.score * 100).toFixed(1)}%</span></div>
                                        {result.audioData && <div className="col-span-2 pt-2 border-t border-red-800/30"><audio controls src={result.audioData} className="w-full h-8 opacity-70" /></div>}
                                    </div>
                                </div>
                            )}
                            {scanStatus === 'idle' && <div className="h-full flex items-center justify-center opacity-30"><Globe size={120} className="text-red-900 animate-spin-slow" /></div>}
                        </div>
                    </div>
                )}

                {view === 'ledger' && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg text-red-400 font-bold flex items-center gap-2"><Database size={18} /> IMMUTABLE_LEDGER // REALTIME</h3>
                            <button onClick={() => { setLedgerData(ledgerService.getAllEntries()); setStats(ledgerService.getStats()); }} className="p-2 hover:bg-red-900/30 rounded text-red-500"><RefreshCw size={14} /></button>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar border border-red-900/30 bg-black">
                            <table className="w-full text-left text-[10px] font-mono">
                                <thead className="bg-red-950/30 text-red-500 sticky top-0"><tr><th className="p-3">HIP_ID</th><th className="p-3">ORIGIN</th><th className="p-3">STATUS</th><th className="p-3 text-right">ACTION</th></tr></thead>
                                <tbody className="divide-y divide-red-900/20">
                                    {ledgerData.map((entry) => (
                                        <tr key={entry.hipId} className="hover:bg-red-900/10 transition-colors">
                                            <td className="p-3 font-mono text-red-300/80">{entry.hipId.substring(0, 18)}...</td>
                                            <td className="p-3 text-red-400/60">{entry.location || "UNKNOWN"}</td>
                                            <td className="p-3">{entry.revoked ? <span className="px-2 py-0.5 bg-red-950 text-red-500 border border-red-900">REVOKED</span> : <span className="px-2 py-0.5 bg-green-900/20 text-green-500 border border-green-900/50">ACTIVE</span>}</td>
                                            <td className="p-3 text-right flex justify-end gap-2">
                                                 <button onClick={() => setSelectedUser(entry)} className="text-cyan-400 hover:text-cyan-100 hover:bg-cyan-900/50 px-2 py-1 border border-cyan-900/50"><Eye size={12} /></button>
                                                {!entry.revoked && <button onClick={() => handleRevoke(entry.hipId)} className="text-red-500 hover:text-red-100 hover:bg-red-600 px-2 py-1 border border-transparent hover:border-red-500">PURGE</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {view === 'events' && (
                    <div className="h-full flex flex-col gap-6">
                        {/* Event Creation Form */}
                        <div className="border-b border-red-900/50 pb-6">
                            <h3 className="text-lg text-red-400 font-bold mb-4 flex items-center gap-2"><Plus size={18}/> CREATE_NEW_EVENT</h3>
                            <form onSubmit={handleCreateEvent} className="flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-[10px] text-red-500 mb-1 block">EVENT_DESIGNATION</label>
                                    <input 
                                        type="text" 
                                        value={newEventName}
                                        onChange={e => setNewEventName(e.target.value)}
                                        className="w-full bg-red-950/10 border border-red-900 p-2 text-xs text-white focus:outline-none focus:border-red-500"
                                        placeholder="EX: OMEGA_PROTOCOL_SUMMIT"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-red-500 mb-1 block">CATEGORY</label>
                                    <select 
                                        value={newEventCategory}
                                        onChange={e => setNewEventCategory(e.target.value as EventCategory)}
                                        className="bg-red-950/10 border border-red-900 p-2 text-xs text-red-300 focus:outline-none focus:border-red-500"
                                    >
                                        {Object.values(EventCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="bg-red-600 hover:bg-red-500 text-black px-6 py-2 text-xs font-bold tracking-widest flex items-center gap-2">
                                    <Plus size={14}/> INITIALIZE
                                </button>
                            </form>
                        </div>

                        {/* Event List */}
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <h3 className="text-lg text-red-400 font-bold mb-4 flex items-center gap-2"><Calendar size={18}/> ACTIVE_OPERATIONS</h3>
                            <div className="grid gap-4">
                                {events.map(event => (
                                    <div key={event.id} className="border border-red-900/30 bg-red-950/10 p-4 flex justify-between items-center group hover:border-red-500/50 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-white font-bold tracking-widest">{event.name}</h4>
                                                <span className="text-[10px] bg-red-900/40 text-red-400 px-2 py-0.5">{event.category}</span>
                                            </div>
                                            <div className="text-[10px] text-red-600/70 mt-1">ID: {event.id} // CREATED: {new Date(event.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => launchGate(event)}
                                                className="bg-red-600/20 hover:bg-red-600 hover:text-black border border-red-600 text-red-500 px-4 py-2 text-xs font-bold tracking-widest flex items-center gap-2 transition-all"
                                            >
                                                <Scan size={14}/> LAUNCH GATE
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="text-red-800 hover:text-red-500"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && (
                                    <div className="text-center py-10 text-red-900 italic text-xs">NO ACTIVE OPERATIONS INITIALIZED</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};