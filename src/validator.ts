import { Platform } from "./dlmate";

const URL_PATTERNS: { [key in Platform]: RegExp } = {
    tiktok: /^(https?:\/\/)?(www\.)?(tiktok\.com)\/.+$/,
    youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    instagram: /^(https?:\/\/)?(www\.)?(instagram\.com)\/.+$/,
};

export function validate(url: string, platform: Platform): boolean {
    const pattern = URL_PATTERNS[platform];
    if (!pattern) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    return pattern.test(url);
}
