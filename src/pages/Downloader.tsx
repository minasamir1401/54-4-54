import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaYoutube, FaInstagram, FaFacebook, FaTiktok, FaLink, FaMusic, FaVideo } from 'react-icons/fa';
import { fetchDownloadInfo, getProxyDownloadUrl } from '../services/api';
import SEO from '../components/SEO';

const Downloader = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
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

    return (
        <div className="min-h-screen bg-[#080808] pt-32 pb-20 px-4 md:px-10">
            <SEO 
                title="LMINA Social Downloader | تحميل فيديوهات يوتيوب وتيك توك"
                description="حمل فيديوهاتك المفضلة من يوتيوب، تيك توك، إنستجرام، وفيسبوك بأعلى جودة وبضغطة واحدة على منصة LMINA."
            />

            {/* Header Content */}
            <div className="max-w-4xl mx-auto text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block p-3 bg-red-600/10 rounded-2xl mb-6 border border-red-600/30"
                >
                    <FaDownload className="text-red-500 text-3xl" />
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl md:text-6xl font-black italic tracking-tighter text-white mb-6 uppercase"
                >
                    Social <span className="fire-text">Downloader</span>
                </motion.h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
                    حمل من يوتيوب، إنستجرام، فيسبوك، وتيك توك بأي جودة تختارها. ندينا كل اللي تحتاجه في مكان واحد.
                </p>

                {/* Social Icons Indicators */}
                <div className="flex justify-center gap-6 mt-8 opacity-40">
                    <FaYoutube size={24} className="hover:text-red-600 transition-colors" />
                    <FaInstagram size={24} className="hover:text-pink-600 transition-colors" />
                    <FaTiktok size={24} className="hover:text-cyan-400 transition-colors" />
                    <FaFacebook size={24} className="hover:text-blue-600 transition-colors" />
                </div>
            </div>

            {/* Search Input Box */}
            <div className="max-w-3xl mx-auto mb-16 px-4">
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute -inset-4 bg-red-600 rounded-[3rem] blur-[60px] opacity-20 group-focus-within:opacity-40 transition-all duration-700 z-0" />
                    <div className="relative z-10 w-full">
                        <input 
                            type="text" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="ضع رابط الفيديو هنا (YouTube, TikTok, Instagram...)"
                            className="w-full bg-[#121212]/80 backdrop-blur-2xl border-2 border-white/5 p-6 rounded-[2rem] text-white text-lg pr-16 focus:outline-none focus:border-red-600 transition-all text-center dir-rtl"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors">
                            <FaLink size={24} />
                        </div>
                    </div>
                </form>
                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-black italic py-4 rounded-2xl text-xl uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'جاري الفحص...' : 'استخراج روابط التحميل'}
                </button>
            </div>

            {/* ERROR UI */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="max-w-2xl mx-auto bg-red-600/10 border border-red-600/30 p-6 rounded-2xl text-red-500 text-center mb-12"
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
                            <div className="bg-[#121212] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                                <div className="aspect-video relative">
                                    <img src={result.thumbnail} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 rounded-lg text-xs font-bold text-white">
                                        {result.source}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h2 className="text-xl font-bold text-white mb-4 line-clamp-2 leading-relaxed">{result.title}</h2>
                                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                                        <div className="p-2 bg-white/5 rounded-lg">{result.uploader}</div>
                                        {result.duration && <div className="p-2 bg-white/5 rounded-lg">{Math.floor(result.duration/60)}:{(result.duration%60).toString().padStart(2,'0')}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Links List */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* VIDEO SECTION */}
                            <div className="space-y-4">
                                <div className="flex flex-row-reverse items-center justify-between mb-4">
                                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
                                        <FaVideo className="text-red-600" /> جودات الفيديو
                                    </h3>
                                    <div className="h-[1px] flex-1 mr-6 bg-white/5" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.formats.filter((f: any) => f.type === 'video').map((f: any, i: number) => (
                                        <motion.a
                                            key={f.id + i}
                                            href={getProxyDownloadUrl(f.url, `${result.title}.${f.ext}`)}
                                            className="flex flex-row-reverse items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-600/30 rounded-2xl group transition-all"
                                            title="اضغط للتحميل المباشر"
                                        >
                                            <div className="flex flex-row-reverse items-center gap-4 text-right">
                                                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
                                                    <FaVideo />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold">{f.resolution}</div>
                                                    <div className="text-gray-500 text-xs uppercase font-black tracking-widest">{f.ext} • {formatSize(f.filesize)}</div>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 bg-white/5 group-hover:bg-red-600 rounded-full flex items-center justify-center text-gray-400 group-hover:text-white transition-all">
                                                <FaDownload size={14} />
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>

                            {/* AUDIO SECTION */}
                            <div className="space-y-4">
                                <div className="flex flex-row-reverse items-center justify-between mb-4">
                                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
                                        <FaMusic className="text-blue-500" /> تحميل الصوت (MP3/M4A)
                                    </h3>
                                    <div className="h-[1px] flex-1 mr-6 bg-white/5" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.formats
                                        .filter((f: any) => f.type === 'audio')
                                        .slice(0, 4) // Only top 4 famosos extensions
                                        .map((f: any, i: number) => (
                                        <motion.a
                                            key={f.id + i}
                                            href={getProxyDownloadUrl(f.url, `${result.title}-audio.${f.ext}`)}
                                            className="flex flex-row-reverse items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-600/30 rounded-2xl group transition-all"
                                            title="اضغط للتحميل المباشر"
                                        >
                                            <div className="flex flex-row-reverse items-center gap-4 text-right">
                                                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                                                    <FaMusic />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold">{f.resolution === 'Unknown' ? 'High Quality Audio' : f.resolution}</div>
                                                    <div className="text-gray-500 text-xs uppercase font-black tracking-widest">{f.ext} • {formatSize(f.filesize)}</div>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 bg-white/5 group-hover:bg-blue-600 rounded-full flex items-center justify-center text-gray-400 group-hover:text-white transition-all">
                                                <FaDownload size={14} />
                                            </div>
                                        </motion.a>
                                    ))}
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
