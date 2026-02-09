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

const MovieCard = ({ id, title, poster, type, year, rating, movie, kidsMode = false }: MovieProps) => {
  const finalId = id || movie?.id;
  const finalTitle = title || movie?.title;
  const finalPoster = poster || movie?.poster;
  const finalType = type || movie?.type;
  const finalYear = year || movie?.year;
  const finalRating = rating || movie?.rating;

  if (!finalId) return null;

  return (
    <Link
      to={finalType === 'course' ? `/course/${encodeURIComponent(finalId)}` : `/details/${encodeURIComponent(finalId)}`}
      onClick={() => {
        window.open('https://offevasionrecruit.com/zic21a2k4s?key=b01e21cf613c7a05ddb4e54f14865584', '_blank');
      }}
      className="block group relative"
      aria-label={`شاهد ${finalTitle}`}
    >
      <motion.article
        className={`relative cursor-pointer ${kidsMode ? 'rounded-[2rem]' : 'rounded-2xl'} overflow-hidden aspect-[2/3] glass-card movie-card-hover
                   ${kidsMode ? 'bg-white border-2 border-transparent' : 'bg-[#151921] border border-white/5 shadow-2xl'}`}
        whileHover={{
          scale: 1.05,
          zIndex: 50,
        }}
      >
        {/* Poster Image */}
        <div className="relative w-full h-full overflow-hidden">
          <LazyLoadImage
            alt={finalTitle}
            src={finalPoster || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop"}
            className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:brightness-50"
            effect="blur"
            wrapperClassName="w-full h-full"
            placeholder={<div className="w-full h-full bg-[#1e293b] animate-pulse" />}
          />

          {/* Shine Effect Wrap */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>

          {/* Bottom Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
        </div>

        {/* Hover Overlay Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 z-30">
          <motion.div
            initial={{ y: 20 }}
            whileHover={{ y: 0 }}
            className={`w-14 h-14 ${kidsMode ? 'bg-kids-yellow' : 'bg-[#7fffd4]'} rounded-full flex items-center justify-center mb-4 shadow-2xl`}
          >
            <FaPlay className={`text-xl ${kidsMode || 'text-[#05070a]'} ml-1`} />
          </motion.div>
          <h3 className={`text-center font-black text-sm sm:text-base px-2 leading-tight line-clamp-2 ${kidsMode ? 'text-slate-900' : 'text-white'}`}>
            {finalTitle}
          </h3>
        </div>

        {/* Top Floating Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          {finalType && (
            <div className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest backdrop-blur-3xl group-hover:opacity-0 transition-opacity
                           ${kidsMode ? 'bg-kids-pink text-white border-white' : 'bg-black/40 text-slate-300 border-white/10'}`}>
              {kidsMode ? 'للأطفال 🎈' : (finalType === 'series' ? 'Series' : 'Movie')}
            </div>
          )}
          {finalRating && (
            <div className="bg-[#05070a]/60 backdrop-blur-3xl px-2 py-1 rounded-lg border border-[#7fffd4]/30 flex items-center gap-1.5 group-hover:opacity-0 transition-opacity">
              <FaStar className="text-yellow-400 text-[9px]" />
              <span className="text-white text-[9px] font-black italic">{Number(finalRating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Info Label (Visible on Idle) */}
        {!kidsMode && (
          <div className="absolute bottom-3 right-3 left-3 z-10 group-hover:opacity-0 transition-opacity">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black italic text-[#7fffd4] opacity-80">{finalYear || 'MOVIDO'}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[70%]">{finalTitle}</span>
            </div>
            <p className="text-[9px] text-slate-400 line-clamp-2 mt-2 leading-relaxed font-medium">
              شاهد هذا العمل وبجودة فائقة وحصرياً على MOVIDO.
            </p>
          </div>
        )}
      </motion.article>
    </Link>
  );
};

export default MovieCard;
