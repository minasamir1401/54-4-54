import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import Background3D from './components/Background3D';
import ConnectionFixer from './components/ConnectionFixer';

const Home = lazy(() => import('./pages/Home'));
const Watch = lazy(() => import('./pages/Watch'));
const Search = lazy(() => import('./pages/Search'));
const CategoryPage = lazy(() => import('./pages/Category'));
const Downloader = lazy(() => import('./pages/Downloader'));

const App = () => {
  const location = useLocation();

  return (
    <div className="bg-transparent min-h-screen selection:bg-red-600/30">
      <Background3D />
      <ConnectionFixer />
      <ErrorBoundary>
        <Navbar />
        <Suspense fallback={
          <div className="bg-[#0a0a0a] h-screen text-white flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">جاري التحميل...</p>
          </div>
        }>
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
                <Route path="/category/:catId" element={<CategoryPage />} />
                <Route path="/details/:id" element={<Watch />} />
                <Route path="/watch/:id" element={<Watch />} />
              </Routes>
            </motion.main>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default App;
