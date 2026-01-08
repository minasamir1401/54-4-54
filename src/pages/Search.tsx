import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import { searchContent } from '../services/api';
import { generateBreadcrumbSchema } from '../utils/structuredData';
import { debounce } from '../utils/debounce';
import MovieCard from '../components/MovieCard';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(query);

  // Fetch content from server direct
  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ['search', query],
    queryFn: () => query ? searchContent(query) : Promise.resolve([]),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, 
  });

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchParams(value ? { q: value } : {});
    }, 500),
    [setSearchParams]
  );

  // Update local query when URL changes
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Handle input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    debouncedSearch(value);
  };

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'الرئيسية', url: '/' },
    { name: 'البحث', url: '/search' },
    ...(query ? [{ name: query, url: `/search?q=${encodeURIComponent(query)}` }] : [])
  ]);

  return (
    <>
      <SEO
        title={query ? `نتائج البحث عن: ${query}` : 'البحث في LMINA'}
        description={
          query
            ? `نتائج البحث عن "${query}" - شاهد الآن على منصة LMINA`
            : 'ابحث عن أفلامك ومسلسلاتك المفضلة على منصة LMINA'
        }
        canonical={query ? `/search?q=${encodeURIComponent(query)}` : '/search'}
        noindex={!query || (searchResults && searchResults.length === 0)}
        structuredData={breadcrumbSchema}
      />

      <div className="min-h-screen bg-deep-slate-900 pt-24 sm:pt-28 px-3 sm:px-4 md:px-10">
        {/* Search Header */}
        <header className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-row-reverse items-center gap-4 mb-8">
             <div className="w-1.5 h-10 bg-ice-mint rounded-full shadow-[0_0_15px_rgba(127,255,212,0.5)]"></div>
             <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
               {query ? `نتائج البحث: ${query}` : 'محرك البحث'}
             </h1>
          </div>
          
          {/* Search Input */}
          <div className="relative group">
            <input
              type="search"
              value={localQuery}
              onChange={handleSearchChange}
              placeholder="ابحث عن فيلم، مسلسل، أو ممثل..."
              className="w-full bg-deep-slate-800/40 border border-deep-slate-border text-white text-base sm:text-lg p-4 sm:p-5 rounded-2xl sm:rounded-[2rem]
                        placeholder-text-muted focus:outline-none focus:border-ice-mint/50 focus:bg-deep-slate-800/60
                       transition-all duration-500 text-right pr-6 shadow-2xl"
              autoFocus
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-ice-mint transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </div>
          </div>
        </header>

        {/* Search Results */}
        <section className="max-w-7xl mx-auto pb-20">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-32 gap-6">
              <div className="w-16 h-16 border-4 border-ice-mint/20 border-t-ice-mint rounded-full animate-spin" />
              <p className="text-text-muted font-black italic text-xs tracking-widest uppercase animate-pulse">جاري البحث عن العظماء...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-20 bg-ice-mint/5 rounded-[2rem] border border-ice-mint/10">
              <p className="text-ice-mint text-xl font-bold">عذراً، حدث خطأ ما أثناء البحث</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 bg-ice-mint hover:bg-ice-mint-hover text-deep-slate-900 px-8 py-3 rounded-xl font-black transition-all"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : query && (!searchResults || searchResults.length === 0) ? (
            <div className="text-center py-32 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
                 <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <p className="text-white text-2xl font-black italic mb-2">للأسف، لم نجد ما تبحث عنه</p>
              <p className="text-gray-500 max-w-md mx-auto">تأكد من كتابة الاسم بشكل صحيح أو جرب البحث بكلمات أبسط مثل "الهرم" بدلاً من "الهرم الرابع"</p>
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <>
              <div className="flex flex-row-reverse justify-between items-center mb-10">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  عثرنا على ({searchResults.length}) نتيجة مطابقة
                </p>
                <div className="h-[1px] flex-1 mx-8 bg-gradient-to-l from-white/10 to-transparent"></div>
              </div>
              
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 md:gap-8">
                {(searchResults || [])
                  .filter((item: any) => {
                    const kidsMode = localStorage.getItem('kidsMode') === 'true';
                    if (!kidsMode) return true;
                    // In kids mode, we filter strictly
                    const title = item.title.toLowerCase();
                    return ['كرتون', 'انمي', 'مدبلج', 'اطفال', 'anime', 'cartoon', 'kids', 'مغامرات'].some(k => title.includes(k));
                  })
                  .map((item: any) => (
                    <li key={item.id} className="relative group">
                      <MovieCard movie={item} />
                      {/* Check if ID looks like an Anime link (base64) or title suggests it */}
                      {(item.id.length > 20 || item.title.includes('انمي') || item.title.includes('حلقة')) && (
                        <div className="absolute top-2 left-2 z-30 pointer-events-none">
                            <span className="bg-ice-mint text-deep-slate-900 text-[8px] font-black px-2 py-0.5 rounded-sm shadow-lg uppercase tracking-tighter">
                                أنمي
                            </span>
                        </div>
                      )}
                    </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="text-center py-32">
              <div className="inline-block p-8 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                <p className="text-gray-400 text-lg font-black italic tracking-tighter uppercase opacity-50">أدخل اسم العمل الذي تبحث عنه...</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default SearchPage;
