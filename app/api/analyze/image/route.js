import { NextResponse } from 'next/server';
import { detectAIImage } from '@/lib/verifier';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('image');

        if (!file) {
            return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await detectAIImage(buffer, file.type);

        return NextResponse.json(result);

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
