import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearch } from "../context/SearchContext";
import { fetchAnimeHome, searchAnime, fetchAnimeList, ContentItem } from "../services/api";
import MovieRow from "../components/MovieRow";
import MovieCard from "../components/MovieCard";
import Hero from "../components/Hero";
import { motion, AnimatePresence } from "framer-motion";
import { FaFire, FaThLarge, FaSearch } from "react-icons/fa";
import SEO from "../components/SEO";

const Anime: React.FC = () => {
  const [sections, setSections] = useState<Record<string, ContentItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<ContentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Infinite Scroll State
  const [allAnime, setAllAnime] = useState<ContentItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { registerOnSearch } = useSearch();

  useEffect(() => {
    registerOnSearch(setSearchQuery);
    return () => registerOnSearch(null);
  }, [registerOnSearch]);

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAnimeHome();
        setSections(data);
        
        // Pick a featured anime from the first section
        const sectionValues = Object.values(data);
        if (sectionValues.length > 0 && sectionValues[0].length > 0) {
          setFeatured(sectionValues[0][0]);
        }
      } catch (error) {
        console.error("Failed to load anime data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // Initial fetch for "Explore More"
    loadMore(1);
  }, []);

  const loadMore = async (pageNum: number) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const items = await fetchAnimeList(pageNum);
      if (items.length === 0) {
        setHasMore(false);
      } else {
        setAllAnime(prev => {
            const newItems = items.filter(item => !prev.some(p => p.id === item.id));
            return [...prev, ...newItems];
        });
        setPage(pageNum + 1);
      }
    } catch (error) {
      console.error("Failed to load more anime:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore(page);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, page]);

  // Search functionality with debouncing
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchAnime(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-ice-mint"></div>
            <p className="text-ice-mint font-black animate-pulse uppercase tracking-widest">LMINA ANIME</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-slate-900 text-white overflow-x-hidden selection:bg-ice-mint/30">
      <SEO 
        title="عالم الأنمي | LMINA Anime"
        description="استمتع بمشاهدة أحدث حلقات الأنمي المترجمة والمدبلجة بجودة عالية. مكتبة شاملة تضم أشهر سلاسل الأنمي والأفلام اليابانية على LMINA."
        url="/anime"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "LMINA Anime - عالم الأنمي",
          "description": "أكبر مكتبة أنمي مترجم في الشرق الأوسط",
          "publisher": {
            "@type": "Organization",
            "name": "LMINA"
          }
        }}
      />
      
      <main className="relative z-10">
        {/* Dynamic Cinematic Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-ice-mint/5 blur-[160px] rounded-full animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-ice-mint/5 blur-[160px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(6,11,25,0.8)_80%)]"></div>
        </div>

        <div className="relative">
            <AnimatePresence mode="wait">
              {!searchQuery && featured && (
                <motion.div
                  key="hero-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full"
                >
                    <Hero movie={featured} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`relative w-full px-4 sm:px-8 md:px-16 lg:px-24 pb-24 transition-all duration-700
                           ${!searchQuery && featured ? '-mt-12 sm:-mt-24 md:-mt-32 lg:-mt-40' : 'pt-32'}`}>

              {searchQuery ? (
                // --- Search Results View ---
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="min-h-[60vh] mt-24"
                >
                  <div className="flex flex-col sm:flex-row-reverse items-center justify-between gap-12 mb-24 border-b border-white/5 pb-20">
                      <div className="flex items-center gap-8 text-right dir-rtl">
                        <div className="w-4 h-16 bg-gradient-to-b from-ice-mint to-transparent rounded-full shadow-neon animate-pulse"></div>
                        <div>
                          <h2 className="text-4xl sm:text-7xl font-black tracking-tighter flex items-center gap-8 italic">
                            {isSearching ? (
                              <div className="w-12 h-12 border-4 border-ice-mint border-t-transparent rounded-full animate-spin"></div>
                            ) : <FaFire className="text-ice-mint text-5xl" />}
                            <span>{isSearching ? "جاري استرجاع البيانات..." : `نتائج البحث`}</span>
                          </h2>
                          <p className="text-text-muted mt-2 text-lg sm:text-xl font-bold">بناءً على طلبك: "{searchQuery}"</p>
                        </div>
                      </div>
                      {!isSearching && (
                          <div className="px-10 py-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-3xl shadow-huge">
                              <span className="text-xl sm:text-2xl font-black text-ice-mint font-outfit">{searchResults.length}</span>
                              <span className="text-xs sm:text-sm font-black text-white/40 uppercase tracking-[0.3em] mr-4 block sm:inline mt-2 sm:mt-0">عنوناً متاحاً</span>
                          </div>
                      )}
                  </div>

                  {!isSearching && searchResults.length === 0 && (
                    <div className="bg-white/[0.01] border border-white/5 rounded-[5rem] sm:rounded-[8rem] p-24 sm:p-56 text-center backdrop-blur-3xl relative overflow-hidden my-[100px]">
                        <div className="absolute inset-0 bg-ice-mint/5 opacity-10 blur-[200px] animate-pulse"></div>
                        <div className="relative z-10">
                            <div className="w-40 h-40 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-16 border border-white/10 shadow-huge">
                                <FaSearch className="text-6xl text-white/5" />
                            </div>
                            <h3 className="text-3xl sm:text-5xl font-black text-white mb-10 italic">عذراً، لم نجد ما تبحث عنه</h3>
                            <p className="text-text-secondary text-xl sm:text-3xl font-bold max-w-3xl mx-auto leading-relaxed opacity-40">
                              تأكد من كتابة الاسم بشكل صحيح أو جرب البحث بكلمات أبسط. يمكنك دائماً تصفح الأقسام المقترحة بالأسفل.
                            </p>
                        </div>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8 lg:gap-10">
                        {searchResults.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <MovieCard movie={item} />
                          </motion.div>
                        ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                // --- Home Sections View ---
                <div className="space-y-32 sm:space-y-48 mt-32">
                  {Object.entries(sections).map(([title, items], index) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, scale: 0.98, y: 50 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      className="relative"
                    >
                      <div className="absolute -top-12 sm:-top-20 right-0 w-1/2 h-[1px] bg-gradient-to-l from-ice-mint/20 to-transparent"></div>
                      <MovieRow title={title} initialItems={items} />
                    </motion.div>
                  ))}

                  {/* Explore More Section */}
                  <div className="mt-48">
                      <div className="relative mb-32 overflow-hidden rounded-[4rem] sm:rounded-[6rem] group min-h-[400px] flex items-center shadow-huge">
                          <div className="absolute inset-0 bg-ice-mint/10 opacity-40 animate-pulse"></div>
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                          <div className="absolute inset-0 border border-white/5 rounded-[4rem] sm:rounded-[6rem] pointer-events-none"></div>
                          
                          <div className="relative w-full p-12 sm:p-24 backdrop-blur-3xl transition-all duration-1000
                                    bg-gradient-to-br from-white/[0.04] to-transparent hover:bg-white/[0.06]">
                              <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-16">
                                  <div className="text-center lg:text-right">
                                      <div className="flex flex-col sm:flex-row-reverse items-center justify-center lg:justify-start gap-8 mb-10">
                                          <h2 className="text-5xl sm:text-8xl lg:text-9xl font-black italic tracking-tighter text-white drop-shadow-huge">كل شيء</h2>
                                          <div className="bg-ice-mint/10 p-6 sm:p-8 rounded-[3rem] rotate-12 group-hover:rotate-0 transition-all duration-1000 shadow-2xl border border-ice-mint/20">
                                              <FaThLarge className="text-5xl sm:text-7xl lg:text-8xl text-ice-mint" />
                                          </div>
                                      </div>
                                      <p className="text-lg sm:text-2xl font-bold tracking-tight text-white/40 max-w-3xl mx-auto lg:mr-0 leading-relaxed">
                                          أرتقِ بتجربة المشاهدة مع أكبر مكتبة أنمي محدثة لحظياً. جودة فائقة، ترجمة احترافية، وسيرفرات بلا حدود.
                                      </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-8 bg-deep-slate-900/80 p-10 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-xl hover:border-ice-mint/30 transition-colors">
                                      <div className="text-center sm:text-right border-l sm:border-l-0 sm:border-r border-white/10 pr-6">
                                          <div className="text-ice-mint text-4xl font-black font-outfit tabular-nums tracking-tighter animate-pulse">+{allAnime.length || '3.2k'}</div>
                                          <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-2">عنوان حصري</div>
                                      </div>
                                      <div className="text-center sm:text-right">
                                          <div className="text-white text-4xl font-black font-outfit italic tracking-tighter">HD</div>
                                          <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-2">أعلى كواليتي</div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-8 lg:gap-10">
                          {allAnime.map((item, idx) => (
                              <motion.div
                                key={`${item.id}-${idx}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4 }}
                              >
                                <MovieCard movie={item} />
                              </motion.div>
                          ))}
                      </div>

                      {/* Load More Trigger */}
                      <div ref={lastElementRef} className="h-60 flex items-center justify-center mt-20">
                          {loadingMore && (
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-14 h-14 border-4 border-ice-mint/20 border-t-ice-mint rounded-full animate-spin shadow-xl shadow-ice-mint/20"></div>
                                <span className="text-xs font-black uppercase tracking-[0.5em] text-ice-mint/60 animate-pulse">جاري استدعاء السيرفرات...</span>
                            </div>
                          )}
                          {!hasMore && (
                            <div className="flex flex-col items-center gap-4 text-center opacity-40">
                                <div className="w-1 h-20 bg-gradient-to-b from-white to-transparent rounded-full mb-4"></div>
                                <p className="text-lg font-black uppercase tracking-widest italic">نهاية العالم الخاص بنا 🎉</p>
                            </div>
                          )}
                      </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      </main>
    </div>
  );
};


export default Anime;
