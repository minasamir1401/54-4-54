import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaInfoCircle, FaStar } from 'react-icons/fa';

interface HeroProps {
  movie: any;
}

const Hero = ({ movie }: HeroProps) => {
  const navigate = useNavigate();

  if (!movie) return (
    <div className="h-[60vh] md:h-[80vh] bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
          <motion.img 
             key={movie.poster}
             initial={{ scale: 1.2, opacity: 0 }}
             animate={{ scale: 1.05, opacity: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             src={movie.poster} 
             alt={movie.title} 
             className="w-full h-full object-cover object-center brightness-[0.85] contrast-[1.1]"
             onError={(e) => {
               const target = e.target as HTMLImageElement;
               target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop";
             }}
          />
          {/* Enhanced Gradients for better readability in RTL - Fixed formatting issues */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none" />
      </div>

      <div className="absolute bottom-[20%] md:bottom-[25%] right-4 sm:right-8 md:right-16 lg:right-24 z-20 max-w-2xl text-right">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
             <div className="flex flex-row-reverse items-center space-x-reverse space-x-3 mb-6 md:mb-8">
                <span className="bg-red-600 text-[10px] md:text-xs font-black italic px-3 md:px-4 py-1.5 rounded-md uppercase tracking-widest shadow-lg shadow-red-600/20">عرض حصري</span>
                <div className="hidden sm:flex items-center space-x-reverse space-x-1.5 text-yellow-500 text-sm">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar className="text-gray-600" />
                </div>
             </div>
             
             <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black mb-3 md:mb-6 drop-shadow-2xl italic tracking-tighter leading-[1.1] text-white">
                {movie.title}
             </h1>
             
             <p className="text-[10px] md:text-sm lg:text-base mb-5 md:mb-8 text-gray-300 line-clamp-2 md:line-clamp-3 drop-shadow-xl font-medium leading-relaxed dir-rtl max-w-lg opacity-80">
               {movie.description || "استمتع بأفضل تجربة مشاهدة على منصة LMINA - محتوى حصري بجودة عالية ومتاح الآن للمشاهدة المباشرة."}
             </p>

             <div className="flex flex-row-reverse items-center gap-4 md:gap-8">
                <button 
                  onClick={() => navigate(`/watch/${movie.id}`)}
                  className="group flex flex-row-reverse items-center bg-white text-black px-8 md:px-14 py-4 md:py-5 rounded-xl md:rounded-2xl font-black italic hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl shadow-white/5 text-sm md:text-lg"
                >
                  <FaPlay className="ml-3 md:ml-4 group-hover:animate-pulse" /> شاهد الآن
                </button>
                <button 
                  onClick={() => navigate(`/watch/${movie.id}`)}
                  className="flex flex-row-reverse items-center bg-white/5 backdrop-blur-xl text-white border border-white/20 px-8 md:px-14 py-4 md:py-5 rounded-xl md:rounded-2xl font-black italic hover:bg-white/10 transition-all duration-300 text-sm md:text-lg"
                >
                  <FaInfoCircle className="ml-3 md:ml-4 text-red-600" /> التفاصيل
                </button>
             </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hero Shade for content below */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
    </div>
  );
};

export default Hero;
