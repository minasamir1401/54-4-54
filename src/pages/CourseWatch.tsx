import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCourseDetails, fetchLessonVideo, updateCourseProgress, CourseDetails, Lesson } from '../services/api';
import { FaPlay, FaCheckCircle, FaChevronRight, FaGraduationCap, FaChalkboardTeacher, FaClock, FaListUl } from 'react-icons/fa';
import { useUser } from '../hooks/useUser';
import SEO from '../components/SEO';

const CourseWatch = () => {
    const { id } = useParams<{ id: string }>();
    const { user, refreshStatus } = useUser();
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(false);

    useEffect(() => {
        const loadCourse = async () => {
            if (!id) return;
            setLoading(true);
            const data = await fetchCourseDetails(id, user?.id);
            if (data) {
                setCourse(data);
                // Set first lesson or last watched (not implemented yet, default to first)
                if (data.lessons.length > 0) {
                    selectLesson(data.lessons[0]);
                }
            }
            setLoading(false);
        };
        loadCourse();
    }, [id, user?.id]);

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
        
        // Update local state
        setCourse(prev => {
            if (!prev) return null;
            const newLessons = prev.lessons.map(l => 
                l.id === lessonId ? { ...l, completed: true } : l
            );
            const completedCount = newLessons.filter(l => l.completed).length;
            return {
                ...prev,
                lessons: newLessons,
                completed_count: completedCount,
                progress_percentage: (completedCount / newLessons.length) * 100
            };
        });
        
        refreshStatus(); // Give points feedback
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-deep-slate-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-ice-mint border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-deep-slate-900 flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">كورس غير موجود</h1>
                <Link to="/courses" className="bg-ice-mint text-deep-slate-900 px-6 py-2 rounded-full font-bold hover:bg-ice-mint-hover">العودة للكورسات</Link>
            </div>
        );
    }

    const getCleanVideoUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // Convert to nocookie and add ad-blocking params
            let clean = url.replace('youtube.com', 'youtube-nocookie.com').replace('youtu.be/', 'youtube-nocookie.com/embed/');
            const separator = clean.includes('?') ? '&' : '?';
            return `${clean}${separator}modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`;
        }
        return url;
    };

    return (
        <div className="min-h-screen bg-deep-slate-900 text-white pt-20 pb-12 px-4 sm:px-6 md:px-12">
            <SEO 
                title={`${currentLesson?.title || 'مشاهدة'} | ${course.title} | LMINA Academy`}
                description={course.description || `تعلم ${course.title} مجاناً مع LMINA Academy. ${course.lessons.length} درس تعليمي بشرح مبسط.`}
                url={`/course/${id}`}
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "Course",
                    "name": course.title,
                    "description": course.description,
                    "provider": {
                        "@type": "Organization",
                        "name": "LMINA Academy",
                        "sameAs": "https://lmina.com"
                    },
                    "hasCourseInstance": {
                        "@type": "CourseInstance",
                        "courseMode": "Online",
                        "instructor": {
                            "@type": "Person",
                            "name": course.instructor || "LMINA Expert"
                        }
                    }
                }}
            />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-text-muted mb-8 text-sm font-bold overflow-hidden whitespace-nowrap">
                <Link to="/courses" className="hover:text-ice-mint transition-colors">الكورسات</Link>
                <FaChevronRight className="text-[10px]" />
                <span className="text-text-secondary truncate">{course.title}</span>
                {currentLesson && (
                    <>
                        <FaChevronRight className="text-[10px]" />
                        <span className="text-ice-mint truncate">{currentLesson.title}</span>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Main Content (Player & Info) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Video Player Section */}
                    <div className="relative aspect-video bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                        {videoLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-deep-slate-800/50 backdrop-blur-sm z-10">
                                <div className="w-12 h-12 border-4 border-ice-mint border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : videoUrl ? (
                            <iframe
                                src={getCleanVideoUrl(videoUrl)}
                                className="w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                                <FaPlay className="text-5xl mb-4 opacity-20" />
                                <p className="font-bold">فشل تحميل الفيديو. يرجى اختيار درس آخر.</p>
                            </div>
                        )}
                    </div>

                    {/* Lesson Info */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.03] border border-white/10 p-8 sm:p-10 rounded-[2.5rem] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-ice-mint/10 blur-[60px] rounded-full" />
                        
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                            <div className="text-right flex-1 w-full sm:w-auto">
                                <span className="text-ice-mint font-black text-sm uppercase tracking-widest mb-2 block italic">الدرس رقم {currentLesson?.index}</span>
                                <h1 className="text-3xl sm:text-4xl font-black mb-3">{currentLesson?.title}</h1>
                                <div className="flex items-center justify-end gap-4 text-gray-400 font-bold">
                                    <span className="flex items-center gap-2"><FaClock className="text-xs" /> {currentLesson?.duration || 'غير محدد'}</span>
                                    <span className="flex items-center gap-2"><FaChalkboardTeacher className="text-xs" /> {course.instructor}</span>
                                </div>
                            </div>

                            {currentLesson && !currentLesson.completed && (
                                <button
                                    onClick={() => handleLessonComplete(currentLesson.id)}
                                    className="w-full sm:w-auto bg-ice-mint hover:bg-ice-mint-hover text-deep-slate-900 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-ice-mint/30 group"
                                >
                                    إكمال الدرس
                                    <FaCheckCircle className="text-xl group-hover:scale-110 transition-transform" />
                                </button>
                            )}
                            
                            {currentLesson?.completed && (
                                <div className="w-full sm:w-auto bg-green-500/20 text-green-500 border border-green-500/30 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3">
                                    تم الإكمال
                                    <FaCheckCircle className="text-xl" />
                                </div>
                            )}
                        </div>

                        <div className="h-[1px] bg-white/10 w-full mb-8" />

                        <div className="text-right">
                            <h3 className="text-xl font-black mb-4 flex items-center justify-end gap-3 text-white">
                                عن الكورس
                                <FaGraduationCap className="text-ice-mint" />
                            </h3>
                            <p className="text-gray-400 leading-relaxed font-bold">
                                {course.description}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar (Lesson List & Progress) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Progress Card */}
                    <div className="bg-gradient-to-br from-ice-mint/20 to-ice-mint-active/20 border border-ice-mint/20 p-8 rounded-[2rem] shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-ice-mint font-black italic">{Math.round(course.progress_percentage || 0)}% مكتمل</span>
                            <span className="text-white font-black">{course.completed_count || 0} / {course.lessons.length} دروس</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-4 p-[2px]">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress_percentage || 0}%` }}
                                className="h-full bg-gradient-to-r from-ice-mint to-ice-mint-active rounded-full shadow-[0_0_10px_rgba(127,255,212,0.5)]"
                            />
                        </div>
                        <p className="text-text-muted text-xs text-center font-bold italic">أكمل جميع الدروس للحصول على شهادة (قريباً!)</p>
                    </div>

                    {/* Lesson List Card */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col h-[700px]">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <span className="text-text-muted text-xs font-black italic uppercase tracking-widest">قائمة الدروس</span>
                            <FaListUl className="text-ice-mint" />
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {course.lessons.map((lesson) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => selectLesson(lesson)}
                                    className={`w-full flex items-center justify-between p-6 border-b border-white/5 transition-all duration-300 text-right group ${
                                        currentLesson?.id === lesson.id 
                                        ? 'bg-ice-mint/20 border-r-4 border-ice-mint' 
                                        : 'hover:bg-white/[0.05]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {lesson.completed ? (
                                            <FaCheckCircle className="text-green-500 text-lg shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-white/10 flex items-center justify-center">
                                                <span className="text-[10px] text-gray-500 font-black">{lesson.index}</span>
                                            </div>
                                        )}
                                        {currentLesson?.id === lesson.id && (
                                            <motion.div 
                                                layoutId="active-indicator"
                                                className="w-1.5 h-1.5 bg-ice-mint rounded-full"
                                            />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 pr-4">
                                        <p className={`font-bold text-sm mb-1 leading-snug ${currentLesson?.id === lesson.id ? 'text-white' : 'text-gray-400'}`}>
                                            {lesson.title}
                                        </p>
                                        <span className="text-[10px] text-gray-600 font-black italic">{lesson.duration || 'غير محدد'}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseWatch;
