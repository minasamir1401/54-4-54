import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { fetchDetails, Details, Server, trackWatchTime } from '../services/api';
import { FaArrowRight, FaDownload, FaExclamationTriangle, FaListUl, FaTv, FaRedo } from 'react-icons/fa';
import SEO from '../components/SEO';
import { useUser } from '../hooks/useUser';
import CommentsSystem from '../components/CommentsSystem';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [data, setData] = useState<Details | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverLoading, setServerLoading] = useState(false);
  const [activeServer, setActiveServer] = useState<Server | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failedServers, setFailedServers] = useState<Set<string>>(new Set());
  const [showEpisodes, setShowEpisodes] = useState(window.innerWidth > 1024);
  
  const [showShield, setShowShield] = useState(true);
  const [shieldActive, setShieldActive] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [activeSeason, setActiveSeason] = useState<number | null>(null);
  const [kidsMode, setKidsMode] = useState(localStorage.getItem('kidsMode') === 'true');
  const { user, refreshStatus } = useUser();

  // Listen to Kids Mode changes
  useEffect(() => {
    const handleKidsChange = () => {
      setKidsMode(localStorage.getItem('kidsMode') === 'true');
    };
    window.addEventListener('kidsModeChange', handleKidsChange);
    return () => window.removeEventListener('kidsModeChange', handleKidsChange);
  }, []);

  // Watch Time Tracking logic
  useEffect(() => {
    let interval: any;
    if (user) {
        interval = setInterval(async () => {
            if (!document.hidden) {
                await trackWatchTime(user.id, 5);
                refreshStatus();
            }
        }, 5 * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [user]);

  // Schema Injection
  useEffect(() => {
    if (data && (data as any).schema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify((data as any).schema);
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [data]);

  const fetchData = async (targetId: string) => {
      setLoading(true);
      setError(null);
      setData(null); // CRITICAL: Reset data to avoid UI race conditions
      setActiveServer(null); // CRITICAL: Reset active server
      setFailedServers(new Set());

      
      try {
          const d = await fetchDetails(targetId);
          if (d.error === 'timeout') {
              setError(d.message || "السيرفر مشغول حالياً، حاول مرة أخرى.");
              return;
          }
          if (!d || !d.title) throw new Error("بيانات المحتوى غير مكتملة");
          
          const safeData: Details = {
              ...d,
              servers: Array.isArray(d.servers) ? d.servers : [],
              episodes: Array.isArray(d.episodes) ? d.episodes : [],
              download_links: Array.isArray(d.download_links) ? d.download_links : []
          };
          
          // Critical data is loaded immediately for fast perception
          setData(safeData);
          if (safeData.servers.length > 0) {
              setActiveServer(safeData.servers[0]);
          }

          // Set initial season if multiple exist
          if (safeData.seasons && safeData.seasons.length > 0) {
             // Try to find which season the current episode belongs to
             const currentSeason = safeData.seasons.find(s => s.episodes.some(e => e.id === targetId));
             setActiveSeason(currentSeason?.number || safeData.seasons[0].number);
          }

          // Save to History
          const historyItem = {
              id: targetId,
              title: safeData.title,
              poster: safeData.poster,
              type: safeData.type
          };
          const saved = localStorage.getItem('watch_history');
          let history = saved ? JSON.parse(saved) : [];
          // Remove if already exists and add to front
          history = [historyItem, ...history.filter((h: any) => h.id !== targetId)].slice(0, 20);
          localStorage.setItem('watch_history', JSON.stringify(history));
          
          // Critical data is loaded immediately for fast perception
          
          // Simulate immediate loading feeling
          setTimeout(() => {
              setLoading(false);
          }, 100); // Feel instant
          
          // All data is loaded immediately now
          
      } catch (err) {
          console.error(err);
          setError("خطأ في جلب البيانات، تأكد من الاتصال وحاول مجدداً.");
          setLoading(false);
      }
  };

  useEffect(() => {
     if (id) {
         fetchData(id);
         setShowShield(true);
         setShieldActive(false);
         window.scrollTo(0, 0);
     }
  }, [id]);

  useEffect(() => {
    if (activeServer && activeServer.type === 'video' && videoRef.current) {
        setServerLoading(true);
        // Use direct_url if available, otherwise fallback to url
        const url = activeServer.direct_url || activeServer.url;
        const video = videoRef.current;
        let hls: Hls | null = null;
        
        const onError = () => {
            console.warn("Video Error, switching...");
            handlePlaybackError();
        };

        try {
            if (url.includes('.m3u8') && Hls.isSupported()) {
               hls = new Hls({
                   xhrSetup: (xhr) => { xhr.withCredentials = false; } 
               });
               hls.loadSource(url);
               hls.attachMedia(video);
               hls.on(Hls.Events.MANIFEST_PARSED, () => setServerLoading(false));
               hls.on(Hls.Events.ERROR, (_, data) => { 
                   if (data.fatal) onError(); 
               });
            } else {
               video.src = url;
               video.onloadeddata = () => setServerLoading(false);
               video.onerror = onError;
            }
        } catch (e) {
            onError();
        }

        return () => { if (hls) hls.destroy(); };
    } else if (activeServer?.type === 'iframe') {
        setServerLoading(true);
        // Set a timeout to hide the loader assuming success
        setTimeout(() => {
            if (activeServer && (failedServers.size === 0 || !failedServers.has(activeServer.url))) {
                setServerLoading(false);
            }
        }, 3000);
    }
  }, [activeServer]);

  const handlePlaybackError = () => {
    if (activeServer && data) {
        const nextFailed = new Set(failedServers);
        nextFailed.add(activeServer.url);
        setFailedServers(nextFailed);
        
        // DISABLED: Automatic server switching
        // Keep the current server marked as failed but don't switch automatically
        setServerLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-transparent text-white flex flex-col font-sans dir-rtl">
      {/* Skeleton Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#060606]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-white/10 rounded-lg animate-pulse flex-1 mx-4 max-w-md"></div>
              <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-24">
          <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Skeleton Player Section */}
              <div className="flex-1 space-y-6">
                  <div className="relative aspect-video bg-black/50 rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-pulse" style={{ minHeight: '300px' }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 border-4 border-amber-600/30 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                  </div>

                  {/* Skeleton Servers */}
                  <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 animate-pulse" style={{ minHeight: '150px' }}>
                      <div className="flex items-center justify-between mb-4">
                          <div className="h-4 bg-white/10 rounded w-32"></div>
                          <div className="w-5 h-5 bg-white/10 rounded"></div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {[...Array(4)].map((_, i) => (
                              <div key={i} className="h-12 bg-white/10 rounded-xl"></div>
                          ))}
                      </div>
                  </div>

                  {/* Skeleton Info */}
                  <div className="space-y-4">
                      <div className="h-8 bg-white/10 rounded w-3/4 animate-pulse"></div>
                      <div className="space-y-2">
                          <div className="h-4 bg-white/10 rounded w-full animate-pulse"></div>
                          <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse"></div>
                          <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse"></div>
                      </div>
                  </div>
              </div>

              {/* Skeleton Episodes Sidebar */}
              <div className="lg:w-80 shrink-0">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden sticky top-24 animate-pulse">
                      <div className="w-full p-4 flex items-center justify-between bg-white/5">
                          <div className="h-4 bg-white/10 rounded w-40"></div>
                          <div className="w-5 h-5 bg-white/10 rounded"></div>
                      </div>
                      <div className="p-2 space-y-2">
                          {[...Array(8)].map((_, i) => (
                              <div key={i} className="w-full h-14 bg-white/10 rounded-xl"></div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </main>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-8 text-center">
        <FaExclamationTriangle className="text-amber-500 text-5xl mb-6" />
        <h2 className="text-2xl font-bold mb-4">حدث خطأ</h2>
        <p className="text-gray-400 mb-8 max-w-md">{error || "تعذّر تحميل المحتوى"}</p>
        <div className="flex gap-4">
             <button onClick={() => id && fetchData(id)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition-all">
                <FaRedo /> إعادة المحاولة
             </button>
             <button onClick={() => navigate('/')} className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 rounded-xl font-bold transition-all">
                الرئيسية
             </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col font-sans dir-rtl">
      {data && (
        <SEO 
          title={data.title}
          description={data.description || `مشاهدة ${data.title} مترجم بجودة عالية على LMINA`}
          image={data.poster}
          type={data.type === 'series' ? 'video.tv_show' : 'video.movie'}
          url={`/watch/${id}`}
          structuredData={{
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": data.title,
            "description": data.description,
            "thumbnailUrl": [data.poster],
            "uploadDate": new Date().toISOString(),
            "embedUrl": `${window.location.origin}/watch/${id}`,
            "interactionStatistic": {
              "@type": "InteractionCounter",
              "interactionType": { "@type": "https://schema.org/WatchAction" },
              "userInteractionCount": 1500
            }
          }}
        />
      )}
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#060606]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
              <button 
                  onClick={() => navigate(-1)} 
                  aria-label="الرجوع للصفحة السابقة"
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                  <FaArrowRight aria-hidden="true" />
              </button>
              <h1 className="text-lg font-bold truncate mx-4">{data?.title || <div className="h-6 bg-white/10 rounded w-48 animate-pulse"></div>}</h1>
              <div className="w-8"></div>
          </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-20 sm:py-24">
          <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Player Section - Load immediately for fast perception */}
              <div className="flex-1 space-y-4 sm:space-y-6">
                  <div className="relative aspect-video bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group" style={{ minHeight: '200px' }}>
                      {serverLoading && (
                          <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center">
                              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                                  {activeServer ? `جاري الاتصال بـ ${activeServer.name}` : 'جاري التحضير...'}
                              </p>
                          </div>
                      )}
                      
                      {activeServer && failedServers.has(activeServer.url) ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-center p-6">
                             <FaExclamationTriangle className="text-yellow-500 text-4xl mb-4" />
                             <p className="text-sm font-bold text-gray-300 mb-4">هذا السيرفر لا يعمل حالياً</p>
                             <button 
                                onClick={handlePlaybackError}
                                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold"
                             >
                                تجربة السيرفر التالي تلقائياً
                             </button>
                          </div>
                      ) : activeServer ? (
                          activeServer.type === 'iframe' ? (
                              // Enhanced server validation to check for various issues
                              (() => {
                                  return (
                                      <div className="relative w-full h-full">
                                          {showShield && (
                                              <div 
                                                  className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer group/shield"
                                                  onClick={() => {
                                                      setShowShield(false);
                                                      setShieldActive(true);
                                                  }}
                                              >
                                                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/40 group-hover/shield:scale-110 transition-transform duration-500">
                                                      <FaTv className="text-3xl text-black ml-1" />
                                                  </div>
                                                  <p className="mt-6 text-white font-black italic text-xl tracking-tighter uppercase">اضغط لبدء المشاهدة الآمنة</p>
                                                  <p className="mt-2 text-white/40 text-xs font-bold uppercase tracking-widest">نظام حماية من الإعلانات المنبثقة مفعل</p>
                                              </div>
                                          )}
                                          
                                          <iframe 
                                              key={activeServer.url}
                                              src={activeServer.url} 
                                              title={`مشغل فيديو - ${data.title}`}
                                              className={`w-full h-full border-0 ${!shieldActive ? 'pointer-events-none' : ''}`} 
                                              allowFullScreen 
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
                                              referrerPolicy="no-referrer-when-downgrade"
                                              loading="lazy"
                                              onLoad={() => {
                                                  setServerLoading(false);
                                              }}
                                          />
                                          
                                          {shieldActive && (
                                              <div className="absolute top-4 left-4 z-40 bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none">
                                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">درع الحماية نشط</span>
                                              </div>
                                          )}
                                      </div>
                                  );
                              })()
                          ) : (
                              <div className="relative w-full h-full">
                                  <video 
                                      key={activeServer.direct_url || activeServer.url}
                                      ref={videoRef} 
                                      controls 
                                      autoPlay 
                                      className="w-full h-full"
                                  />
                                  <div className="absolute top-4 right-4 z-40 flex gap-2">
                                      <button 
                                          onClick={() => videoRef.current?.requestPictureInPicture()}
                                          title="Picture in Picture"
                                          className="bg-black/60 hover:bg-black/90 p-2 rounded-lg backdrop-blur-md border border-white/10 transition-all text-xs"
                                      >
                                          PIP
                                      </button>
                                      <button 
                                          onClick={() => setLightsOff(!lightsOff)}
                                          title="Lights Off"
                                          className={`bg-black/60 hover:bg-black/90 p-2 rounded-lg backdrop-blur-md border border-white/10 transition-all text-xs ${lightsOff ? 'text-yellow-500' : 'text-white'}`}
                                      >
                                          {lightsOff ? 'Lights On' : 'Lights Off'}
                                      </button>
                                  </div>
                              </div>
                          )
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-500 font-bold">
                              لا يوجد سيرفر مختار
                          </div>
                      )}
                  </div>

                  {/* Servers - Load immediately as they're critical for playback */}
                  <div className="bg-zinc-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5" style={{ minHeight: '120px' }}>
                      <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">سيرفرات المشاهدة</span>
                           <FaTv className="text-amber-500" />
                      </div>
                      <ul className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {data.servers.map((srv, idx) => {
                              const isFailed = failedServers.has(srv.url);
                              const isActive = activeServer?.url === srv.url;
                              
                                  return (
                                      <li key={idx}>
                                          <button
                                              onClick={() => { 
                                                  // Clear server from failed list when manually selected
                                                  if (failedServers.has(srv.url)) {
                                                      const newFailed = new Set(failedServers);
                                                      newFailed.delete(srv.url);
                                                      setFailedServers(newFailed);
                                                  }
                                                  setShowShield(true);
                                                  setShieldActive(false);
                                                  setActiveServer(srv); 
                                                  setServerLoading(true); 
                                              }}
                                              className={`w-full p-2 sm:p-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all border ${
                                                  isActive 
                                                     ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20' 
                                                    : isFailed
                                                        ? 'bg-amber-900/10 border-amber-900/20 text-amber-500 opacity-50 cursor-not-allowed'
                                                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                              }`}
                                              disabled={isFailed}
                                          >
                                              {srv.name} {isFailed && '(عطل)'}
                                          </button>
                                      </li>
                                  );
                          })}
                      </ul>
                  </div>

                  {/* Info - Deferred loading for non-critical content */}
                  <div className="space-y-3 sm:space-y-4 text-center sm:text-right">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black px-2 sm:px-0">{data.title}</h2>
                      
                      {/* AI Summary Section */}
                      {data.ai_summary && (
                          <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-right">
                               <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">ملخص ذكي (AI Summary)</h4>
                              <p className="text-sm text-gray-300 italic leading-relaxed">
                                  "{data.ai_summary}"
                              </p>
                          </div>
                      )}

                      <p className="text-gray-400 leading-relaxed text-sm">{data.description}</p>
                      
                                {/* Recommendations Sidebar / Grid */}
                                {data.recommendations && data.recommendations.length > 0 && (
                                    <div className={`mt-12 p-6 rounded-[2.5rem] transition-all duration-500 ${kidsMode ? 'bg-white border-4 border-dashed border-blue-200 shadow-xl relative overflow-hidden' : ''}`}>
                                        {kidsMode && (
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 animate-rainbow-flow bg-[length:200%_auto]"></div>
                                        )}
                                        <h3 className={`text-xl font-black mb-6 text-right flex items-center justify-end gap-3 ${kidsMode ? 'text-indigo-600 animate-bounce-slow' : 'text-white'}`}>
                                            {kidsMode ? 'مغامرات ممتعة لك ✨' : 'قد يعجبك أيضاً'}
                                            <div className={`w-1 h-6 rounded-full ${kidsMode ? 'bg-pink-400' : 'bg-indigo-600'}`} />
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                                            {data.recommendations
                                                .filter(rec => {
                                                    if (!kidsMode) return true;
                                                    const title = rec.title.toLowerCase();
                                                    const keywords = ['كرتون', 'انمي', 'مدبلج', 'اطفال', 'باربي', 'ديزني', 'سبيستون', 'نتورك', 'anime', 'cartoon', 'kids', 'dubbed', 'مغامرات'];
                                                    return keywords.some(k => title.includes(k));
                                                })
                                                .slice(0, 10)
                                                .map((rec) => (
                                                <div 
                                                    key={rec.id} 
                                                    onClick={() => navigate(`/watch/${rec.id}`)}
                                                    className={`cursor-pointer group relative aspect-[2/3] rounded-[2rem] overflow-hidden transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                                                        kidsMode 
                                                        ? 'border-4 border-white shadow-lg bg-indigo-50 hover:rotate-2' 
                                                        : 'shadow-lg hover:ring-2 hover:ring-indigo-600'
                                                    }`}
                                                >
                                                    <img src={rec.poster} alt={rec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent transition-opacity p-4 flex flex-col justify-end ${kidsMode ? 'from-white/95' : 'from-black'}`}>
                                                        <p className={`font-black truncate ${kidsMode ? 'text-indigo-700 text-sm' : 'text-white text-[10px]'}`}>{rec.title}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                       
                    {/* Better Download Section - Show all download links immediately */}
                    {data.download_links && data.download_links.length > 0 && (
                        <div className={`rounded-[3rem] p-8 sm:p-12 border transition-all duration-500 relative overflow-hidden group ${
                            kidsMode 
                            ? 'bg-white border-blue-100 shadow-2xl' 
                            : 'bg-gradient-to-br from-amber-900/40 to-black border-amber-500/20 shadow-amber-500/10'
                        }`}>
                            {kidsMode && (
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                            )}
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center border-4 transition-all duration-500 ${
                                        kidsMode 
                                        ? 'bg-blue-400 border-white shadow-lg animate-bounce' 
                                        : 'bg-amber-600/20 border-amber-600/30'
                                    }`}>
                                        <FaDownload className={`${kidsMode ? 'text-white text-2xl' : 'text-amber-400 text-lg'}`} />
                                    </div>
                                    <h3 className={`text-2xl font-black italic tracking-tighter uppercase ${kidsMode ? 'text-blue-500' : 'text-amber-100'}`}>
                                        {kidsMode ? 'حفظ المغامرة 🎈' : 'روابط التحميل المباشر'}
                                    </h3>
                                </div>
                            </div>
 
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                {data.download_links.map((dl, i) => (
                                    <li key={i}>
                                        <a 
                                            href={dl.url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className={`flex items-center justify-between p-6 rounded-[2rem] w-full transition-all duration-300 group/btn border-4 ${
                                                kidsMode 
                                                ? 'bg-blue-50 border-white hover:bg-pink-50 hover:border-pink-200 hover:scale-105 shadow-md' 
                                                : 'bg-amber-950/20 border-white/5 hover:bg-amber-600/10 hover:border-amber-600/30 hover:-translate-y-1'
                                            }`}
                                        >
                                            <span className={`transition-colors ${kidsMode ? 'text-blue-400' : 'text-amber-400 group-hover/btn:text-amber-300'}`}>
                                                <FaDownload className={`${kidsMode ? 'text-xl' : 'text-xs'}`} />
                                            </span>
                                            <div className="text-right">
                                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${
                                                    kidsMode ? 'text-pink-400' : 'text-amber-500/50 group-hover/btn:text-amber-400'
                                                }`}>
                                                    {kidsMode ? 'جودة مدهشة' : 'تحميل مباشر'}
                                                </p>
                                                <p className={`text-lg font-black transition-colors ${
                                                    kidsMode ? 'text-blue-600' : 'text-white group-hover/btn:text-amber-100'
                                                }`}>
                                                    {dl.quality || 'Link'}
                                                </p>
                                            </div>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                  {/* Comments System */}
                  {id && (
                      <CommentsSystem contentId={id} />
                  )}
                  </div>
              </div>

              {/* Episodes Sidebar - Show all episodes immediately */}
              {data.type === 'series' && (
                  <div className="lg:w-80 shrink-0">
                      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden sticky top-24">
                          <button 
                             onClick={() => setShowEpisodes(!showEpisodes)}
                             className="w-full p-4 flex items-center justify-between text-right bg-white/5 hover:bg-white/10"
                          >
                             <span className="text-xs font-bold text-gray-400">قائمة الحلقات ({data.episodes.length})</span>
                             <FaListUl className="text-amber-500" />
                          </button>
                          
                          {/* Season Tabs */}
                          {data.seasons && data.seasons.length > 1 && (
                              <div className="flex overflow-x-auto p-2 gap-2 bg-black/20 border-b border-white/5 custom-scrollbar">
                                  {data.seasons.map(s => (
                                      <button
                                          key={s.number}
                                          onClick={() => setActiveSeason(s.number)}
                                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all flex-shrink-0 border ${
                                              activeSeason === s.number 
                                              ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20' 
                                              : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                                          }`}
                                      >
                                          الجزء {s.number}
                                      </button>
                                  ))}
                              </div>
                          )}

                          {(showEpisodes || window.innerWidth > 1024) && (
                              <ul className="max-h-[500px] overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                  {(() => {
                                      const getEpNo = (ep: any) => {
                                          if (ep.episode && !isNaN(parseInt(ep.episode))) return parseInt(ep.episode);
                                          const m = String(ep.title).match(/\d+/);
                                          return m ? parseInt(m[0]) : 0;
                                      };
                                      
                                      // Filter episodes by active season if it exists
                                      const displayEpisodes = data.seasons && activeSeason 
                                          ? data.seasons.find(s => s.number === activeSeason)?.episodes || data.episodes
                                          : data.episodes;

                                      return [...displayEpisodes]
                                          .sort((a, b) => getEpNo(b) - getEpNo(a))
                                          .map(ep => {
                                              const isActive = ep.id === id;
                                              const epNo = getEpNo(ep);
                                              return (
                                                  <li key={ep.id}>
                                                      <button
                                                          onClick={() => navigate(`/watch/${ep.id}`)}
                                                          className={`w-full p-4 rounded-xl flex flex-row-reverse items-center gap-4 text-right transition-all border ${
                                                              isActive 
                                                              ? 'bg-amber-500 border-amber-500 text-black shadow-xl shadow-amber-500/20' 
                                                              : 'bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/10'
                                                          }`}
                                                      >
                                                          <span className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-xs font-black
                                                                         ${isActive ? 'bg-white/20' : 'bg-black/40'}`}>
                                                              {epNo || '?'}
                                                          </span>
                                                          <span className="flex-1 text-[11px] font-bold truncate">{ep.title}</span>
                                                      </button>
                                                  </li>
                                              );
                                          });
                                  })()}
                              </ul>
                          )}
                      </div>
                  </div>
              )}
          </div>
      </main>

      {/* Lights Off Overlay */}
      {lightsOff && (
          <div 
              className="fixed inset-0 bg-black/95 z-[60] backdrop-blur-3xl transition-all duration-700 pointer-events-none"
              style={{ opacity: 0.95 }}
          />
      )}
      
      {/* Styles for Lights Off Player */}
      <style>{`
          ${lightsOff ? `
              main { position: relative; z-index: 70; }
              .aspect-video { box-shadow: 0 0 100px rgba(245, 158, 11, 0.4); border: 1px solid rgba(245, 158, 11, 0.5) !important; }
              header, nav, .sidebar, .info-section { opacity: 0.1; pointer-events: none; transition: all 1s; }
          ` : ''}
      `}</style>
    </div>
  );
};

export default Watch;
