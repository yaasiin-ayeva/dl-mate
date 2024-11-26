import DlMate from '../src/dlmate';
import { validate } from '../src/validator';

jest.mock('axios');
// const axios = require('axios');

describe('TikTok Download', () => {

  let dlMate: DlMate;

  beforeEach(() => {
    dlMate = new DlMate({ timeout: 10000, retries: 3, cacheTime: 3600 });
  });

  it('should validate a valid TikTok URL', () => {
    const validUrl = 'https://vm.tiktok.com/ZMh3jtwJq/';
    const isValid = validate(validUrl, 'tiktok');
    expect(isValid).toBe(true);
  });

  it('should clear the cache for a given URL', () => {
    dlMate.clearCache('tiktok', 'https://www.tiktok.com/@lyricmate/video/7413647349991427334?is_from_webapp=1&sender_device=pc&web_id=7367327613927622150');
    expect(dlMate.getCacheStats().keys).toBe(0);
  });
});
