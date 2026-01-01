import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaStar } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

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

const MovieCard = ({ id, title, poster, type, year, rating, movie, isLarge = false }: MovieProps) => {
  const finalId = id || movie?.id;
  const finalTitle = title || movie?.title;
  const finalPoster = poster || movie?.poster;
  const finalType = type || movie?.type;
  const finalYear = year || movie?.year;
  const finalRating = rating || movie?.rating;

  if (!finalId) return null;

  return (
    <Link 
      to={`/watch/${encodeURIComponent(finalId)}`} 
      className="block group"
      aria-label={`مشاهدة ${finalTitle}`}
    >
      <motion.div 
        className={`relative cursor-pointer rounded-3xl overflow-hidden
                   bg-[#0c0c0c] aspect-[2/3] border border-white/5 shadow-2xl
                   ${isLarge ? 'md:h-[420px]' : ''}`}
        whileHover={{ 
          scale: 1.05, 
          zIndex: 50,
          boxShadow: "0 0 30px 10px rgba(220, 38, 38, 0.2)",
          borderColor: "rgba(220, 38, 38, 0.4)"
        }}
        transition={{ 
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1] // Custom refined ease-out
        }}
      >
        {/* Poster Image */}
        <div className="relative w-full h-full overflow-hidden bg-zinc-900">
          <LazyLoadImage
            alt={finalTitle}
            src={finalPoster || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop"}
            className="object-cover w-full h-full transition-all duration-1000 
                     group-hover:scale-110 group-hover:brightness-50"
            effect="blur"
            wrapperClassName="w-full h-full"
          />
          
          {/* Subtle Bottom Shade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />
        </div>
        
        {/* Centered Title & Play on Hover */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 z-30">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/20 mb-4 transform -translate-y-4 group-hover:translate-y-0 transition-transform">
                <FaPlay className="text-white text-xl ml-1" />
            </div>
            <h3 className="text-white text-base font-bold text-center leading-tight line-clamp-2">
                {finalTitle}
            </h3>
        </div>

        {/* Top Badges - Glass Style */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          {finalType && (
            <div className="bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-white/10 flex items-center gap-2 group-hover:opacity-0 transition-opacity">
               <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                {finalType === 'series' ? 'Series' : 'Movie'}
              </span>
            </div>
          )}
          {finalRating && (
             <div className="bg-yellow-500/20 backdrop-blur-xl px-2.5 py-1 rounded-2xl border border-yellow-500/30 flex items-center gap-1 group-hover:opacity-0 transition-opacity">
                <FaStar className="text-yellow-500 text-[10px]" />
                <span className="text-white text-[10px] font-bold font-outfit">{Number(finalRating).toFixed(1)}</span>
             </div>
          )}
        </div>

        {/* Bottom Year Label (Always visible but fades out on hover) */}
        <div className="absolute bottom-5 right-5 group-hover:opacity-0 transition-opacity z-20">
             <span className="text-xs font-black italic tracking-tighter text-white opacity-40 uppercase">{finalYear || 'LMINA'}</span>
        </div>
      </motion.div>
    </Link>
  );
};

export default MovieCard;
