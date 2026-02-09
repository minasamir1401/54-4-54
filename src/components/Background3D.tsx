import { memo, useState, useEffect } from 'react';

const Background3D = memo(() => {
  const [kidsMode, setKidsMode] = useState(localStorage.getItem('kidsMode') === 'true');

  useEffect(() => {
    const handleKidsChange = () => {
      setKidsMode(localStorage.getItem('kidsMode') === 'true');
    };
    window.addEventListener('kidsModeChange', handleKidsChange);
    return () => window.removeEventListener('kidsModeChange', handleKidsChange);
  }, []);

  if (kidsMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-deep-slate-900" aria-hidden="true">
      {/* 1. AGGRESSIVE CORE GLOWS - Optimized with CSS animations */}
      <div
        className="absolute -top-[10%] -right-[5%] w-[800px] h-[800px] bg-ice-mint/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow"
      />
      
      <div
        className="absolute -bottom-[10%] -left-[5%] w-[1000px] h-[1000px] bg-deep-slate-800/20 blur-[180px] rounded-full animate-pulse-slower"
      />

      {/* NEW: Secondary accent glow */}
      <div
        className="absolute top-[40%] left-[10%] w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full animate-pulse-slow"
      />

      {/* 2. OPTIMIZED PARTICLES - Using CSS for performance */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full blur-[1px] animate-float-up ${
              i % 3 === 0 ? 'bg-ice-mint w-1.5 h-1.5' : i % 3 === 1 ? 'bg-white/20 w-1 h-1' : 'bg-amber-400/30 w-1 h-1'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 15 + 15}s`,
              animationDelay: `${Math.random() * 10}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>

      {/* 3. VIGNETTE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_150%)] opacity-90" />
    </div>
  );
});

Background3D.displayName = 'Background3D';
export default Background3D;
