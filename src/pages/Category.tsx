import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchByCategory, ContentItem } from '../services/api';
import MovieCard from '../components/MovieCard';
import { FaArrowDown, FaLayerGroup } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';

const categoryNames: Record<string, string> = {
    'netflix-movies': 'أفلام Netflix',
    'english-movies': 'أفلام أجنبية',
    'asian-movies': 'أفلام آسيوية',
    'turkish-movies': 'أفلام تركية',
    'arabic-movies': 'أفلام عربية',
    'classic-movies': 'أفلام كلاسيكية',
    'dubbed-movies': 'أفلام مدبلجة',
    'indian-movies': 'أفلام هندية',
    'anime-movies': 'أفلام كرتون',
    'netflix-series': 'مسلسلات Netflix',
    'arabic-series': 'مسلسلات عربية',
    'english-series': 'مسلسلات أجنبية',
    'turkish-series': 'مسلسلات تركية',
    'cartoon-series': 'مسلسلات كرتون',
    'korean-series': 'مسلسلات كورية',
    'dubbed-series': 'مسلسلات مدبلجة',
    'egyptian-series': 'مسلسلات مصرية',
    'indian-series': 'مسلسلات هندية',
    'ramadan-2025': 'مسلسلات رمضان 2025',
    'ramadan-2024': 'مسلسلات رمضان 2024',
    'ramadan-2023': 'مسلسلات رمضان 2023',
    'ramadan-2022': 'مسلسلات رمضان 2022',
    'ramadan-2021': 'مسلسلات رمضان 2021',
    'ramadan-2020': 'مسلسلات رمضان 2020',
    'ramadan-2019': 'مسلسلات رمضان 2019',
    'plays': 'مسرحيات عربية',
    'wwe': 'مصارعة حرة - WWE',
    'anime-series': 'مسلسلات أنمي',
    'arabic-songs': 'أغاني عربية',
};

const CategoryPage = () => {
    const { catId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (catId === 'anime-series') {
            navigate('/anime', { replace: true });
        }
    }, [catId, navigate]);

    if (catId === 'anime-series') return null;

    const [items, setItems] = useState<ContentItem[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const observerTarget = useRef(null);

    const categoryTitle = catId ? categoryNames[catId] || 'قائمة الأعمال' : 'المحتوى';
    const [kidsMode] = useState(localStorage.getItem('kidsMode') === 'true');

    useEffect(() => {
        if (catId) {
            setItems([]);
            setPage(1);
            loadData(catId, 1, true);
        }
    }, [catId]);

    const loadData = async (id: string, p: number, initial = false) => {
        if (initial) setLoading(true);
        else setLoadingMore(true);
        try {
            const data = await fetchByCategory(id, p);
            if (initial) setItems(Array.isArray(data) ? data : []);
            else {
                setItems(prev => {
                    const existingIds = new Set(prev.map(i => i.id));
                    const uniqueNew = (data as ContentItem[]).filter(i => !existingIds.has(i.id));
                    return [...prev, ...uniqueNew];
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loadingMore && !loading && items.length > 0) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    if (catId) loadData(catId, nextPage);
                }
            },
            { threshold: 0.1 }
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [items, loading, loadingMore, page, catId]);

    return (
        <div className={`min-h-screen pt-32 pb-20 px-6 md:px-12 ${kidsMode ? 'bg-[#f0fdf9]' : 'bg-[#05070a]'}`}>
            <SEO
                title={`${categoryTitle} - مشاهدة أون لاين | MOVIDO`}
                description={`استمتع بمشاهدة وتحميل أحدث ${categoryTitle} بجودة عالية 4K على موفيدو. مكتبة ضخمة متجددة من ${categoryTitle} المترجمة والمدبلجة.`}
                url={`/category/${catId}`}
                keywords={`${categoryTitle}, مشاهدة ${categoryTitle}, تحميل ${categoryTitle}, موفيدو ${categoryTitle}`}
            />

            <div className="max-w-[1700px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-10 md:p-16 rounded-[4rem] border-white/5 mb-16 relative overflow-hidden group"
                >
                    <div className={`absolute inset-0 blur-[100px] opacity-20 ${kidsMode ? 'bg-kids-blue' : 'bg-[#7fffd4]'}`} />
                    <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between gap-10">
                        <div className="text-center md:text-right">
                            <span className={`text-[10px] font-black uppercase tracking-[0.6em] mb-4 block ${kidsMode ? 'text-kids-blue' : 'text-[#7fffd4]'}`}>الاستكشاف الذكي</span>
                            <h1 className={`text-4xl md:text-7xl font-black heading-premium italic tracking-tighter ${kidsMode ? 'text-slate-800' : 'text-white'}`}>
                                {categoryTitle}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-3xl px-8 py-4 rounded-3xl border border-white/10">
                            <FaLayerGroup className={`${kidsMode ? 'text-kids-blue' : 'text-[#7fffd4]'} text-2xl`} />
                            <span className={`font-black tracking-widest text-xs ${kidsMode ? 'text-slate-600' : 'text-slate-400'}`}>{items.length} عمل متاح</span>
                        </div>
                    </div>
                </motion.div>

                {loading && items.length === 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10">
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
                                >
                                    <MovieCard movie={item} kidsMode={kidsMode} />
                                </motion.div>
                            ))}
                        </div>

                        <div ref={observerTarget} className="h-60 flex flex-col items-center justify-center mt-20">
                            <AnimatePresence>
                                {loadingMore && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex flex-col items-center gap-6"
                                    >
                                        <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${kidsMode ? 'border-kids-blue' : 'border-[#7fffd4]'}`} />
                                        <span className={`font-black italic tracking-widest uppercase ${kidsMode ? 'text-slate-600' : 'text-slate-500'}`}>جاري تحميل المزيد...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {!loadingMore && items.length > 0 && (
                                <div className="text-slate-600 flex flex-col items-center gap-4 opacity-30">
                                    <FaArrowDown className="text-2xl animate-bounce" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">اسحب للمزيد</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
