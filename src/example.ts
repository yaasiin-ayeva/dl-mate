import DlMate from "./dlmate";

async function main() {
    
    const mate = new DlMate({
        timeout: 15000,
        retries: 5,
        cacheTime: 3600,
    });

    const tiktokUrl = 'https://www.tiktok.com/@lyricmate/video/7413647349991427334?is_from_webapp=1&sender_device=pc&web_id=7367327613927622150';
    const youtubeUrl = 'https://youtube.com/shorts/TfBtqDa2Yd8?si=voKSnR9eL8UShq4t';
    const xUrl = "https://x.com/rough__sea/status/1859685138323628316";
    const linkedinUrl = "https://www.linkedin.com/feed/update/urn:li:activity:7267102275511222273?utm_source=share&utm_medium=member_desktop";
    // const facebookUrl = "https://web.facebook.com/openai/videos/248478235847140";
    // const instagramUrl = 'https://www.instagram.com/reel/DBbjz5wvtXp/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==';

    try {
        const tiktokData = await mate.downloadTikTok(tiktokUrl);
        console.log('TikTok Data:', tiktokData);

        const youtubeData = await mate.downloadYouTube(youtubeUrl);
        console.log('YouTube Data:', youtubeData);

        const xData = await mate.downloadX(xUrl);
        console.log('X Data:', xData);
        
        const linkedinData = await mate.downloadLinkedIn(linkedinUrl);
        console.log('LinkedIn Data:', linkedinData);

        // const instagramData = await mate.downloadInstagram(instagramUrl);
        // console.log('Instagram Data:', instagramData);

        // const facebookData = await mate.downloadFacebook(facebookUrl);
        // console.log('Facebook Data:', facebookData);

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