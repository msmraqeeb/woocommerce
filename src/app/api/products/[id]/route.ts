import { NextResponse } from 'next/server';
import { wooFetch } from '@/lib/woocommerce';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const product = await wooFetch(`/products/${id}`);
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const updatedProduct = await wooFetch(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const deletedProduct = await wooFetch(`/products/${id}?force=true`, {
            method: 'DELETE',
        });
        return NextResponse.json(deletedProduct);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
