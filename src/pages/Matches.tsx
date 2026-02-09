import { useEffect, useState, useRef } from 'react';
import { FaPlay, FaTimes, FaSatellite, FaInfoCircle } from 'react-icons/fa';
import Hls from 'hls.js';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';

interface Channel {
    team_home: string; 
    team_away: string;
    time: string;
    status: string;
    url: string; 
    logo_home: string; 
    logo_away: string;
    score: string;
}

export default function Matches() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingChannel, setPlayingChannel] = useState<Channel | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        fetch('/api-proxy/matches')
            .then(res => res.json())
            .then(data => { setChannels(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (playingChannel && videoRef.current) {
            const proxyUrl = `/api-proxy/proxy/stream?url=${encodeURIComponent(playingChannel.url)}`;
            if (Hls.isSupported()) {
                if (hlsRef.current) hlsRef.current.destroy();
                const hls = new Hls();
                hls.loadSource(proxyUrl);
                hls.attachMedia(videoRef.current);
                hls.on(Hls.Events.MANIFEST_PARSED, () => { videoRef.current?.play().catch(e => console.error(e)); });
                hlsRef.current = hls;
            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                videoRef.current.src = proxyUrl;
                videoRef.current.play().catch(e => console.error(e));
            }
        }
        return () => { if (hlsRef.current) hlsRef.current.destroy(); };
    }, [playingChannel]);

    return (
        <div className="min-h-screen bg-[#05070a] text-white pt-32 pb-32 px-6 md:px-12 selection:bg-[#7fffd4]/30">
            <SEO 
                title="البث المباشر | مباريات اليوم | MOVIDO Live"
                description="تابع أقوى القنوات الرياضية والمباريات العالمية بث مباشر وحصري بجودة 4K على موفيدو لايف."
                url="/matches"
            />
            
            <div className="max-w-[1700px] mx-auto">
                {/* Sports Header */}
                <motion.header 
                  initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-12 md:p-20 rounded-[4rem] border-white/5 mb-16 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7fffd4]/5 to-blue-500/5 transition-opacity" />
                    <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between gap-12">
                        <div className="text-center md:text-right">
                             <div className="inline-flex items-center gap-4 bg-red-500 text-[#05070a] px-6 py-2 rounded-2xl text-xs font-black uppercase italic mb-6 animate-pulse">
                                <span className="w-2 h-2 bg-[#05070a] rounded-full animate-ping" /> بث مباشر الآن
                             </div>
                             <h1 className="text-4xl md:text-8xl font-black heading-premium italic tracking-tighter leading-tight">
                                موفيدو <span className="text-white/30">|</span> سبورت
                             </h1>
                             <p className="text-lg md:text-2xl text-slate-400 mt-4 font-medium italic">أكبر مكتبة قنوات رياضية بجودة فائقة بدون تقطيع.</p>
                        </div>
                        <div className="flex items-center gap-6 glass-panel px-10 py-6 rounded-[2.5rem] border-white/10">
                             <FaSatellite className="text-4xl text-[#7fffd4]" />
                             <div className="text-right">
                                <div className="text-3xl font-black tabular-nums">{channels.length}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-[#7fffd4] opacity-60">قناة نشطة</div>
                             </div>
                        </div>
                    </div>
                </motion.header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-8">
                        <div className="w-20 h-20 border-4 border-[#7fffd4]/10 border-t-[#7fffd4] rounded-full animate-spin shadow-[0_0_30px_rgba(127,255,212,0.2)]" />
                        <p className="font-black italic text-[#7fffd4] animate-pulse uppercase tracking-[0.5em]">جاري الاتصال بالأقمار الصناعية...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {channels.map((channel, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: (idx % 4) * 0.05 }}
                                className="group relative glass-panel rounded-[3rem] p-6 border-white/5 overflow-hidden hover:border-[#7fffd4]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                                onClick={() => setPlayingChannel(channel)}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                
                                <div className="relative z-10 aspect-video bg-black/40 rounded-[2.5rem] overflow-hidden flex items-center justify-center border border-white/5 mb-8 group-hover:border-[#7fffd4]/20">
                                    <img 
                                        src={channel.logo_home || "https://placehold.co/300x200/1C2530/FFF?text=TV"} 
                                        className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-1000" 
                                        alt={channel.team_home} 
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <div className="w-20 h-20 bg-[#7fffd4] text-[#05070a] rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500">
                                            <FaPlay className="text-2xl ml-1" />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 px-4 text-center">
                                    <h3 className="text-2xl font-black italic mb-4 truncate group-hover:text-[#7fffd4] transition-colors">{channel.team_home}</h3>
                                    <div className="flex items-center justify-center gap-3 bg-white/5 py-3 rounded-2xl border border-white/5">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">شاهد الآن</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Premium Broadcast Modal */}
            <AnimatePresence>
                {playingChannel && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 sm:p-12 overflow-y-auto"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                            className="w-full max-w-6xl glass-panel rounded-[4rem] overflow-hidden border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
                        >
                            <div className="flex flex-row-reverse items-center justify-between p-8 bg-white/5 border-b border-white/10">
                                <div className="flex flex-row-reverse items-center gap-6">
                                    <h3 className="text-xl md:text-3xl font-black italic">{playingChannel.team_home}</h3>
                                    <div className="bg-red-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase animate-pulse">LIVE</div>
                                </div>
                                <button onClick={() => setPlayingChannel(null)} className="glass-panel p-4 rounded-full text-white hover:bg-white/10 border-white/10 transition-colors">
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                            <div className="aspect-video bg-black relative">
                                <video ref={videoRef} className="w-full h-full" controls autoPlay playsInline />
                            </div>
                            <div className="p-8 bg-[#05070a]/50 flex flex-row-reverse items-center gap-4 text-slate-500">
                                <FaInfoCircle />
                                <span className="text-xs font-bold">بث مباشر للقناة بأعلى جودة متوفرة. في حال التقطيع يرجى تحديث الصفحة.</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
