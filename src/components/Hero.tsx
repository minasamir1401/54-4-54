import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaInfoCircle, FaStar } from 'react-icons/fa';

interface HeroProps {
  movie: any;
  kidsMode?: boolean;
}

const Hero = ({ movie, kidsMode = false }: HeroProps) => {
  const navigate = useNavigate();

  if (!movie) return (
    <div className="h-[75vh] md:h-[92vh] bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className={`relative h-[75vh] md:h-[92vh] w-full overflow-hidden ${kidsMode ? 'bg-transparent text-deep-slate-900' : 'bg-deep-slate-900 text-white'}`}>
      {/* Cinematic Background */}
      <div className="absolute inset-0">
          <motion.img 
             key={movie.poster}
             initial={{ scale: 1.05, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             src={movie.poster} 
             alt={movie.title} 
             loading="eager"
             // @ts-ignore
             fetchpriority="high"
             className={`w-full h-full object-cover object-top ${kidsMode ? 'mask-gradient-bottom rounded-b-[3rem] shadow-xl' : 'brightness-75 contrast-[1.05]'}`}
          />
          {/* Global Cinematic Vignette - Hide in Kids Mode */}
          {!kidsMode && (
            <>
              <div className="absolute inset-0 bg-gradient-to-l from-deep-slate-900 via-deep-slate-900/40 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-slate-900 via-transparent to-black/30 z-10 pointer-events-none" />
            </>
          )}
          {kidsMode && (
             <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
          )}
      </div>

      {/* Content Area */}
      <div className="absolute inset-0 z-20 flex pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-10 items-end justify-center md:items-center md:justify-start md:px-24">
        {/* Adjusted width for better responsiveness at 1024px+ */}
        <div className="w-full md:max-w-3xl lg:max-w-4xl text-center md:text-right">
          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-[95%] mx-auto md:mx-0"
            >
               <div className="flex flex-row-reverse items-center justify-center md:justify-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  {kidsMode ? (
                     <span className="bg-kids-yellow text-deep-slate-900 border-2 border-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg transform rotate-2">
                        🌟 مميز جداً
                     </span>
                  ) : (
                    <span className="flex items-center gap-2 bg-deep-slate-800/80 backdrop-blur-2xl border border-deep-slate-border px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-ice-mint">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-ice-mint rounded-full animate-pulse" /> الأكثر شهرة
                    </span>
                  )}
                  <div className={`flex flex-row-reverse items-center gap-1 font-outfit text-xs sm:text-sm font-bold ${kidsMode ? 'text-kids-pink' : 'text-ice-mint'}`}>
                      <FaStar size={kidsMode ? 16 : 12} aria-hidden="true" className={kidsMode ? 'animate-bounce-slow' : ''} /> {movie.rating || '8.5'}
                  </div>
               </div>
               
               {/* Fluid font sizes for all screens */}
               <h1 className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 tracking-tighter leading-tight italic ${kidsMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-kids-blue to-kids-pink drop-shadow-md' : ''}`}>
                  {movie.title}
               </h1>
               
               <p className={`text-xs sm:text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto md:mr-0 leading-relaxed line-clamp-2 xs:line-clamp-3 sm:line-clamp-4 ${kidsMode ? 'text-gray-600 font-bold' : 'text-text-secondary opacity-90'}`}>
                 {movie.description || (kidsMode ? "مغامرات شيقة وممتعة بانتظاركم! شاهدوا أجمل اللحظات وتعلموا أشياء جديدة مع أصدقائكم المفضلين." : "استمتع بتجربة سينمائية لا مثيل لها على LMINA. محتوى حصري بجودة عالية وواجهة ذكية مصممة لمحبي الأفلام الحقيقيين.")}
               </p>

               <div className="flex flex-row-reverse items-center justify-center md:justify-start gap-2 sm:gap-4 mb-4 sm:mb-12">
                  <button 
                    onClick={() => navigate(`/watch/${movie.id}`)}
                    aria-label={`مشاهدة ${movie.title} الآن`}
                    className={`flex flex-row-reverse items-center px-6 sm:px-12 py-3 sm:py-4 rounded-full font-black transition-all duration-500 transform active:scale-95 text-xs sm:text-base ${
                      kidsMode 
                      ? 'bg-kids-green text-white shadow-[0_10px_20px_rgba(129,199,132,0.4)] hover:shadow-[0_15px_30px_rgba(129,199,132,0.6)]' 
                      : 'bg-ice-mint text-deep-slate-900 hover:bg-white shadow-[0_0_20px_rgba(127,255,212,0.4)]'
                    }`}
                  >
                    <FaPlay className="ml-1.5 sm:ml-3" aria-hidden="true" /> {kidsMode ? 'يلا نشاهد!' : 'مشاهدة'}
                  </button>
                  <button 
                    onClick={() => navigate(`/watch/${movie.id}`)}
                    aria-label={`عرض تفاصيل ${movie.title}`}
                    className={`flex flex-row-reverse items-center backdrop-blur-md px-5 sm:px-10 py-3 sm:py-4 rounded-full font-bold transition-all duration-300 text-xs sm:text-base border ${
                      kidsMode
                      ? 'bg-white text-kids-blue border-kids-blue hover:bg-kids-blue hover:text-white'
                      : 'bg-white/5 text-white hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <FaInfoCircle className={`ml-1.5 sm:ml-3 ${kidsMode ? '' : 'text-ice-mint'}`} aria-hidden="true" /> {kidsMode ? 'القصة' : 'التفاصيل'}
                  </button>
               </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Hero Shade for content below - Only in normal mode */}
      {!kidsMode && <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-deep-slate-900 to-transparent z-10" />}
    </div>
  );
};

export default Hero;
