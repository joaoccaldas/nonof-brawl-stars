import { useEffect, useState } from 'react';

export default function ScanLines() {
  const [scanY, setScanY] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    // Main scan line sweep
    const scanInterval = setInterval(() => {
      setScanY(y => (y + 1) % 100);
    }, 50);

    // Occasional glitch
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 100);
      }
    }, 3000);

    return () => {
      clearInterval(scanInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* Subtle scan lines pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.1) 2px, rgba(6, 182, 212, 0.1) 4px)'
        }}
      />
      
      {/* Moving scan line */}
      <div 
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
        style={{ top: `${scanY}%` }}
      />
      
      {/* Glitch effect */}
      {glitch && (
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-cyan-400/5 translate-x-1" />
          <div className="flex-1 bg-cyan-400/5 -translate-x-1" />
        </div>
      )}
      
      {/* Vignette for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)'
        }}
      />
    </div>
  );
}
