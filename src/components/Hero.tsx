import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaInfoCircle, FaStar, FaFilm } from 'react-icons/fa';

interface HeroProps {
  movie: any;
  kidsMode?: boolean;
}

const Hero = ({ movie, kidsMode = false }: HeroProps) => {
  const navigate = useNavigate();

  const openSmartLink = () => {
    window.open('https://offevasionrecruit.com/zic21a2k4s?key=b01e21cf613c7a05ddb4e54f14865584', '_blank');
  };

  if (!movie) return (
    <div className="h-[85vh] md:h-[95vh] bg-[#05070a] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#7fffd4] border-t-transparent rounded-full animate-spin shadow-[0_0_50px_rgba(127,255,212,0.4)]"></div>
    </div>
  );

  return (
    <div className={`relative h-[85vh] md:h-[95vh] w-full overflow-hidden ${kidsMode ? 'bg-transparent text-slate-900' : 'bg-[#05070a] text-white'}`}>
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <motion.img
          key={movie.poster}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 1 }}
          transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
          src={movie.poster}
          alt={movie.title}
          loading="eager"
          // @ts-ignore
          fetchpriority="high"
          className={`w-full h-full object-cover object-top ${kidsMode ? 'hero-mask-bottom rounded-b-[4rem] shadow-2xl' : 'brightness-[0.6] contrast-[1.1] saturate-[1.2]'}`}
        />

        {/* Subtle MOVIDO Branding Texture Overlay */}
        {!kidsMode && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ delay: 1, duration: 2 }}
            src="/movido_hero.png"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay pointer-events-none"
            alt=""
          />
        )}

        {/* Luxury Gradients & Vignettes */}
        {!kidsMode && (
          <>
            <div className="absolute inset-0 bg-gradient-to-l from-[#05070a] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/20 to-black/40 z-10 pointer-events-none" />
            <div className="absolute inset-0 hero-vignette z-10 pointer-events-none" />

            {/* Cinematic Grain Effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
          </>
        )}
        {kidsMode && (
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
        )}
      </div>

      {/* Hero Content Area */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center md:items-start md:justify-center pt-20 pb-10 px-4 sm:px-12 md:px-24 h-full pointer-events-none">
        <div className="w-full max-w-5xl text-center md:text-right pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-row-reverse items-center justify-center md:justify-start gap-3 sm:gap-5 mb-4 sm:mb-8">
                {kidsMode ? (
                  <span className="bg-kids-yellow text-[#05070a] font-black px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-2xl text-[8px] sm:text-[10px] uppercase tracking-tighter shadow-xl transform -rotate-1">
                    🌟 ممتع جداً للأطفال
                  </span>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 sm:gap-3 bg-[#7fffd4]/10 backdrop-blur-3xl border border-[#7fffd4]/20 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-[8px] sm:text-[10px] uppercase font-black tracking-[0.2em] text-[#7fffd4] shadow-[0_0_30px_rgba(127,255,212,0.15)]"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#7fffd4] rounded-full animate-pulse shadow-[0_0_15px_#7fffd4]" />
                    حصرياً على MOVIDO
                  </motion.div>
                )}
                <div className={`flex flex-row-reverse items-center gap-1.5 sm:gap-2 font-outfit text-sm sm:text-base font-black ${kidsMode ? 'text-kids-pink' : 'text-[#7fffd4]'}`}>
                  <FaStar className={kidsMode ? 'animate-bounce' : 'animate-pulse text-yellow-400'} />
                  <span className="text-lg sm:text-xl italic">{movie.rating || '9.2'}</span>
                </div>
              </div>

              <h1 className={`text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 sm:mb-10 heading-premium tracking-tighter italic leading-tight ${kidsMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-kids-blue to-kids-pink drop-shadow-2xl' : 'text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]'}`}>
                {movie.title}
              </h1>

              <p className={`text-sm sm:text-lg md:text-2xl mb-8 sm:mb-14 max-w-3xl mx-auto md:mr-0 leading-relaxed line-clamp-3 italic px-2 sm:px-0 ${kidsMode ? 'text-slate-700 font-bold' : 'text-slate-200 font-black opacity-80'}`} style={{ direction: 'rtl' }}>
                {movie.description || (kidsMode ? "مغامرات شيقة وممتعة بانتظاركم! شاهدوا أجمل اللحظات وتعلموا أشياء جديدة مع أصدقائكم المفضلين." : "اختبر روعة السينما كما لم تعهدها من قبل. دقة متناهية، تجربة غامرة، ومحتوى يتخطى حدود الخيال.")}
              </p>

              <div className="flex flex-row-reverse items-center justify-center md:justify-start gap-3 sm:gap-6 mb-8 sm:mb-12">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(127, 255, 212, 0.45)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    openSmartLink();
                    navigate(`/details/${movie.id}`);
                  }}
                  className={`flex flex-row-reverse items-center px-5 py-3 sm:px-16 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-xl transition-all duration-500 overflow-hidden relative group/btn ${kidsMode
                    ? 'bg-kids-blue text-white shadow-2xl'
                    : 'bg-[#7fffd4] text-[#05070a] shadow-[0_15px_40px_rgba(127,255,212,0.3)]'
                    }`}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                  <FaPlay className="ml-2 sm:ml-4 text-sm sm:text-xl relative z-10" />
                  <span className="relative z-10">{kidsMode ? 'هيا لنشاهد!' : 'شاهد الآن'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    openSmartLink();
                    navigate(`/details/${movie.id}`);
                  }}
                  className={`flex flex-row-reverse items-center backdrop-blur-3xl px-4 py-3 sm:px-14 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-xl transition-all duration-300 border-2 ${kidsMode
                    ? 'bg-white text-kids-blue border-kids-blue shadow-lg'
                    : 'bg-white/5 text-white border-white/10 hover:border-white/20'
                    }`}
                >
                  <FaInfoCircle className="ml-2 sm:ml-4 text-sm sm:text-xl" />
                  <span>{kidsMode ? 'التفاصيل' : 'المزيد من المعلومات'}</span>
                </motion.button>
              </div>

              {/* Movie Badges */}
              {!kidsMode && (
                <div className="hidden md:flex flex-row-reverse items-center gap-8 opacity-60">
                  {[
                    { icon: <FaFilm />, text: '4K ULTRA HD' },
                    { icon: <span>CC</span>, text: 'مترجم للعربية' },
                    { icon: <FaStar />, text: 'أعلى تقييم' },
                  ].map((badge, bidx) => (
                    <div key={bidx} className="flex flex-row-reverse items-center gap-3 text-xs font-black tracking-widest text-white">
                      <span className="text-lg text-[#7fffd4]">{badge.icon}</span>
                      {badge.text}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {!kidsMode && <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-[#05070a] via-[#05070a]/40 to-transparent z-10" />}
    </div>
  );
};

export default Hero;
