import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as fs from 'fs';
import * as path from 'path';

// API endpoint to serve cover images, bypassing URL encoding issues
// API endpoint to serve cover images with safe ASCII-only filenames
export const GET: RequestHandler = async ({ params }) => {
    let { filename } = params;

    if (!filename) {
        throw error(400, 'Filename is required');
    }

    console.log('Requested safe filename:', filename);

    // Security: only allow .jpg files  
    if (!filename.endsWith('.jpg')) {
        throw error(400, 'Only JPG files are allowed');
    }

    // Security: only allow cover_*.jpg format (ASCII alphanumeric + underscore + dot)
    if (!/^cover_[a-f0-9]{8}\.jpg$/.test(filename)) {
        throw error(400, 'Invalid filename format');
    }

    try {
        // Construct path to the safe cover image
        const imagePath = path.join(process.cwd(), 'src', 'lib', 'assets', 'covers_safe', filename);
        console.log('Serving file:', imagePath);

        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            console.warn(`Image not found: ${imagePath}. Serving placeholder.`);
            // Return a simple SVG placeholder
            const placeholderSvg = `
                <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="200" fill="#f0f0f0"/>
                    <text x="50%" y="50%" font-family="Arial" font-size="20" fill="#999" text-anchor="middle" dy=".3em">Missing</text>
                </svg>
            `;
            return new Response(placeholderSvg, {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'no-cache'
                }
            });
        }

        // Read and return the image
        const imageBuffer = fs.readFileSync(imagePath);
        console.log('Successfully served', imageBuffer.length, 'bytes');

        return new Response(imageBuffer, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (err) {
        console.error(`Failed to load image: ${filename}`, err);
        // Even on error, return placeholder to verify build safety
        const placeholderSvg = `
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#ffeeee"/>
                <text x="50%" y="50%" font-family="Arial" font-size="20" fill="#ff6b6b" text-anchor="middle" dy=".3em">Error</text>
            </svg>
        `;
        return new Response(placeholderSvg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'no-cache'
            }
        });
    }
};
