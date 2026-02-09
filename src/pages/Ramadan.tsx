import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchByCategory, ContentItem } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaStar, FaMoon, FaMosque, FaCalendarAlt } from 'react-icons/fa';
import { ramadan2026List } from '../data/ramadan26Seo';
import SEO from '../components/SEO';

const RamadanPage = () => {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Filter valid series for SEO and display
    const validSeries = ramadan2026List.filter(s =>
        !s.title.includes('التقييم مغلق') &&
        !s.title.includes('رئيس') &&
        !s.title.includes('ابحث') &&
        !s.title.includes('English') &&
        !s.title.match(/^\d+$/) && // Remove line numbers
        s.description.length > 20 // Reasonable description length
    );

    useEffect(() => {
        const load = async () => {
            const data = await fetchByCategory('ramadan-2026');
            setItems(data);
            setLoading(false);
        };
        load();
    }, []);

    // Construct rich Description for SEO
    const seoDescription = `شاهد أحدث مسلسلات رمضان 2026 حصرياً على موفيدو. قائمة كاملة تشمل: ${validSeries.slice(0, 10).map(s => s.title).join('، ')}، والمزيد بجودة عالية وبدون إعلانات.`;

    // Construct Keyword string
    const seoKeywords = validSeries.map(s => s.title).join(', ') + ', مسلسلات رمضان 2026, رمضان 2026, مسلسلات خليجية, مسلسلات مصرية, مسلسلات سورية';

    return (
        <div className="min-h-screen bg-[#020408] relative overflow-hidden font-sans">
            <SEO
                title="مسلسلات رمضان 2026 - مشاهدة وتحميل | MOVIDO"
                description={seoDescription}
                keywords={seoKeywords}
                image="https://www.transparenttextures.com/patterns/arabesque.png" // Placeholder, ideally a collage
                type="website"
            />

            {/* Islamic Pattern Background Overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/arabesque.png")' }}>
            </div>

            {/* Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Hanging Lanterns (Fanoos) Animation */}
            <div className="absolute top-0 w-full flex justify-between px-10 pointer-events-none z-10">
                <motion.div
                    initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 1.5, type: 'spring' }}
                    className="relative w-20 origin-top"
                    style={{ transformOrigin: 'top center' }}
                >
                    <motion.div
                        animate={{ rotate: [2, -2, 2] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="flex flex-col items-center"
                    >
                        <div className="h-32 w-0.5 bg-gradient-to-b from-amber-200 to-amber-600/50"></div>
                        <div className="text-6xl text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                            <FaMosque />
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ y: -150 }} animate={{ y: 0 }} transition={{ duration: 2, delay: 0.5, type: 'spring' }}
                    className="relative w-20 origin-top hidden md:block"
                >
                    <motion.div
                        animate={{ rotate: [-1.5, 1.5, -1.5] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="flex flex-col items-center"
                    >
                        <div className="h-48 w-0.5 bg-gradient-to-b from-amber-200 to-amber-600/50"></div>
                        <div className="text-5xl text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                            <FaStar />
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 1.8, delay: 0.2, type: 'spring' }}
                    className="relative w-20 origin-top"
                >
                    <motion.div
                        animate={{ rotate: [3, -3, 3] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="flex flex-col items-center"
                    >
                        <div className="h-24 w-0.5 bg-gradient-to-b from-amber-200 to-amber-600/50"></div>
                        <div className="text-7xl text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                            <FaMoon />
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Hero Section */}
            <div className="relative pt-40 pb-20 px-6 text-center z-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="inline-block"
                >
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 drop-shadow-2xl mb-4"
                        style={{ textShadow: '0 4px 20px rgba(217, 119, 6, 0.5)' }}>
                        رمضان 2026
                    </h1>
                    <div className="h-1 w-40 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-6"></div>
                    <p className="text-xl text-amber-100/80 font-bold tracking-wider max-w-2xl mx-auto leading-relaxed">
                        استمتع بأقوى المسلسلات الرمضانية الحصرية بجودة عالية وبدون إعلانات مزعجة.
                        كل عام وأنتم بخير.
                    </p>
                </motion.div>
            </div>

            {/* Grid Content */}
            <div className="max-w-[1800px] mx-auto px-6 pb-20 relative z-20">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {items.length === 0 ? (
                            <div className="text-center text-slate-500 py-20 flex flex-col items-center gap-4">
                                <FaMoon className="text-6xl text-slate-700" />
                                <p className="text-2xl font-bold">جاري تحديث القائمة...</p>
                                <p>انتظرونا في رمضان 2026 بأقوى الأعمال</p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                            >
                                {items.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => navigate(`/details/${item.id}`)}
                                        className="group relative cursor-pointer"
                                    >
                                        <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 relative border border-amber-500/10 group-hover:border-amber-500/50 transition-colors duration-500 shadow-lg group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                            <img
                                                src={item.poster || 'https://via.placeholder.com/300x450?text=Ramadan+2026'}
                                                alt={item.title}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                            {/* Hover Play Button */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                                                <div className="w-16 h-16 rounded-full bg-amber-500/90 flex items-center justify-center text-black shadow-xl backdrop-blur-sm">
                                                    <FaPlay className="text-2xl ml-1" />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <h3 className="text-white font-bold text-center line-clamp-2 text-sm md:text-base group-hover:text-amber-400 transition-colors">
                                                    {item.title}
                                                </h3>
                                            </div>

                                            {/* Ramadan Badge */}
                                            <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg text-[10px] font-black text-black shadow-lg">
                                                رمضان 2026
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* SEO Content Section (Rich List) */}
            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/5">
                <div className="flex items-center gap-4 mb-10">
                    <FaCalendarAlt className="text-3xl text-amber-500" />
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                        دليل مسلسلات رمضان 2026 المرتقبة
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {validSeries.map((series, idx) => (
                        <div key={idx} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-amber-500/30 transition-colors">
                            <h3 className="text-xl font-bold text-amber-400 mb-2">{series.title}</h3>
                            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{series.description}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs bg-black/30 px-2 py-1 rounded text-slate-500">بطولة: {series.actors.split(' ').slice(0, 3).join(' ')}...</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center text-slate-600 text-sm">
                    <p>حقوق النشر والعلامات التجارية مملوكة لأصحابها. هذا الدليل لأغراض المعلومات فقط.</p>
                </div>
            </div>

        </div>
    );
};

export default RamadanPage;
