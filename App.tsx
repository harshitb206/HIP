import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Home, Fingerprint, FileText, Lock, LogOut, Download, Shield, Database, Eye, EyeOff, Server, Network, User, Cpu, ArrowLeft, Globe, Activity } from 'lucide-react';
import { CaptureFlow } from './components/CaptureFlow';
import { Verifier } from './components/Verifier'; 
import { HologramAvatar } from './components/HologramAvatar';
import { ledgerService } from './services/ledgerService';
import { CryptoService } from './services/cryptoService';
import { SignedHipToken, HipPurpose } from './types';
import { QRCodeSVG } from 'qrcode.react';

// --- Dashboard (User View) ---

const Dashboard = ({ token, onLogout }: { token: SignedHipToken, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'card' | 'qr' | 'json'>('card');
  const [showPrivacyMask, setShowPrivacyMask] = useState(false);
  const navigate = useNavigate();

  const downloadCert = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(token, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `hip_cert_${token.payload.hipId.substring(0,8)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 pt-20">
      <header className="flex flex-wrap justify-between items-end mb-12 gap-4 border-b border-cyan-500/20 pb-6">
         <div>
             <h1 className="text-4xl font-mono font-black text-white tracking-tighter mb-1">
               PASSPORT <span className="text-cyan-500">CONTROL</span>
             </h1>
             <div className="flex items-center gap-4 text-xs font-mono text-cyan-600 tracking-widest uppercase">
                 <span>ACCESS LEVEL: CITIZEN</span>
                 <span>//</span>
                 <span>ID: {token.payload.hipId.substring(0,8)}</span>
             </div>
         </div>
         <div className="flex gap-2">
             <button onClick={() => navigate('/')} className="flex items-center gap-2 text-cyan-500 hover:text-white text-xs transition-colors border border-cyan-900/50 hover:bg-cyan-900/30 px-6 py-3 rounded-sm font-mono tracking-widest">
                <ArrowLeft size={14} /> MAIN_MENU
             </button>
             <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:text-white text-xs transition-colors border border-red-900/50 hover:bg-red-900/30 px-6 py-3 rounded-sm font-mono tracking-widest">
                <LogOut size={14} /> DISCONNECT
             </button>
         </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* ID Card Visual */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-black border border-cyan-900/50 p-8 flex flex-col items-center relative overflow-hidden group">
                 {/* Decorative background */}
                 <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                 <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                 
                 <HologramAvatar 
                     seed={token.payload.hipId} 
                     isMasked={showPrivacyMask} 
                     userImage={token.payload.meta.avatarPreview !== "generated" ? token.payload.meta.avatarPreview : undefined}
                 />

                 <div className="mt-8 text-center z-10 w-full">
                     <h2 className="text-2xl font-bold font-mono text-white tracking-widest">
                         {showPrivacyMask ? "ANONYMOUS" : token.payload.meta.displayName.toUpperCase()}
                     </h2>
                     <div className="mt-4 grid grid-cols-2 gap-px bg-cyan-900/30 border border-cyan-900/30">
                        <div className="bg-black/80 p-3 text-center">
                            <span className="block text-[10px] text-slate-500 font-mono mb-1">ORIGIN</span>
                            <span className="text-xs text-cyan-400 font-mono truncate px-1 block">{token.payload.meta.location || "UNKNOWN"}</span>
                        </div>
                        <div className="bg-black/80 p-3 text-center">
                            <span className="block text-[10px] text-slate-500 font-mono mb-1">STATUS</span>
                            <span className="text-xs text-green-500 font-mono">ACTIVE</span>
                        </div>
                     </div>
                 </div>
            </div>

            <button 
                onClick={() => setShowPrivacyMask(!showPrivacyMask)}
                className={`w-full py-4 flex items-center justify-center gap-2 border font-mono text-xs tracking-widest transition-all ${showPrivacyMask ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' : 'border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50'}`}
            >
                {showPrivacyMask ? <Eye size={16} /> : <EyeOff size={16} />}
                {showPrivacyMask ? "DISABLE PRIVACY SHIELD" : "ENABLE PRIVACY SHIELD"}
            </button>
        </div>

        {/* Actions & Details */}
        <div className="lg:col-span-8 space-y-6">
            <div className="flex border-b border-cyan-900/30 font-mono text-xs tracking-widest">
                <button onClick={() => setActiveTab('card')} className={`px-8 py-3 transition-all ${activeTab === 'card' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-950/10' : 'text-slate-500 hover:text-cyan-300'}`}>IDENTITY_DATA</button>
                <button onClick={() => setActiveTab('qr')} className={`px-8 py-3 transition-all ${activeTab === 'qr' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-950/10' : 'text-slate-500 hover:text-cyan-300'}`}>QR_TOKEN</button>
                <button onClick={() => setActiveTab('json')} className={`px-8 py-3 transition-all ${activeTab === 'json' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-950/10' : 'text-slate-500 hover:text-cyan-300'}`}>RAW_PAYLOAD</button>
            </div>

            <div className="min-h-[400px] border border-cyan-900/20 bg-black/40 p-8 relative">
                {activeTab === 'card' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-cyan-950/10 border border-cyan-900/30">
                                <p className="text-[10px] text-cyan-600 font-mono mb-2 uppercase tracking-widest">Access Clearance</p>
                                <div className="text-xl text-white font-mono flex items-center gap-2">
                                    <Globe size={20} className="text-cyan-400"/> UNIVERSAL
                                </div>
                            </div>
                            <div className="p-6 bg-cyan-950/10 border border-cyan-900/30">
                                <p className="text-[10px] text-cyan-600 font-mono mb-2 uppercase tracking-widest">Trust Vector</p>
                                <div className="text-xl text-white font-mono flex items-center gap-2">
                                    <Shield size={20} className="text-cyan-400"/> 99.9%
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Immutable Hash Identifier</p>
                             <div className="bg-black border border-slate-800 p-4 font-mono text-xs text-cyan-600 break-all">
                                 {token.payload.maskedHash}
                             </div>
                        </div>

                        <div className="space-y-2">
                             <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Digital Signature</p>
                             <div className="bg-black border border-slate-800 p-4 font-mono text-[10px] text-slate-600 break-all h-20 overflow-hidden relative">
                                 {token.signature}
                                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'qr' && (
                    <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300 h-full py-8">
                        <div className="p-4 bg-white rounded-sm shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            <QRCodeSVG 
                                value={JSON.stringify(token)} 
                                size={220}
                                level="L"
                            />
                        </div>
                        <p className="text-cyan-400 font-mono font-bold mt-8 tracking-[0.2em] text-xs uppercase animate-pulse">Scan at Checkpoint</p>
                    </div>
                )}

                {activeTab === 'json' && (
                    <div className="relative animate-in slide-in-from-bottom-4 duration-300 h-full flex flex-col">
                        <pre className="flex-1 bg-black p-6 border border-slate-800 text-[10px] text-green-500/80 overflow-auto font-mono custom-scrollbar mb-4">
                            {JSON.stringify(token, null, 2)}
                        </pre>
                        <button 
                            onClick={downloadCert}
                            className="self-end px-6 py-3 bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 hover:text-white transition-all font-mono text-xs flex items-center gap-2"
                        >
                            <Download size={14} /> DOWNLOAD CERTIFICATE
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Create Logic ---

const CreateHip = ({ onComplete }: { onComplete: (token: SignedHipToken) => void }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleCaptureComplete = async (data: { image: string, mockEmbedding: number[], location: { city: string, ip: string }, audioData: string }) => {
        setIsProcessing(true);
        try {
            const keyPair = await CryptoService.generateKeyPair();
            const publicKeyJwk = await CryptoService.exportPublicKey(keyPair.publicKey);
            const identityHash = await CryptoService.hashString(JSON.stringify(data.mockEmbedding));
            const maskedHash = await CryptoService.hashString("masked_" + identityHash + Date.now());
            const hipId = crypto.randomUUID();
            const now = Date.now();
            const payload = {
                hipId,
                maskedHash,
                purpose: HipPurpose.UNIVERSAL_ACCESS, 
                issuedAt: now,
                exp: now + 86400000 * 7,
                issuer: "HIP-Global-Authority-Node-01",
                nonce: crypto.randomUUID(),
                scope: ["global_access", "verification", "travel"],
                meta: {
                    displayName: "User-" + hipId.substring(0,4),
                    avatarPreview: data.image || "generated", 
                    ip: data.location.ip,
                    location: data.location.city,
                    audioData: "Stored in Ledger" 
                }
            };
            const signature = await CryptoService.sign(keyPair.privateKey, JSON.stringify(payload));
            ledgerService.registerHip({
                hipId,
                identityHash,
                maskedHash,
                issuer: payload.issuer,
                issuedAt: now,
                exp: payload.exp,
                revoked: false,
                biometricVector: data.mockEmbedding,
                ip: data.location.ip,
                location: data.location.city,
                audioData: data.audioData, // STORE AUDIO
                avatarImage: data.image // STORE HIGH RES AVATAR FOR ADMIN
            });
            onComplete({ payload, signature, publicKey: publicKeyJwk });

        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center font-mono">
                <div className="relative">
                    <div className="w-32 h-32 border-t-4 border-cyan-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 border-r-4 border-purple-500 rounded-full animate-spin-reverse opacity-50"></div>
                </div>
                <h2 className="text-3xl text-white tracking-widest mt-8 mb-2 font-bold">MINTING TOKEN</h2>
                <div className="text-xs text-cyan-500 space-y-1 opacity-70 font-mono">
                    <p>Writing to Immutable Ledger...</p>
                    <p>Finalizing ECDSA Signatures...</p>
                    <p>Granting Universal Access...</p>
                </div>
            </div>
        );
    }

    return <CaptureFlow onComplete={handleCaptureComplete} />;
};

// --- Landing / Role Select ---

const Landing = () => {
    const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0 });
    
    useEffect(() => {
        // Initial fetch
        setStats(ledgerService.getStats());
        
        // Dynamic Data Update
        const interval = setInterval(() => {
            setStats(ledgerService.getStats());
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex flex-col pt-16 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_100%)]"></div>
            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-cyan-900/10 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
                <div className="text-center mb-16 space-y-2">
                    <div className="inline-block border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 mb-6 rounded-full">
                        <div className="flex items-center gap-2">
                             <span className="relative flex h-2 w-2">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                             </span>
                             <span className="text-[10px] font-mono text-cyan-300 tracking-widest">SYSTEM ONLINE</span>
                        </div>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white font-mono tracking-tighter mix-blend-overlay opacity-80">
                        H.I.P.
                    </h1>
                    <p className="text-cyan-400 font-mono tracking-[0.5em] text-sm md:text-lg uppercase">
                        Holographic Identity Passport
                    </p>
                </div>

                {/* Dynamic Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 border-y border-cyan-900/30 bg-black/30 py-6 backdrop-blur-sm">
                    <div className="text-center border-r border-cyan-900/30">
                        <div className="text-2xl text-white font-mono font-bold">{stats.total.toLocaleString()}</div>
                        <div className="text-[10px] text-cyan-500 uppercase tracking-widest font-mono">Total Identities</div>
                    </div>
                    <div className="text-center border-r border-cyan-900/30">
                        <div className="text-2xl text-green-400 font-mono font-bold">{stats.active.toLocaleString()}</div>
                        <div className="text-[10px] text-green-700 uppercase tracking-widest font-mono">Active Nodes</div>
                    </div>
                    <div className="text-center border-r border-cyan-900/30">
                        <div className="text-2xl text-white font-mono font-bold">
                             {(stats.active / (stats.total || 1) * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-cyan-500 uppercase tracking-widest font-mono">Trust Index</div>
                    </div>
                    <div className="text-center">
                         <div className="text-2xl text-white font-mono font-bold animate-pulse">
                             {new Date().getMilliseconds()}
                         </div>
                         <div className="text-[10px] text-cyan-500 uppercase tracking-widest font-mono">Block Height</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Citizen Card */}
                    <Link to="/create" className="group relative h-96 bg-black border border-cyan-900 hover:border-cyan-400 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[length:20px_20px] opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-24 h-24 mb-8 relative">
                                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-spin-slow group-hover:border-cyan-400"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Fingerprint className="text-cyan-500 w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-mono font-bold text-white mb-2 tracking-widest">CITIZEN</h3>
                            <p className="text-slate-500 text-xs font-mono max-w-xs tracking-wide">
                                Create Sovereign Digital ID. Access Universal Events.
                            </p>
                            <div className="mt-8 px-8 py-3 bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                Initialize
                            </div>
                        </div>
                    </Link>

                    {/* Admin Card */}
                    <Link to="/admin" className="group relative h-96 bg-black border border-red-900 hover:border-red-500 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[length:20px_20px] opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-24 h-24 mb-8 relative">
                                <div className="absolute inset-0 border-2 border-red-500/30 rounded-full animate-spin-reverse group-hover:border-red-400"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Shield className="text-red-500 w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-mono font-bold text-white mb-2 tracking-widest">NETSEC</h3>
                            <p className="text-slate-500 text-xs font-mono max-w-xs tracking-wide">
                                Restricted Environment. Ledger Auditing & Verification.
                            </p>
                            <div className="mt-8 px-8 py-3 bg-red-950/30 border border-red-500/30 text-red-400 font-mono text-xs uppercase tracking-[0.2em] group-hover:bg-red-500 group-hover:text-black transition-all">
                                Authorize
                            </div>
                        </div>
                    </Link>
                </div>
                
                <footer className="mt-20 border-t border-cyan-900/30 pt-8 flex justify-center gap-12 text-[10px] font-mono text-slate-600 tracking-widest">
                    <Link to="/docs" className="hover:text-cyan-400 transition-colors">SYSTEM_DOCS_V2.0</Link>
                    <Link to="/architecture" className="hover:text-cyan-400 transition-colors">NODE_MAP</Link>
                    <span className="text-cyan-900">SECURE_CONNECTION_ESTABLISHED</span>
                </footer>
            </div>
        </div>
    );
};

// --- Documentation Page ---

const Docs = () => {
    return (
        <div className="max-w-4xl mx-auto p-8 pt-24 font-mono animate-in fade-in duration-500">
             <Link to="/" className="text-cyan-500 hover:text-white mb-8 flex items-center gap-2 text-xs border border-cyan-900/50 w-fit px-4 py-2 hover:bg-cyan-900/20 transition-colors">
                <ArrowLeft size={14} /> RETURN_TO_ROOT
             </Link>
             <h1 className="text-3xl font-bold text-white mb-8 border-b border-cyan-900/50 pb-4">SYSTEM_DOCUMENTATION_V2.0</h1>
             
             <div className="space-y-12 text-sm text-slate-400">
                 <section className="space-y-4">
                     <h2 className="text-cyan-400 font-bold text-lg uppercase tracking-widest flex items-center gap-2"><FileText size={18}/> 01 // Protocol Overview</h2>
                     <p className="leading-relaxed">The Holographic Identity Passport (HIP) protocol establishes a decentralized, self-sovereign identity layer for the open metaverse. Utilizing high-assurance biometrics and cryptographic signatures, HIP ensures 1:1 personhood without compromising privacy.</p>
                 </section>
                 
                 <section className="space-y-4">
                     <h2 className="text-cyan-400 font-bold text-lg uppercase tracking-widest flex items-center gap-2"><Lock size={18}/> 02 // Cryptography</h2>
                     <p className="leading-relaxed">Identities are secured via ECDSA (P-256) key pairs generated client-side via the WebCrypto API. The private key never leaves the user's execution environment. Public keys are anchored to an immutable ledger for verification, ensuring that only the rightful owner can prove their identity.</p>
                 </section>

                 <section className="space-y-4">
                     <h2 className="text-cyan-400 font-bold text-lg uppercase tracking-widest flex items-center gap-2"><Cpu size={18}/> 03 // Verification Logic</h2>
                     <div className="bg-black border border-cyan-900 p-6 rounded-sm relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-2 text-xs text-cyan-900">pseudocode.ts</div>
                         <pre className="text-green-500 font-mono text-xs overflow-x-auto">
{`function verifyToken(token: SignedHipToken): boolean {
    // 1. Verify Cryptographic Signature
    const isSigValid = await CryptoService.verify(
        token.publicKey, 
        token.signature, 
        JSON.stringify(token.payload)
    );

    // 2. Check Immutable Ledger Status
    const ledgerEntry = ledgerService.getEntry(token.payload.hipId);
    const isNotRevoked = !ledgerEntry.revoked;

    // 3. Verify Biometric Hash Integrity
    const isHashValid = ledgerEntry.maskedHash === token.payload.maskedHash;

    return isSigValid && isNotRevoked && isHashValid;
}`}
                         </pre>
                     </div>
                 </section>
             </div>
        </div>
    );
};

// --- Architecture View Page ---

const ArchitectureView = () => {
    return (
         <div className="max-w-6xl mx-auto p-8 pt-24 font-mono h-screen flex flex-col animate-in fade-in duration-500">
             <Link to="/" className="text-cyan-500 hover:text-white mb-8 flex items-center gap-2 text-xs border border-cyan-900/50 w-fit px-4 py-2 hover:bg-cyan-900/20 transition-colors">
                <ArrowLeft size={14} /> RETURN_TO_ROOT
             </Link>
             <h1 className="text-3xl font-bold text-white mb-8 border-b border-cyan-900/50 pb-4">NODE_TOPOLOGY_MAP</h1>
             
             <div className="flex-1 flex items-center justify-center relative border border-cyan-900/30 bg-black/50 rounded-sm overflow-hidden">
                 <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                 
                 {/* Simple CSS Visualization of Architecture */}
                 <div className="relative w-full h-full flex items-center justify-center p-12">
                     
                     {/* Client Node */}
                     <div className="absolute left-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-10 group">
                         <div className="w-20 h-20 bg-cyan-900/20 border-2 border-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)] group-hover:scale-110 transition-transform">
                             <User className="text-cyan-400 w-8 h-8" />
                         </div>
                         <div className="text-center">
                             <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Client Enclave</div>
                             <div className="text-[10px] text-cyan-600 mt-1">Browser / WebCrypto</div>
                         </div>
                     </div>

                     {/* Server Node */}
                     <div className="flex flex-col items-center gap-4 z-10 group">
                          <div className="w-32 h-32 bg-black border-2 border-white rounded-xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] group-hover:border-cyan-400 transition-colors">
                             <Server className="text-white w-12 h-12 group-hover:text-cyan-400 transition-colors" />
                         </div>
                         <div className="text-center">
                             <div className="text-xs text-white font-bold uppercase tracking-widest bg-black px-2">Consensus Layer</div>
                             <div className="text-[10px] text-slate-500 mt-1">Immutable Ledger / State</div>
                         </div>
                     </div>

                     {/* Admin Node */}
                     <div className="absolute right-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-10 group">
                         <div className="w-20 h-20 bg-red-900/20 border-2 border-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)] group-hover:scale-110 transition-transform">
                             <Shield className="text-red-400 w-8 h-8" />
                         </div>
                         <div className="text-center">
                             <div className="text-xs text-red-500 font-bold uppercase tracking-widest">Admin Node</div>
                             <div className="text-[10px] text-red-700 mt-1">Verifier / Auditor</div>
                         </div>
                     </div>

                     {/* Connections */}
                     <svg className="absolute inset-0 w-full h-full pointer-events-none">
                         <line x1="15%" y1="50%" x2="45%" y2="50%" stroke="#0e7490" strokeWidth="2" strokeDasharray="5,5" />
                         <line x1="55%" y1="50%" x2="85%" y2="50%" stroke="#7f1d1d" strokeWidth="2" strokeDasharray="5,5" />
                         
                         {/* Animated Packets */}
                         <circle r="4" fill="#22d3ee">
                             <animateMotion dur="2s" repeatCount="indefinite" path="M 200,350 L 600,350" />
                         </circle>
                     </svg>
                     
                     {/* Labels */}
                     <div className="absolute top-[42%] left-[25%] text-[10px] text-cyan-500 font-mono bg-black px-2 border border-cyan-900">ECDSA_SIGNATURE</div>
                     <div className="absolute bottom-[42%] right-[25%] text-[10px] text-red-500 font-mono bg-black px-2 border border-red-900">AUDIT_LOG</div>

                 </div>
             </div>
        </div>
    );
};

// --- App Root ---

export default function App() {
  const [userToken, setUserToken] = useState<SignedHipToken | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hip_demo_token');
    if (saved) {
        try { setUserToken(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleCreateComplete = (token: SignedHipToken) => {
      setUserToken(token);
      try {
        localStorage.setItem('hip_demo_token', JSON.stringify(token));
      } catch (e) {
          console.warn("Storage quota exceeded. Token session is temporary.");
      }
  };

  const handleLogout = () => {
      setUserToken(null);
      localStorage.removeItem('hip_demo_token');
  };

  return (
    <HashRouter>
      <div className="min-h-screen font-sans selection:bg-cyan-500/30 pb-12 bg-black text-slate-200">
        <Routes>
            <Route path="/" element={<Landing />} />
            
            {/* Citizen Routes */}
            <Route path="/create" element={userToken ? <Navigate to="/citizen/dashboard" /> : <CreateHip onComplete={handleCreateComplete} />} />
            <Route path="/citizen/dashboard" element={userToken ? <Dashboard token={userToken} onLogout={handleLogout} /> : <Navigate to="/create" />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Verifier />} />
            
            {/* Info */}
            <Route path="/docs" element={<Docs />} />
            <Route path="/architecture" element={<ArchitectureView />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
