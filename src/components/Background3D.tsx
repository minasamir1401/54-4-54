import { memo } from 'react';

const Background3D = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#050505]" aria-hidden="true">
      {/* 1. AGGRESSIVE CORE GLOWS - Optimized with CSS animations */}
      <div
        className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-red-600/20 blur-[130px] rounded-full mix-blend-screen animate-pulse-slow"
      />
      
      <div
        className="absolute -bottom-[10%] -left-[5%] w-[800px] h-[800px] bg-red-900/15 blur-[160px] rounded-full animate-pulse-slower"
      />

      {/* 2. OPTIMIZED PARTICLES - Using CSS for performance */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full blur-[1px] animate-float-up ${
              i % 2 === 0 ? 'bg-red-500 w-1 h-1' : 'bg-white/10 w-0.5 h-0.5'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 20}s`,
              animationDelay: `${Math.random() * 10}s`,
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
