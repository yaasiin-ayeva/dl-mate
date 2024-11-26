# dl-mate
A Node.js library for downloading content from various social media platforms including TikTok, LinkedIn, YouTube, X (Twitter), and more. Built with reliability and caching in mind.

## Features

- 🚀 Support for multiple platforms:
  - TikTok videos, music, and video metadata
  - LinkedIn Video posts
  - X (Twitter) videos
  - Pinterest videos
  - YouTube videos (multiple quality options)
- 💾 Built-in caching system
- 🔄 Automatic retries with exponential backoff
- ✅ Comprehensive URL validation
- 🛡️ Error handling and timeout management
- 📊 Cache statistics and management

## Installation

```bash
npm install dl-mate
# or
yarn add dl-mate
```

## Quick Start

```typescript
import DlMate from 'dl-mate';

// Initialize with default config
const mate = new DlMate();

// Download TikTok video
try {
    const result = await mate.downloadTikTok(
        'https://www.tiktok.com/@champ_marco/video/7424898414418087173?is_from_webapp=1&sender_device=pc&web_id=7367327613927622150'
    );
    console.log(result);
} catch (error) {
    console.error('Download failed:', error.message);
}
```

## Configuration

The downloader can be initialized with custom configuration:

```typescript
const mate = new DlMate({
    timeout: 30000,     // Request timeout in ms
    retries: 3,         // Number of retry attempts
    cacheTime: 3600,    // Cache TTL in seconds
    maxCacheSize: 100   // Maximum number of cached items
});
```

## API Reference

The library supports currently downloading content from the following platforms:

| Platform | Function | Is Standalone (ie. not using any third-party service) |
| --- | --- | --- |
| LinkedIn | `downloadLinkedIn` | ✅ |
| Pinterest | `downloadPinterest` | ✅ |
| TikTok | `downloadTikTok` | 🔜 |
| X (Twitter) | `downloadX` | 🔜 |
| YouTube | `downloadYouTube` | 🔜 |

### TikTok Downloads

```typescript
const result = await mate.downloadTikTok(url);
```

Returns:
```typescript
{
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
```

### X (Twitter) Downloads

```typescript
const result = await mate.downloadX(url);
```

Returns:
```typescript
{
    title?: string;
    downloads: {
        quality: 'HD' | 'SD';
        url: string;
    }[];
    thumbnail?: string;
}
```

### YouTube Downloads

```typescript
const result = await mate.downloadYouTube(url);
```

Returns:
```typescript
{
    videoId: string,
    formats: [
        {
            url: string,
            quality: string,
            type: 'mp3' | 'mp4'
        }
    ]
}
```

### LinkedIn Downloads

```typescript
const result = await mate.downloadLinkedIn(url);
```

Returns:
```typescript
{
    title: string,
    downloads: [
        {
            url: string,
            quality: string | null,
        }
    ]
}
```

### Pinterest Downloads

```typescript
const result = await mate.downloadPinterest(url);
```

Returns:
```typescript
{
    title: string | null;
    video: string | null;
    thumbnail: string | null;
    metadata?: {
        description?: string;
    };
}
```

### Cache Management

```typescript
// Clear cache for specific URL
mate.clearCache('tiktok', url);

// Clear all cache for platform
mate.clearCache('tiktok');

// Clear entire cache
mate.clearCache();

// Get cache statistics
const stats = mate.getCacheStats();
```

## Error Handling

The library throws descriptive errors that can be caught and handled:

```typescript
try {
    const result = await mate.downloadTikTok(url);
} catch (error) {
    if (error.message.includes('Invalid URL')) {
        console.error('The provided URL is not valid');
    } else if (error.message.includes('Network error')) {
        console.error('Network connection failed');
    } else {
        console.error('Download failed:', error.message);
    }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Credits

This project was built by [yaasiin-ayeva](https://github.com/yaasiin-ayeva) and some functionnalities uses third-party apis and websites.

- [TikVM](tikwm.com) for TikTok downloads
- [SaveServall](https://saveservall.xyz) for YouTube downloads
- [Twdown.net](https://twdown.net) & [twdownload.dev](https://twdownload.dev) for X downloads

Dl-Mate uses these third-party services for downloading content but still have its own standalone method of downloading from some plateforms.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This library is for educational purposes only. Please respect the terms of service and usage policies of the respective social media platforms.