import { NextResponse } from 'next/server';
import { verifyCode } from '@/lib/verifier';

export async function POST(req) {
    try {
        const { code, language } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        const result = await verifyCode(code, language || 'auto');
        return NextResponse.json(result);

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
