import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaStar, FaFilm, FaTv } from 'react-icons/fa';

interface MovieProps {
  id?: string;
  title?: string;
  poster?: string;
  duration?: string;
  type?: string;
  year?: string;
  rating?: number;
  movie?: {
    id: string;
    title: string;
    poster: string;
    duration?: string;
    type?: string;
    year?: string;
    rating?: number;
  };
  isLarge?: boolean;
}

const MovieCard = ({ id, title, poster, duration, type, year, rating, movie, isLarge = false }: MovieProps) => {
  const finalId = id || movie?.id;
  const finalTitle = title || movie?.title;
  const finalPoster = poster || movie?.poster;
  const finalDuration = duration || movie?.duration;
  const finalType = type || movie?.type;
  const finalYear = year || movie?.year;
  const finalRating = rating || movie?.rating;

  if (!finalId) return null;

  return (
    <Link to={`/watch/${encodeURIComponent(finalId)}`} className="block group">
      <motion.div 
        className={`relative cursor-pointer transition-all duration-500 ease-out rounded-2xl overflow-hidden
                   shadow-[0_8px_30px_rgb(0,0,0,0.6)] hover:shadow-[0_20px_60px_rgb(220,38,38,0.4)]
                   bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] aspect-[2/3] 
                   border border-white/5 hover:border-red-600/50
                   ${isLarge ? 'md:h-[400px]' : ''}`}
        whileHover={{ y: -12, scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Poster Image */}
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={finalPoster || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop"}
            alt={finalTitle}
            className="object-cover w-full h-full transition-transform duration-700 
                     group-hover:scale-115 opacity-90 group-hover:opacity-100"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop";
            }}
          />
          
          {/* Premium Gradient Overlay - ensuring no interaction blocking */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent 
                        z-10 pointer-events-none transition-opacity duration-300" />
        </div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center 
                      opacity-0 group-hover:opacity-100 transition-all duration-300 
                      scale-150 group-hover:scale-100 z-30">
           <div className="bg-gradient-to-br from-red-600 to-red-700 p-5 rounded-full 
                         shadow-2xl shadow-red-600/60 backdrop-blur-sm
                         transform group-hover:rotate-0 rotate-12 transition-transform duration-300
                         border-2 border-white/20">
              <FaPlay className="text-white text-2xl ml-1 drop-shadow-lg" />
           </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
          {/* Type Badge */}
          {finalType && (
            <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg 
                          border border-white/10 flex items-center gap-1.5">
              {finalType === 'series' ? (
                <FaTv className="text-red-500 text-xs" />
              ) : (
                <FaFilm className="text-red-500 text-xs" />
              )}
              <span className="text-white text-[9px] font-black uppercase tracking-wider">
                {finalType === 'series' ? 'مسلسل' : 'فيلم'}
              </span>
            </div>
          )}
          
          {/* Quality Badge */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-2.5 py-1 rounded-lg
                        shadow-lg shadow-red-600/40 border border-red-400/30">
            <span className="text-white text-[9px] font-black uppercase tracking-wider">
              HD
            </span>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20
                      transform translate-y-1 group-hover:translate-y-0 transition-all duration-300 pb-6">
          {/* Rating */}
          {finalRating && typeof Number(finalRating) === 'number' && !isNaN(Number(finalRating)) && (
            <div className="flex items-center gap-1.5 mb-2 opacity-0 group-hover:opacity-100 
                          transition-all duration-300 delay-100 translate-y-2 group-hover:translate-y-0">
              <FaStar className="text-yellow-500 text-[10px] drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              <span className="text-white text-xs font-black tracking-tighter">
                {Number(finalRating).toFixed(1)}
              </span>
            </div>
          )}
          
          {/* Title */}
          <h3 className="text-white text-[13px] md:text-[15px] font-black text-right leading-[1.3] 
                       line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2
                       group-hover:text-red-500 transition-colors duration-300">
            {finalTitle}
          </h3>
          
          {/* Year & Duration */}
          <div className="flex items-center justify-end gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest
                        opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">
            {finalDuration && <span className="bg-white/10 px-1.5 py-0.5 rounded-md">{finalDuration}</span>}
            {finalYear && finalDuration && <span className="text-red-600 font-bold">•</span>}
            {finalYear && <span>{finalYear}</span>}
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      bg-gradient-to-tr from-transparent via-white/5 to-transparent
                      transform -translate-x-full group-hover:translate-x-full
                      transition-transform duration-1000 pointer-events-none" />
      </motion.div>
    </Link>
  );
};

export default MovieCard;

