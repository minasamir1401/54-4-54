import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchByCategory, ContentItem } from '../services/api';
import MovieCard from './MovieCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
            { rootMargin: '400px' }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [catId, hasFetched]);

    const handleScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const absoluteScrollLeft = Math.abs(scrollLeft);
            setShowLeftButton(absoluteScrollLeft < scrollWidth - clientWidth - 20);
            setShowRightButton(absoluteScrollLeft > 20);
        }
    }, []);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll, items]);

    const scroll = useCallback((direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    }, []);

    return (
        <div ref={containerRef} className="mb-12 md:mb-24 group relative">
            {/* Header */}
            <div className="flex flex-row-reverse items-center justify-between mb-8 px-4 md:px-0">
                <div className="flex flex-row-reverse items-center gap-4">
                    <div className={`w-1.5 h-10 rounded-full ${kidsMode ? 'bg-kids-blue shadow-[0_0_15px_rgba(79,195,247,0.5)]' : 'bg-[#7fffd4] shadow-[0_0_15px_rgba(127,255,212,0.5)]'}`} />
                    <h2 className={`text-xl sm:text-2xl md:text-4xl font-black heading-premium tracking-tighter ${kidsMode ? 'text-slate-900' : 'text-white'}`}>
                        {title}
                    </h2>
                </div>
                {catId && (
                    <button
                        onClick={() => navigate(`/category/${catId}`)}
                        className={`text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all duration-300
                                   ${kidsMode
                                ? 'bg-kids-blue/10 text-kids-blue hover:bg-kids-blue hover:text-white'
                                : 'bg-white/5 text-[#7fffd4] hover:bg-[#7fffd4] hover:text-[#05070a] border border-white/5'}`}
                    >
                        عرض الكل
                    </button>
                )}
            </div>

            <div className="relative overflow-visible">
                {/* Scroll Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className={`absolute left-0 top-0 bottom-10 z-30 px-6 hidden md:flex items-center transition-all duration-500
                               bg-gradient-to-r from-[#05070a]/90 to-transparent backdrop-blur-[2px]
                               ${showLeftButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <FaChevronLeft className={`text-2xl ${kidsMode ? 'text-kids-blue' : 'text-[#7fffd4]'}`} />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className={`absolute right-0 top-0 bottom-10 z-30 px-6 hidden md:flex items-center transition-all duration-500
                               bg-gradient-to-l from-[#05070a]/90 to-transparent backdrop-blur-[2px]
                               ${showRightButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <FaChevronRight className={`text-2xl ${kidsMode ? 'text-kids-blue' : 'text-[#7fffd4]'}`} />
                </button>

                {/* Content */}
                <ul
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-2.5 sm:gap-4 md:gap-6 px-4 md:px-0 no-scrollbar scroll-smooth pb-10 snap-x snap-mandatory"
                >
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <li key={i} className="flex-shrink-0 w-[120px] sm:w-[160px] md:w-[260px] aspect-[2/3] bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : (
                        items.map((item, index) => (
                            <motion.li
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="flex-shrink-0 w-[120px] sm:w-[160px] md:w-[260px] snap-start"
                            >
                                <MovieCard movie={item} kidsMode={kidsMode} />
                            </motion.li>
                        ))
                    )}
                </ul>

                {/* Depth Overlays */}
                {!kidsMode && (
                    <>
                        <div className="absolute top-0 bottom-10 left-0 w-24 bg-gradient-to-r from-[#05070a] to-transparent pointer-events-none z-20 hidden md:block" />
                        <div className="absolute top-0 bottom-10 right-0 w-24 bg-gradient-to-l from-[#05070a] to-transparent pointer-events-none z-20 hidden md:block" />
                    </>
                )}
            </div>
        </div>
    );
});

MovieRow.displayName = 'MovieRow';
export default MovieRow;
