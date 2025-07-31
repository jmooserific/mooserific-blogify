import { writeFile } from 'fs/promises';
import { join } from 'path';
import { PostData } from '../src/types';
import { createPostJson } from '../src/writer/postWriter';

describe('postWriter', () => {
    const outputDir = './test_output';
    const postData: PostData = {
        date: '2025-07-26T14:42:00',
        author: 'vemoose',
        caption: 'Sample caption',
        photos: [
            { filename: '01.jpg', width: 800, height: 600 },
            { filename: '02.jpg', width: 1200, height: 900 }
        ],
        videos: ['clip1.mp4', 'clip2.mp4']
    };

    beforeAll(async () => {
        await writeFile(join(outputDir, '2025-07-26T14-42/post.json'), JSON.stringify(postData, null, 2));
    });

    afterAll(async () => {
        // Clean up test output directory if needed
    });

    it('should create post.json with correct structure', async () => {
        const folderName = '2025-07-26T14-42';
        const postJsonPath = join(outputDir, folderName, 'post.json');

        const result = await createPostJson(postData, outputDir);
        expect(result).toBeTruthy();

        const fileContent = await readFile(postJsonPath, 'utf-8');
        const parsedContent = JSON.parse(fileContent);

        expect(parsedContent).toEqual(postData);
    });

    it('should handle missing fields gracefully', async () => {
        const incompletePostData: PostData = {
            date: '2025-07-26T14:42:00',
            author: 'vemoose',
            caption: '',
            photos: [],
            videos: []
        };

        const result = await createPostJson(incompletePostData, outputDir);
        expect(result).toBeTruthy();

        const folderName = '2025-07-26T14-42';
        const postJsonPath = join(outputDir, folderName, 'post.json');
        const fileContent = await readFile(postJsonPath, 'utf-8');
        const parsedContent = JSON.parse(fileContent);

        expect(parsedContent.caption).toBe('');
        expect(parsedContent.photos).toEqual([]);
        expect(parsedContent.videos).toEqual([]);
    });
});