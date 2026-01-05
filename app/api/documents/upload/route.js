import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { processDocument } from '@/lib/documentProcessor';

export async function POST(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type;
        const filename = file.name;

        // Validation
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
        }

        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
            'text/plain'
        ];

        if (!allowedTypes.includes(mimeType)) {
            return NextResponse.json({ error: 'Unsupported file type. Please upload PDF, DOCX, PPTX, or TXT.' }, { status: 400 });
        }

        // Process Document (Extract Text)
        // We do this immediately to avoid storing binary files in DB/Disk for this MVP
        const { text, metadata } = await processDocument(buffer, mimeType);

        if (!text || text.length < 50) {
            return NextResponse.json({ error: 'Could not extract sufficient text from file. It might be empty or scanned image (OCR not fully enabled).' }, { status: 400 });
        }

        // Create Document in DB
        const document = await prisma.document.create({
            data: {
                userId: session.user.id,
                filename: filename,
                content: text,
                // We could add metadata column if schema supported it, or just use content
            }
        });

        return NextResponse.json({
            status: 'uploaded',
            documentId: document.id,
            filename: document.filename,
            size: file.size,
            extractedWordCount: metadata.wordCount
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
