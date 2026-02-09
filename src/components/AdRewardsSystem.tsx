import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { redeemReward, trackWatchTime } from '../services/api';

const AdRewardsSystem = ({ contentId }: { contentId: string }) => {
  const { user, refreshStatus } = useUser();
  const [showRewardsPanel, setShowRewardsPanel] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  // تتبع وقت المشاهدة التفاعلي
  useEffect(() => {
    if (!user) return;

    let interval: NodeJS.Timeout;
    if (watchTime < 60) { // تتبع أول 60 دقيقة فقط
      interval = setInterval(async () => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          // منح نقاط بناءً على وقت المشاهدة
          if (newTime % 5 === 0) { // كل 5 دقائق
            trackWatchTime(user.id, 5);
            refreshStatus();
          }
          return newTime;
        });
      }, 60000); // كل دقيقة
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, watchTime, refreshStatus]);

  const claimAdReward = async (rewardType: 'points' | 'time' | 'bonus') => {
    if (!user) return;

    try {
      switch(rewardType) {
        case 'points':
          // في الواقع، هذه الوظيفة ستكون في الخادم للتحقق من الإعلان
          // هذا فقط عرض تقديمي
          alert('تم مشاهدة الإعلان وتحقيق النقاط!');
          refreshStatus();
          break;
        case 'time':
          alert('تم الحصول على 10 دقائق إضافية بدون إعلانات!');
          break;
        case 'bonus':
          alert('تم الحصول على مكافأة خاصة!');
          break;
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const toggleRewardsPanel = () => {
    setShowRewardsPanel(!showRewardsPanel);
  };

  const startAd = () => {
    setIsWatchingAd(true);
    setAdProgress(0);
    
    // محاكاة تقدم الإعلان
    const adInterval = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(adInterval);
          setIsWatchingAd(false);
          // منح مكافأة بعد مشاهدة الإعلان بالكامل
          setTimeout(() => {
            alert('تم مشاهدة الإعلان بالكامل! تم منح 25 نقطة.');
            refreshStatus();
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleRewardsPanel}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        title="نظام جزاءات الإعلانات"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {showRewardsPanel && (
        <div className="fixed bottom-32 right-4 z-50 w-80 bg-black/90 backdrop-blur-lg rounded-2xl border border-white/20 p-4 text-white shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">نظام جزاءات الإعلانات</h3>
            <button 
              onClick={toggleRewardsPanel}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-3 bg-white/10 rounded-xl">
            <div className="flex justify-between text-sm mb-1">
              <span>وقت المشاهدة: {Math.floor(watchTime / 60)}:{String(watchTime % 60).padStart(2, '0')}</span>
              <span>نقاط: {user?.points || 0}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((watchTime / 60) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={startAd}
              disabled={isWatchingAd}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                isWatchingAd 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>شاهد إعلان مقابل 25 نقطة</span>
            </button>

            {isWatchingAd && (
              <div className="p-3 bg-blue-900/50 rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                  <span>جاري مشاهدة الإعلان...</span>
                  <span>{adProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all" 
                    style={{ width: `${adProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              onClick={() => claimAdReward('time')}
              className="w-full p-3 rounded-xl flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>10 دقائق بدون إعلانات (100 نقطة)</span>
            </button>

            <button
              onClick={() => user && (user.points || 0) >= 500 ? claimAdReward('bonus') : null}
              disabled={(user?.points || 0) < 500}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                (user?.points || 0) >= 500
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gray-700 opacity-50 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>مكافأة خاصة (500 نقطة)</span>
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-400">
            <p>• اربح نقاط بمشاهدة المحتوى</p>
            <p>• اربح نقاط إضافية بمشاهدة الإعلانات</p>
            <p>• استخدم النقاط لتحسين تجربتك</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdRewardsSystem;