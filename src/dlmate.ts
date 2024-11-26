import axios, { type AxiosInstance } from 'axios';
import { CheerioAPI, load as cheerioLoad } from 'cheerio';
import NodeCache from 'node-cache';
// import axiosRetry from 'axios-retry';
import { validate as validateUrl } from './validator';
import {
    DlMateConfig,
    Platform,
    TikTokDownloadResult,
    YouTubeDownloadFormat,
    LinkedInDownloadResult,
    XDownloadResult,
    LinkedInVideoData,
    PinterestDownloadResult,
} from './types';


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

    async downloadX(url: string): Promise<XDownloadResult> {
        try {
            const downloadServices = [
                'https://twdown.net/download.php',
                'https://twdownload.dev/download'
            ];

            for (const service of downloadServices) {
                try {
                    const data = new URLSearchParams();
                    data.append('URL', url);

                    const response = await this.axios.post(
                        service,
                        data,
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Referer': service
                            }
                        }
                    );

                    const $ = cheerioLoad(response.data);
                    const title = $('div:nth-child(1) > div:nth-child(2) > p').text().trim();

                    const downloads: XDownloadResult['downloads'] = [];

                    const hdLink = $('tr:nth-child(1) > td:nth-child(4) > a').attr('href') ||
                        $('div:nth-child(1) > div.download-btn > a').attr('href');
                    const sdLink = $('tr:nth-child(2) > td:nth-child(4) > a').attr('href') ||
                        $('div:nth-child(2) > .download-btn > a').attr('href');

                    if (hdLink) downloads.push({ quality: 'HD', url: hdLink });
                    if (sdLink) downloads.push({ quality: 'SD', url: sdLink });

                    if (downloads.length) {
                        return {
                            title,
                            downloads,
                            thumbnail: $('img.thumbnail').attr('src') ||
                                $('div.video-thumbnail img').attr('src')
                        };
                    }
                } catch (serviceError) {
                    console.warn(`Twitter download service ${service} failed:`, serviceError);
                }
            }

            throw new Error('No download links found');
        } catch (error: any) {
            throw new Error(`Twitter download failed: ${error.message}`);
        }
    }

    async downloadLinkedIn(url: string): Promise<LinkedInDownloadResult> {
        return this.download(url, 'linkedin', async (validUrl) => {
            const fetchHtml = async (validUrl: string): Promise<any> => {
                try {
                    const response = await axios.get(validUrl);
                    const html = cheerioLoad(response.data);
                    if (!html) {
                        throw new Error("Invalid content");
                    }
                    return html;
                } catch (error: any) {
                    throw new Error(`Unable to fetch content from LinkedIn: ${error.message}`);
                }
            };

            const getMetadata = (url: string, html: CheerioAPI): { quality: string | null; title: string | null } => {
                const pattern = /\/(\w*?)-(\w*?)-(\w*?)-/;
                const matches = url.match(pattern);

                const titleElement = html("meta[property='og:title']").attr("content") ||
                    html("title").text();
                const title = titleElement ? titleElement.trim() : null;

                return {
                    quality: matches ? matches[2] : null,
                    title: title,
                };
            };

            let videoTitle: string | null = null;

            const extractVideos = async (validUrl: string): Promise<LinkedInVideoData[]> => {
                const html = await fetchHtml(validUrl);
                const videoElements = html("video[data-sources]");
                const results: LinkedInVideoData[] = [];

                videoElements.each((_: any, element: any) => {
                    const ve = html(element).attr("data-sources");
                    if (ve) {
                        try {
                            const parsedVideos = JSON.parse(ve);
                            parsedVideos.forEach((videoObj: { src: string }) => {
                                if (videoObj.src) {
                                    const metadata = getMetadata(videoObj.src, html);
                                    videoTitle = metadata.title;
                                    const data = {
                                        url: videoObj.src,
                                        quality: metadata.quality,
                                    };
                                    results.push(data);
                                }
                            });
                        } catch (jsonError) {
                            console.warn("Failed to parse video sources:", jsonError);
                        }
                    }
                });

                return results;
            };

            const videos = await extractVideos(validUrl);
            if (!videos.length) {
                throw new Error("No videos found on the LinkedIn page.");
            }

            const videoData: LinkedInDownloadResult = {
                title: videoTitle ?? 'Untitled',
                downloads: videos,
            };

            return videoData;
        });
    }


    // In the DlMate class, add this method
    async downloadPinterest(url: string): Promise<PinterestDownloadResult> {
        return this.download(url, 'pinterest', async (validUrl) => {
            const response = await this.axios.get(validUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                }
            });

            const $ = cheerioLoad(response.data);

            // Try to find video
            const video = $('video[src]').first().attr('src');
            const videoUrl = video ?
                video.replace("/hls/", "/720p/").replace(".m3u8", ".mp4") :
                null;

            // Try to find title and description
            const title = $('meta[property="og:title"]').attr('content') ||
                $('title').text().trim() ||
                null;

            // Try to find thumbnail
            const thumbnail = $('meta[property="og:image"]').attr('content') || null;

            return {
                title,
                video: videoUrl,
                thumbnail,
                metadata: {
                    description: $('meta[property="og:description"]').attr('content') || undefined
                }
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