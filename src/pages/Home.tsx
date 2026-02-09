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
import AdBanner from '../components/AdBanner';

const Home = () => {
  const location = useLocation();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
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
    const fetchFunc = kidsMode ? () => import('../services/api').then(m => m.fetchByCategory('anime-movies', 1)) : () => fetchLatest(1);

    fetchFunc()
      .then(data => {
        const safeData = Array.isArray(data) ? data : [];
        setContent(safeData);
        if (safeData.length > 0) setHeroMovie(safeData[0]);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [kidsMode]);

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
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadingMore, loading, content]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen pb-20 relative overflow-hidden ${kidsMode ? 'bg-[#f0fdf9]' : 'bg-[#05070a]'}`}>
      <SEO
        title="MOVIDO - موفيدو | مشاهدة وتحميل الأفلام والمسلسلات والأنمي 4K"
        description="موفيدو هي وجهتك الأولى لمشاهدة أحدث الأفلام والمسلسلات العربية والأجنبية، الأنمي، والكورسات التعليمية بجودة 4K وبدون إعلانات مزعجة."
        url="/"
        keywords="موفيدو, MOVIDO, مشاهدة افلام, مسلسلات رمضان 2025, انمي مترجم, كورسات مجانية, تحميل افلام"
      />

      {/* Global Texture Overlay */}
      {!kidsMode && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-screen">
          <img src="/movido_hero.png" className="w-full h-full object-cover" alt="" />
        </div>
      )}

      <Hero movie={heroMovie} kidsMode={kidsMode} />

      <main className="relative z-20 -mt-24 md:-mt-40">
        <div className="px-6 md:px-12 space-y-24">
          {/* Top Ad Banner */}
          <div className="flex justify-center md:hidden">
            <AdBanner />
          </div>

          {/* Modern Category Navigation (Mobile/Tablet) */}
          <div className="flex justify-center w-full lg:hidden relative z-30 mb-8">
            <div
              className="bg-[#0f1115]/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center gap-1 overflow-x-auto max-w-[calc(100vw-32px)] no-scrollbar shadow-2xl shadow-black/50"
              dir="rtl"
            >
              {[
                { name: 'الرئيسية', icon: '🏠', path: '/' },
                { name: 'أفلام', icon: '🎬', path: '/category/english-movies' },
                { name: 'مسلسلات', icon: '📺', path: '/category/english-series' },
                { name: 'أنمي', icon: '✨', path: '/anime' },
                { name: 'أداة التحميل', icon: '⬇️', path: '/downloader', isNew: true },
              ].map((cat) => {
                const isActive = location.pathname === cat.path;
                return (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    className={`
                      relative px-5 py-2.5 rounded-full text-[11px] font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0
                      ${isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    <span>{cat.name}</span>
                    <span className="text-sm opacity-80">{cat.icon}</span>

                    {/* Notification Dot for New Items */}
                    {cat.isNew && !isActive && (
                      <span className="absolute top-2 left-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <HistoryRow kidsMode={kidsMode} />

          {/* Mid Ad Banner */}
          <AdBanner />

          <div className="space-y-24 pb-20">
            {kidsMode ? (
              <>
                <MovieRow title="أفلام أنمي" catId="anime-movies" kidsMode={kidsMode} />
                <MovieRow title="مسلسلات أنمي" catId="anime-series" kidsMode={kidsMode} />
                <MovieRow title="أفلام مدبلجة" catId="dubbed-movies" kidsMode={kidsMode} />
              </>
            ) : (
              <>
                <MovieRow title="مسلسلات رمضان 2025" catId="ramadan-2025" />
                <MovieRow title="أفلام أجنبية" catId="english-movies" />
                <MovieRow title="مسلسلات عربية" catId="arabic-series" />
                <MovieRow title="مسلسلات تركية" catId="turkish-series" />
                <MovieRow title="أفلام عربية" catId="arabic-movies" />
              </>
            )}
          </div>

          {/* Discovery Section Header */}
          <div className="relative mb-20 overflow-hidden rounded-[4rem] group">
            <div className={`absolute inset-0 blur-[120px] transition-all duration-1000 group-hover:scale-125 ${kidsMode ? 'bg-gradient-to-r from-kids-yellow/30 to-kids-pink/30' : 'bg-gradient-to-r from-accent-primary/5 via-accent-blue/5 to-transparent'}`} />
            <div className={`relative p-12 md:p-20 glass-panel border-white/5`}>
              <div className="flex flex-col-reverse md:flex-row-reverse items-center justify-between gap-12">
                <div className="text-center md:text-right">
                  <div className="flex flex-col md:flex-row-reverse items-center gap-6 mb-8">
                    <h2 className={`text-3xl md:text-5xl font-black heading-premium italic leading-tight ${kidsMode ? 'text-slate-800' : 'text-white'}`}>
                      {kidsMode ? 'مملكة المرح بانتظارك 🎭' : 'اكتشف المزيد من MOVIDO'}
                    </h2>
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <FaFire className={`text-6xl ${kidsMode ? 'text-kids-pink' : 'text-accent-primary shadow-2xl'}`} />
                    </motion.div>
                  </div>
                  <p className={`text-lg md:text-2xl font-medium opacity-70 ${kidsMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    {kidsMode ? 'شاهد أجمل القصص والمغامرات الشيقة.' : 'أكبر مكتبة أفلام محدثة على مدار الساعة بأعلى دقة ممكنة.'}
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`px-10 py-6 rounded-3xl font-black text-xl flex items-center gap-4 cursor-pointer shadow-2xl transition-all
                                       ${kidsMode ? 'bg-kids-pink text-white' : 'bg-[#7fffd4] text-[#05070a]'}`}
                >
                  <span>تصفح الكل</span>
                  <FaThLarge />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Grid Ad Banner */}
          <AdBanner />

          {/* Global Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            {content.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (index % 6) * 0.1 }}
              >
                <MovieCard movie={item} kidsMode={kidsMode} />
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div ref={observerTarget} className="h-60 flex flex-col items-center justify-center">
            <AnimatePresence>
              {loadingMore && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${kidsMode ? 'border-kids-blue' : 'border-[#7fffd4]'}`} />
                  <span className={`font-black italic tracking-widest uppercase ${kidsMode ? 'text-slate-600' : 'text-slate-500'}`}>جاري التحميل...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className={`fixed bottom-10 left-10 z-50 p-5 rounded-full shadow-2xl border-2 border-white/10 backdrop-blur-xl transition-all
                       ${kidsMode ? 'bg-kids-pink text-white' : 'bg-[#7fffd4] text-[#05070a]'}`}
          >
            <FaArrowUp className="text-2xl" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
