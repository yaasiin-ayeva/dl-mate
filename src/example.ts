import DlMate from "./dlmate";

async function main() {
    const mate = new DlMate({
        timeout: 15000,
        retries: 5,
        cacheTime: 3600,
    });

    const tiktokUrl = 'https://www.tiktok.com/@lyricmate/video/7413647349991427334?is_from_webapp=1&sender_device=pc&web_id=7367327613927622150';
    const instagramUrl = 'https://www.instagram.com/reel/DCje8JSpUsl/?utm_source=ig_web_copy_link';
    const youtubeUrl = 'https://youtu.be/k947KH4Ll-Y?si=eXTsBixG4LAqEJq-';
    
    try {
        const tiktokData = await mate.downloadTikTok(tiktokUrl);
        console.log('TikTok Data:', tiktokData);

        const youtubeData = await mate.downloadYouTube(youtubeUrl);
        console.log('YouTube Data:', youtubeData);

        const instagramData = await mate.downloadInstagram(instagramUrl);
        console.log('Instagram Data:', instagramData);

        const cacheStats = mate.getCacheStats();
        console.log('Cache Stats:', cacheStats);

    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('An unknown error occurred', error);
        }
    }
}

main();