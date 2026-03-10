import { NextResponse } from 'next/server';
import { wooFetch } from '@/lib/woocommerce';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '20';

    try {
        const orders = await wooFetch(`/orders?page=${page}&per_page=${perPage}`);
        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
