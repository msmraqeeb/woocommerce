import { NextResponse } from 'next/server';
import { wooFetch } from '@/lib/woocommerce';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const updatedOrder = await wooFetch(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
