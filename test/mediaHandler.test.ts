import { downloadMedia } from '../src/media/mediaHandler';
import { promises as fs } from 'fs';
import path from 'path';

describe('Media Handler', () => {
    const testDir = path.join(__dirname, 'testMedia');
    const mediaUrl = 'https://example.com/media/01.jpg';
    const mediaUrl2 = 'https://example.com/media/02.mp4';
    const mediaUrls = [mediaUrl, mediaUrl2];

    beforeAll(async () => {
        await fs.mkdir(testDir, { recursive: true });
    });

    afterAll(async () => {
        await fs.rmdir(testDir, { recursive: true });
    });

    it('should download and save media files correctly', async () => {
        const mediaFiles = await downloadMedia(mediaUrls, testDir);

        expect(mediaFiles).toHaveLength(2);
        expect(mediaFiles).toContainEqual(expect.stringContaining('01.jpg'));
        expect(mediaFiles).toContainEqual(expect.stringContaining('02.mp4'));
    });

    it('should handle errors gracefully when downloading media', async () => {
        const invalidUrl = 'https://example.com/media/invalid.jpg';
        const mediaFiles = await downloadMedia([invalidUrl], testDir);

        expect(mediaFiles).toHaveLength(0);
    });
});