export interface DlMateConfig {
    timeout?: number;
    retries?: number;
    cacheTime?: number;
    maxCacheSize?: number;
}

export type Platform = 'tiktok' | 'youtube' | 'x' | 'linkedin';

export interface XDownloadResult {
    title?: string;
    downloads: {
        quality: 'HD' | 'SD';
        url: string;
    }[];
    thumbnail?: string;
}

export interface TikTokDownloadResult {
    title: string;
    title_audio: string;
    thumbnail: string;
    video: string[];
    audio: string[];
    metadata: {
        duration: number;
        created_at: number;
        views: number;
        likes: number;
        shares: number;
    };
}

export interface YouTubeDownloadFormat {
    url: string;
    quality: string;
    type: string;
}

export interface LinkedInVideoData {
    url: string;
    quality: string | null;
}

export interface LinkedInDownloadResult {
    title: string | null;
    downloads: LinkedInVideoData[];
}
