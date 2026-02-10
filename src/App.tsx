import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import Background3D from "./components/Background3D";
import KidsBackground from "./components/KidsBackground";
import InstallPrompt from "./components/InstallPrompt";
import ScrollToTop from "./components/ScrollToTop";
import GlobalPopunder from "./components/GlobalPopunder";
import SecurityGuard from "./components/SecurityGuard";
import { useState, useEffect } from "react";
import { registerShareClick } from "./services/api";
import { FaCoins } from "react-icons/fa";

const Home = lazy(() => import("./pages/Home"));

const Search = lazy(() => import("./pages/Search"));
const Details = lazy(() => import('./pages/Details'));
const CategoryPage = lazy(() => import("./pages/Category"));
const Downloader = lazy(() => import("./pages/Downloader"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseWatch = lazy(() => import("./pages/CourseWatch"));
const Matches = lazy(() => import("./pages/Matches"));
const Anime = lazy(() => import("./pages/Anime"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ScrapersManager = lazy(() => import("./pages/ScrapersManager"));
const Rewards = lazy(() => import("./pages/Rewards"));
const RamadanPage = lazy(() => import("./pages/Ramadan"));

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [kidsMode, setKidsMode] = useState(
    localStorage.getItem("kidsMode") === "true",
  );
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  useEffect(() => {
    const handleKidsChange = () => {
      setKidsMode(localStorage.getItem("kidsMode") === "true");
    };
    window.addEventListener("kidsModeChange", handleKidsChange);

    // Track Referral Clicks
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      registerShareClick(ref);
    }

    // Modal Timing Logic (Show once per browser session for new users)
    const hasSeenRewards = localStorage.getItem("onboarding_rewards_v1");
    if (!hasSeenRewards) {
      setTimeout(() => setShowRewardsModal(true), 2500);
    }

    return () => window.removeEventListener("kidsModeChange", handleKidsChange);
  }, []);

  const closeRewardsModal = () => {
    localStorage.setItem("onboarding_rewards_v1", "true");
    setShowRewardsModal(false);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${kidsMode ? "bg-white text-deep-slate-900 selection:bg-kids-pink/30 kids-mode" : "bg-deep-slate-900 selection:bg-ice-mint/30"}`}
    >
      <Background3D />
      <KidsBackground />
      <InstallPrompt />
      <ScrollToTop />
      <GlobalPopunder />
      <SecurityGuard />
      <ErrorBoundary>
        <Navbar key={`navbar-${kidsMode}`} />
        <BottomNav key={`bottomnav-${kidsMode}`} />
        <Suspense
          fallback={
            <div className="bg-deep-slate-900 h-screen text-white flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-2 border-ice-mint border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                جاري التحميل...
              </p>
            </div>
          }
        >
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/downloader" element={<Downloader />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/academy" element={<Courses />} />
                <Route path="/course/:id" element={<CourseWatch />} />
                <Route path="/category/cartoon-series" element={<Anime />} />
                <Route path="/category/anime-series" element={<Anime />} />
                <Route path="/category/:catId" element={<CategoryPage />} />
                <Route path="/details/:id" element={<Details />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/anime" element={<Anime />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/scrapers" element={<ScrapersManager />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/ramadan-2026" element={<RamadanPage />} />
              </Routes>
            </motion.main>
          </AnimatePresence>
        </Suspense>
        <Footer />

        {/* Rewards Announcement Modal (Compact & Transparent) */}
        <AnimatePresence>
          {showRewardsModal && !kidsMode && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="glass-panel max-w-lg w-full rounded-[3rem] overflow-hidden border-[#7fffd4]/30 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative"
              >
                {/* Background Visual Deco */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#7fffd4]/5 via-transparent to-purple-500/5 opacity-40 pointer-events-none" />

                <div className="h-32 bg-gradient-to-br from-[#05070a] to-[#0c0f16] flex items-center justify-center relative border-b border-white/5">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-6xl text-yellow-500 drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]"
                  >
                    <FaCoins />
                  </motion.div>
                  <div className="absolute top-6 right-8 text-[#7fffd4] font-black italic tracking-tighter text-lg">
                    MOVIDO REWARDS
                  </div>

                  <button
                    onClick={closeRewardsModal}
                    className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-8 text-center space-y-6 relative">
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter leading-tight">
                      اربح اشتراكك{" "}
                      <span className="text-[#7fffd4]">مجاناً!</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-sm mx-auto">
                      اجمع النقاط من المشاهدة ودعوة الأصدقاء، واستبدلها
                      بإشتراكات بدون إعلانات.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: "🎥", label: "2 نقطة", sub: "دقيقة" },
                      { icon: "🎁", label: "50 نقطة", sub: "دعوة" },
                      { icon: "🔥", label: "بونص", sub: "يومي" },
                    ].map((box, i) => (
                      <div
                        key={i}
                        className="bg-white/5 p-3 rounded-2xl border border-white/5"
                      >
                        <div className="text-xl mb-1">{box.icon}</div>
                        <div className="text-white font-black text-[10px] whitespace-nowrap">
                          {box.label}
                        </div>
                        <div className="text-slate-500 text-[7px] font-bold uppercase tracking-widest">
                          {box.sub}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={() => {
                        navigate("/rewards");
                        closeRewardsModal();
                      }}
                      className="w-full bg-[#7fffd4] text-[#05070a] py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all"
                    >
                      عرض المتجر
                    </button>
                    <button
                      onClick={closeRewardsModal}
                      className="w-full py-3 rounded-2xl text-slate-500 font-bold text-xs hover:text-white transition-all"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </div>
  );
};

export default App;
