import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes, FaMobileAlt, FaLaptop } from 'react-icons/fa';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the custom prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Optionally store in session storage to not show again in this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already dismissed in this session
  if (sessionStorage.getItem('installPromptDismissed')) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[10000]"
        >
          <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 blur-3xl rounded-full group-hover:bg-red-600/30 transition-all duration-500" />
            
            <button 
              onClick={handleClose}
              className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors"
              aria-label="إغلاق"
            >
              <FaTimes />
            </button>

            <div className="flex flex-row-reverse items-start gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/20">
                <img src="/favicon.png" alt="LMINA Logo" className="w-10 h-10 object-contain" />
              </div>
              
              <div className="flex-1 text-right">
                <h3 className="text-white font-black text-lg mb-1 italic tracking-tighter">تطبيق LMINA</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  ثبت التطبيق الآن على جهازك لتجربة مشاهدة أسرع وأفضل بدون إعلانات.
                </p>
                
                <div className="flex flex-row-reverse items-center gap-3">
                  <button
                    onClick={handleInstall}
                    className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaDownload className="text-xs" />
                    تثبيت الآن
                  </button>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    <FaMobileAlt title="جوال" />
                    <FaLaptop title="كمبيوتر" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
