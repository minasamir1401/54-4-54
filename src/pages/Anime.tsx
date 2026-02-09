import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearch } from "../context/SearchContext";
import { fetchAnimeHome, searchAnime, fetchAnimeList, ContentItem } from "../services/api";
import MovieRow from "../components/MovieRow";
import MovieCard from "../components/MovieCard";
import Hero from "../components/Hero";
import { motion, AnimatePresence } from "framer-motion";
import { FaJournalWhills } from "react-icons/fa";
import SEO from "../components/SEO";

const Anime: React.FC = () => {
  const [sections, setSections] = useState<Record<string, ContentItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<ContentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);

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
        const sectionValues = Object.values(data);
        if (sectionValues.length > 0 && sectionValues[0].length > 0) {
          setFeatured(sectionValues[0][0]);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    loadData();
    loadMore(1);
  }, []);

  const loadMore = async (pageNum: number) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const items = await fetchAnimeList(pageNum);
      if (items.length === 0) setHasMore(false);
      else {
        setAllAnime(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = items.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
        setPage(pageNum + 1);
      }
    } catch (e) { console.error(e); } finally { setLoadingMore(false); }
  };

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) loadMore(page);
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, page]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
      try {
        const results = await searchAnime(searchQuery);
        setSearchResults(results);
      } catch (e) { console.error(e); }
    };
    const debounceTimer = setTimeout(performSearch, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (loading) return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-[#7fffd4]/10 border-t-[#7fffd4] rounded-full animate-spin shadow-[0_0_30px_rgba(127,255,212,0.2)] mx-auto mb-8" />
        <p className="text-[#7fffd4] font-black italic tracking-widest animate-pulse uppercase">Otaku Portal Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <SEO
        title="عالم الأنمي - شاهد أنمي مترجم ومدبلج أون لاين | MOVIDO Anime"
        description="استكشف أكبر مكتبة أنمي في الوطن العربي. شاهد أفلام ومسلسلات الأنمي (ون بيس، ناروتو، هجوم العمالقة) بجودة BluRay وترجمة احترافية."
        keywords="انمي مترجم, انمي مدبلج, مشاهدة انمي, تحميل انمي, موفيدو انمي, ون بيس, ناروتو"
      />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {!searchQuery && featured && (
            <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
              <Hero movie={featured} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`px-6 md:px-12 lg:px-24 pb-32 transition-all duration-700 ${!searchQuery && featured ? '-mt-40' : 'pt-40'}`}>
          {searchQuery ? (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="min-h-[60vh]">
              <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-10 mb-20 border-b border-white/5 pb-16">
                <div className="text-right">
                  <h2 className="text-4xl md:text-8xl font-black heading-premium italic tracking-tighter mb-4">نتائج <span className="text-[#7fffd4]">الأنمي</span></h2>
                  <p className="text-slate-400 font-bold italic">جاري البحث عن: "{searchQuery}"</p>
                </div>
                <div className="glass-panel px-10 py-6 rounded-3xl border-white/10 text-center">
                  <div className="text-3xl font-black text-[#7fffd4]">{searchResults.length}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-40">عنوان متاح</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 md:gap-10">
                {searchResults.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <MovieCard movie={item} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-40">
              {Object.entries(sections).map(([title, items]) => (
                <motion.div key={title} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <MovieRow title={title} initialItems={items} />
                </motion.div>
              ))}

              <div className="space-y-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  className="glass-panel p-16 md:p-24 rounded-[4rem] border-white/5 relative overflow-hidden group shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7fffd4]/5 to-transparent animate-pulse" />
                  <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between gap-16">
                    <div className="text-center md:text-right">
                      <div className="inline-flex items-center gap-4 bg-white/5 px-6 py-2 rounded-2xl border border-white/10 mb-8">
                        <FaJournalWhills className="text-[#7fffd4]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#7fffd4]">الأرشيف الضخم</span>
                      </div>
                      <h2 className="text-5xl md:text-9xl font-black heading-premium italic tracking-tighter leading-none mb-8">عالم <span className="opacity-30">بلا حدود</span></h2>
                      <p className="text-xl md:text-2xl text-slate-500 font-bold max-w-3xl md:mr-0 mx-auto">أكبر مكتبة أنمي في الشرق الأوسط بين يديك الآن. استكشف جميع المواسم والحلقات بجودة سينمائية.</p>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 md:gap-10">
                  {allAnime.map((item, idx) => (
                    <motion.div key={`${item.id}-${idx}`} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                      <MovieCard movie={item} />
                    </motion.div>
                  ))}
                </div>

                <div ref={lastElementRef} className="h-40 flex items-center justify-center pt-20">
                  {loadingMore ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-12 h-12 border-4 border-[#7fffd4]/10 border-t-[#7fffd4] rounded-full animate-spin" />
                      <span className="text-xs font-black uppercase tracking-widest text-[#7fffd4]/40">جاري تحميل الأرشيف...</span>
                    </div>
                  ) : (
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Anime;
