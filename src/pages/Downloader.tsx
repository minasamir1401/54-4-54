import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaYoutube, FaInstagram, FaFacebook, FaTiktok, FaLink, FaMusic, FaVideo, FaTwitter } from 'react-icons/fa';
import { fetchDownloadInfo, getProxyDownloadUrl } from '../services/api';
import SEO from '../components/SEO';

const Downloader = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [kidsMode, setKidsMode] = useState(localStorage.getItem('kidsMode') === 'true');

    useEffect(() => {
        const handleKidsChange = () => {
            setKidsMode(localStorage.getItem('kidsMode') === 'true');
        };
        window.addEventListener('kidsModeChange', handleKidsChange);
        return () => window.removeEventListener('kidsModeChange', handleKidsChange);
    }, []);

    const handleDownload = async () => {
        if (!url.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await fetchDownloadInfo(url);
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ في جلب بيانات الفيديو. تأكد من الرابط وحاول مجدداً.');
        } finally {
            setLoading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Style helpers for Kids Mode
    const getBgColor = () => kidsMode ? 'bg-[#f0fdf9]' : 'bg-deep-slate-900';
    const getTextColor = () => kidsMode ? 'text-deep-slate-900' : 'text-white';
    const getSecondaryTextColor = () => kidsMode ? 'text-deep-slate-700' : 'text-gray-400';
    const getCardBg = () => kidsMode ? 'bg-white border-2 border-kids-blue/20 shadow-xl' : 'bg-deep-slate-800/80 backdrop-blur-2xl border-2 border-deep-slate-border shadow-2xl';
    const getPrimaryBtn = () => kidsMode ? 'bg-kids-blue text-deep-slate-900 shadow-lg hover:bg-kids-blue/90 font-black' : 'bg-ice-mint hover:bg-ice-mint-hover text-deep-slate-900 font-black';

    return (
        <div className={`min-h-screen ${getBgColor()} pt-32 pb-20 px-4 md:px-10 transition-colors duration-500`}>
            <SEO 
                title="LMINA Social Downloader | تحميل فيديوهات يوتيوب وتيك توك"
                description="حمل فيديوهاتك المفضلة من يوتيوب، تيك توك، إنستجرام، وفيسبوك بأعلى جودة وبضغطة واحدة على منصة LMINA."
                url="/downloader"
            />

            {/* Header Content */}
            <div className="max-w-4xl mx-auto text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`inline-block p-4 ${kidsMode ? 'bg-kids-blue/20 rounded-full' : 'bg-ice-mint/10 rounded-2xl'} mb-6 border ${kidsMode ? 'border-kids-blue/30' : 'border-ice-mint/30'}`}
                >
                    <FaDownload className={`${kidsMode ? 'text-kids-blue' : 'text-ice-mint'} text-3xl`} />
                </motion.div>
                
                <h1 className={`text-3xl md:text-5xl font-black mb-6 tracking-tighter ${getTextColor()}`}>
                    <span className={`text-transparent bg-clip-text ${kidsMode ? 'bg-gradient-to-r from-kids-blue via-kids-pink to-kids-yellow' : 'bg-gradient-to-r from-ice-mint to-ice-mint-active'}`}>
                        LMINA
                    </span>{' '}
                    Downloader
                </h1>
                
                <p className={`${getSecondaryTextColor()} text-lg mb-12 max-w-2xl mx-auto leading-relaxed font-bold`}>
                    حمل فيديوهاتك المفضلة من يوتيوب، فيسبوك، انستجرام، تيك توك وتويتر بأعلى جودة مجاناً.
                </p>

                <div className={`flex justify-center gap-6 mb-16 ${kidsMode ? 'text-kids-blue' : 'text-text-secondary'}`}>
                    <FaYoutube size={24} className="hover:scale-125 transition-transform cursor-pointer" />
                    <FaFacebook size={24} className="hover:scale-125 transition-transform cursor-pointer" />
                    <FaInstagram size={24} className="hover:scale-125 transition-transform cursor-pointer" />
                    <FaTiktok size={24} className="hover:scale-125 transition-transform cursor-pointer" />
                    <FaTwitter size={24} className="hover:scale-125 transition-transform cursor-pointer" />
                </div>

                <form 
                    onSubmit={(e) => { e.preventDefault(); handleDownload(); }}
                    className="relative max-w-3xl mx-auto group z-20"
                >
                    <div className={`absolute -inset-4 ${kidsMode ? 'bg-kids-blue' : 'bg-ice-mint'} rounded-[3rem] blur-[60px] opacity-10 group-focus-within:opacity-30 transition-all duration-700 z-0 pointer-events-none`} />
                    <div className="relative flex items-center z-10">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="ضع رابط الفيديو هنا..."
                            className={`w-full ${kidsMode ? 'bg-white text-deep-slate-900 border-kids-blue/20' : 'bg-deep-slate-800/90 text-white border-deep-slate-border'} border-2 p-6 rounded-[2rem] text-lg pr-16 focus:outline-none ${kidsMode ? 'focus:border-kids-blue' : 'focus:border-ice-mint'} transition-all text-center dir-rtl font-bold shadow-inner`}
                        />
                        <div className={`absolute right-8 top-1/2 -translate-y-1/2 ${kidsMode ? 'text-kids-blue' : 'text-ice-mint'} group-focus-within:scale-125 transition-all opacity-50`}>
                            <FaLink size={20} />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`relative z-30 w-full mt-6 ${getPrimaryBtn()} py-6 rounded-[2rem] text-xl uppercase tracking-widest transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer
                                 ${!url.trim() && !loading ? 'opacity-70 grayscale-[0.5]' : 'ring-2 ring-ice-mint/20 shadow-ice-mint/20'}`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 border-3 ${kidsMode ? 'border-deep-slate-900' : 'border-black'} border-t-transparent rounded-full animate-spin`} />
                                <span>جاري الاستخراج...</span>
                            </div>
                        ) : (
                            <>
                                <span className="font-black">تحميل سريع</span>
                                {kidsMode ? <span className="text-2xl">🚀</span> : <FaDownload className="animate-bounce" />}
                            </>
                        )}
                    </button>
                    {/* Visual hint for accessibility */}
                    {!url.trim() && !loading && (
                        <p className="mt-4 text-[10px] text-text-muted font-bold text-center animate-pulse">يرجى إدخال الرابط أولاً ليتمكن النظام من معالجته</p>
                    )}
                </form>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`max-w-2xl mx-auto ${kidsMode ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-600/10 text-amber-500 border-amber-600/30'} border p-6 rounded-[2rem] text-center mb-12 font-bold shadow-sm`}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RESULT UI */}
            <AnimatePresence>
                {result && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10"
                    >
                        {/* Info Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className={`${getCardBg()} rounded-[2.5rem] overflow-hidden`}>
                                <div className="aspect-video relative">
                                    <img src={result.thumbnail} className="w-full h-full object-cover" alt="" />
                                    <div className={`absolute bottom-4 left-4 ${kidsMode ? 'bg-kids-yellow text-deep-slate-900' : 'bg-black/80 text-white'} px-3 py-1 rounded-lg text-xs font-bold uppercase`}>
                                        {result.source}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h2 className={`text-xl font-black ${getTextColor()} mb-4 line-clamp-2 leading-relaxed`}>{result.title}</h2>
                                    <div className="flex flex-wrap gap-2 text-sm font-bold">
                                        <div className={`px-3 py-1.5 ${kidsMode ? 'bg-kids-blue/10 text-kids-blue' : 'bg-white/5 text-gray-400'} rounded-full`}>{result.uploader}</div>
                                        {result.duration && (
                                            <div className={`px-3 py-1.5 ${kidsMode ? 'bg-kids-green/10 text-kids-green' : 'bg-white/5 text-gray-400'} rounded-full`}>
                                                {Math.floor(result.duration/60)}:{(result.duration%60).toString().padStart(2,'0')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Links List */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* VIDEO SECTION */}
                            <div className="space-y-4">
                                <div className="flex flex-row-reverse items-center justify-between mb-4">
                                    <h3 className={`text-2xl font-black italic ${getTextColor()} uppercase tracking-tighter flex items-center gap-3`}>
                                        <FaVideo className={kidsMode ? 'text-kids-blue' : 'text-amber-600'} /> جودات الفيديو
                                    </h3>
                                    <div className={`h-[2px] flex-1 mr-6 ${kidsMode ? 'bg-kids-blue/10' : 'bg-white/5'}`} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.formats.filter((f: any) => f.type === 'video').length > 0 ? (
                                        result.formats.filter((f: any) => f.type === 'video').map((f: any, i: number) => (
                                            <a
                                                key={f.id + i}
                                                href={getProxyDownloadUrl(f.url, `${result.title}.${f.ext}`)}
                                                className={`flex flex-row-reverse items-center justify-between p-5 ${kidsMode ? 'bg-white hover:bg-kids-blue/5 border-kids-blue/10 hover:border-kids-blue/40' : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-amber-600/30'} border-2 rounded-[2rem] group transition-all`}
                                                title="اضغط للتحميل المباشر"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <div className="flex flex-row-reverse items-center gap-4 text-right">
                                                    <div className={`w-12 h-12 ${kidsMode ? 'bg-kids-green/10 text-kids-green' : 'bg-green-500/10 text-green-500'} rounded-2xl flex items-center justify-center text-xl`}>
                                                        <FaVideo />
                                                    </div>
                                                    <div>
                                                        <div className={`font-black ${getTextColor()} flex items-center gap-2`}>
                                                            {f.resolution}
                                                            {!f.has_audio && (
                                                                <span className="bg-red-500/10 text-red-500 text-[8px] px-1.5 py-0.5 rounded-md border border-red-500/20">بدون صوت</span>
                                                            )}
                                                        </div>
                                                        <div className={`${getSecondaryTextColor()} text-[10px] uppercase font-black tracking-widest`}>{f.ext} • {formatSize(f.filesize)}</div>
                                                    </div>
                                                </div>
                                                <div className={`w-12 h-12 ${kidsMode ? 'bg-kids-blue/10 text-kids-blue group-hover:bg-kids-blue group-hover:text-deep-slate-900' : 'bg-white/5 text-gray-400 group-hover:bg-ice-mint group-hover:text-deep-slate-900'} rounded-full flex items-center justify-center transition-all shadow-sm`}>
                                                    <FaDownload size={16} />
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <div className={`col-span-full p-8 text-center border-2 border-dashed ${kidsMode ? 'border-kids-blue/20 text-kids-blue' : 'border-white/10 text-gray-500'} rounded-[2rem] font-bold`}>
                                            لا توجد روابط فيديو متاحة لهذا الرابط حالياً.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AUDIO SECTION */}
                            <div className="space-y-4">
                                <div className="flex flex-row-reverse items-center justify-between mb-4">
                                    <h3 className={`text-2xl font-black italic ${getTextColor()} uppercase tracking-tighter flex items-center gap-3`}>
                                        <FaMusic className={kidsMode ? 'text-kids-pink' : 'text-blue-500'} /> تحميل الصوتيات
                                    </h3>
                                    <div className={`h-[2px] flex-1 mr-6 ${kidsMode ? 'bg-kids-pink/10' : 'bg-white/5'}`} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.formats.filter((f: any) => f.type === 'audio').length > 0 ? (
                                        result.formats
                                            .filter((f: any) => f.type === 'audio')
                                            .slice(0, 4)
                                            .map((f: any, i: number) => (
                                            <a
                                                key={f.id + i}
                                                href={getProxyDownloadUrl(f.url, `${result.title}-audio.${f.ext}`)}
                                                className={`flex flex-row-reverse items-center justify-between p-5 ${kidsMode ? 'bg-white hover:bg-kids-pink/5 border-kids-pink/10 hover:border-kids-pink/40' : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-blue-600/30'} border-2 rounded-[2rem] group transition-all`}
                                                title="اضغط للتحميل المباشر"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <div className="flex flex-row-reverse items-center gap-4 text-right">
                                                    <div className={`w-12 h-12 ${kidsMode ? 'bg-kids-pink/10 text-kids-pink' : 'bg-blue-500/10 text-blue-500'} rounded-2xl flex items-center justify-center text-xl`}>
                                                        <FaMusic />
                                                    </div>
                                                    <div>
                                                        <div className={`font-black ${getTextColor()}`}>{f.resolution === 'Unknown' || f.resolution === 'Audio Only' ? 'جودة عالية MP3' : f.resolution}</div>
                                                        <div className={`${getSecondaryTextColor()} text-[10px] uppercase font-black tracking-widest`}>{f.ext} • {formatSize(f.filesize)}</div>
                                                    </div>
                                                </div>
                                                <div className={`w-12 h-12 ${kidsMode ? 'bg-kids-pink/10 text-kids-pink group-hover:bg-kids-pink group-hover:text-deep-slate-900' : 'bg-white/5 text-gray-400 group-hover:bg-blue-600 group-hover:text-white'} rounded-full flex items-center justify-center transition-all shadow-sm`}>
                                                    <FaDownload size={16} />
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <div className={`col-span-full p-8 text-center border-2 border-dashed ${kidsMode ? 'border-kids-pink/20 text-kids-pink' : 'border-white/10 text-gray-500'} rounded-[2rem] font-bold`}>
                                            لا توجد روابط صوتية متاحة.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Downloader;
