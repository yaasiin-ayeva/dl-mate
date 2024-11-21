import DlMate from '../src/dlmate';
import { validate } from '../src/validator';

jest.mock('axios');
const axios = require('axios');

describe('DlMate TikTok Download', () => {

  let dlMate: DlMate;

  beforeEach(() => {
    dlMate = new DlMate({ timeout: 10000, retries: 3, cacheTime: 3600 });
  });

  it('should validate a valid TikTok URL', () => {
    const validUrl = 'https://www.tiktok.com/@lyricmate/video/7413647349991427334?is_from_webapp=1&sender_device=pc&web_id=7367327613927622150';
    const isValid = validate(validUrl, 'tiktok');
    expect(isValid).toBe(true);
  });

  it('should throw error for an invalid TikTok URL', () => {
    const invalidUrl = 'https://tiktok.com/@user/123';
    const isValid = validate(invalidUrl, 'tiktok');
    expect(isValid).toBe(false);
  });

  it('should return correct TikTok data on success', async () => {
    const mockTikTokData = {
      title: 'Sample Title',
      title_audio: 'Sample Audio Title',
      thumbnail: 'https://path/to/thumbnail.jpg',
      video: ['https://path/to/video.mp4'],
      audio: ['https://path/to/audio.mp3'],
      metadata: {
        duration: 120,
        created_at: 1609459200,
        views: 1000,
        likes: 200,
        shares: 50,
      },
    };

    axios.post.mockResolvedValueOnce({ data: { data: mockTikTokData } });

    const result = await dlMate.downloadTikTok('https://www.tiktok.com/@lyricmate/video/7413647349991427334?is_from_webapp=1&sender_device=pc&web_id=7367327613927622150');
    expect(result.title).toBe('Sample Title');
    expect(result.video.length).toBeGreaterThan(0);
  });

  it('should handle error for TikTok download', async () => {
    axios.post.mockRejectedValueOnce(new Error('TikTok API Error'));

    await expect(dlMate.downloadTikTok('https://www.tiktok.com/@lyricmate/video/7413647349991427334?is_from_webapp=1&sender_device=pc&web_id=7367327613927622150'))
      .rejects
      .toThrow('TikTok API Error');
  });

  it('should clear the cache for a given URL', () => {
    dlMate.clearCache('tiktok', 'https://www.tiktok.com/@lyricmate/video/7413647349991427334?is_from_webapp=1&sender_device=pc&web_id=7367327613927622150');
    expect(dlMate.getCacheStats().keys).toBe(0);
  });
});
