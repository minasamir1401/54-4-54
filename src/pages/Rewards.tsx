import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaGift, FaUserFriends, FaCheckCircle, FaClock, FaStar, FaShareAlt, FaShieldAlt } from 'react-icons/fa';
import { useUser } from '../hooks/useUser';
import { redeemReward, redeemPromo } from '../services/api';
import SEO from '../components/SEO';

const Rewards = () => {
    const { user, refreshStatus, getReferralLink } = useUser();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [promoCode, setPromoCode] = useState('');


    const rewards = [
        { id: 'ad_free_1d', name: 'اشتراك يومي (بدون إعلانات)', cost: 700, icon: <FaClock className="text-blue-400" />, duration: '24 ساعة' },
        { id: 'ad_free_1w', name: 'اشتراك أسبوعي (بدون إعلانات)', cost: 3000, icon: <FaStar className="text-purple-400" />, duration: '7 أيام' },
        { id: 'ad_free_1m', name: 'اشتراك شهري (بدون إعلانات)', cost: 10000, icon: <FaShieldAlt className="text-[#7fffd4]" />, duration: '30 يوم' },
        { id: 'fan_badge', name: 'شارة المعجب الذهبية', cost: 100000, icon: <FaGift className="text-yellow-400" />, duration: 'دائم' },
    ];

    const handleRedeem = async (type: string, cost: number) => {
        if (!user || user.points < cost) {
            setMessage({ text: 'نقاطك غير كافية لعملية الاستبدال', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await redeemReward(user.id, type);
            setMessage({ text: 'تم استبدال المكافأة بنجاح! استمتع بمشاهدة خالية من الإعلانات.', type: 'success' });
            refreshStatus();
        } catch (e) {
            setMessage({ text: 'حدث خطأ أثناء الاستبدال، يرجى المحاولة لاحقاً.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePromoRedeem = async () => {
        if (!user || !promoCode.trim()) return;

        setLoading(true);
        try {
            await redeemPromo(user.id, promoCode.trim());
            setMessage({ text: 'مبروك! تم تفعيل كود الهدية بنجاح. اشتراكك الآن مفعل لمدة شهر مجاناً.', type: 'success' });
            setPromoCode('');
            refreshStatus();
        } catch (e: any) {
            setMessage({ text: typeof e === 'string' ? e : 'كود غير صالح أو تم استخدامه مسبقاً', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const copyReferral = () => {
        const link = getReferralLink();
        navigator.clipboard.writeText(link);
        setMessage({ text: 'تم نسخ رابط الإحالة! شاركه مع أصدقائك لربح النقاط.', type: 'success' });
    };

    const isAdFree = user && user.ad_free_until > (Date.now() / 1000);

    return (
        <div className="min-h-screen pt-20 md:pt-32 pb-20 px-2 md:px-12 bg-[#05070a]">
            <SEO title="نظام المكافأت والربح | MOVIDO" description="اجمع النقاط من مشاهدة الأفلام ومشاركة الروابط واستبدلها باشتراكات مميزة بدون إعلانات." />

            <div className="max-w-6xl mx-auto">
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8 mb-8 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-3 md:p-8 rounded-xl md:rounded-[3rem] border-[#7fffd4]/10 flex items-center gap-3 md:gap-6"
                    >
                        <div className="w-10 h-10 md:w-20 md:h-20 rounded-lg md:rounded-[2rem] bg-[#7fffd4]/10 flex items-center justify-center text-lg md:text-4xl text-[#7fffd4] shrink-0">
                            <FaCoins />
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-500 text-[7px] md:text-sm font-black uppercase tracking-widest mb-0.5 truncate">نقاطك الحالية</p>
                            <h2 className="text-xl md:text-4xl font-black text-white tabular-nums truncate">{user?.points || 0}</h2>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel p-3 md:p-8 rounded-xl md:rounded-[3rem] border-white/5 flex items-center gap-3 md:gap-6"
                    >
                        <div className="w-10 h-10 md:w-20 md:h-20 rounded-lg md:rounded-[2rem] bg-pink-500/10 flex items-center justify-center text-lg md:text-4xl text-pink-500 shrink-0">
                            <FaClock />
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-500 text-[7px] md:text-sm font-black uppercase tracking-widest mb-0.5 truncate">وقت المشاهدة</p>
                            <h2 className="text-lg md:text-3xl font-black text-white italic truncate">{((user?.watch_time_total || 0) / 3600).toFixed(1)} <span className="text-[8px] opacity-40">ساعة</span></h2>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-panel p-3 md:p-8 rounded-xl md:rounded-[3rem] border-white/5 flex items-center gap-3 md:gap-6"
                    >
                        <div className={`w-10 h-10 md:w-20 md:h-20 rounded-lg md:rounded-[2rem] flex items-center justify-center text-lg md:text-4xl shrink-0 ${isAdFree ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                            <FaShieldAlt />
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-500 text-[7px] md:text-sm font-black uppercase tracking-widest mb-0.5 truncate">حالة الاشتراك</p>
                            <h2 className={`text-xs md:text-xl font-black italic truncate ${isAdFree ? 'text-green-500' : 'text-orange-500'}`}>
                                {isAdFree ? 'مفعل مميز' : 'مستخدم عادي'}
                            </h2>
                        </div>
                    </motion.div>
                </div>

                {/* Notifications */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`p-6 rounded-2xl mb-12 text-center font-bold flex items-center justify-center gap-4 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                        >
                            {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                            {message.text}
                            <button onClick={() => setMessage(null)} className="ml-auto text-[10px] uppercase underline">إغلاق</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
                    {/* Rewards Store & Promo */}
                    <div className="space-y-8 md:space-y-12">
                        {/* Promo Code Section */}
                        <div className="glass-panel p-4 md:p-8 rounded-2xl md:rounded-[3rem] border-[#7fffd4]/30 bg-gradient-to-br from-[#7fffd4]/5 to-transparent relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 text-2xl md:text-4xl"><FaGift /></div>
                            <h3 className="text-lg md:text-xl font-black text-white italic mb-4">هل لديك كود هدية؟ 🎁</h3>
                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="أدخل الكود هنا..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:px-6 md:py-4 text-white font-bold outline-none focus:border-[#7fffd4]/50 transition-all uppercase text-xs md:text-base"
                                />
                                <button
                                    disabled={loading || !promoCode.trim()}
                                    onClick={handlePromoRedeem}
                                    className="px-6 py-3 md:px-8 sm:py-0 bg-[#7fffd4] text-[#05070a] rounded-xl font-black text-[10px] md:text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    تفعيل
                                </button>
                            </div>
                            <p className="mt-3 text-[8px] md:text-[9px] text-slate-500 font-bold italic">أكواد الهدايا صالحة لشخص واحد ولمرة واحدة فقط.</p>
                        </div>

                        <div>
                            <h3 className="text-2xl md:text-3xl font-black text-white italic mb-2 tracking-tighter">متجر المكافأت 🎁</h3>
                            <p className="text-slate-500 text-sm font-bold">استخدم نقاطك للحصول على مميزات حصرية.</p>
                        </div>

                        <div className="space-y-3">
                            {rewards.map((reward) => (
                                <div key={reward.id} className="glass-panel p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between border-white/5 hover:border-[#7fffd4]/20 transition-all group gap-4">
                                    <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                                        <div className="text-2xl md:text-3xl group-hover:scale-110 transition-transform bg-white/5 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl md:rounded-2xl shrink-0">
                                            {reward.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-white text-sm md:text-base mb-1 truncate">{reward.name}</h4>
                                            <p className="text-[10px] md:text-xs text-slate-500 font-bold italic tracking-wider">المدة: {reward.duration}</p>
                                        </div>
                                    </div>
                                    <button
                                        disabled={loading || !user || user.points < reward.cost}
                                        onClick={() => handleRedeem(reward.id, reward.cost)}
                                        className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center justify-center gap-2
                                            ${user && user.points >= reward.cost
                                                ? 'bg-[#7fffd4] text-[#05070a] shadow-xl hover:scale-105 active:scale-95'
                                                : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                                    >
                                        استبدال بـ {reward.cost} <FaCoins className="inline" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* How to earn */}
                    <div className="space-y-6 md:space-y-8">
                        <div>
                            <h3 className="text-xl md:text-3xl font-black text-white italic mb-1 md:mb-2 tracking-tighter">كيف تربح النقاط؟ 🚀</h3>
                            <p className="text-slate-500 text-[10px] md:text-sm font-bold">طرق حقيقية وسهلة لجمع الذهب في MOVIDO.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="glass-panel p-4 md:p-8 rounded-2xl md:rounded-[3rem] border-white/5 bg-gradient-to-br from-[#7fffd4]/5 to-transparent">
                                <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-6 mb-8">
                                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-2xl bg-[#7fffd4]/10 flex items-center justify-center text-lg md:text-3xl text-[#7fffd4] shrink-0">
                                        <FaClock />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm md:text-xl font-black text-white mb-1 md:mb-2 italic">مشاهدة حقيقية</h4>
                                        <p className="text-slate-400 text-[9px] md:text-sm leading-relaxed font-medium">كل دقيقة تقضيها في مشاهدة أفلامك المفضلة تعطيك <span className="text-[#7fffd4] font-black underline">2 نقطة</span>. ساعة واحدة تمنحك 120 نقطة!</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-6">
                                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-2xl bg-purple-500/10 flex items-center justify-center text-lg md:text-3xl text-purple-500 shrink-0">
                                        <FaUserFriends />
                                    </div>
                                    <div className="flex-1 w-full min-w-0">
                                        <h4 className="text-sm md:text-xl font-black text-white mb-1 md:mb-2 italic">نظام الإحالة (Invite)</h4>
                                        <p className="text-slate-400 text-[9px] md:text-sm leading-relaxed font-medium mb-6">شارك رابطك الخاص مع أصدقائك. ستحصل على <span className="text-purple-400 font-black">50 نقطة</span> فور انضمام كل صديق جديد، و <span className="text-purple-400 font-black">5 نقاط</span> لكل ضغطة فريدة على رابطك!</p>

                                        <button
                                            onClick={copyReferral}
                                            className="w-full py-3 md:py-5 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[9px] md:text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                                        >
                                            <FaShareAlt /> نسخ رابط الإحالة الخاص بك
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-3 md:p-6 rounded-xl md:rounded-[2.5rem] border-yellow-500/20 bg-yellow-500/5 flex items-center gap-3 md:gap-6 text-right">
                                <FaGift className="text-lg md:text-3xl text-yellow-500 shrink-0 animate-bounce" />
                                <p className="text-[8px] md:text-xs text-yellow-200/60 font-medium italic leading-relaxed">
                                    نصيحة: شاهد حلقة كاملة بدون تخطي لتحصل على <span className="text-yellow-500 font-black">200 نقطة بونص</span> كل ساعتين!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FaExclamationTriangle = ({ className }: { className?: string }) => (
    <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0L569.517 440.013zM288 354c-11.046 0-20 8.954-20 20v20c0 11.046 8.954 20 20 20s20-8.954 20-20v-20c0-11.046-8.954-20-20-20zm64-96c0-35.346-28.654-64-64-64s-64 28.654-64 64v80c0 8.837 7.163 16 16 16h96c8.837 0 16-7.163 16-16v-80z"></path>
    </svg>
);

export default Rewards;
