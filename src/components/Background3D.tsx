import { motion, useReducedMotion } from 'framer-motion';
import { memo } from 'react';

const Background3D = memo(() => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#050505]">
      {/* 1. AGGRESSIVE CORE GLOWS - Optimized with will-change */}
      <motion.div
        animate={shouldReduceMotion ? {} : {
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.2, 0.15],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ willChange: "opacity" }}
        className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-red-600/20 blur-[130px] rounded-full mix-blend-screen"
      />
      
      <motion.div
        animate={shouldReduceMotion ? {} : {
          scale: [1.1, 1, 1.1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ willChange: "opacity" }}
        className="absolute -bottom-[10%] -left-[5%] w-[800px] h-[800px] bg-red-900/15 blur-[160px] rounded-full"
      />

      {/* 2. OPTIMIZED PARTICLES */}
      {!shouldReduceMotion && [...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0,
          }}
          animate={{
            y: ["0%", "100%"],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10
          }}
          style={{ willChange: "transform" }}
          className={`absolute rounded-full blur-[1px] ${
            i % 2 === 0 ? 'bg-red-500 w-1 h-1' : 'bg-white/10 w-0.5 h-0.5'
          }`}
        />
      ))}

      {/* 3. VIGNETTE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_150%)] opacity-90" />
    </div>
  );
});

Background3D.displayName = 'Background3D';
export default Background3D;
