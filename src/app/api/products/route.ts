import { NextResponse } from 'next/server';
import { wooFetch } from '@/lib/woocommerce';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '20';
    const search = searchParams.get('search') || '';

    try {
        let backendEndpoint = `/wp-json/wc/v3/products?page=${page}&per_page=${perPage}&status=any`;
        if (search) {
            backendEndpoint += `&search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(`${process.env.WOOCOMMERCE_URL}${backendEndpoint}`, {
            headers: {
                Authorization: `Basic ${btoa(`${process.env.WOOCOMMERCE_KEY}:${process.env.WOOCOMMERCE_SECRET}`)}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to fetch products");
        }

        const data = await response.json();
        const totalItems = parseInt(response.headers.get('x-wp-total') || '0', 10);
        const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '0', 10);

        return NextResponse.json({
            products: Array.isArray(data) ? data : [],
            totalItems,
            totalPages
        });
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
