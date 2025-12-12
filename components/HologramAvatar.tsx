import React from 'react';

interface HologramAvatarProps {
  seed?: string;
  size?: number;
  isMasked?: boolean;
  userImage?: string;
}

export const HologramAvatar: React.FC<HologramAvatarProps> = ({ isMasked = false, userImage }) => {
  return (
    <div className="relative group">
       {/* High Tech Frame */}
       <div className={`relative overflow-hidden border-2 ${isMasked ? 'border-slate-600 bg-slate-800' : 'border-cyan-500 bg-black'} w-48 h-56 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]`}>
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current z-20"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-current z-20"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-current z-20"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current z-20"></div>

            {userImage && !isMasked ? (
                <>
                    <img 
                        src={userImage} 
                        alt="ID" 
                        className="w-full h-full object-cover filter contrast-125 brightness-90 sepia-[.2] hue-rotate-180 transition-all duration-500 group-hover:filter-none" 
                    />
                    {/* Holographic Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                    <div className="absolute top-0 w-full h-1 bg-cyan-400/50 blur-[2px] animate-scan z-10 opacity-50"></div>
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <svg className="w-12 h-12 mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="text-[10px] font-mono tracking-widest">IDENTITY MASKED</span>
                </div>
            )}
       </div>
       
       {!isMasked && (
           <div className="absolute -bottom-6 w-full text-center">
               <span className="text-[10px] font-mono text-cyan-500 tracking-[0.3em] uppercase opacity-70">Verified ID</span>
           </div>
       )}
    </div>
  );
};