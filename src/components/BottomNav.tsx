import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaDownload, FaChild, FaLock, FaFilm, FaSearch } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [kidsMode, setKidsMode] = useState(localStorage.getItem('kidsMode') === 'true');
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');

    const handleKidsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (kidsMode) setShowPinModal(true);
        else {
            setKidsMode(true);
            localStorage.setItem('kidsMode', 'true');
            window.dispatchEvent(new Event('kidsModeChange'));
            navigate('/category/dubbed-series');
        }
    };

    const verifyPin = () => {
        if (pinInput === '1234') {
            setKidsMode(false);
            localStorage.setItem('kidsMode', 'false');
            window.dispatchEvent(new Event('kidsModeChange'));
            setShowPinModal(false);
            setPinInput('');
            navigate('/');
        } else alert('رمز خاطئ!');
    };

    useEffect(() => {
        const handleKidsChange = () => setKidsMode(localStorage.getItem('kidsMode') === 'true');
        window.addEventListener('kidsModeChange', handleKidsChange);
        return () => window.removeEventListener('kidsModeChange', handleKidsChange);
    }, []);

    const navItems = kidsMode
        ? [
            { name: 'الرئيسية', path: '/', icon: <FaHome />, match: (p: string) => p === '/' },
            { name: 'مدبلج', path: '/category/dubbed-series', icon: <FaFilm />, match: (p: string) => p.includes('dubbed') },
            { name: 'كوري', path: '/category/korean-series', icon: <FaSearch />, match: (p: string) => p.includes('korean') },
            { name: 'أطفال', path: '#', icon: <FaChild />, isAction: true, action: handleKidsClick, isActive: kidsMode }
        ]
        : [
            { name: 'الرئيسية', path: '/', icon: <FaHome />, match: (p: string) => p === '/' },
            { name: 'مكافآت', path: '/rewards', icon: <FaFilm />, match: (p: string) => p === '/rewards' },
            { name: 'تحميل', path: '/downloader', icon: <FaDownload />, match: (p: string) => p === '/downloader' },
            { name: 'بحث', path: '/search', icon: <FaSearch />, match: (p: string) => p === '/search' },
            { name: 'أطفال', path: '#', icon: <FaChild />, isAction: true, action: handleKidsClick, isActive: kidsMode }
        ];

    if (['/watch', '/details'].some(path => location.pathname.startsWith(path))) return null;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-[90] md:hidden pb-safe">
                <div className="mx-6 mb-8">
                    <div className={`backdrop-blur-3xl border border-white/5 rounded-[2.5rem] px-8 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between
                                   ${kidsMode ? 'bg-white shadow-xl' : 'bg-[#0c0f16]/90'}`}>
                        {navItems.map((item, idx) => {
                            const isActive = item.isActive !== undefined ? item.isActive : item.match(location.pathname);
                            return (
                                <Link
                                    key={idx}
                                    to={item.path}
                                    onClick={item.isAction ? item.action : undefined}
                                    className={`flex flex-col items-center gap-1.5 transition-all duration-500
                                               ${isActive
                                            ? (kidsMode ? 'text-kids-blue scale-110' : 'text-[#7fffd4] scale-110')
                                            : (kidsMode ? 'text-slate-400' : 'text-slate-600')}`}
                                >
                                    <span className={`text-xl ${isActive ? 'drop-shadow-[0_0_10px_rgba(127,255,212,0.4)]' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showPinModal && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md px-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-10 rounded-[3rem] w-full max-w-sm text-center">
                            <FaLock className="text-4xl text-[#7fffd4] mx-auto mb-6" />
                            <h3 className="text-xl font-black text-white mb-2">منطقة الوالدين</h3>
                            <input
                                type="password" maxLength={4} value={pinInput} onChange={e => setPinInput(e.target.value)} autoFocus
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-center text-3xl tracking-[0.5em] text-white outline-none"
                            />
                            <div className="flex gap-4 mt-8">
                                <button onClick={() => setShowPinModal(false)} className="flex-1 p-4 rounded-2xl font-bold text-slate-500 bg-white/5">إلغاء</button>
                                <button onClick={verifyPin} className="flex-1 p-4 rounded-2xl font-bold text-[#05070a] bg-[#7fffd4]">خروج</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default BottomNav;
