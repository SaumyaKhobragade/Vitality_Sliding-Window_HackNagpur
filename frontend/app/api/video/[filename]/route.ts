import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * API Route to serve video files from the backend SampleVideo directory
 * GET /api/video/[filename]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Path to the video files in the backend
    const videoDir = join(process.cwd(), '..', 'imageVideoBackend', 'SampleVideo');
    const videoPath = join(videoDir, filename);

    // Check if file exists
    if (!existsSync(videoPath)) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    try {
        const videoBuffer = await readFile(videoPath);

        // Determine content type based on file extension
        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'video/mp4';
        if (ext === 'webm') contentType = 'video/webm';
        else if (ext === 'avi') contentType = 'video/x-msvideo';
        else if (ext === 'mov') contentType = 'video/quicktime';

        return new NextResponse(videoBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': videoBuffer.length.toString(),
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Error reading video file:', error);
        return NextResponse.json({ error: 'Failed to read video' }, { status: 500 });
    }
}
