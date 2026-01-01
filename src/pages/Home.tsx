import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import HistoryRow from '../components/HistoryRow';
import { fetchLatest, ContentItem } from '../services/api';
import { FaFire, FaThLarge, FaBolt, FaArrowUp } from 'react-icons/fa';
import SEO from '../components/SEO';

const Home = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchLatest(1)
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
  }, []);

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
      {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen flex flex-col items-center justify-center text-white relative z-10"
          >
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity }
                }}
                className="w-24 h-24 border-4 border-red-600 border-t-transparent rounded-full mb-8 shadow-2xl shadow-red-600/50"
              />
              <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm font-black uppercase tracking-[0.4em] text-gray-400"
              >
                جاري التحميل...
              </motion.p>
              <motion.div
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-1 bg-gradient-to-r from-red-600 to-red-800 mt-6 rounded-full"
                style={{ width: "200px" }}
              />
          </motion.div>
      ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-screen flex flex-col items-center justify-center text-red-500 p-8 text-center"
          >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-full 
                         flex items-center justify-center mb-8 border-2 border-red-600/30 shadow-2xl"
              >
                 <FaBolt className="text-6xl text-red-600" />
              </motion.div>
              <h2 className="text-5xl font-black mb-4 tracking-tighter italic bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                خطأ في الاتصال
              </h2>
              <p className="text-gray-400 font-bold mb-10 max-w-md text-lg">{error}</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-red-600 to-red-700 text-white font-black italic 
                         px-12 py-5 rounded-2xl hover:shadow-2xl hover:shadow-red-600/50 
                         transition-all transform border border-red-500/30"
              >
                أعد المحاولة الآن
              </motion.button>
          </motion.div>
      ) : content.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen flex flex-col items-center justify-center text-white"
          >
              <h2 className="text-3xl font-bold mb-4">لا يوجد محتوى حالياً</h2>
              <p className="text-gray-400">نواجه مشكلة في العثور على أحدث الأفلام. يرجى المحاولة لاحقاً.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 bg-red-600 px-8 py-3 rounded-xl font-bold"
              >
                تحديث الصفحة
              </button>
          </motion.div>
      ) : (
          <>
            <Hero movie={heroMovie} />
            
            <main className="relative z-20 -mt-16 sm:-mt-24 md:-mt-32">
                {/* Categorized Rows */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="px-4 sm:px-6 md:px-12 mb-12 sm:mb-16 md:mb-20 space-y-12 sm:space-y-16 md:space-y-24"
                >
                    <HistoryRow />
                    <MovieRow title="مسلسلات رمضان 2025" catId="ramadan-2025" />
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
                 </motion.div>

                {/* Main Grid Feed */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="px-4 sm:px-6 md:px-12"
                >
                    {/* Section Header */}
                    <div className="relative mb-10 sm:mb-12 md:mb-16 overflow-hidden rounded-3xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-500/5 to-transparent blur-3xl" />
                        <div className="relative bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-8 sm:p-10 
                                      border border-white/10 backdrop-blur-xl
                                      hover:border-red-600/30 transition-all duration-500">
                            <div className="flex flex-row-reverse items-center justify-between">
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-4 mb-3">
                                        <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter">
                                            استكشف المزيد
                                        </h2>
                                        <motion.div
                                          animate={{ 
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 10, -10, 0]
                                          }}
                                          transition={{ duration: 2, repeat: Infinity }}
                                        >
                                          <FaFire className="text-4xl sm:text-5xl text-red-600 drop-shadow-2xl" />
                                        </motion.div>
                                    </div>
                                    <p className="text-gray-400 text-xs sm:text-sm font-bold tracking-wide">
                                        تصفح المكتبة الشاملة المحدثة يومياً
                                    </p>
                                </div>
                                <div className="hidden sm:flex items-center gap-3 bg-black/60 px-6 py-3 
                                              rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm
                                              hover:bg-red-600/20 hover:border-red-600/50 transition-all duration-300 cursor-pointer">
                                    <span className="text-sm text-white font-black italic">عرض الكل</span>
                                    <FaThLarge className="text-red-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 
                               gap-4 sm:gap-6 gap-y-10 sm:gap-y-12"
                    >
                        {content.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                              <MovieCard movie={item} />
                            </motion.div>
                        ))}
                    </motion.div>

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
                                      className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full shadow-2xl shadow-red-600/50"
                                    />
                                    <p className="text-gray-400 font-black italic text-sm uppercase tracking-widest">
                                        نحضر لك المزيد...
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </main>
          </>
      )}

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
            className="fixed bottom-8 left-8 z-50 bg-gradient-to-br from-red-600 to-red-700 
                     text-white p-4 rounded-full shadow-2xl shadow-red-600/50
                     border-2 border-white/20 backdrop-blur-sm
                     hover:shadow-red-600/70 transition-all duration-300"
          >
            <FaArrowUp className="text-xl" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Decorative Background Glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-red-600/5 blur-[200px] pointer-events-none -z-10 rounded-full animate-pulse" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-red-600/5 blur-[200px] pointer-events-none -z-10 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/3 blur-[250px] pointer-events-none -z-10 rounded-full" />
    </div>
  );
};

export default Home;

