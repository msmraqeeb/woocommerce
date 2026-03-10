import { NextResponse } from 'next/server';
import { wooFetch } from '@/lib/woocommerce';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '20';

    try {
        const products = await wooFetch(`/products?page=${page}&per_page=${perPage}&status=any`);
        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newProduct = await wooFetch('/products', {
            method: 'POST',
            body: JSON.stringify(body),
        });
        return NextResponse.json(newProduct, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
