import axios, { type AxiosInstance } from 'axios';
import { load as cheerioLoad } from 'cheerio';
import NodeCache from 'node-cache';
import axiosRetry from 'axios-retry';
import { validate as validateUrl } from './validator';

interface DlMateConfig {
    timeout?: number;
    retries?: number;
    cacheTime?: number;
    maxCacheSize?: number;
}

export type Platform = "tiktok" | "instagram" | "youtube";

interface TikTokDownloadResult {
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

interface InstagramDownloadResult {
    type: 'reel' | 'post';
    downloads: {
        quality: string;
        thumbnail: string;
        url: string;
        size: string;
    }[];
}

interface YouTubeDownloadFormat {
    url: string;
    quality: string;
    type: string;
}

export default class DlMate {
    private config: DlMateConfig;
    private cache: NodeCache;
    private axios: AxiosInstance;

    constructor(config: DlMateConfig = {}) {

        this.config = {
            timeout: 30000,
            retries: 3,
            cacheTime: 3600,
            maxCacheSize: 100,
            ...config,
        };

        this.cache = new NodeCache({
            stdTTL: this.config.cacheTime,
            maxKeys: this.config.maxCacheSize,
            checkperiod: 120,
        });

        this.axios = axios.create({
            timeout: this.config.timeout,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                Accept: 'application/json, text/javascript, */*; q=0.01',
            },
        });

        // TODO: Add retry logic
        // axiosRetry(this.axios, {
        //     retries: this.config.retries,
        //     retryDelay: axiosRetry.exponentialDelay,
        //     retryCondition: axiosRetry.isNetworkOrIdempotentRequestError,
        // });
    }

    private async download<T>(
        url: string,
        platform: Platform,
        downloadFn: (validUrl: string) => Promise<T>
    ): Promise<T> {
        if (!validateUrl(url, platform)) {
            throw new Error(`Invalid ${platform} URL`);
        }

        const cacheKey = `${platform}:${url}`;
        const cachedResult = this.cache.get<T>(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        const result = await downloadFn(url);
        this.cache.set(cacheKey, result);

        return result;
    }

    async downloadTikTok(url: string): Promise<TikTokDownloadResult> {
        return this.download(url, 'tiktok', async (validUrl) => {
            const baseUrl = 'https://www.tikwm.com';
            const response = await this.axios.post(`${baseUrl}/api/`, {
                url: validUrl,
                count: 12,
                cursor: 0,
                web: 1,
                hd: 1,
            });

            const data = response.data?.data;
            if (!data) {
                throw new Error('Invalid response from TikTok API');
            }

            return {
                title: data.title,
                title_audio: data.music_info.title,
                thumbnail: `${baseUrl}${data.cover}`,
                video: [`${baseUrl}${data.play}`],
                audio: [`${baseUrl}${data.music}`],
                metadata: {
                    duration: data.duration,
                    created_at: data.create_time,
                    views: data.play_count,
                    likes: data.digg_count,
                    shares: data.share_count,
                },
            };
        });
    }

    async downloadInstagram(url: string): Promise<InstagramDownloadResult> {
        return this.download(url, 'instagram', async (validUrl) => {
            const response = await this.axios.post(
                'https://snapsave.app/action.php',
                { url: validUrl },
                {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        origin: 'https://snapsave.app',
                        referer: 'https://snapsave.app/id',
                    },
                }
            );

            const $ = cheerioLoad(response.data);
            const results: InstagramDownloadResult['downloads'] = [];

            $('.download-items__thumb, article.media > figure').each((_, element) => {
                const thumbnail = $(element).find('img').attr('src');
                const downloadBtn = $(element).next('.download-items__btn');

                if (!thumbnail) return;

                downloadBtn.find('a').each((_, link) => {
                    const downloadUrl = $(link).attr('href');
                    if (!downloadUrl) return;

                    const finalUrl = downloadUrl.startsWith('http')
                        ? downloadUrl
                        : `https://snapsave.app${downloadUrl}`;
                    const quality = $(link).text().trim();

                    console.log("Downloading:", finalUrl);
                    console.log("Download URL:", downloadUrl);

                    results.push({
                        quality,
                        thumbnail,
                        url: finalUrl,
                        size: $(link).closest('td').prev().text().trim(),
                    });
                });
            });

            if (!results.length) {
                throw new Error('No downloadable content found');
            }

            return {
                type: url.includes('/reel/') ? 'reel' : 'post',
                downloads: results,
            };
        });
    }

    async downloadYouTube(url: string): Promise<{ videoId: string; formats: YouTubeDownloadFormat[] }> {
        return this.download(url, 'youtube', async (validUrl) => {
            const videoId = validUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:shorts\/|watch\?v=|music\?v=|embed\/|v\/|.+\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];

            if (!videoId) {
                throw new Error('Could not extract video ID');
            }

            const downloadFormat = async (type: string, quality: string): Promise<YouTubeDownloadFormat> => {
                const params = new URLSearchParams({
                    videoid: videoId,
                    downtype: type,
                    vquality: quality,
                });

                const response = await this.axios.post(
                    'https://api-cdn.saveservall.xyz/ajax-v2.php',
                    params,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );

                if (!response.data?.url) {
                    throw new Error(`Failed to get ${type} format`);
                }

                return {
                    url: response.data.url,
                    quality,
                    type,
                };
            };

            const formats = await Promise.all([
                downloadFormat('mp3', '128'),
                downloadFormat('mp3', '320'),
                downloadFormat('mp4', '720'),
                downloadFormat('mp4', '1080'),
            ]).catch(() => [

            ]);

            return {
                videoId,
                formats: formats.filter((f) => f?.url),
            };
        });
    }

    clearCache(platform?: string, url?: string): void {
        if (platform && url) {
            this.cache.del(`${platform}:${url}`);
        } else if (platform) {
            const keys = this.cache.keys();
            keys.forEach((key) => {
                if (key.startsWith(`${platform}:`)) {
                    this.cache.del(key);
                }
            });
        } else {
            this.cache.flushAll();
        }
    }

    getCacheStats(): NodeCache.Stats {
        return this.cache.getStats();
    }
}