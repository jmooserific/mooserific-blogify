import { parseTumblrData } from '../src/parser/tumblrParser';
import { Post } from '../src/types';

describe('Tumblr Parser', () => {
    it('should parse a valid Tumblr post', () => {
        const input = {
            date: '2025-07-26T14:42:00Z',
            author: 'vemoose',
            caption: 'This is a test caption.',
            photos: [
                { url: 'http://example.com/photo1.jpg', width: 800, height: 600 },
                { url: 'http://example.com/photo2.jpg', width: 1200, height: 900 }
            ],
            videos: [
                { url: 'http://example.com/video1.mp4', resolution: '720p' }
            ]
        };

        const expectedOutput: Post = {
            date: '2025-07-26T14:42:00',
            author: 'vemoose',
            caption: 'This is a test caption.',
            photos: [
                { filename: '01.jpg', width: 800, height: 600 },
                { filename: '02.jpg', width: 1200, height: 900 }
            ],
            videos: ['video1.mp4']
        };

        const result = parseTumblrData(input);
        expect(result).toEqual(expectedOutput);
    });

    it('should handle missing fields gracefully', () => {
        const input = {
            date: '2025-07-26T14:42:00Z',
            author: 'vemoose',
            caption: null,
            photos: [],
            videos: []
        };

        const expectedOutput: Post = {
            date: '2025-07-26T14:42:00',
            author: 'vemoose',
            caption: '',
            photos: [],
            videos: []
        };

        const result = parseTumblrData(input);
        expect(result).toEqual(expectedOutput);
    });

    it('should return empty arrays for posts with no media', () => {
        const input = {
            date: '2025-07-26T14:42:00Z',
            author: 'vemoose',
            caption: 'No media here.',
            photos: [],
            videos: []
        };

        const expectedOutput: Post = {
            date: '2025-07-26T14:42:00',
            author: 'vemoose',
            caption: 'No media here.',
            photos: [],
            videos: []
        };

        const result = parseTumblrData(input);
        expect(result).toEqual(expectedOutput);
    });
});