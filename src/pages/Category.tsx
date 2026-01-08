import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchByCategory, ContentItem } from '../services/api';
import MovieCard from '../components/MovieCard';
import { FaArrowDown, FaLayerGroup } from 'react-icons/fa';
import SEO from '../components/SEO';

const categoryNames: Record<string, string> = {
  // Movies
  'english-movies': 'أفلام أجنبية',
  'arabic-movies': 'أفلام عربية',
  'indian-movies': 'أفلام هندية',
  'turkish-movies': 'أفلام تركية',
  'asian-movies': 'أفلام آسيوية',
  'anime-movies': 'أفلام كرتون اطفال',
  'dubbed-movies': 'أفلام مدبلجة',
  'latest-additions': 'أخر الإضافات',
  'most-viewed': 'الأكثر مشاهدة',

  // Series
  'arabic-series': 'مسلسلات عربية',
  'english-series': 'مسلسلات أجنبية',
  'turkish-series': 'مسلسلات تركية',
  'indian-series': 'مسلسلات هندية',
  'asian-series': 'مسلسلات آسيوية',
  'anime-series': 'مسلسلات كرتون اطفال',
  'tv-programs': 'برامج تلفزيونية',
  'plays': 'مسرحيات عربية',

  // Special Ramadan Categories
  'ramadan-2025': 'مسلسلات رمضان 2025',
  'ramadan-2024': 'مسلسلات رمضان 2024',
  'ramadan-2023': 'مسلسلات رمضان 2023',

  // Legacy mappings for stability
  'all_movies_13': 'أفلام أجنبية',
  'arabic-movies33': 'أفلام عربية',
  'indian-movies9': 'أفلام هندية',
  '6-asian-movies': 'أفلام آسيوية',
  'anime-movies-7': 'أفلام كرتون اطفال',
  '7-aflammdblgh': 'أفلام مدبلجة',
  '8-aflam3isk': 'أفلام تركية',
  'arabic-series46': 'مسلسلات عربية',
};

/**
 * Enhanced SEO description generator based on category context
 */
const getCategoryDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
        'مسلسلات رمضان 2025': 'شاهد حصرياً جميع مسلسلات رمضان 2025 بجودة عالية وبدون إعلانات. تابع نجومك المفضلين وأحدث الدراما الرمضانية على LMINA.',
        'أفلام كرتون اطفال': 'أكبر مكتبة لأفلام الكرتون والأنمي المترجمة والمدبلجة للأطفال. شاهد أحدث المغامرات والقصص بجودة عالية وآمنة تماماً.',
        'مسلسلات كرتون اطفال': 'مجموعة متميزة من مسلسلات الكرتون والأنمي لكل الأعمار. شاهد حلقاتك المفضلة مترجمة ومدبلجة بجودة عالية في بيئة آمنة.',
        'أفلام أجنبية': 'أحدث أفلام هوليوود والأفلام العالمية مترجمة. شاهد أفلام الأكشن، الرعب، والخيال العلمي بأفضل جودة.',
        'مسلسلات تركية': 'عش عالم الدراما التركية مع أحدث المسلسلات المترجمة والمدبلجة. قصص حب وانتقام وتشويق لا تنتهي.',
        'برامج تلفزيونية': 'تابع برامجك التلفزيونية والتوك شو المفضلة. حلقات كاملة بجودة عالية من أشهر القنوات العربية.',
        'الأكثر مشاهدة': 'استكشف التريند الحالي وأكثر المحتويات مشاهدة على منصة LMINA. اختيارات الجمهور بين يديك.',
    };
    return descriptions[name] || `استعرض قائمة ${name} المحدثة لحظياً على LMINA. شاهد أحدث العروض بجودة عالية وبدون إعلانات مزعجة.`;
};

const CategoryPage = () => {
    const { catId } = useParams();
    const [items, setItems] = useState<ContentItem[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const observerTarget = useRef(null);

    const categoryTitle = catId ? categoryNames[catId] || 'تصنيف مخصص' : 'تصنيف';
    const seoDescription = getCategoryDescription(categoryTitle);

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
            // Mapping virtual IDs for SEO pages to actual scraper calls if needed
            let fetchId = id;
            if (id === 'latest-additions') fetchId = 'latest'; // Should be handled by specific logic or backend
            
            const data = await fetchByCategory(fetchId, p);
            if (initial) setItems(Array.isArray(data) ? data : []);
            else {
                setItems(prev => {
                    const safePrev = Array.isArray(prev) ? prev : [];
                    const safeNew = Array.isArray(data) ? data : [];
                    const existingIds = new Set(safePrev.map(i => i.id));
                    const uniqueNew = safeNew.filter(i => i && i.id && !existingIds.has(i.id));
                    return [...safePrev, ...uniqueNew];
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (initial) setLoading(false);
            else setLoadingMore(false);
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
            { threshold: 1.0 }
        );

        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [items, loading, loadingMore, page, catId]);

    return (
        <div className="min-h-screen bg-transparent pt-20 sm:pt-28 md:pt-32 pb-8 sm:pb-20 px-3 sm:px-4 md:px-12">
            <SEO 
                title={`${categoryTitle} - شاهد بجودة عالية | LMINA`}
                description={seoDescription}
                url={`/category/${catId}`}
                type="website"
            />
            <div className="max-w-[1920px] mx-auto">
                <div className="flex flex-col md:flex-row-reverse items-center justify-between mb-8 sm:mb-16 gap-6 sm:gap-8 bg-deep-slate-800/40 p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-deep-slate-border shadow-3xl backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-ice-mint/5 rounded-full blur-[100px] -z-10"></div>
                    <div className="text-right relative z-10">
                        <h1 className="text-ice-mint text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-2 sm:mb-4">قسم مخصص</h1>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black italic text-white leading-none tracking-tighter">{categoryTitle}</h2>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-3 sm:space-x-4 bg-deep-slate-900/60 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-deep-slate-border shadow-inner">
                        <span className="text-text-muted font-black italic text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap">أرشفة ذكية</span>
                        <div className="h-4 w-[1px] bg-white/10 mx-1 sm:mx-2"></div>
                        <FaLayerGroup className="text-ice-mint text-base sm:text-lg" />
                    </div>
                </div>

                {loading && items.length === 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 gap-y-8 sm:gap-y-12">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 gap-y-8 sm:gap-y-12">
                            {items.map((item) => (
                                <li key={item.id}>
                                    <MovieCard movie={item} />
                                </li>
                            ))}
                        </ul>

                        <div ref={observerTarget} className="h-40 sm:h-60 flex flex-col items-center justify-center mt-12 sm:mt-20">
                            {loadingMore && (
                                <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-[3px] border-ice-mint border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-text-muted font-black italic text-[9px] sm:text-[10px] uppercase tracking-[0.5em]">جاري التحميل</p>
                                </div>
                            )}
                            {!loadingMore && items.length > 0 && (
                                <div className="opacity-20 hover:opacity-100 transition-opacity">
                                    <FaArrowDown className="text-white text-2xl sm:text-3xl animate-bounce" />
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
