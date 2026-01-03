import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaInfoCircle, FaStar } from 'react-icons/fa';

interface HeroProps {
  movie: any;
}

const Hero = ({ movie }: HeroProps) => {
  const navigate = useNavigate();

  if (!movie) return (
    <div className="h-[75vh] md:h-[92vh] bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="relative h-[75vh] md:h-[92vh] w-full text-white overflow-hidden bg-[#050505]">
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
             className="w-full h-full object-cover object-top brightness-75 contrast-[1.05]"
          />
          {/* Global Cinematic Vignette */}
          <div className="absolute inset-0 bg-gradient-to-l from-black via-black/40 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/30 z-10 pointer-events-none" />
      </div>

      {/* Content Area */}
      <div className="absolute inset-0 z-20 flex pt-32 pb-20 px-6 sm:px-10 items-end justify-center md:justify-start md:px-24">
        {/* Adjusted width for better responsiveness at 1024px+ */}
        <div className="w-full md:max-w-3xl lg:max-w-4xl text-center md:text-right">
          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
               <div className="flex flex-row-reverse items-center justify-center md:justify-start gap-4 mb-6">
                  <span className="flex items-center gap-2 bg-white/5 backdrop-blur-2xl border border-white/10 px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest text-red-500">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> الأكثر شهرة الآن
                  </span>
                  <div className="flex flex-row-reverse items-center gap-1 text-yellow-500 font-outfit text-sm font-bold">
                      <FaStar size={14} aria-hidden="true" /> {movie.rating || '8.5'}
                  </div>
               </div>
               
               {/* Reduced font sizes slightly to prevent wrapping issues on medium/large screens */}
               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 tracking-tighter leading-tight italic">
                  {movie.title}
               </h1>
               
               <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto md:mr-0 leading-relaxed opacity-90 line-clamp-3 sm:line-clamp-4">
                 {movie.description || "استمتع بتجربة سينمائية لا مثيل لها على LMINA. محتوى حصري بجودة عالية وواجهة ذكية مصممة لمحبي الأفلام الحقيقيين."}
               </p>

               <div className="flex flex-row-reverse items-center justify-center md:justify-start gap-3 sm:gap-4 mb-[50px]">
                  <button 
                    onClick={() => navigate(`/watch/${movie.id}`)}
                    aria-label={`مشاهدة ${movie.title} الآن`}
                    className="flex flex-row-reverse items-center bg-white text-black px-6 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold hover:bg-red-600 hover:text-white transition-all duration-500 transform hover:scale-105 text-sm sm:text-base"
                  >
                    <FaPlay className="ml-2 sm:ml-3" aria-hidden="true" /> شاهد الآن
                  </button>
                  <button 
                    onClick={() => navigate(`/watch/${movie.id}`)}
                    aria-label={`عرض تفاصيل ${movie.title}`}
                    className="flex flex-row-reverse items-center bg-white/5 backdrop-blur-3xl text-white border border-white/10 px-6 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold hover:bg-white/10 transition-all duration-500 text-sm sm:text-base"
                  >
                    <FaInfoCircle className="ml-2 sm:ml-3 text-red-600" aria-hidden="true" /> التفاصيل
                  </button>
               </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Hero Shade for content below */}
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#050505] to-transparent z-10" />
    </div>
  );
};

export default Hero;
