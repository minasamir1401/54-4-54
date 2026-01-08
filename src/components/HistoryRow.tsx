import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ContentItem } from '../services/api';
import { FaHistory, FaTrash } from 'react-icons/fa';

interface HistoryRowProps {
  kidsMode?: boolean;
}

const HistoryRow = ({ kidsMode = false }: HistoryRowProps) => {
  const [history, setHistory] = useState<ContentItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('watch_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('watch_history');
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex flex-row-reverse items-center justify-between mb-6">
        <div className="flex flex-row-reverse items-center gap-3">
          <div className={`p-2 rounded-lg ${kidsMode ? 'bg-kids-blue/20' : 'bg-ice-mint/20'}`}>
            <FaHistory className={`text-xl ${kidsMode ? 'text-kids-blue' : 'text-ice-mint'}`} aria-hidden="true" />
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${kidsMode ? 'text-deep-slate-900' : 'text-white'}`}>
            {kidsMode ? 'نكمل المشاهدة؟ 🚀' : 'تابع المشاهدة'}
          </h2>
        </div>
        <button 
          onClick={clearHistory}
          aria-label="مسح سجل المشاهدة"
          className={`transition-colors flex flex-row-reverse items-center gap-2 text-sm ${kidsMode ? 'text-gray-500 hover:text-red-500' : 'text-text-muted hover:text-ice-mint'}`}
        >
          <FaTrash size={12} aria-hidden="true" />
          {kidsMode ? 'مسح القائمة' : 'مسح السجل'}
        </button>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {history.slice(0, 6).map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link 
              to={`/watch/${item.id}`} 
              className="group block"
              aria-label={`متابعة مشاهدة ${item.title}`}
            >
              <div className={`relative aspect-[2/3] overflow-hidden mb-3 shadow-lg ${
                  kidsMode 
                  ? 'rounded-[2rem] bg-white border-4 border-transparent border-b-kids-blue/20 hover:border-kids-blue' 
                  : 'rounded-xl bg-deep-slate-800 border border-deep-slate-border'
              }`}>
                <img 
                  src={item.poster} 
                  alt={`بوستر فيلم ${item.title}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Image';
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 flex items-end p-4 ${
                    kidsMode 
                    ? 'from-kids-blue/20 via-transparent to-transparent opacity-100' 
                    : 'from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100'
                }`}>
                   <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                      <div className={`w-1/2 h-full ${kidsMode ? 'bg-kids-yellow' : 'bg-ice-mint'}`} />
                   </div>
                </div>
              </div>
              <h3 className={`text-sm font-medium transition-colors line-clamp-2 text-center ${
                  kidsMode 
                  ? 'text-deep-slate-900 group-hover:text-kids-blue font-black' 
                  : 'text-gray-200 group-hover:text-ice-mint'
              }`}>
                {item.title}
              </h3>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryRow;
