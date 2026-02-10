import { useState } from 'react';
import { FaDownload, FaLink, FaMagic, FaExclamationTriangle, FaCheckCircle, FaSatelliteDish } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';

const Downloader = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleExtract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;
        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const res = await fetch(`/api-proxy/proxy/get-links?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data && Array.isArray(data) && data.length > 0) setResults(data);
            else setError('لم نتمكن من استخراج روابط من هذا الرابط. تأكد من أن الموقع مدعوم.');
        } catch (err) {
            setError('حدث خطأ فني أثناء المعالجة، يرجى المحاولة لاحقاً.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-white pt-20 md:pt-32 pb-20 px-2 md:px-12">
            <SEO title="تحميل الفيديو | MOVIDO Downloader" description="استخرج روابط التحميل المباشرة من أشهر المواقع العالمية بجودة عالية." />

            <div className="max-w-[1200px] mx-auto">

                {/* Lab Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 md:mb-20"
                >
                    <div className="inline-flex items-center gap-2 md:gap-4 px-3 md:px-6 py-1.5 md:py-2 rounded-full border border-[#7fffd4]/20 bg-[#7fffd4]/10 text-[#7fffd4] mb-4 md:mb-8">
                        <FaMagic className="animate-pulse text-[10px]" />
                        <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.5em]">تحميل الفيديو</span>
                    </div>
                    <h1 className="text-2xl md:text-6xl lg:text-8xl font-black heading-premium italic tracking-tighter leading-none mb-3 md:mb-6">
                        تحميل <span className="text-white/30">&</span> مشاهدة
                    </h1>
                    <p className="text-[10px] md:text-xl text-slate-500 font-bold italic px-2">قم بتحميل مقاطع الفيديو من جميع المواقع المفضلة لديك بسهولة.</p>
                </motion.header>

                {/* Input Lab Section */}
                <div className="glass-panel p-4 md:p-12 lg:p-20 rounded-2xl md:rounded-[4rem] border-white/5 shadow-2xl relative overflow-hidden group mb-8 md:mb-16">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#7fffd4]/5 blur-[80px] -z-10" />

                    <form onSubmit={handleExtract} className="relative z-10 flex flex-col items-center">
                        <div className="w-full relative mb-4 md:mb-10 group">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="رابط الفيديو (TikTok, Instagram...)"
                                className="w-full bg-white/5 border border-white/10 p-4 md:p-8 rounded-xl md:rounded-[2.5rem] outline-none text-right dir-rtl font-black text-xs md:text-2xl placeholder:opacity-20 focus:border-[#7fffd4]/40 transition-all shadow-inner"
                                required
                            />
                            <div className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-sm md:text-2xl text-[#7fffd4] opacity-40 group-focus-within:opacity-100 transition-opacity">
                                <FaLink />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full md:w-auto bg-[#7fffd4] text-[#05070a] px-8 md:px-16 py-3.5 md:py-6 rounded-xl md:rounded-3xl font-black flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(127,255,212,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-xs md:text-base"
                        >
                            {loading ? (
                                <div className="w-4 h-4 md:w-6 md:h-6 border-2 md:border-4 border-[#05070a]/20 border-t-[#05070a] rounded-full animate-spin" />
                            ) : <FaSatelliteDish className="text-sm md:text-xl" />}
                            {loading ? 'جاري التحميل...' : 'تحميل'}
                        </button>
                    </form>
                </div>

                {/* Display Results */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 md:p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex flex-col items-center gap-3 md:gap-6 mb-8 md:mb-16 text-center">
                            <FaExclamationTriangle className="text-2xl md:text-4xl" />
                            <p className="font-black text-xs md:text-lg italic">{error}</p>
                        </motion.div>
                    )}

                    {results.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-8">
                            <div className="flex flex-row-reverse items-center justify-between mb-6 md:mb-10">
                                <div className="flex items-center gap-2 md:gap-4 text-green-400">
                                    <FaCheckCircle className="text-lg md:text-2xl" />
                                    <h2 className="text-sm md:text-2xl font-black italic truncate">تم استخراج {results.length} رابط</h2>
                                </div>
                                <div className="h-[1px] flex-1 mx-2 md:mx-8 bg-gradient-to-l from-white/10 to-transparent"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                                {results.map((link, idx) => (
                                    <motion.a
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                        href={link.url} target="_blank" rel="noopener noreferrer"
                                        className="glass-panel p-3 md:p-8 rounded-xl md:rounded-[2.5rem] border-white/5 flex flex-row-reverse items-center justify-between hover:bg-white/5 hover:border-[#7fffd4]/20 transition-all group gap-3"
                                    >
                                        <div className="text-right flex-1 min-w-0">
                                            <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 mb-0.5 block">رابط بجودة</span>
                                            <div className="text-xs md:text-2xl font-black text-white group-hover:text-[#7fffd4] transition-colors truncate">{link.quality || 'رابط مباشر'}</div>
                                        </div>
                                        <div className="w-10 h-10 md:w-16 md:h-16 shrink-0 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#7fffd4] group-hover:text-[#05070a] transition-all">
                                            <FaDownload className="text-xs md:text-xl" />
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-12 md:mt-32">
                    {[
                        { title: 'يدعم مواقع متعددة', desc: 'يدعم التحميل من تيك توك، انستجرام، يوتيوب، وغيرها.' },
                        { title: 'جودة عالية', desc: 'استخراج بأعلى جودة متوفرة (4K/HD).' },
                        { title: 'سريع وآمن', desc: 'روابط مباشرة وخالية من الإعلانات المنبثقة.' }
                    ].map((card, i) => (
                        <div key={i} className="glass-panel p-4 md:p-10 rounded-xl md:rounded-[3rem] border-white/5 text-center">
                            <h3 className="text-sm md:text-xl font-black italic mb-2 md:mb-4 text-[#7fffd4]">{card.title}</h3>
                            <p className="text-[9px] md:text-slate-500 font-bold">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Downloader;
