# dl-mate
A robust Node.js library for downloading content from various social media platforms including TikTok, Instagram, YouTube, and more. Built with reliability, caching, and error handling in mind.

## Features

- 🚀 Support for multiple platforms:
  - TikTok videos and music
  - Instagram posts, reels, and stories
  - YouTube videos (multiple quality options)
- 💾 Built-in caching system
- 🔄 Automatic retries with exponential backoff
- ✅ Comprehensive URL validation
- 🛡️ Error handling and timeout management
- 📊 Cache statistics and management
- 🧪 Thoroughly tested with Jest

## Installation

```bash
npm install dl-mate
# or
yarn add dl-mate
```

<!-- Required peer dependencies:
```bash
npm install axios axios-retry node-cache cheerio
``` -->

## Quick Start

```javascript
import DlMate from 'dl-mate';

// Initialize with default config
const mate = new DlMate();

// Download TikTok video
try {
    const result = await mate.downloadTikTok(
        'https://www.tiktok.com/@user/video/1234567890'
    );
    console.log(result);
} catch (error) {
    console.error('Download failed:', error.message);
}
```

## Configuration

The downloader can be initialized with custom configuration:

```javascript
const mate = new DlMate({
    timeout: 30000,     // Request timeout in ms
    retries: 3,         // Number of retry attempts
    cacheTime: 3600,    // Cache TTL in seconds
    maxCacheSize: 100   // Maximum number of cached items
});
```

## API Reference

### TikTok Downloads

```javascript
const result = await mate.downloadTikTok(url);
```

Returns:
```javascript
{
    title: string,
    title_audio: string,
    thumbnail: string,
    video: string[],
    audio: string[],
    metadata: {
        duration: number,
        created_at: string,
        views: number,
        likes: number,
        shares: number
    }
}
```

### Instagram Downloads

```javascript
const result = await mate.downloadInstagram(url);
```

Returns:
```javascript
{
    type: 'post' | 'reel',
    downloads: [
        {
            quality: string,
            thumbnail: string,
            url: string,
            size: string
        }
    ]
}
```

### YouTube Downloads

```javascript
const result = await mate.downloadYouTube(url);
```

Returns:
```javascript
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

### Cache Management

```javascript
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

```javascript
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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This library is for educational purposes only. Please respect the terms of service and usage policies of the respective social media platforms.