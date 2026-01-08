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
  kidsMode?: boolean;
}

const MovieCard = ({ id, title, poster, type, year, rating, movie, isLarge = false, kidsMode = false }: MovieProps) => {
  const finalId = id || movie?.id;
  const finalTitle = title || movie?.title;
  const finalPoster = poster || movie?.poster;
  const finalType = type || movie?.type;
  const finalYear = year || movie?.year;
  const finalRating = rating || movie?.rating;

  if (!finalId) return null;

  return (
    <Link 
      to={finalType === 'course' ? `/course/${encodeURIComponent(finalId)}` : `/watch/${encodeURIComponent(finalId)}`} 
      className="block group relative"
      aria-label={`شاهد ${finalTitle} (${finalType}) - ${finalYear}`}
      title={`مشاهدة ${finalTitle}`}
    >
      <motion.article 
        className={`relative cursor-pointer ${kidsMode ? 'rounded-[2.5rem]' : 'rounded-3xl'} overflow-hidden
                   ${kidsMode 
                      ? 'bg-white aspect-[2/3] border-4 border-transparent hover:border-kids-blue shadow-lg' 
                      : 'bg-deep-slate-800 aspect-[2/3] border border-deep-slate-border shadow-2xl'}
                   ${isLarge ? 'md:h-[420px]' : ''}`}
        whileHover={{ 
          scale: 1.05, 
          zIndex: 50,
          boxShadow: kidsMode ? "0 20px 40px rgba(79, 195, 247, 0.4)" : "0 0 30px 10px rgba(127, 255, 212, 0.2)",
          borderColor: kidsMode ? "#4FC3F7" : "rgba(127, 255, 212, 0.4)"
        }}
        transition={{ 
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        {/* Poster Image with SEO & Speed Optimization */}
        <div className="relative w-full h-full overflow-hidden bg-zinc-900">
          <LazyLoadImage
            alt={`بوستر ${finalType === 'series' ? 'مسلسل' : 'فيلم'} ${finalTitle}`}
            src={finalPoster || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop"}
            className="object-cover w-full h-full transition-all duration-1000 
                     group-hover:scale-110 group-hover:brightness-50"
            effect="blur"
            wrapperClassName="w-full h-full"
            placeholder={<div className="w-full h-full bg-deep-slate-800" />}
            threshold={300}
          />
          
          {/* Subtle Bottom Shade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />
        </div>
        
        {/* Content Info (Hidden for SEO, Visible for Screen Readers) */}
        <div className="sr-only">
            <h2>{finalTitle}</h2>
            <p>{finalType} - {finalYear}</p>
            <span>التقييم: {finalRating}</span>
        </div>

        {/* Centered Title & Play on Hover */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 z-30">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 ${kidsMode ? 'bg-kids-yellow text-deep-slate-900 shadow-[0_10px_20px_rgba(255,241,118,0.5)]' : 'bg-white/10 backdrop-blur-2xl border border-white/20'} rounded-full flex items-center justify-center mb-2 sm:mb-4 transform -translate-y-4 group-hover:translate-y-0 transition-transform`}>
                <FaPlay className={`${kidsMode ? 'text-xl sm:text-2xl text-deep-slate-900 ml-1.5 sm:ml-2' : 'text-white text-lg sm:text-xl ml-1'}`} />
            </div>
            <h3 className={`${kidsMode ? 'text-deep-slate-900 text-sm sm:text-lg font-black drop-shadow-sm' : 'text-white text-xs sm:text-base font-bold'} text-center leading-tight line-clamp-2`}>
                {finalTitle}
            </h3>
        </div>

        {/* Top Badges - Glass Style */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col gap-1 sm:gap-2 z-20">
          {finalType && (
            <div className={`${kidsMode ? 'bg-kids-pink text-white border-white' : 'bg-black/40 backdrop-blur-xl border-white/10 text-gray-300'} px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border flex items-center gap-1 sm:gap-2 group-hover:opacity-0 transition-opacity whitespace-nowrap`}>
               <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
                {kidsMode ? 'للأطفال 🎈' : (finalType === 'series' ? 'Series' : finalType === 'course' ? 'Course' : 'Movie')}
              </span>
            </div>
          )}
          {kidsMode && (
             <div className="bg-kids-green text-deep-slate-900 px-2 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl border border-kids-yellow flex items-center gap-1 group-hover:opacity-0 transition-opacity justify-center shadow-md">
                <span className="text-[8px] sm:text-[10px] font-black">آمن ✅</span>
             </div>
          )}
          {finalRating && (
             <div className="bg-deep-slate-900/40 backdrop-blur-xl px-2 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl border border-ice-mint/30 flex items-center gap-1 group-hover:opacity-0 transition-opacity">
                <FaStar className="text-rating text-[8px] sm:text-[10px]" />
                <span className="text-white text-[8px] sm:text-[10px] font-bold font-outfit">{Number(finalRating).toFixed(1)}</span>
             </div>
          )}
        </div>

        {/* Bottom Year Label (Always visible but fades out on hover) */}
        <div className="absolute bottom-3 sm:bottom-5 right-3 sm:bottom-5 group-hover:opacity-0 transition-opacity z-20">
             <span className={`text-[9px] sm:text-xs font-black italic tracking-tighter ${kidsMode ? 'text-white drop-shadow-md opacity-90' : 'text-white opacity-40'} uppercase`}>{finalYear || 'LMINA'}</span>
        </div>
      </motion.article>
    </Link>
  );
};

export default MovieCard;
