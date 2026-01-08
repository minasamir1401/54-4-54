import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLatestCourses, fetchCoursesByCategory, searchCourses, ContentItem } from '../services/api';
import { FaGraduationCap, FaSearch, FaFilter, FaArrowUp, FaBookOpen, FaUserGraduate } from 'react-icons/fa';
import MovieCard from '../components/MovieCard';
import SEO from '../components/SEO';
// import { useUser } from '../hooks/useUser';

const COURSE_CATEGORIES = [
  { id: 'all', title: 'الكل' },
  { id: '12', title: 'برمجة' },
  { id: '25', title: 'انجليزي' },
  { id: '15', title: 'تكنولوجيا المعلومات' },
  { id: '13', title: 'جرافيك ديزاين' },
  { id: '14', title: 'الهندسة' },
  { id: '18', title: 'الادارة و التجارة' },
  { id: '40', title: 'الطب' },
  { id: '22', title: 'فنون' },
];

const Courses = () => {
    const [courses, setCourses] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [selectedCat, setSelectedCat] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    // const [isSearching, setIsSearching] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    // const { user } = useUser();

    const fetchCourses = async (p: number, cat: string, query: string, append: boolean = false) => {
        try {
            let data: ContentItem[] = [];
            if (query) {
                data = await searchCourses(query);
            } else if (cat === 'all') {
                data = await fetchLatestCourses(p);
            } else {
                data = await fetchCoursesByCategory(cat, p);
            }

            if (append) {
                setCourses(prev => {
                    const ids = new Set(prev.map(c => c.id));
                    return [...prev, ...data.filter(c => !ids.has(c.id))];
                });
            } else {
                setCourses(data);
            }
        } catch (err) {
            setError("حدث خطأ أثناء تحميل الكورسات.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        setPage(1);
        fetchCourses(1, selectedCat, searchQuery);
    }, [selectedCat]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setPage(1);
        fetchCourses(1, selectedCat, searchQuery);
    };

    const loadMore = () => {
        if (loadingMore || searchQuery) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCourses(nextPage, selectedCat, searchQuery, true);
    };

    const observerTarget = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loadingMore && !loading && courses.length > 0) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [loadingMore, loading, courses]);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 500);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-transparent min-h-screen pb-20 relative px-4 sm:px-8 md:px-16 pt-24 sm:pt-32">
            <SEO 
                title="أكاديمية LMINA | تعلم مهارات جديدة مجاناً"
                description="استكشف مئات الكورسات المجانية في البرمجة، التصميم، اللغات وغيرها. ابدأ رحلة تعلمك الآن مع LMINA Academy واحصل على المعرفة من الخبراء."
                url="/courses"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "EducationalOrganization",
                    "name": "LMINA Academy",
                    "description": "منصة تعليمية تقدم كورسات مجانية عالية الجودة باللغة العربية.",
                    "url": "https://lmina.com/courses",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    }
                }}
            />

            {/* Header Section */}
            <div className="relative mb-12 sm:mb-20">
                <div className="absolute -top-24 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-ice-mint/10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-ice-mint-active/5 blur-[100px] rounded-full" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-white/[0.03] border border-ice-mint/10 backdrop-blur-2xl p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-ice-mint to-transparent opacity-50" />
                    
                    <div className="text-right flex-1">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-end gap-4 mb-6"
                        >
                            <h1 className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter">أكاديمية LMINA</h1>
                            <FaGraduationCap className="text-5xl sm:text-7xl text-ice-mint drop-shadow-[0_0_15px_rgba(127,255,212,0.5)]" />
                        </motion.div>
                        <p className="text-gray-400 text-lg sm:text-xl font-bold max-w-2xl ml-auto leading-relaxed">
                            استكشف عالم المعرفة مع أفضل الكورسات المجانية. طور مهاراتك وراقب تقدمك خطوة بخطوة.
                        </p>
                        
                                    <div className="flex items-center gap-2 bg-deep-slate-800/20 px-4 py-2 rounded-xl border border-ice-mint/30">
                                        <span className="text-ice-mint font-black text-sm">مراقبة المحتوى</span>
                                        <FaBookOpen className="text-ice-mint" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-deep-slate-800/20 px-4 py-2 rounded-xl border border-white/10">
                                        <span className="text-white font-black text-sm">شهادات تدريبية</span>
                                        <FaUserGraduate className="text-ice-mint" />
                                    </div>
                    </div>

                    <motion.form 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onSubmit={handleSearch}
                        className="w-full md:w-96 relative group"
                    >
                        <input 
                            type="text" 
                            placeholder="ابحث عن كورس..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-deep-slate-800/40 border-2 border-deep-slate-border rounded-2xl py-4 sm:py-5 px-6 sm:px-8 text-right text-white font-bold outline-none focus:border-ice-mint transition-all duration-300 group-hover:border-ice-mint/50"
                        />
                        <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-text-muted hover:text-ice-mint transition-colors">
                            <FaSearch />
                        </button>
                    </motion.form>
                </div>
            </div>

            {/* Categories & Filters */}
            <div className="relative z-20 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
                    {COURSE_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCat(cat.id)}
                            className={`px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${
                                selectedCat === cat.id 
                                ? 'bg-ice-mint text-deep-slate-900 shadow-xl shadow-ice-mint/30 scale-105' 
                                : 'bg-white/5 text-text-muted hover:bg-white/10 border border-deep-slate-border hover:border-ice-mint/30 hover:text-ice-mint'
                            }`}
                        >
                            {cat.title}
                        </button>
                    ))}
                    <div className="h-10 w-[2px] bg-white/10 mx-2 hidden sm:block" />
                    <FaFilter className="text-gray-500 text-xl" />
                </div>
                
                <h3 className="text-white font-black text-xl italic border-r-4 border-amber-600 pr-4">الفئات الأكثر طلباً</h3>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <p className="text-amber-400 font-black text-xl mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-amber-500 text-black px-8 py-3 rounded-2xl font-bold hover:bg-amber-400 transition-colors">إعادة المحاولة</button>
                </div>
            ) : (
                <motion.ul 
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8"
                >
                    <AnimatePresence>
                        {courses.map((course, idx) => (
                            <motion.li
                                key={course.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                                <MovieCard movie={{...course, type: 'course'}} />
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </motion.ul>
            )}

            {/* Empty State */}
            {!loading && courses.length === 0 && (
                <div className="text-center py-32 bg-white/[0.02] border border-white/5 rounded-[3rem]">
                    <FaBookOpen className="text-8xl text-gray-700 mx-auto mb-8 opacity-20" />
                    <p className="text-gray-500 font-bold text-2xl">لم نجد كورسات تطابق بحثك</p>
                    <button onClick={() => {setSearchQuery(''); setSelectedCat('all')}} className="mt-6 text-amber-500 font-black underline hover:text-amber-400">استكشف كافة الكورسات</button>
                </div>
            )}

            {/* Load More Target */}
            <div ref={observerTarget} className="h-40 flex items-center justify-center">
                {loadingMore && (
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-amber-500/50" />
                )}
            </div>

            {/* Scroll Up */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                        className="fixed bottom-10 left-10 p-5 bg-ice-mint text-deep-slate-900 rounded-full shadow-2xl shadow-ice-mint/50 z-50 border-2 border-deep-slate-900/20 hover:scale-110 transition-transform"
                    >
                        <FaArrowUp />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Courses;
