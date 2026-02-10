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
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-2 md:top-auto md:bottom-8 left-2 right-2 md:left-auto md:right-8 md:w-[380px] z-[10000]"
        >
          <div className="bg-black/95 backdrop-blur-2xl border border-white/10 p-3 md:p-6 rounded-[1.2rem] md:rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-ice-mint/20 blur-3xl rounded-full group-hover:bg-ice-mint/30 transition-all duration-500" />

            <button
              onClick={handleClose}
              className="absolute top-3 left-3 w-6 h-6 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors"
              aria-label="إغلاق"
            >
              <FaTimes className="text-[10px]" />
            </button>

            <div className="flex flex-row-reverse items-center gap-4 md:gap-5">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-ice-mint to-ice-mint-active rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-ice-mint/20">
                <img src="/favicon.png" alt="MOVIDO Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              </div>

              <div className="flex-1 text-right">
                <h3 className="text-white text-xs md:text-base font-black italic">MOVIDO PWA</h3>
                <p className="text-slate-400 text-[8px] md:text-[10px] font-bold leading-tight mt-1">تطبيق موفيدو لتجربة أسرع وأفضل على جهازك.</p>

                <div className="flex flex-row-reverse items-center gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="flex-1 bg-white text-black py-2 md:py-3 rounded-lg md:rounded-xl font-black text-[10px] md:text-sm hover:bg-ice-mint hover:text-deep-slate-900 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaDownload className="text-[8px] md:text-xs" />
                    تثبيت
                  </button>

                  <div className="hidden sm:flex items-center gap-2 text-gray-500 text-[8px] font-black uppercase tracking-widest">
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
