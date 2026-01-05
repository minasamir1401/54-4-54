import { useState, useEffect } from 'react';
import { FaPaperPlane, FaUserCircle, FaCrown, FaCommentAlt } from 'react-icons/fa';
import { getComments, postComment, initUser, Comment as CommentType } from '../services/api';
import { useUser } from '../hooks/useUser';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  contentId: string;
}

const CommentsSystem = ({ contentId }: Props) => {
  const { user, refreshStatus } = useUser();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isKidsMode, setIsKidsMode] = useState(document.body.classList.contains('kids-mode'));

  // Reactive kids mode detection
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsKidsMode(document.body.classList.contains('kids-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getComments(contentId);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [contentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let userId = user?.id || localStorage.getItem('meih_user_id');
      
      // If still no ID, force init
      if (!userId) {
        const guestUser = await initUser();
        if (guestUser) {
          userId = guestUser.id;
          localStorage.setItem('meih_user_id', guestUser.id);
        }
      }

      if (!userId) throw new Error("Anonymous ID failure");

      console.log("Submitting comment for content:", contentId, "User:", userId);
      await postComment(userId, contentId, newComment);
      console.log("Comment posted successfully");
      
      setNewComment('');
      await loadComments();
      refreshStatus(); // Give points
    } catch (error) {
      console.error("Submission failed:", error);
      alert("خطأ أثناء الإرسال. يرجى التأكد من اتصالك بالإنترنت.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`mt-8 sm:mt-12 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border ${isKidsMode ? 'bg-orange-50 border-orange-200' : 'bg-white/5 border-white/10 shadow-2xl backdrop-blur-xl'}`}>
      <div className="flex items-center gap-3 mb-8">
        <FaCommentAlt className={isKidsMode ? 'text-orange-500 text-2xl' : 'text-amber-500 text-xl'} />
        <h3 className={`text-lg sm:text-xl font-black ${isKidsMode ? 'text-orange-900' : 'text-white'}`}>التعليقات</h3>
        <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${isKidsMode ? 'bg-orange-200 text-orange-800' : 'bg-white/10 text-gray-400'}`}>
          {comments.length}
        </span>
      </div>

      {/* Post Comment */}
      <form onSubmit={handleSubmit} className="mb-10 relative group">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="اكتب تعليقك هنا..."
          disabled={isSubmitting}
          className={`
            w-full p-4 sm:p-5 pr-5 sm:pr-6 pl-14 sm:pl-16 rounded-xl sm:rounded-[1.5rem] outline-none transition-all resize-none h-20 sm:h-24 text-sm sm:text-base
            ${isKidsMode 
              ? 'bg-white border-4 border-orange-200 focus:border-orange-400 text-orange-900 placeholder-orange-300' 
              : 'bg-black/40 border border-white/10 focus:border-amber-600 text-white placeholder-gray-500'}
          `}
        />
        <button
          type="submit"
          disabled={!user || !newComment.trim() || isSubmitting}
          className={`
            absolute left-3 sm:left-4 bottom-3 sm:bottom-4 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all
            ${isKidsMode 
              ? 'bg-orange-500 text-white shadow-lg hover:scale-110 active:scale-95' 
              : 'bg-amber-600 text-white hover:bg-amber-700 shadow-[0_0_20px_rgba(217,119,6,0.3)]'}
            disabled:opacity-50 disabled:scale-100
          `}
        >
          <FaPaperPlane className={isSubmitting ? 'animate-ping' : ''} />
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col gap-4">
             {[1,2,3].map(i => (
               <div key={i} className={`h-24 rounded-3xl animate-pulse ${isKidsMode ? 'bg-orange-100' : 'bg-white/5'}`} />
             ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border ${isKidsMode ? 'bg-white border-orange-100 shadow-sm' : 'bg-black/20 border-white/5'}`}
                >
                  <div className="flex-shrink-0">
                    {comment.is_fan ? (
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative ${isKidsMode ? 'bg-yellow-400 text-yellow-900 shadow-lg' : 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]'}`}>
                        <FaCrown className="text-xl" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                      </div>
                    ) : (
                      <FaUserCircle className={`text-4xl ${isKidsMode ? 'text-orange-200' : 'text-gray-700'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-black text-sm ${isKidsMode ? 'text-orange-900' : 'text-gray-300'}`}>
                        {comment.user_id.substring(0, 8)}
                      </span>
                      {comment.is_fan === 1 && (
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isKidsMode ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          Premium Fan 🏆
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500 opacity-60">
                        {new Date(comment.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${isKidsMode ? 'text-orange-800' : 'text-gray-400'}`}>
                      {comment.text}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className={`text-center py-10 opacity-40 ${isKidsMode ? 'text-orange-900' : 'text-gray-400'}`}>
                لا توجد تعليقات بعد، كن أول من يعلق!
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default CommentsSystem;
