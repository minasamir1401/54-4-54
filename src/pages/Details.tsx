import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaPlay, FaCloudDownloadAlt, FaChevronRight } from 'react-icons/fa';
import { fetchDetails, Details, ContentItem, fetchByCategory, fetchLatest, saveHistory, resolveStream, getProxyStreamUrl } from '../services/api';
import SEO from '../components/SEO';
import AdBanner from '../components/AdBanner';
import VideoPlayer from '../components/VideoPlayer';

const DetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<Details | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedServer, setSelectedServer] = useState<number>(0);
    const [fallbackMovies, setFallbackMovies] = useState<ContentItem[]>([]);
    const [fallbackSeries, setFallbackSeries] = useState<ContentItem[]>([]);
    const [directStream, setDirectStream] = useState<{ url: string; type: string; headers?: any } | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    // Ad Logic State - Aggressive Mode
    const [serverClicks, setServerClicks] = useState(0);
    const [episodeClicks, setEpisodeClicks] = useState(0);
    const [downloadClicks, setDownloadClicks] = useState<Record<number, number>>({});

    const openSmartLink = () => {
        window.open('https://offevasionrecruit.com/zic21a2k4s?key=b01e21cf613c7a05ddb4e54f14865584', '_blank');
    };

    const scrollToPlayer = () => {
        const el = document.getElementById('main-player-container');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const handleServerWithAds = (idx: number) => {
        if (serverClicks < 1) {
            openSmartLink();
            setServerClicks(prev => prev + 1);
        } else {
            setSelectedServer(idx);
            scrollToPlayer();
            setServerClicks(0); // Reset for next switch
        }
    };

    const handleEpisodeWithAds = (epId: string) => {
        if (episodeClicks < 2) {
            openSmartLink();
            setEpisodeClicks(prev => prev + 1);
        } else {
            // Track Episode History
            const userId = localStorage.getItem('user_id') || 'guest';
            saveHistory(userId, data?.id || '', 'series', epId);

            navigate(`/details/${epId}`);
            setEpisodeClicks(0); // Reset
        }
    };

    const handleDownloadWithAds = (url: string, index: number) => {
        const current = downloadClicks[index] || 0;
        if (current < 4) {
            openSmartLink();
            setDownloadClicks(prev => ({ ...prev, [index]: current + 1 }));
        } else {
            window.open(url, '_blank');
            setDownloadClicks(prev => ({ ...prev, [index]: 0 }));
        }
    };

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        setSelectedServer(0);
        window.scrollTo(0, 0);

        const load = async () => {
            const res = await fetchDetails(id);
            if (res && !res.error) {
                setData(res);

                // Track History
                const userId = localStorage.getItem('user_id') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('user_id', userId);
                saveHistory(userId, id, res.type, undefined);
            } else {
                setError(res?.error || "حدث خطأ في جلب التفاصيل");
            }
            setLoading(false);
        };
        load();

        // Fetch Discovery Data (Use Latest Content for better quality)
        const loadDiscovery = async () => {
            try {
                // Fetch diverse sources to guarantee content
                const [latest, netflixSeries, foreignSeries] = await Promise.all([
                    fetchLatest(1),
                    fetchByCategory('netflix-series'),
                    fetchByCategory('foreign-series')
                ]);

                // 1. Process Movies (from Latest)
                const movies = (latest || [])
                    .filter(i => i.type === 'movie' && !i.title.match(/^(أفلام|مسلسلات) -/))
                    .slice(0, 10);

                // 2. Process Series (Combine sources to ensure we have data)
                let series = [
                    ...(latest || []).filter(i => i.type === 'series'),
                    ...(netflixSeries || []),
                    ...(foreignSeries || [])
                ];

                // Filter out bad placeholders and ensure uniqueness
                series = series
                    .filter(i => i.type === 'series' && !i.title.match(/^(أفلام|مسلسلات) -/))
                    .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Deduplicate
                    .slice(0, 10);

                if (movies.length > 0) setFallbackMovies(movies);
                if (series.length > 0) setFallbackSeries(series);
            } catch (e) {
                console.error("Discovery load failed", e);
            }
        };
        loadDiscovery();
    }, [id]);

    // Auto-resolve stream for selected server
    useEffect(() => {
        if (!data?.servers?.[selectedServer]) {
            setDirectStream(null);
            return;
        }

        const resolve = async () => {
            const server = data.servers![selectedServer];
            console.log("Resolution refresh V2 for:", server.url);
            setIsResolving(true);
            setServerError(null);
            setDirectStream(null);

            try {
                // Determine if this server is likely bypassable
                const isBypassable = /vidara|savefiles|reviewrate|mixdrop|streamtape|upstream|vidoza|up4fun|voe|bysezejataos|frizat|vidmoly|byse/i.test(server.url);

                if (isBypassable) {
                    const result = await resolveStream(server.url);

                    if (result && result.success && result.url) {
                        if (result.url === "deleted" || result.type === "error") {
                            setServerError("عذراً، هذا السيرفر لم يعد متاحاً (تم حذفه من المصدر)");
                            setIsResolving(false);
                            return;
                        }

                        const type = result.type === 'hls' ? 'hls' : 'video';
                        const proxiedUrl = getProxyStreamUrl(result.url, type, result.headers?.Referer || result.headers?.referer || server.url);
                        setDirectStream({
                            url: proxiedUrl,
                            type: result.type || 'hls'
                        });
                        setIsResolving(false);
                        return;
                    }
                }

                // If not bypassable or resolution failed, we just show iframe (which happens by default when directStream is null and isResolving is false)
                console.info("Falling back to standard iframe for:", server.url);
            } catch (e) {
                console.warn("Stream resolution failed", e);
            } finally {
                setIsResolving(false);
            }
        };

        resolve();
    }, [selectedServer, data]);


    if (loading) {
        return (
            <div className="min-h-screen bg-[#06080a] flex items-center justify-center">
                <div className="relative flex flex-col items-center gap-6">
                    <div className="w-20 h-20 border-2 border-indigo-500/20 rounded-full animate-ping absolute inset-0"></div>
                    <div className="w-20 h-20 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-indigo-500/50 font-black tracking-[0.5em] text-[10px] uppercase">Cinema Engine</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#06080a] flex items-center justify-center text-white px-6">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 max-w-sm">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 text-red-500 text-3xl">!</div>
                    <h2 className="text-2xl font-black italic">حدث خطأ ما</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">{error || "لم نتمكن من الوصول للمحتوى حالياً"}</p>
                    <button onClick={() => navigate('/')} className="w-full py-4 bg-indigo-600 rounded-2xl font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-sm text-white">العودة للرئيسية</button>
                </motion.div>
            </div>
        );
    }

    const currentServer = data.servers?.[selectedServer];

    // Recommendation Splicing with Dynamic Fetch Fallbacks
    const moviesRecs = data.recommendations && data.recommendations.length > 0 ? data.recommendations.filter(x => x.type === 'movie').slice(0, 6) : fallbackMovies;
    const seriesRecs = data.recommendations && data.recommendations.length > 0 ? data.recommendations.filter(x => x.type === 'series').slice(0, 6) : fallbackSeries;

    // Fallback if filtering failed (e.g. data returned mixed types) or empty
    const finalMovies = moviesRecs.length > 0 ? moviesRecs : fallbackMovies;
    const finalSeries = seriesRecs.length > 0 ? seriesRecs : fallbackSeries;

    return (
        <div className="min-h-screen bg-[#06080a] font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden text-slate-200">
            <SEO
                title={`${data.title} - مشاهدة وتحميل | MOVIDO`}
                description={data.description.substring(0, 160) + `... شاهد ${data.title} بجودة عالية وبدون إعلانات على موفيدو.`}
                image={data.poster}
                type={data.type === 'movie' ? 'video.movie' : 'video.tv_show'}
                rating={data.rating}
                genre={data.genre}
                year={data.year}
                keywords={`${data.title}, مشاهدة ${data.title}, تحميل ${data.title}, ${data.type === 'movie' ? 'فيلم' : 'مسلسل'}, مترجم, HD, 4K, ${data.genre?.join(', ')}`}
            />

            <div className="max-w-[1800px] mx-auto p-4 md:p-8 pt-20 md:pt-32 relative">

                {/* Header: Back Button & Title */}
                <div className="flex flex-row items-center justify-between gap-4 mb-6 md:mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl md:rounded-2xl transition-all"
                    >
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                            <FaChevronRight className="text-[10px] md:text-xs text-white" />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-slate-400 group-hover:text-white hidden sm:inline">الرجوع</span>
                    </button>

                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <h1 className="text-xl md:text-3xl lg:text-5xl font-black text-white italic tracking-tighter leading-tight dir-rtl line-clamp-2 md:line-clamp-none">{data.title}</h1>
                            <div className="flex items-center justify-end gap-3 mt-2 text-slate-400 text-[10px] md:text-sm">
                                <span>{data.year || '2024'}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                <span>{data.rating || '8.5'} Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mobile Server/Episode Tabs could go here if needed, but we stack them by default */}

                {/* Full Width Server Selection */}
                <div className="bg-[#0e1217] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 mb-6 md:mb-8">
                    <div className="flex items-center gap-3 mb-4 px-2 justify-end">
                        <h3 className="text-xs font-black uppercase text-slate-400">سيرفرات المشاهدة</h3>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" dir="rtl">
                        {data.servers?.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleServerWithAds(idx)}
                                className={`shrink-0 px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${selectedServer === idx
                                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <span>سيرفر {idx + 1}</span>
                                {selectedServer === idx && <FaPlay className="text-[8px]" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile/Desktop Ad Banner between Servers and Player */}
                <div className="w-full flex justify-center mb-8">
                    <AdBanner />
                </div>

                <div className="flex flex-col lg:flex-row gap-8 relative">

                    {/* Left Column: Episodes (Sticky) */}
                    {/* User asked for Left side */}
                    <div className="w-full lg:w-[320px] shrink-0 order-2 lg:order-1">
                        <div className="lg:sticky lg:top-28 space-y-6">
                            {/* Episodes List */}
                            {data.episodes && data.episodes.length > 0 ? (
                                <div className="bg-[#0e1217] rounded-[2rem] border border-white/5 overflow-hidden flex flex-col max-h-[600px]">
                                    <div className="p-6 border-b border-white/5 bg-[#13161c]">
                                        <h3 className="text-lg font-black italic text-white flex items-center justify-between">
                                            <span>الحلقات</span>
                                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400">{data.episodes!.length}</span>
                                        </h3>
                                    </div>
                                    <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                        {data.episodes.slice().reverse().map((ep) => (
                                            <button
                                                key={ep.id}
                                                onClick={() => handleEpisodeWithAds(ep.id)}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${ep.id === id
                                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                                                    : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">EPISODE</span>
                                                <span className="font-black italic text-lg">{ep.episode}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#0e1217] p-6 rounded-[2rem] border border-white/5 text-center py-12">
                                    <p className="text-slate-500 font-bold text-sm">فيلم كامل (بدون حلقات)</p>
                                </div>
                            )}

                            {/* Vertical Ad */}
                            <div className="hidden lg:block">
                                <AdBanner />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Servers & Player */}
                    <div className="flex-1 order-1 lg:order-2 space-y-8 min-w-0">



                        {/* New Mobile Ad Banner Place */}
                        <div className="w-full flex justify-center my-4 md:hidden">
                            <AdBanner />
                        </div>

                        {/* Video Player */}
                        <div className="w-full space-y-4" id="main-player-container">
                            <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/5">
                                <AnimatePresence mode="wait">
                                    <motion.div key={selectedServer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative z-10">
                                        <div className="w-full h-full bg-[#0a0c10] rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative">
                                            {isResolving && (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-[#0a0c10]">
                                                    <div className="relative w-16 h-16">
                                                        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                                                        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                    <div className="text-center">
                                                        <h3 className="text-lg font-bold text-white animate-pulse">جارٍ استخراج الرابط المباشر...</h3>
                                                        <p className="text-slate-400 text-xs mt-1">لحظات لتخطي الإعلانات المزعجة</p>
                                                    </div>
                                                </div>
                                            )}

                                            {!isResolving && serverError && (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center px-6">
                                                    <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center text-4xl mb-2">⚠️</div>
                                                    <h3 className="text-xl font-bold text-white">{serverError}</h3>
                                                    <button
                                                        onClick={() => setSelectedServer((selectedServer + 1) % (data.servers?.length || 1))}
                                                        className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white text-sm transition-colors"
                                                    >
                                                        تجربة سيرفر آخر
                                                    </button>
                                                </div>
                                            )}

                                            {!isResolving && !serverError && directStream && (
                                                <VideoPlayer url={directStream.url} poster={data.poster} />
                                            )}

                                            {!isResolving && !serverError && !directStream && currentServer?.url && (
                                                <div className="w-full h-full relative group/player">
                                                    <iframe
                                                        src={currentServer.url}
                                                        className="w-full h-full border-0"
                                                        allowFullScreen
                                                        allow="autoplay; encrypted-media"
                                                        title="MoviePlayer"
                                                    />
                                                    <div className="absolute inset-0 bg-transparent z-20 pointer-events-none group-active/player:hidden" />
                                                </div>
                                            )}

                                            {!isResolving && !serverError && !directStream && !currentServer?.url && (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                                    <span>لا يوجد فيديو متاح لهذا السيرفر</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Ad Banner - Visible on all devices */}
                        <div className="w-full flex justify-center my-4">
                            <AdBanner />
                        </div>

                        {/* Ad Banner - Visible on all devices */}
                        <div className="w-full flex justify-center my-4">
                            <AdBanner />
                        </div>

                    </div>
                </div>

            </div>

            {/* Full Width Downloads Section */}
            {data.download_links && data.download_links.length > 0 && (
                <div className="bg-[#0e1217] p-6 md:p-8 rounded-[2rem] border border-white/5 mb-8 mt-12">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <FaCloudDownloadAlt className="text-emerald-500 text-2xl" />
                            <h3 className="text-xl font-black italic text-white">روابط التحميل</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" dir="rtl">
                        {data.download_links.map((dl, i) => (
                            <button
                                key={i}
                                onClick={() => handleDownloadWithAds(dl.url, i)}
                                className="relative group p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all flex flex-col items-center gap-2"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FaDownload className="text-slate-400 group-hover:text-emerald-500" />
                                </div>
                                <span className="text-sm font-bold text-white">تحميل {i + 1}</span>
                                <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-emerald-400 font-mono">{dl.quality}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations (Moved outside to be full width) */}
            <div className="space-y-12 pt-16">
                {/* Movies Recs */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-black italic text-white dir-rtl">أفلام مقترحة</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {finalMovies.map((item: any, idx) => (
                            <motion.div key={idx} onClick={() => navigate(`/details/${item.id}`)} whileHover={{ y: -5 }} className="cursor-pointer">
                                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 relative group">
                                    <img src={item.poster} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                </div>
                                <h4 className="text-xs font-bold text-center mt-2 text-slate-300 line-clamp-1">{item.title}</h4>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Series Recs */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-black italic text-white dir-rtl">مسلسلات مقترحة</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {finalSeries.map((item: any, idx) => (
                            <motion.div key={idx} onClick={() => navigate(`/details/${item.id}`)} whileHover={{ y: -5 }} className="cursor-pointer">
                                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 relative group">
                                    <img src={item.poster} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                </div>
                                <h4 className="text-xs font-bold text-center mt-2 text-slate-300 line-clamp-1">{item.title}</h4>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Footer */}
            <footer className="mt-20 pt-12 border-t border-white/5 text-center pb-12">
                <p className="text-[10px] font-black text-slate-600 tracking-[0.2em] uppercase">MOVIDO Cinema Engine</p>
            </footer>

        </div>
    );
};

export default DetailsPage;
