import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import { searchContent } from '../services/api';
import { debounce } from '../utils/debounce';
import MovieCard from '../components/MovieCard';
import { FaSearch, FaFrown, FaSatelliteDish, FaMicrophone } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(query);
  const [isListening, setIsListening] = useState(false);
  const [kidsMode] = useState(localStorage.getItem('kidsMode') === 'true');

  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ['search', query],
    queryFn: () => query ? searchContent(query) : Promise.resolve([]),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchParams(value ? { q: value } : {});
    }, 500),
    [setSearchParams]
  );

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    debouncedSearch(value);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("متصفحك لا يدعم البحث الصوتي.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setLocalQuery(transcript);
      setSearchParams({ q: transcript });
    };

    recognition.start();
  };

  return (
    <div className={`min-h-screen pt-24 md:pt-32 pb-20 px-4 sm:px-6 md:px-12 ${kidsMode ? 'bg-[#f0fdf9]' : 'bg-[#05070a]'}`}>
      <SEO
        title={`${query ? `نتائج البحث عن ${query}` : 'محرك البحث الذكي'} | MOVIDO`}
        description={query ? `تعرف على نتائج البحث عن ${query} على موفيدو. شاهد وحمل أفلام ومسلسلات ${query} بجودة عالية.` : "ابحث عن أفلامك ومسلسلاتك المفضلة على موفيدو. محرك بحث ذكي وسريع للأفلام والمسلسلات والأنمي."}
        keywords={`${query ? `${query}, ` : ''}بحث موفيدو, افلام, مسلسلات, انمي, شاهد اون لاين`}
        noindex={!query}
      />

      <div className="max-w-[1700px] mx-auto">
        {/* Cinematic Search Header */}
        <header className="max-w-4xl mx-auto mb-10 md:mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="mb-8 md:mb-12"
          >
            <div className={`inline-flex items-center gap-2 md:gap-4 px-4 py-1.5 md:px-6 md:py-2 rounded-full border mb-4 md:mb-8 ${kidsMode ? 'bg-kids-blue/10 border-kids-blue/20 text-kids-blue' : 'bg-[#7fffd4]/10 border-[#7fffd4]/20 text-[#7fffd4]'}`}>
              <FaSatelliteDish className="animate-pulse text-xs md:text-base" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em]">محرك البحث الذكي {isListening && <span className="text-red-500 animate-ping">● جاري الاستماع</span>}</span>
            </div>
            <h1 className={`text-3xl sm:text-5xl md:text-7xl font-black heading-premium italic tracking-tighter ${kidsMode ? 'text-slate-800' : 'text-white'}`}>
              {query ? `نتائج البحث: ${query}` : 'عم تبحث اليوم؟'}
            </h1>
          </motion.div>

          <div className={`relative group glass-panel rounded-3xl md:rounded-[3rem] p-1.5 md:p-2 border-white/5 shadow-2xl transition-all duration-500 flex items-center focus-within:ring-2 ${kidsMode ? 'focus-within:ring-kids-blue' : 'focus-within:ring-[#7fffd4]/30'}`}>
            <div className={`pl-4 md:pl-10 text-xl md:text-2xl group-focus-within:scale-125 transition-all duration-500 ${kidsMode ? 'text-kids-blue' : 'text-[#7fffd4]'}`}>
              <FaSearch />
            </div>
            <input
              type="search"
              value={localQuery}
              onChange={handleSearchChange}
              placeholder="ابحث عن فيلم، مسلسل، أو أنمي..."
              className={`flex-1 bg-transparent text-white text-base sm:text-xl md:text-2xl p-4 md:p-8 outline-none text-right dir-rtl font-black placeholder:opacity-30 ${kidsMode ? 'text-slate-800' : 'text-white'}`}
              autoFocus
            />
            <button
              onClick={startVoiceSearch}
              className={`mr-2 md:mr-6 p-3 md:p-5 rounded-xl md:rounded-2xl transition-all relative ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-slate-500 hover:text-[#7fffd4] hover:bg-white/10'}`}
              title="بحث صوتي"
            >
              <FaMicrophone className={`text-sm md:text-xl ${isListening ? 'scale-125' : ''}`} />
              {isListening && (
                <span className="absolute inset-0 rounded-xl md:rounded-2xl border-2 border-red-500 animate-ping" />
              )}
            </button>
          </div>
        </header>

        {/* Search Results Grid */}
        <section className="pb-20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-8">
              <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${kidsMode ? 'border-kids-blue' : 'border-[#7fffd4]'}`} />
              <p className={`font-black italic tracking-widest uppercase animate-pulse ${kidsMode ? 'text-slate-500' : 'text-slate-400'}`}>جاري العثور على النتائج...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-20 glass-panel rounded-[3rem] border-white/5">
              <FaFrown className="text-6xl text-red-500 mx-auto mb-6" />
              <h2 className="text-white text-2xl font-black mb-4">حدث خطأ في النظام</h2>
              <button onClick={() => window.location.reload()} className="bg-[#7fffd4] text-[#05070a] px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all">إعادة المحاولة</button>
            </div>
          ) : query && (!searchResults || searchResults.length === 0) ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 opacity-30">
                <FaSearch className="text-4xl text-white" />
              </div>
              <h3 className={`text-3xl font-black italic mb-4 ${kidsMode ? 'text-slate-800' : 'text-white'}`}>لم نعثر على أي نتائج</h3>
              <p className="text-slate-500 max-w-md mx-auto font-medium">جرب البحث بكلمات أبسط أو تأكد من تهجئة اسم العمل بشكل صحيح.</p>
            </motion.div>
          ) : searchResults && searchResults.length > 0 ? (
            <>
              <div className="flex flex-row-reverse items-center gap-6 mb-12">
                <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl backdrop-blur-3xl border ${kidsMode ? 'bg-kids-blue/10 border-kids-blue/20 text-kids-blue' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                  عثرنا على {searchResults.length} نتيجة
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-white/10 to-transparent"></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10">
                {searchResults.map((item: any, index: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (index % 6) * 0.05 }}
                  >
                    <MovieCard movie={item} kidsMode={kidsMode} />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-40">
              <div className="inline-block p-12 rounded-[4rem] glass-panel border-white/5 opacity-50 grayscale scale-95">
                <p className="text-slate-400 text-xl font-black italic tracking-tighter uppercase">ابدأ بكتابة اسم العمل المفضل لديك...</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SearchPage;
