import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import HistoryRow from '../components/HistoryRow';
import { fetchLatest, ContentItem } from '../services/api';
import { FaFire, FaThLarge, FaArrowUp } from 'react-icons/fa';
import SEO from '../components/SEO';

const Home = () => {
  const location = useLocation();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [kidsMode, setKidsMode] = useState(localStorage.getItem('kidsMode') === 'true');

  useEffect(() => {
    const handleKidsChange = () => {
      setKidsMode(localStorage.getItem('kidsMode') === 'true');
    };
    window.addEventListener('kidsModeChange', handleKidsChange);
    return () => window.removeEventListener('kidsModeChange', handleKidsChange);
  }, []);

  useEffect(() => {
    setLoading(true);
    // If kidsMode is active, fetch from anime-movies instead of general latest
    const fetchFunc = kidsMode ? () => import('../services/api').then(m => m.fetchByCategory('anime-movies', 1)) : () => fetchLatest(1);
    
    fetchFunc()
      .then(data => {
        const safeData = Array.isArray(data) ? data : [];
        setContent(safeData);
        if (safeData.length > 0) setHeroMovie(safeData[0]);
      })
      .catch(err => {
          console.error(err);
          setError("فشل في تحميل المحتوى. تأكد من تشغيل السيرفر.");
      })
      .finally(() => setLoading(false));
  }, [kidsMode]);

  // Auto-cycle Hero content every 40 seconds
  useEffect(() => {
    if (content.length === 0) return;
    
    const interval = setInterval(() => {
      setHeroMovie((currentMovie: any) => {
        if (!currentMovie || content.length === 0) return content[0];
        const currentIndex = content.findIndex(item => item.id === currentMovie.id);
        const nextIndex = (currentIndex + 1) % Math.min(content.length, 10);
        return content[nextIndex];
      });
    }, 40000); // 40 seconds

    return () => clearInterval(interval);
  }, [content]);

  const loadMore = async () => {
      if (loadingMore) return;
      setLoadingMore(true);
      try {
          const nextPage = page + 1;
          const newData = await fetchLatest(nextPage);
          const safeNewData = Array.isArray(newData) ? newData : [];
          if (safeNewData.length > 0) {
              setPage(nextPage);
              setContent(prev => {
                  const safePrev = Array.isArray(prev) ? prev : [];
                  const ids = new Set(safePrev.map(p => p.id));
                  const validNew = safeNewData.filter(n => n && n.id && !ids.has(n.id));
                  return [...safePrev, ...validNew];
              });
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingMore(false);
      }
  };

  const observerTarget = useRef(null);

  useEffect(() => {
      const observer = new IntersectionObserver(
          entries => {
              if (entries[0].isIntersecting && !loadingMore && !loading && content.length > 0) {
                  loadMore();
              }
          },
          { threshold: 1.0 }
      );

      if (observerTarget.current) observer.observe(observerTarget.current);
      return () => observer.disconnect();
  }, [loadingMore, loading, content]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-transparent min-h-screen pb-20 relative overflow-hidden">
      <SEO 
        title="الرئيسية | LMINA - منصة المشاهدة الأولى"
        description="شاهد أحدث الأفلام والمسلسلات العربية والأجنبية والتركية بجودة عالية مجاناً على منصة LMINA. تجربة مشاهدة فريدة بدون إعلانات."
        url="/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "LMINA",
          "url": "https://lmina.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://lmina.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      
      {/* Full layout starts here - Always visible */}
      <Hero movie={heroMovie} kidsMode={kidsMode} />
      
      <main className="relative z-20 -mt-16 sm:-mt-24 md:-mt-32">
          {/* Categorized Rows */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="px-3 sm:px-6 md:px-12 mb-10 sm:mb-16 md:mb-20 space-y-10 sm:space-y-16 md:space-y-24"
          >
              {/* Mobile Category Chips - Premium Redesign */}
              <div 
                className="flex items-center gap-3 overflow-x-auto pb-6 pt-2 px-4 no-scrollbar -mx-3 md:hidden scroll-smooth"
                dir="rtl"
              >
                  {[
                      { name: 'الكل', path: '/' },
                      { name: 'الأفلام', path: '/category/english-movies' },
                      { name: 'المسلسلات', path: '/category/english-series' },
                      { name: 'أنمي', path: '/anime' },
                      { name: 'تحميل', path: '/downloader', isNew: true },
                  ].map((cat) => {
                      const isActive = location.pathname === cat.path;
                      return (
                        <Link 
                            key={cat.name}
                            to={cat.path}
                            className={`
                                whitespace-nowrap px-6 py-3 rounded-2xl font-black text-[11px] transition-all duration-300 relative shrink-0
                                ${isActive 
                                    ? (kidsMode ? 'bg-kids-blue text-white shadow-lg' : 'bg-ice-mint text-deep-slate-900 shadow-[0_8px_20px_rgba(127,255,212,0.3)] border border-ice-mint-active')
                                    : (kidsMode ? 'bg-white text-gray-500 border border-kids-blue/20' : 'bg-deep-slate-800/60 backdrop-blur-md border border-deep-slate-border text-text-secondary')}
                            `}
                        >
                            {cat.name}
                            {cat.isNew && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ice-mint opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-400 border border-deep-slate-900"></span>
                                </span>
                            )}
                        </Link>
                      );
                  })}
              </div>

              <HistoryRow kidsMode={kidsMode} />
              
              {/* Optional Error/Loading Overlay for Rows */}
              {(error || (loading && content.length === 0)) && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  {loading ? (
                    <div className="flex items-center gap-3 text-gray-500 font-bold italic">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      تحديث المكتبة...
                    </div>
                  ) : (
                    <div className="bg-deep-slate-800 border border-red-500/20 p-4 rounded-2xl">
                      <p className="text-red-400 font-bold mb-2">{error}</p>
                      <button onClick={() => window.location.reload()} className="text-deep-slate-900 text-xs bg-ice-mint px-4 py-1 rounded-full hover:bg-white font-bold">إعادة محاولة</button>
                    </div>
                  )}
                </div>
              )}

              {kidsMode ? (
                <>
                  <MovieRow title="أفلام أنمي" catId="anime-movies" kidsMode={kidsMode} />
                  <MovieRow title="مسلسلات أنمي" catId="anime-series" kidsMode={kidsMode} />
                  <MovieRow title="أفلام مدبلجة" catId="dubbed-movies" kidsMode={kidsMode} />
                </>
              ) : (
                <>
                  <MovieRow title="مسلسلات رمضان 2025" catId="ramadan-2025" />
                  <MovieRow title="مسلسلات رمضان 2024" catId="ramadan-2024" />
                  <MovieRow title="مسلسلات رمضان 2023" catId="ramadan-2023" />
                  <MovieRow title="أفلام أجنبية" catId="english-movies" />
                  <MovieRow title="أفلام عربية" catId="arabic-movies" />
                  <MovieRow title="مسلسلات عربية" catId="arabic-series" />
                  <MovieRow title="مسلسلات تركية" catId="turkish-series" />
                  <MovieRow title="أفلام هندية" catId="indian-movies" />
                  <MovieRow title="أفلام تركية" catId="turkish-movies" />
                  <MovieRow title="مسلسلات اجنبية" catId="english-series" />
                  <MovieRow title="أفلام آسيوية" catId="asian-movies" />
                  <MovieRow title="أفلام أنمي" catId="anime-movies" />
                  <MovieRow title="أفلام مدبلجة" catId="dubbed-movies" />
                  <MovieRow title="مسلسلات هندية" catId="indian-series" />
                  <MovieRow title="مسلسلات آسياوية" catId="asian-series" />
                  <MovieRow title="مسلسلات أنمي" catId="anime-series" />
                  <MovieRow title="برامج تلفزيون" catId="tv-programs" />
                  <MovieRow title="مسرحيات" catId="plays" />
                </>
              )}
           </motion.div>

          {/* Main Grid Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="px-3 sm:px-6 md:px-12"
          >
              {/* Section Header */}
              <div className={`relative mb-10 sm:mb-12 md:mb-16 overflow-hidden rounded-3xl ${kidsMode ? 'shadow-xl' : ''}`}>
                  <div className={`absolute inset-0 blur-3xl ${kidsMode ? 'bg-gradient-to-r from-kids-yellow/20 via-kids-pink/20 to-kids-blue/20' : 'bg-gradient-to-r from-ice-mint/10 via-ice-mint/5 to-transparent'}`} />
                  <div className={`relative p-6 sm:p-10 border backdrop-blur-xl transition-all duration-500
                                ${kidsMode 
                                  ? 'bg-white/60 border-kids-blue/20 hover:border-kids-blue/50' 
                                  : 'bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-deep-slate-border hover:border-ice-mint/30'}`}>
                      <div className="flex flex-row-reverse items-center justify-between">
                          <div className="text-right">
                              <div className="flex items-center justify-end gap-4 mb-3">
                                  <h2 className={`text-2xl sm:text-4xl md:text-5xl font-black italic tracking-tighter ${kidsMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-kids-blue to-kids-pink' : 'text-white'}`}>
                                      {kidsMode ? 'استكشف عالم المرح 🎠' : 'استكشف المزيد'}
                                  </h2>
                                  <motion.div
                                    animate={{ 
                                      scale: [1, 1.2, 1],
                                      rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <FaFire className={`text-4xl sm:text-5xl drop-shadow-2xl ${kidsMode ? 'text-kids-yellow' : 'text-ice-mint'}`} />
                                  </motion.div>
                              </div>
                              <p className={`text-xs sm:text-sm font-bold tracking-wide ${kidsMode ? 'text-gray-600' : 'text-text-secondary'}`}>
                                  {kidsMode ? 'مغامرات جديدة كل يوم بانتظاركم!' : 'تصفح المكتبة الشاملة المحدثة يومياً'}
                              </p>
                          </div>
                          <div className={`hidden sm:flex items-center gap-3 px-6 py-3 
                                        rounded-2xl border shadow-xl backdrop-blur-sm transition-all duration-300 cursor-pointer
                                        ${kidsMode 
                                          ? 'bg-kids-blue/10 border-kids-blue/30 text-deep-slate-900 hover:bg-kids-blue hover:text-white' 
                                          : 'bg-deep-slate-800 border-deep-slate-border text-white hover:bg-ice-mint/20 hover:border-ice-mint/50'}`}>
                              <span className="text-sm font-black italic">عرض الكل</span>
                              <FaThLarge className={`${kidsMode ? '' : 'text-ice-mint'}`} />
                          </div>
                      </div>
                  </div>
              </div>

              {/* Content Grid */}
              <motion.ul 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 
                         gap-3 sm:gap-6 gap-y-8 sm:gap-y-12"
              >
                  {content
                    .filter(item => {
                      if (!kidsMode) return true;
                      const title = item.title.toLowerCase();
                      return ['كرتون', 'انمي', 'مدبلج', 'اطفال', 'anime', 'cartoon', 'kids', 'مغامرات'].some(k => title.includes(k));
                    })
                    .map((item, index) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <MovieCard movie={item} kidsMode={kidsMode} />
                      </motion.li>
                  ))}
              </motion.ul>

              {/* Load More Indicator */}
              <div ref={observerTarget} className="h-40 sm:h-60 flex flex-col items-center justify-center mt-16 sm:mt-24">
                  <AnimatePresence>
                      {loadingMore && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center gap-6"
                          >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className={`w-16 h-16 border-4 border-t-transparent rounded-full shadow-2xl ${kidsMode ? 'border-kids-blue shadow-kids-blue/50' : 'border-ice-mint shadow-ice-mint/50'}`}
                              />
                              <p className={`font-black italic text-sm uppercase tracking-widest ${kidsMode ? 'text-kids-pink' : 'text-text-muted'}`}>
                                  {kidsMode ? 'جاري تحميل المزيد من المرح... 🎈' : 'نحضر لك المزيد...'}
                              </p>
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
          </motion.div>
      </main>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 left-8 z-50 bg-gradient-to-br from-ice-mint to-ice-mint-hover 
                     text-deep-slate-900 p-4 rounded-full shadow-2xl shadow-ice-mint/50
                     border-2 border-white/20 backdrop-blur-sm
                     hover:shadow-ice-mint/70 transition-all duration-300"
          >
            <FaArrowUp className="text-xl" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;
