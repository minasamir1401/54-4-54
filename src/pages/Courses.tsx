import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLatestCourses, fetchCoursesByCategory, searchCourses, ContentItem } from '../services/api';
import { FaSearch, FaArrowUp, FaUserGraduate, FaMagic } from 'react-icons/fa';
import MovieCard from '../components/MovieCard';
import SEO from '../components/SEO';

const COURSE_CATEGORIES = [
    { id: 'all', title: 'كافة المجالات' },
    { id: '12', title: 'البرمجة' },
    { id: '25', title: 'اللغات' },
    { id: '15', title: 'الأمن السيبراني' },
    { id: '13', title: 'التصميم' },
    { id: '14', title: 'الهندسة' },
    { id: '18', title: 'البيزنس' },
    { id: '40', title: 'الطب' },
    { id: '22', title: 'الفنون' },
];

const Courses = () => {
    const [courses, setCourses] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [selectedCat, setSelectedCat] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingMore, setLoadingMore] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const fetchCoursesData = async (p: number, cat: string, query: string, append: boolean = false) => {
        try {
            let data: ContentItem[] = [];
            if (query) data = await searchCourses(query);
            else if (cat === 'all') data = await fetchLatestCourses(p);
            else data = await fetchCoursesByCategory(cat, p);

            if (append) {
                setCourses(prev => {
                    const ids = new Set(prev.map(c => c.id));
                    return [...prev, ...data.filter(c => !ids.has(c.id))];
                });
            } else setCourses(data);
        } catch (err) { setError("فشل الاتصال بالأكاديمية."); } finally { setLoading(false); setLoadingMore(false); }
    };

    useEffect(() => {
        setLoading(true);
        setPage(1);
        fetchCoursesData(1, selectedCat, searchQuery);
    }, [selectedCat]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setPage(1);
        fetchCoursesData(1, selectedCat, searchQuery);
    };

    const loadMore = () => {
        if (loadingMore || searchQuery) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCoursesData(nextPage, selectedCat, searchQuery, true);
    };

    const observerTarget = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => { if (entries[0].isIntersecting && !loadingMore && !loading && courses.length > 0) loadMore(); },
            { threshold: 0.1 }
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
        <div className="bg-[#05070a] min-h-screen pb-32 px-6 md:px-12 pt-32">
            <SEO
                title="أكاديمية MOVIDO | تعلم البرمجة، اللغات، والمهارات الرقمية مجاناً"
                description="منصة موفيدو التعليمية توفر لك آلاف الكورسات المجانية في البرمجة، التصميم، اللغات، والأمن السيبراني بجودة احترافية."
                keywords="كورسات برمجة مجانية, تعلم التصميم, دورات لغات, امن سيبراني, تعليم ذاتي, اكاديمية موفيدو"
                type="website"
            />

            <div className="max-w-[1700px] mx-auto">
                {/* Academy Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-12 md:p-20 rounded-[4rem] border-white/5 mb-16 relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7fffd4]/10 to-transparent blur-[120px] -z-10" />
                    <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between gap-12">
                        <div className="text-center md:text-right">
                            <div className="inline-flex items-center gap-4 bg-white/5 px-6 py-2 rounded-2xl border border-white/10 mb-8">
                                <FaMagic className="text-[#7fffd4] animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#7fffd4]">مستقبل التعلم</span>
                            </div>
                            <h1 className="text-4xl md:text-8xl font-black heading-premium italic tracking-tighter leading-tight mb-6">
                                أكاديمية <span className="opacity-30">|</span> موفيدو
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-400 font-bold max-w-3xl md:mr-0 mx-auto leading-relaxed italic">
                                بوابتك نحو الاحتراف. الآلاف من الكورسات المجانية بانتظارك لتبدأ رحلة النجاح اليوم.
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="w-full md:w-[400px] relative group">
                            <input
                                type="text"
                                placeholder="ابحث عن مهارة، لغة، أو كورس..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-right text-white font-black text-xl outline-none focus:border-[#7fffd4]/40 transition-all shadow-inner"
                            />
                            <button type="submit" className="absolute left-10 top-1/2 -translate-y-1/2 text-2xl text-[#7fffd4] opacity-40 group-focus-within:opacity-100 transition-opacity">
                                <FaSearch />
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Intelligent Navigation/Filters */}
                <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-10 mb-20">
                    <div className="flex flex-wrap flex-row-reverse items-center gap-4">
                        {COURSE_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCat(cat.id)}
                                className={`px-8 py-4 rounded-2xl font-black text-sm transition-all duration-500 border ${selectedCat === cat.id
                                    ? 'bg-[#7fffd4] text-[#05070a] border-[#7fffd4] shadow-2xl scale-110'
                                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {cat.title}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-[2rem] border border-white/10 text-[#7fffd4]">
                        <FaUserGraduate />
                        <span className="font-black text-xs uppercase tracking-widest">+12K خريج مسجل</span>
                    </div>
                </div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 md:gap-10">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 glass-panel rounded-[3rem] border-white/5">
                        <p className="text-red-500 font-black text-xl mb-8 leading-relaxed italic">{error}</p>
                        <button onClick={() => window.location.reload()} className="bg-[#7fffd4] text-[#05070a] px-12 py-4 rounded-2xl font-black hover:scale-105 transition-all">إعادة المحاولة</button>
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 md:gap-10">
                        {courses.map((course, idx) => (
                            <motion.div key={course.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: (idx % 6) * 0.05 }} viewport={{ once: true }}>
                                <MovieCard movie={{ ...course, type: 'course' }} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Infinite Interaction Target */}
                <div ref={observerTarget} className="h-60 flex items-center justify-center mt-20">
                    <AnimatePresence>
                        {loadingMore && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
                                <div className="w-12 h-12 border-4 border-t-transparent border-[#7fffd4] rounded-full animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#7fffd4]/40 italic">جاري استدعاء المعرفة...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Scroll Up Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-12 left-12 p-6 bg-[#7fffd4] text-[#05070a] rounded-full shadow-2xl z-[100] active:scale-90 transition-transform"
                    >
                        <FaArrowUp className="text-xl" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Courses;
