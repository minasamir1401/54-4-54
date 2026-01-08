
import { memo, useEffect, useState } from 'react';
import { FaCloud, FaStar, FaHeart, FaMusic } from 'react-icons/fa';
import { motion } from 'framer-motion';

const KidsBackground = memo(() => {
  const [kidsMode, setKidsMode] = useState(localStorage.getItem('kidsMode') === 'true');

  useEffect(() => {
    const handleKidsChange = () => {
      setKidsMode(localStorage.getItem('kidsMode') === 'true');
    };
    window.addEventListener('kidsModeChange', handleKidsChange);
    return () => window.removeEventListener('kidsModeChange', handleKidsChange);
  }, []);

  if (!kidsMode) return null;

  // Floating icons configuration
  const icons = [
    { Icon: FaCloud, color: 'text-kids-blue', size: 'text-6xl', delay: 0 },
    { Icon: FaStar, color: 'text-kids-yellow', size: 'text-4xl', delay: 2 },
    { Icon: FaHeart, color: 'text-kids-pink', size: 'text-3xl', delay: 4 },
    { Icon: FaMusic, color: 'text-kids-green', size: 'text-4xl', delay: 6 },
    { Icon: FaCloud, color: 'text-kids-blue', size: 'text-5xl', delay: 8 },
    { Icon: FaStar, color: 'text-kids-yellow', size: 'text-2xl', delay: 10 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-white" aria-hidden="true">
      {/* Soft Gradient Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-kids-blue/20 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-kids-yellow/20 rounded-full blur-[120px] animate-pulse-slower" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-kids-pink/20 rounded-full blur-[80px] animate-pulse" />

      {/* Floating Characters/Icons */}
      {icons.map((item, i) => (
        <motion.div
          key={i}
          initial={{ y: '110vh', x: Math.random() * window.innerWidth, rotate: 0 }}
          animate={{ 
            y: '-10vh', 
            rotate: 360,
            x: (Math.random() - 0.5) * 200 + (Math.random() * window.innerWidth) 
          }}
          transition={{ 
            duration: 20 + Math.random() * 10, 
            repeat: Infinity, 
            ease: "linear",
            delay: item.delay 
          }}
          className={`absolute ${item.color} ${item.size} opacity-60`}
        >
          <item.Icon />
        </motion.div>
      ))}

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#4FC3F7 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>
    </div>
  );
});

KidsBackground.displayName = 'KidsBackground';
export default KidsBackground;
