import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchByCategory, ContentItem } from '../services/api';
import MovieCard from './MovieCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface MovieRowProps {
    title: string;
    catId?: string;
    initialItems?: ContentItem[];
    kidsMode?: boolean;
}

const MovieRow = memo(({ title, catId, initialItems, kidsMode = false }: MovieRowProps) => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ContentItem[]>(initialItems || []);
    const [loading, setLoading] = useState(!initialItems);
    const [hasFetched, setHasFetched] = useState(!!initialItems);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);
    const scrollRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (hasFetched) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && catId) {
                    setHasFetched(true);
                    fetchByCategory(catId, 1)
                        .then(res => setItems(Array.isArray(res) ? res : []))
                        .catch(console.error)
                        .finally(() => setLoading(false));
                }
            },
            { rootMargin: '200px' } // Fetch slightly before coming into view
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [catId, hasFetched]);

    // Check scroll position to show/hide buttons
    const handleScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const absoluteScrollLeft = Math.abs(scrollLeft);
            
            // In RTL, scrollLeft is 0 at start (rightmost) and decreases (negative)
            setShowLeftButton(absoluteScrollLeft < scrollWidth - clientWidth - 10);
            setShowRightButton(absoluteScrollLeft > 10);
        }
    }, []);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll(); // Initial check
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll, items]);

    const scroll = useCallback((direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.85;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    }, []);

    return (
        <div ref={containerRef} className="mb-10 md:mb-20 group relative min-h-[300px]">
            {loading && (!items || items.length === 0) ? (
                <div className="space-y-6">
                    <div className="flex flex-row-reverse items-center justify-between px-4 md:px-0">
                         <div className="h-8 bg-white/5 rounded-lg w-48 animate-pulse" />
                         <div className="h-6 bg-white/5 rounded-lg w-24 animate-pulse" />
                    </div>
                    <div className="flex flex-row-reverse gap-4 md:gap-6 overflow-hidden px-4 md:px-0">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] lg:w-[250px] aspect-[2/3] bg-white/5 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                {/* Header with modern styling */}
            <div className={`flex flex-row-reverse items-center justify-between mb-5 md:mb-7 px-4 md:px-0 ${kidsMode ? 'bg-white/50 p-4 rounded-3xl border border-kids-blue/20' : ''}`}>
                <div className="flex flex-row-reverse items-center gap-3">
                    <div className={`w-1 h-8 md:h-10 rounded-full ${kidsMode ? 'bg-kids-blue' : 'bg-gradient-to-b from-ice-mint to-ice-mint-active'}`} />
                    <h2 className={`text-xl md:text-3xl font-black tracking-wide transition-colors duration-300 ${kidsMode ? 'text-deep-slate-900 group-hover:text-kids-blue' : 'text-white group-hover:text-ice-mint'}`}>
                        {title}
                    </h2>
                </div>
                {catId && (
                    <button 
                        onClick={() => navigate(`/category/${catId}`)}
                        className={`text-[10px] md:text-xs font-bold uppercase tracking-widest 
                                     transition-all duration-300 
                                     hover:scale-105 active:scale-95
                                     px-3 py-1.5 rounded-lg
                                     ${kidsMode 
                                        ? 'text-kids-blue bg-kids-blue/10 hover:bg-kids-blue hover:text-white border border-kids-blue/20' 
                                        : 'text-text-muted hover:text-ice-mint hover:bg-white/5'}`}
                    >
                        عرض الكل
                    </button>
                )}
            </div>

            <div className="relative text-right">
                {/* Enhanced Scroll Buttons with smooth transitions */}
                {/* Enhanced Scroll Buttons with smooth transitions */}
                <button 
                    onClick={() => scroll('left')}
                    aria-label="التمرير لليسار"
                    className={`absolute left-0 top-0 bottom-8 z-30 
                              px-6 py-4 rounded-r-3xl
                              transition-all duration-300 ease-out
                              hover:to-transparent
                              hidden md:flex items-center
                              backdrop-blur-sm
                              ${kidsMode 
                                ? 'bg-gradient-to-r from-kids-blue/20 to-transparent hover:from-kids-blue/40 text-kids-blue' 
                                : 'bg-gradient-to-r from-deep-slate-900/90 to-transparent hover:from-ice-mint/20 text-white'}
                              ${showLeftButton ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <FaChevronLeft className={`text-xl drop-shadow-lg transition-transform duration-300 hover:scale-125 ${kidsMode ? 'text-kids-blue' : 'text-white'}`} aria-hidden="true" />
                </button>
                <button 
                    onClick={() => scroll('right')}
                    aria-label="التمرير لليمين"
                    className={`absolute right-0 top-0 bottom-8 z-30 
                              px-6 py-4 rounded-l-3xl
                              transition-all duration-300 ease-out
                              hover:to-transparent
                              hidden md:flex items-center
                              backdrop-blur-sm
                              ${kidsMode 
                                ? 'bg-gradient-to-l from-kids-blue/20 to-transparent hover:from-kids-blue/40 text-kids-blue' 
                                : 'bg-gradient-to-l from-deep-slate-900/90 to-transparent hover:from-ice-mint/20 text-white'}
                              ${showRightButton ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <FaChevronRight className={`text-xl drop-shadow-lg transition-transform duration-300 hover:scale-125 ${kidsMode ? 'text-kids-blue' : 'text-white'}`} aria-hidden="true" />
                </button>

                {/* Scrollable container with improved spacing */}
                    <ul 
                        ref={scrollRef}
                        aria-label={`قائمة ${title}`}
                        className="flex overflow-x-auto gap-3 md:gap-5 px-4 md:px-0 
                                 scrollbar-hide scroll-smooth pb-8
                                 snap-x snap-mandatory group/row"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {(Array.isArray(items) ? items : []).map((item, index) => (
                            <li 
                                key={item.id} 
                                className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] lg:w-[250px]
                                         snap-start
                                         transition-all duration-500 ease-out
                                         group-hover/row:opacity-40 hover:!opacity-100
                                         hover:scale-105 hover:z-10"
                                style={{
                                    animationDelay: `${index * 50}ms`
                                }}
                            >
                                <MovieCard movie={item} kidsMode={kidsMode} />
                            </li>
                        ))}
                    </ul>

                {/* Gradient overlays for visual depth */}
                {!kidsMode && (
                    <>
                        <div className="absolute top-0 bottom-8 left-0 w-12 md:w-20 
                                    bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent 
                                    pointer-events-none z-20 hidden md:block" />
                        <div className="absolute top-0 bottom-8 right-0 w-12 md:w-20 
                                    bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent 
                                    pointer-events-none z-20 hidden md:block" />
                    </>
                )}
            </div>
          </>
        )}
      </div>
    );
});

MovieRow.displayName = 'MovieRow';

export default MovieRow;
