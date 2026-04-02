import { NextResponse } from 'next/server';
import { wooFetch } from '@/lib/woocommerce';

export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '20';
    const search = searchParams.get('search') || '';
    const orderby = searchParams.get('orderby') || 'date';
    const order = searchParams.get('order') || 'desc';
    const status = searchParams.get('status') || 'any';
    const stockStatus = searchParams.get('stock_status') || '';

    try {
        let backendEndpoint = `/wp-json/wc/v3/products?page=${page}&per_page=${perPage}&status=${status}&orderby=${orderby}&order=${order}`;
        if (stockStatus) {
            backendEndpoint += `&stock_status=${stockStatus}`;
        }

        let products: any[] = [];
        let totalItems = 0;
        let totalPages = 1;

        const authHeader = `Basic ${btoa(`${process.env.WOOCOMMERCE_KEY}:${process.env.WOOCOMMERCE_SECRET}`)}`;
        const headers = {
            Authorization: authHeader,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        };

        if (search) {
            // Fetch by generic text search (name/description)
            const searchPromise = fetch(`${process.env.WOOCOMMERCE_URL}${backendEndpoint}&search=${encodeURIComponent(search)}`, { headers });
            // Fetch exact SKU match
            const skuPromise = fetch(`${process.env.WOOCOMMERCE_URL}${backendEndpoint}&sku=${encodeURIComponent(search)}`, { headers });

            const [searchRes, skuRes] = await Promise.all([searchPromise, skuPromise]);

            if (!searchRes.ok || !skuRes.ok) {
                const errData = await (searchRes.ok ? skuRes : searchRes).json().catch(() => ({}));
                throw new Error(errData.message || "Failed to fetch products");
            }

            const searchData = await searchRes.json();
            const skuData = await skuRes.json();

            // Merge and deduplicate by ID
            const mergedProducts = [...(Array.isArray(searchData) ? searchData : []), ...(Array.isArray(skuData) ? skuData : [])];
            const uniqueProducts = Array.from(new Map(mergedProducts.map(item => [item.id, item])).values());

            products = uniqueProducts;
            totalItems = uniqueProducts.length;
            totalPages = 1;
        } else {
            const response = await fetch(`${process.env.WOOCOMMERCE_URL}${backendEndpoint}`, { headers });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to fetch products");
            }
            const data = await response.json();
            products = Array.isArray(data) ? data : [];
            totalItems = parseInt(response.headers.get('x-wp-total') || '0', 10);
            totalPages = parseInt(response.headers.get('x-wp-totalpages') || '0', 10);
        }

        return NextResponse.json({
            products,
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
