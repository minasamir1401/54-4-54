import { useEffect, useState, useRef } from 'react';
import { FaPlay, FaTimes } from 'react-icons/fa';
import Hls from 'hls.js';
import SEO from '../components/SEO';

interface Channel {
    team_home: string; // Channel Name
    team_away: string;
    time: string;
    status: string;
    url: string; // Stream URL
    logo_home: string; // Channel Logo
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
            .then(data => {
                setChannels(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (playingChannel && videoRef.current) {
            if (Hls.isSupported()) {
                if (hlsRef.current) hlsRef.current.destroy();
                const hls = new Hls();
                // Ensure we use the proxy URL correctly if needed
                hls.loadSource(playingChannel.url);
                hls.attachMedia(videoRef.current);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    videoRef.current?.play().catch(e => console.error(e));
                });
                hlsRef.current = hls;
            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                videoRef.current.src = playingChannel.url;
                videoRef.current.play().catch(e => console.error(e));
            }
        }
        return () => {
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, [playingChannel]);

    return (
        <div className="min-h-screen bg-deep-slate-900 text-text-main font-outfit dir-rtl">
            <SEO 
                title="البث المباشر | مباريات اليوم | LMINA Live"
                description="تابع البث المباشر لأهم القنوات الرياضية والمباريات العالمية بجودة عالية وبدون تقطيع على LMINA. قنوات بين سبورت بجودات متعددة."
                url="/matches"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "LiveBlogPosting",
                    "headline": "بث مباشر للمباريات والقنوات الرياضية",
                    "description": "بث حي ومباشر للمنافسات الرياضية العالمية",
                    "publisher": {
                        "@type": "Organization",
                        "name": "LMINA Live"
                    }
                }}
            />
            
            <div className="pt-24 px-4 md:px-12 max-w-7xl mx-auto pb-20">
                <div className="flex items-center gap-4 mb-8 animate-fade-in-down" role="banner">
                    <div className="w-1.5 h-12 bg-gradient-to-b from-ice-mint to-ice-mint-active rounded-full shadow-[0_0_15px_rgba(127,255,212,0.4)]"></div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                            البث المباشر
                        </h1>
                        <p className="text-text-muted text-sm md:text-base">
                            شاهد أفضل القنوات الرياضية بجودة عالية
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                         <div className="w-12 h-12 border-4 border-deep-slate-700 border-t-ice-mint rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {channels.map((channel, idx) => (
                            <div key={idx} className="group relative overflow-hidden bg-deep-slate-800 border border-deep-slate-border rounded-2xl p-4 hover:border-ice-mint/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-deep-slate-900/80 via-transparent to-transparent opacity-50"></div>
                                
                                <div className="relative flex flex-col items-center gap-4 z-10">
                                    <div className="w-full aspect-video bg-deep-slate-900/50 rounded-xl overflow-hidden relative flex items-center justify-center border border-white/5 group-hover:border-ice-mint/30 transition-colors">
                                        <img 
                                            src={channel.logo_home || "https://placehold.co/300x200/1C2530/FFF?text=TV"} 
                                            alt={channel.team_home} 
                                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                                            loading="lazy"
                                        />
                                        
                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                            <button 
                                                onClick={() => setPlayingChannel(channel)}
                                                className="w-14 h-14 bg-ice-mint text-deep-slate-900 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(127,255,212,0.4)] hover:scale-110 transition-transform hover:bg-white"
                                            >
                                                <FaPlay size={20} className="ml-1" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full text-center">
                                        <h3 className="font-bold text-lg text-white group-hover:text-ice-mint transition-colors truncate px-2">
                                            {channel.team_home}
                                        </h3>
                                        <div className="flex items-center justify-center gap-2 mt-3">
                                            <span className="relative flex h-2.5 w-2.5">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ice-mint opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ice-mint"></span>
                                            </span>
                                            <span className="text-xs text-ice-mint/80 font-mono tracking-wider font-bold">LIVE STREAM</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Video Modal */}
            {playingChannel && (
                <div className="fixed inset-0 z-[100] bg-deep-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-5xl bg-deep-slate-800 rounded-2xl overflow-hidden border border-deep-slate-border shadow-2xl relative flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-deep-slate-border bg-deep-slate-900/50">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                <h3 className="font-bold text-lg text-white">{playingChannel.team_home}</h3>
                            </div>
                            <button 
                                onClick={() => setPlayingChannel(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-muted hover:text-white"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="relative aspect-video bg-black">
                            <video 
                                ref={videoRef}
                                className="w-full h-full"
                                controls
                                autoPlay
                                playsInline
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
