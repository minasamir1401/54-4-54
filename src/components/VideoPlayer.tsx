
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { FaPlay, FaPause, FaExpand, FaFastForward, FaFastBackward, FaVolumeUp, FaVolumeMute, FaCog } from 'react-icons/fa';

interface VideoPlayerProps {
    url: string;
    poster?: string;
    onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, poster, onEnded }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isBuffering, setIsBuffering] = useState(true);
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !url) return;

        if (Hls.isSupported() && (url.includes('.m3u8') || !url.includes('.mp4'))) {
            const hls = new Hls({
                maxBufferSize: 30 * 1024 * 1024,
                enableWorker: true,
            });
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // Future: Setup manual quality switcher
                video.play().catch(() => setIsPlaying(false));
                setIsPlaying(true);
                setIsBuffering(false);
            });
            hls.on(Hls.Events.FRAG_BUFFERED, () => setIsBuffering(false));
            hls.on(Hls.Events.ERROR, () => setIsBuffering(false));
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play().catch(() => setIsPlaying(false));
        } else {
            video.src = url;
            video.play().catch(() => setIsPlaying(false));
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
            // Clean up event listener if set for non-HLS videos
            if (video) {
                video.onloadedmetadata = null;
            }
        };
    }, [url]);

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };

    const handleProgress = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            setProgress((current / total) * 100);
            setDuration(total);
        }
    };

    const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = (parseFloat(e.target.value) / 100) * duration;
        if (videoRef.current) videoRef.current.currentTime = time;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const skip = (seconds: number) => {
        if (videoRef.current) videoRef.current.currentTime += seconds;
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden group border border-white/5 shadow-2xl"
            onMouseMove={() => {
                setShowControls(true);
                // Hide controls after 3 seconds of inactivity
                clearTimeout((window as any).controlsTimeout);
                (window as any).controlsTimeout = setTimeout(() => setShowControls(false), 3000);
            }}
        >
            <video
                ref={videoRef}
                poster={poster}
                className="w-full h-full cursor-pointer"
                onTimeUpdate={handleProgress}
                onClick={togglePlay}
                onEnded={onEnded}
                playsInline
            />

            {/* Premium Overlay UI */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-500 flex flex-col justify-end p-6 ${showControls ? 'opacity-100' : 'opacity-0'}`}>

                {/* Progress Bar */}
                <div className="relative w-full h-1.5 mb-6 group/progress">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={seek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 bg-white/20 rounded-full" />
                    <div
                        className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full flex items-center justify-end"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="w-3 h-3 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-lg shadow-indigo-500/50" />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors text-2xl">
                            {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>

                        <div className="flex items-center gap-4 text-white/80 text-lg">
                            <button onClick={() => skip(-10)}><FaFastBackward /></button>
                            <button onClick={() => skip(10)}><FaFastForward /></button>
                        </div>

                        <div className="flex items-center gap-3 text-sm font-bold text-white/60 font-mono">
                            <span>{Math.floor((videoRef.current?.currentTime || 0) / 60)}:{Math.floor((videoRef.current?.currentTime || 0) % 60).toString().padStart(2, '0')}</span>
                            <span>/</span>
                            <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 group/volume">
                            <button onClick={() => setIsMuted(!isMuted)} className="text-white/80 hover:text-white text-xl">
                                {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                            </button>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-0 group-hover/volume:w-20 transition-all cursor-pointer accent-indigo-500"
                            />
                        </div>

                        <button className="text-white/80 hover:text-white text-xl">
                            <FaCog />
                        </button>

                        <button onClick={toggleFullscreen} className="text-white/80 hover:text-white text-xl">
                            <FaExpand />
                        </button>
                    </div>
                </div>
            </div>

            {/* Buffer Indicator */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-30">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Play/Pause Large Icons (Center) */}
            <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300 ${isPlaying ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}
                style={{ visibility: showControls || !isPlaying ? 'visible' : 'hidden' }}
            >
                {!isPlaying && (
                    <div className="w-20 h-20 bg-indigo-600/20 backdrop-blur-md rounded-full flex items-center justify-center border border-indigo-500/30">
                        <FaPlay className="text-indigo-500 ml-1 text-3xl" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;
