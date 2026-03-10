import { NextResponse } from 'next/server';
import { wooFetch } from '@/lib/woocommerce';

export async function GET() {
    try {
        // Note: WooCommerce API doesn't have a single "dashboard" endpoint.
        // We can fetch reports, or just aggregate some data using specific endpoints.
        // For a simple dashboard, we can fetch total orders count and products count.

        // Fetch products
        const productsRes = await fetch(`${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=1`, {
            headers: { Authorization: `Basic ${btoa(`${process.env.WOOCOMMERCE_KEY}:${process.env.WOOCOMMERCE_SECRET}`)}` }
        });
        const totalProducts = productsRes.headers.get('x-wp-total') || '0';

        // Fetch orders
        const ordersRes = await fetch(`${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/orders?per_page=1`, {
            headers: { Authorization: `Basic ${btoa(`${process.env.WOOCOMMERCE_KEY}:${process.env.WOOCOMMERCE_SECRET}`)}` }
        });
        const totalOrders = ordersRes.headers.get('x-wp-total') || '0';

        // Fetch recent orders to calculate revenue perhaps? Or use reports endpoint.
        const salesRes = await wooFetch('/reports/sales?period=month');

        return NextResponse.json({
            totalProducts: parseInt(totalProducts, 10),
            totalOrders: parseInt(totalOrders, 10),
            monthlySales: salesRes[0]?.total_sales || "0.00",
            monthlyOrders: salesRes[0]?.total_orders || 0,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
