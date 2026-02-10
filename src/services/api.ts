import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api-proxy";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 15000, // 15s timeout
});

// Enterprise Resilience: Automated Retry & Global Error Management
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;

        // Retry logic for transient errors (Network, 5xx)
        const MAX_RETRIES = 3;
        config.retryCount = config.retryCount || 0;

        if (config.retryCount < MAX_RETRIES && (!response || response.status >= 500)) {
            config.retryCount += 1;
            const backoffDelay = Math.pow(2, config.retryCount) * 1000;
            console.warn(`[API] Resilience Triggered: Retrying ${config.url} (${config.retryCount}/${MAX_RETRIES}) in ${backoffDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            return api(config);
        }

        // Comprehensive Error Logging for Diagnostics
        console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
            status: response?.status,
            message: error.message,
            requestId: response?.headers?.["x-request-id"]
        });

        return Promise.reject(error);
    }
);

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData<T>(key: string): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as T;
    }
    cache.delete(key);
    return null;
}

function setCachedData<T>(key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });
}

export interface ContentItem {
    id: string;
    title: string;
    poster: string;
    type: "movie" | "series";
    duration?: string;
    episodes_count?: number;
}

export interface Episode {
    id: string;
    title: string;
    episode: number;
    url: string;
}

export interface Download {
    quality: string;
    url: string;
}

export interface Server {
    name: string;
    url: string;
}

export interface Details {
    id: string;
    title: string;
    description: string;
    poster: string;
    type: "movie" | "series";
    episodes: Episode[];
    episodes_count?: number;
    seasons?: {
        number: number;
        episodes: Episode[];
    }[];
    servers?: Server[];
    download_links: Download[];
    recommendations?: ContentItem[];
    ai_summary?: string;
    year?: string;
    genre?: string[];
    rating?: string;
    schema?: any;
    current_episode?: {
        id: string;
        title: string;
    };
    error?: string;
    message?: string;
}

export interface Lesson {
    id: string;
    title: string;
    index: number;
    duration?: string;
    completed?: boolean;
}


export interface CourseDetails {
    id: string;
    title: string;
    description: string;
    instructor: string;
    lessons: Lesson[];
    type: "course";
    progress_percentage?: number;
    completed_count?: number;
}

const getBaseUrl = () => {
    if (API_BASE_URL.startsWith('http')) return API_BASE_URL;
    return window.location.origin + (API_BASE_URL === '/api-proxy' ? '' : API_BASE_URL);
};

export const getProxyImage = (url: string) => {
    if (!url) return "";
    const base = getBaseUrl();
    if (url.includes("/proxy/image")) return url.startsWith('http') ? url : `${base}${url}`;
    return `${base}/proxy/image?url=${encodeURIComponent(url)}`;
};

export const getProxyDownloadUrl = (url: string, filename: string) => {
    return `${getBaseUrl()}/proxy/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
};

export const getProxyStreamUrl = (url: string, type: 'hls' | 'stream' | 'video', referer?: string) => {
    let proxyUrl = `${getBaseUrl()}/proxy/${type}?url=${encodeURIComponent(url)}`;
    if (referer) proxyUrl += `&referer=${encodeURIComponent(referer)}`;
    return proxyUrl;
};



const mapContentItem = (item: ContentItem) => ({
    ...item,
    title: item.title.replace(/LMINA/gi, 'MOVIDO').replace(/ArabSeed/gi, 'MOVIDO').replace(/عرب سيد/g, 'MOVIDO').replace(/Larooza/gi, 'MOVIDO').replace(/Laroza/gi, 'MOVIDO'),
    poster: getProxyImage(item.poster),
});

// Mock data for fallback
const MOCK_ITEMS: ContentItem[] = [
    {
        id: "mock-1",
        title: "محتوى تجريبي 1",
        poster:
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500",
        type: "movie",
    },
    {
        id: "mock-2",
        title: "محتوى تجريبي 2",
        poster:
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500",
        type: "movie",
    },
    {
        id: "mock-3",
        title: "محتوى تجريبي 3",
        poster:
            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500",
        type: "series",
    },
    {
        id: "mock-4",
        title: "محتوى تجريبي 4",
        poster:
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500",
        type: "movie",
    },
    {
        id: "mock-5",
        title: "محتوى تجريبي 5",
        poster: "https://images.unsplash.com/photo-1542204172-658a09b615c7?w=500",
        type: "series",
    },
];

export const fetchLatest = async (page: number = 1) => {
    const cacheKey = `latest_${page}`;
    const cached = getCachedData<ContentItem[]>(cacheKey);
    if (cached) return cached;

    try {
        const data = (await api.get<ContentItem[]>(`/movies/latest?page=${page}`))
            .data;
        const mapped = (Array.isArray(data) ? data : []).map(mapContentItem);
        setCachedData(cacheKey, mapped);
        return mapped;
    } catch (error) {
        console.warn("API Fetch failed, using mock data:", error);
        return MOCK_ITEMS;
    }
};

export const fetchDetails = async (id: string) => {
    const cacheKey = `details_${id}`;
    const cached = getCachedData<Details>(cacheKey);
    if (cached) return cached;

    try {
        // If the ID is an Animerco link (base64 of URL containing animerco)
        let isAnime = false;
        try {
            // Convert URL-safe base64 to standard base64
            const standardB64 = id.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = atob(standardB64);
            if (decoded.includes("animerco.org") || decoded.includes("2qk9x7b.shop") || decoded.includes("anime4up")) {
                isAnime = true;
            }
        } catch { }

        const endpoint = isAnime ? `/anime/details/${id}` : `/movies/details/${id}`;
        const data = (await api.get<Details>(endpoint)).data;

        if (data) {
            if (data.poster) data.poster = getProxyImage(data.poster);
            if (data.recommendations) {
                data.recommendations = data.recommendations.map(mapContentItem);
            }
        }
        setCachedData(cacheKey, data);
        return data;
    } catch (error) {
        console.warn("API Fetch failed for details:", error);
        return {
            id: id,
            title: "محتوى تجريبي",
            description:
                "هذا محتوى تجريبي يظهر لأن السيرفر غير متصل حالياً. يرجى المحاولة لاحقاً.",
            poster:
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
            type: "movie",
            episodes: [],
            download_links: [
                { quality: "1080p", url: "https://example.com/dl/1080p" },
                { quality: "720p", url: "https://example.com/dl/720p" },
                { quality: "480p", url: "https://example.com/dl/480p" }
            ],
            recommendations: MOCK_ITEMS,
        } as Details;
    }
};

export const searchContent = async (query: string) => {
    const cacheKey = `search_${query}`;
    const cached = getCachedData<ContentItem[]>(cacheKey);
    if (cached) return cached;

    try {
        const data = (await api.get<ContentItem[]>(`/movies/search?q=${query}`))
            .data;
        const mapped = (Array.isArray(data) ? data : []).map(mapContentItem);
        setCachedData(cacheKey, mapped);
        return mapped;
    } catch (error) {
        return MOCK_ITEMS.filter((item) => item.title.includes(query));
    }
};

export const fetchByCategory = async (catId: string, page: number = 1) => {
    const cacheKey = `category_${catId}_${page}`;
    const cached = getCachedData<ContentItem[]>(cacheKey);
    if (cached) return cached;

    try {
        const data = (
            await api.get<ContentItem[]>(`/movies/category/${catId}?page=${page}`)
        ).data;
        const mapped = (Array.isArray(data) ? data : []).map(mapContentItem);
        setCachedData(cacheKey, mapped);
        return mapped;
    } catch (error) {
        return MOCK_ITEMS;
    }
};

export interface UserStatus {
    id: string;
    points: number;
    watch_time_total: number;
    is_fan: number;
    ad_free_until: number;
    referrer_id: string | null;
    created_at: string;
}

export const initUser = async (userId?: string, referrerId?: string) => {
    try {
        const response = await api.post<UserStatus>(`/user/init`, null, {
            params: { user_id: userId, referrer_id: referrerId }
        });
        return response.data;
    } catch (error) {
        console.error("User init failed:", error);
        return null;
    }
};

export const getUserStatus = async (userId: string) => {
    try {
        const response = await api.get<UserStatus>(`/user/status/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Get user status failed:", error);
        return null;
    }
};

export const trackWatch = async (userId: string, minutes: number = 5) => {
    try {
        const response = await api.post(`/user/watch`, null, {
            params: { user_id: userId, minutes }
        });
        return response.data;
    } catch (error) {
        console.error("Track watch failed:", error);
        return null;
    }
};

export const redeemReward = async (userId: string, rewardType: string) => {
    try {
        const response = await api.post(`/user/redeem`, null, {
            params: { user_id: userId, reward_type: rewardType }
        });
        return response.data;
    } catch (error) {
        console.error("Redeem failed:", error);
        throw error;
    }
};

export const registerShareClick = async (referrerId: string) => {
    try {
        await api.post(`/user/share-click`, null, {
            params: { referrer_id: referrerId }
        });
    } catch { }
};

export const redeemPromo = async (userId: string, code: string) => {
    try {
        const response = await api.post(`/user/redeem-promo`, null, {
            params: { user_id: userId, code }
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data?.detail || "فشل تفعيل الكود";
    }
};

export interface Comment {
    id: number;
    content_id: string;
    user_id: string;
    text: string;
    created_at: string;
    is_fan: number;
}

export const getComments = async (contentId: string) => {
    try {
        return (await api.get<Comment[]>(`/comments/${contentId}`)).data;
    } catch (error) {
        return [];
    }
};

export const postComment = async (
    userId: string,
    contentId: string,
    text: string
) => {
    try {
        return (
            await api.post("/comments", null, {
                params: { user_id: userId, content_id: contentId, text },
            })
        ).data;
    } catch (error) {
        return { success: false };
    }
};

export const fetchDownloadInfo = async (url: string) => {
    try {
        // Increase timeout specifically for downloader as yt-dlp can be slow
        const response = await api.get("/proxy/download/info", {
            params: { url },
            timeout: 60000 // 60s for downloader
        });
        const data = response.data;

        if (!data || data.error) {
            return { error: data?.error || "حدث خطأ غير متوقع", formats: [] };
        }

        // Transform formats to match expected structure
        // We now include formats that might be video-only but marked as quality
        const videoFormats = data.formats
            .filter((f: any) => f.has_video) // Include all video formats
            .map((f: any) => ({
                id: f.format_id,
                type: 'video',
                resolution: f.quality || 'Unknown',
                ext: f.ext,
                filesize: f.filesize,
                url: f.url,
                has_audio: f.has_audio
            }))
            .sort((a: any, b: any) => (b.has_audio ? 1 : 0) - (a.has_audio ? 1 : 0)); // Prefer combined formats

        const audioFormats = data.formats
            .filter((f: any) => f.has_audio && !f.has_video)
            .map((f: any) => ({
                id: f.format_id,
                type: 'audio',
                resolution: f.quality || 'Audio Only',
                ext: f.ext,
                filesize: f.filesize,
                url: f.url
            }));

        let source = 'Unknown';
        try {
            source = new URL(url).hostname;
        } catch (e) {
            console.warn("Invalid URL for hostname extraction", url);
        }

        return {
            title: data.title,
            thumbnail: data.thumbnail,
            duration: data.duration,
            uploader: data.uploader,
            view_count: data.view_count,
            source,
            formats: [...videoFormats, ...audioFormats]
        };
    } catch (error: any) {
        console.error("Downloader API failed:", error);
        return {
            error: error.response?.data?.detail || "خدمة التحميل غير متوفرة حالياً. قد يكون الرابط خاطئاً أو السيرفر مشغولاً.",
            formats: [],
        };
    }
};

// --- Course API Methods ---

export const fetchLatestCourses = async (page: number = 1) => {
    try {
        const data = (await api.get<ContentItem[]>(`/courses/latest?page=${page}`))
            .data;
        return (Array.isArray(data) ? data : []).map(mapContentItem);
    } catch (error) {
        return [];
    }
};

export const fetchCoursesByCategory = async (
    catId: string,
    page: number = 1
) => {
    try {
        const response = await api.get<ContentItem[]>(
            `/courses/category/${catId}?page=${page}`
        );
        const data = response.data;
        return (Array.isArray(data) ? data : []).map(mapContentItem);
    } catch (error: any) {
        console.error(`Fetch category ${catId} failed:`, error.message);
        throw error; // Throw so UI shows error state
    }
};

export const searchCourses = async (query: string) => {
    try {
        const data = (await api.get<ContentItem[]>(`/courses/search?q=${query}`))
            .data;
        return (Array.isArray(data) ? data : []).map(mapContentItem);
    } catch (error) {
        return [];
    }
};

export const fetchCourseDetails = async (id: string, userId?: string) => {
    try {
        const data = (
            await api.get<CourseDetails>(`/courses/details/${id}`, {
                params: { user_id: userId },
            })
        ).data;
        return data;
    } catch (error) {
        return null;
    }
};

export const fetchLessonVideo = async (lessonId: string) => {
    try {
        return (await api.get<{ video_url: string }>(`/courses/lesson/${lessonId}`))
            .data;
    } catch (error) {
        return { video_url: "" };
    }
};

export const updateCourseProgress = async (
    userId: string,
    courseId: string,
    lessonId: string,
    completed: number = 1
) => {
    try {
        return (
            await api.post("/courses/progress", {
                user_id: userId,
                course_id: courseId,
                lesson_id: lessonId,
                completed,
            })
        ).data;
    } catch (error) {
        return { success: false };
    }
};

// --- Anime API Methods ---

export const fetchAnimeHome = async () => {
    const cacheKey = "anime_home";
    const cached = getCachedData<Record<string, ContentItem[]>>(cacheKey);
    if (cached) return cached;

    try {
        const data = (await api.get<Record<string, ContentItem[]>>("/anime/home")).data;
        const mapped: Record<string, ContentItem[]> = {};
        for (const [key, items] of Object.entries(data)) {
            mapped[key] = (Array.isArray(items) ? items : []).map(mapContentItem);
        }
        setCachedData(cacheKey, mapped);
        return mapped;
    } catch (error) {
        console.error("Fetch anime home failed:", error);
        return {};
    }
};

export const fetchAnimeList = async (page: number = 1) => {
    const cacheKey = `anime_list_${page}`;
    const cached = getCachedData<ContentItem[]>(cacheKey);
    if (cached) return cached;

    try {
        const data = (await api.get<ContentItem[]>(`/anime/list?page=${page}`)).data;
        const mapped = (Array.isArray(data) ? data : []).map(mapContentItem);
        setCachedData(cacheKey, mapped);
        return mapped;
    } catch (error) {
        console.error("Fetch anime list failed:", error);
        return [];
    }
};

export const searchAnime = async (query: string) => {
    const cacheKey = `anime_search_${query}`;
    const cached = getCachedData<ContentItem[]>(cacheKey);
    if (cached) return cached;

    try {
        const data = (await api.get<ContentItem[]>(`/anime/search?q=${query}`)).data;
        const mapped = (Array.isArray(data) ? data : []).map(mapContentItem);
        setCachedData(cacheKey, mapped);
        return mapped;
    } catch (error) {
        console.error("Search anime failed:", error);
        return [];
    }
};

export const fetchAnimeDetails = async (id: string) => {
    const cacheKey = `anime_details_${id}`;
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;

    try {
        const data = (await api.get<any>(`/anime/details/${id}`)).data;
        if (data && data.poster) {
            data.poster = getProxyImage(data.poster);
        }
        setCachedData(cacheKey, data);
        return data;
    } catch (error) {
        console.error("Fetch anime details failed:", error);
        return null;
    }
};

export const fetchAnimeEpisode = async (id: string) => {
    const cacheKey = `anime_episode_${id}`;
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;

    try {
        const data = (await api.get<any>(`/anime/episode/${id}`)).data;
        setCachedData(cacheKey, data);
        return data;
    } catch (error) {
        console.error("Fetch anime episode failed:", error);
        return null;
    }
};

export const resolveStream = async (url: string) => {
    try {
        // Appending timestamp to force fresh extraction (bypass backend LRU cache)
        const response = await api.get('/proxy/resolve', {
            params: {
                url,
                t: Date.now()
            }
        });
        return response.data;
    } catch (error) {
        console.error("Stream resolution failed:", error);
        return { success: false, message: "Server error" };
    }
};


export const prefetchCategory = async (catId: string) => {
    const cacheKey = `category_${catId}_1`;
    if (getCachedData(cacheKey)) return;
    fetchByCategory(catId, 1);
};

export const warmupContent = async () => {
    console.log("🔥 System Warming Up...");
    // Prefetch high priority content
    Promise.all([
        fetchLatest(1),
        fetchAnimeHome(),
        fetchCoursesByCategory('programming', 1),
        fetchByCategory('ramadan-2025', 1),
        fetchByCategory('cartoon-series', 1)
    ]).then(() => console.log("✅ System Warmup Complete"));
};

export const clearAllCache = async () => {
    // 1. Clear Frontend In-Memory Cache
    cache.clear();

    // 2. Clear Backend Caches via Admin Endpoint
    try {
        await api.post('/scrapers/clear-all-cache', null, {
            headers: { 'Authorization': 'admin_master_token_2025' }
        });
        console.log("🚀 Global Cache Purged Successfully");
        return true;
    } catch (e) {
        console.warn("Failed to clear backend cache:", e);
        return false;
    }
};

export const saveHistory = async (userId: string, contentId: string, contentType: string, episodeId?: string) => {
    try {
        await api.post("/user/history", null, {
            params: {
                user_id: userId,
                content_id: contentId,
                content_type: contentType,
                episode_id: episodeId
            }
        });
    } catch (e) {
        console.warn("Failed to save history", e);
    }
};
