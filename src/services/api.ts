import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 
                     'https://minaewrw-meih-movies-api.hf.space';
// Note: If you want to use a local backend, set VITE_API_URL=http://localhost:8000

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

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
    type: 'movie' | 'series';
    duration?: string;
}

export interface Episode {
    id: string;
    title: string;
    episode: number;
    url: string;
}

export interface Server {
    name: string;
    url: string;
    type?: 'video' | 'iframe';
}

export interface Download {
    quality: string;
    url: string;
}

export interface Details {
    title: string;
    description: string;
    poster: string;
    type: 'movie' | 'series';
    episodes: Episode[];
    servers: Server[];
    download_links: Download[];
    current_episode?: {
        id: string;
        title: string;
    };
    error?: string;
    message?: string;
}

export const getProxyImage = (url: string) => {
  if (!url) return '';
  // If it's a relative path from the backend, prepend the API base
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  // If it's already a full proxied URL, return as is
  if (url.includes('/proxy/image')) return url;
  // Fallback: proxy it manually
  return `${API_BASE_URL}/proxy/image?url=${encodeURIComponent(url)}`;
};

export const getProxyDownloadUrl = (url: string, filename: string) => {
  return `${API_BASE_URL}/download/file?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
};

const mapContentItem = (item: ContentItem) => ({
  ...item,
  poster: getProxyImage(item.poster)
});

export const fetchLatest = async (page: number = 1) => {
  const cacheKey = `latest_${page}`;
  const cached = getCachedData<ContentItem[]>(cacheKey);
  if (cached) return cached;
  
  const data = (await api.get<ContentItem[]>(`/latest?page=${page}`)).data;
  const mapped = (Array.isArray(data) ? data : []).map(mapContentItem);
  setCachedData(cacheKey, mapped);
  return mapped;
};

export const fetchDetails = async (id: string) => {
  const cacheKey = `details_${id}`;
  const cached = getCachedData<Details>(cacheKey);
  if (cached) return cached;
  
  const data = (await api.get<Details>(`/details/${id}`)).data;
  if (data && data.poster) {
    data.poster = getProxyImage(data.poster);
  }
  setCachedData(cacheKey, data);
  return data;
};

export const searchContent = async (query: string) => {
  const cacheKey = `search_${query}`;
  const cached = getCachedData<ContentItem[]>(cacheKey);
  if (cached) return cached;
  
  const data = (await api.get<ContentItem[]>(`/search?q=${query}`)).data;
  const mapped = (Array.isArray(data) ? data : []).map(mapContentItem);
  setCachedData(cacheKey, mapped);
  return mapped;
};

export const fetchByCategory = async (catId: string, page: number = 1) => {
  const cacheKey = `category_${catId}_${page}`;
  const cached = getCachedData<ContentItem[]>(cacheKey);
  if (cached) return cached;
  
  const data = (await api.get<ContentItem[]>(`/category/${catId}?page=${page}`)).data;
  const mapped = (Array.isArray(data) ? data : []).map(mapContentItem);
  setCachedData(cacheKey, mapped);
  return mapped;
};

export const fetchDownloadInfo = async (url: string) => {
  return (await api.get(`/download/info?url=${encodeURIComponent(url)}`)).data;
};

