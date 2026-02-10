import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCourseDetails, fetchLessonVideo, updateCourseProgress, CourseDetails, Lesson } from '../services/api';
import { FaPlay, FaCheckCircle, FaChevronRight, FaGraduationCap, FaChalkboardTeacher, FaClock, FaListUl, FaShieldAlt } from 'react-icons/fa';
import { useUser } from '../hooks/useUser';
import SEO from '../components/SEO';

const CourseWatch = () => {
    const { id } = useParams<{ id: string }>();
    const { user, loading: userLoading, refreshStatus } = useUser();
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(false);

    useEffect(() => {
        const loadCourse = async () => {
            if (!id || userLoading) return;
            setLoading(true);
            const data = await fetchCourseDetails(id, user?.id);
            if (data) {
                setCourse(data);
                if (data.lessons.length > 0) selectLesson(data.lessons[0]);
            }
            setLoading(false);
        };
        loadCourse();
    }, [id, user?.id, userLoading]);

    const selectLesson = async (lesson: Lesson) => {
        setCurrentLesson(lesson);
        setVideoLoading(true);
        const videoData = await fetchLessonVideo(lesson.id);
        setVideoUrl(videoData.video_url);
        setVideoLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLessonComplete = async (lessonId: string) => {
        if (!user || !id || !course) return;
        await updateCourseProgress(user.id, id, lessonId, 1);
        setCourse(prev => {
            if (!prev) return null;
            const newLessons = prev.lessons.map(l => l.id === lessonId ? { ...l, completed: true } : l);
            const completedCount = newLessons.filter(l => l.completed).length;
            return {
                ...prev,
                lessons: newLessons,
                completed_count: completedCount,
                progress_percentage: (completedCount / newLessons.length) * 100
            };
        });
        refreshStatus();
    };

    if (loading || userLoading) return (
        <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-t-transparent border-[#7fffd4] rounded-full animate-spin shadow-[0_0_30px_rgba(127,255,212,0.2)]" />
        </div>
    );

    if (!course) return (
        <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-12 text-center">
            <h1 className="text-3xl font-black text-white mb-8 italic">الكورس غير متاح حالياً</h1>
            <Link to="/courses" className="bg-[#7fffd4] text-[#05070a] px-12 py-4 rounded-2xl font-black hover:scale-105 transition-all">العودة للأكاديمية</Link>
        </div>
    );

    const getCleanVideoUrl = (url: string) => {
        return url;
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-white pt-20 md:pt-28 pb-20 px-3 md:px-12">
            <SEO title={`${currentLesson?.title || 'مشاهدة'} | ${course.title}`} description={course.description} />

            <div className="max-w-[1700px] mx-auto">
                {/* Immersive Navigation Bar */}
                <div className="flex flex-row-reverse items-center justify-between mb-8 md:mb-12 bg-white/5 backdrop-blur-3xl px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[2.5rem] border border-white/5">
                    <div className="flex flex-row-reverse items-center gap-3 md:gap-6">
                        <Link to="/courses" className="glass-panel p-2 md:p-4 rounded-full text-slate-400 hover:text-[#7fffd4] transition-colors text-xs md:text-sm"><FaChevronRight /></Link>
                        <h1 className="text-sm md:text-2xl font-black italic text-white line-clamp-1">{course.title}</h1>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7fffd4] opacity-50 italic">أكاديمية موفيدو</div>
                        <FaShieldAlt className="text-[#7fffd4]" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Primary Focus: Player & Lesson Details */}
                    <div className="lg:col-span-2 space-y-12">

                        <div className="relative aspect-video bg-black rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl group">
                            {videoLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xl z-10">
                                    <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-t-transparent border-[#7fffd4] rounded-full animate-spin" />
                                </div>
                            ) : videoUrl ? (
                                <iframe
                                    key={videoUrl}
                                    src={getCleanVideoUrl(videoUrl)}
                                    className="w-full h-full border-0"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center opacity-30">
                                    <FaPlay className="text-6xl mb-6" />
                                    <p className="text-xl font-black italic">فشل تحميل الفيديو.. جرب درساً آخر</p>
                                </div>
                            )}
                        </div>

                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-16 rounded-[2rem] md:rounded-[4rem] border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#7fffd4]/5 blur-[100px] -z-10" />
                            <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between gap-6 md:gap-10 mb-8 md:mb-12">
                                <div className="text-right flex-1">
                                    <span className="text-[#7fffd4] font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.6em] mb-2 md:mb-4 block italic">الدرس رقم {currentLesson?.index}</span>
                                    <h2 className="text-xl md:text-5xl font-black italic tracking-tighter mb-2 md:mb-4">{currentLesson?.title}</h2>
                                    <div className="flex items-center justify-end gap-4 md:gap-6 text-slate-500 font-bold italic text-[10px] md:text-base">
                                        <span className="flex items-center gap-1.5 md:gap-2"><FaClock className="text-[8px] md:text-xs" /> {currentLesson?.duration}</span>
                                        <div className="w-1 h-1 bg-white/10 rounded-full" />
                                        <span className="flex items-center gap-1.5 md:gap-2 text-[#7fffd4]/60"><FaChalkboardTeacher className="text-[8px] md:text-xs" /> {course.instructor}</span>
                                    </div>
                                </div>
                                {currentLesson && !currentLesson.completed && (
                                    <button onClick={() => handleLessonComplete(currentLesson.id)} className="w-full md:w-auto bg-[#7fffd4] text-[#05070a] px-8 md:px-12 py-3 md:py-5 rounded-xl md:rounded-3xl font-black flex items-center justify-center gap-3 md:gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(127,255,212,0.3)] text-xs md:text-base">
                                        تأكيد الإكمال <FaCheckCircle className="text-sm md:text-xl" />
                                    </button>
                                )}
                                {currentLesson?.completed && (
                                    <div className="w-full md:w-auto bg-green-500 shadow-[0_10px_30px_rgba(34,197,94,0.3)] text-[#05070a] px-8 md:px-12 py-3 md:py-5 rounded-xl md:rounded-3xl font-black flex items-center justify-center gap-3 md:gap-4 text-xs md:text-base">
                                        انتهيت منه <FaCheckCircle className="text-sm md:text-xl" />
                                    </div>
                                )}
                            </div>
                            <div className="h-[1px] bg-white/5 w-full mb-8 md:mb-12" />
                            <div className="text-right">
                                <h3 className="text-sm md:text-xl font-black italic mb-4 md:mb-6 text-white flex items-center justify-end gap-3 md:gap-4">عن هذا المسار <FaGraduationCap className="text-[#7fffd4]" /></h3>
                                <p className="text-xs md:text-xl text-slate-400 leading-relaxed font-medium italic">{course.description}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Secondary Context: Curriculum & Progress */}
                    <div className="lg:col-span-1 space-y-10">
                        <div className="glass-panel p-6 md:p-10 rounded-[1.5rem] md:rounded-[3.5rem] border-[#7fffd4]/10 bg-gradient-to-br from-[#7fffd4]/10 to-transparent">
                            <div className="flex flex-row-reverse items-center justify-between mb-4 md:mb-8">
                                <span className="font-black italic text-lg md:text-2xl text-white">{Math.round(course.progress_percentage || 0)}%</span>
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">التقدم الأكاديمي</span>
                            </div>
                            <div className="w-full h-2 md:h-3 bg-black/40 rounded-full overflow-hidden p-[1px] md:p-[2px]">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress_percentage || 0}%` }} className="h-full bg-gradient-to-r from-[#7fffd4] to-blue-500 rounded-full shadow-[0_0_20px_rgba(127,255,212,0.4)]" />
                            </div>
                        </div>

                        <div className="glass-panel rounded-[1.5rem] md:rounded-[3.5rem] overflow-hidden border-white/5 flex flex-col h-[400px] md:h-[750px]">
                            <div className="p-6 md:p-10 border-b border-white/5 bg-white/5 flex flex-row-reverse items-center justify-between">
                                <h3 className="text-sm md:text-xl font-black italic">منهج الكورس</h3>
                                <FaListUl className="text-[#7fffd4] text-xs md:text-base" />
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-6 space-y-2 md:space-y-3">
                                {course.lessons.map((lesson) => (
                                    <button
                                        key={lesson.id}
                                        onClick={() => selectLesson(lesson)}
                                        className={`w-full p-4 md:p-6 rounded-xl md:rounded-[2.5rem] transition-all duration-500 border relative group text-right
                                          ${currentLesson?.id === lesson.id
                                                ? 'bg-[#7fffd4] text-[#05070a] border-[#7fffd4] shadow-xl scale-[1.02]'
                                                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <div className="flex flex-row-reverse items-center justify-between">
                                            <div className="flex flex-row-reverse items-center gap-3 md:gap-4 truncate flex-1">
                                                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center font-black text-[10px] md:text-xs ${currentLesson?.id === lesson.id ? 'bg-[#05070a] text-white' : 'bg-white/5'}`}>{lesson.index}</div>
                                                <span className="font-black truncate block text-[10px] md:text-base">{lesson.title}</span>
                                            </div>
                                            {lesson.completed && <FaCheckCircle className={`text-sm md:text-xl ${currentLesson?.id === lesson.id ? 'text-[#05070a]' : 'text-green-500'}`} />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseWatch;
