export async function wooFetch(endpoint: string, options: RequestInit = {}) {
    const url = process.env.WOOCOMMERCE_URL;
    const key = process.env.WOOCOMMERCE_KEY;
    const secret = process.env.WOOCOMMERCE_SECRET;

    if (!url || !key || !secret) {
        throw new Error('Missing WooCommerce configuration environment variables');
    }

    const authString = btoa(`${key}:${secret}`);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        ...options.headers,
    };

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // adding default per_page to 100 for some endpoints if not provided via query

    try {
        const response = await fetch(`${url}/wp-json/wc/v3${path}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`WooCommerce API Error (${response.status}):`, errorText);
            throw new Error(`WooCommerce Error: ${response.statusText} - ${errorText}`);
        }

        return response.json();
    } catch (error) {
        console.error("wooFetch Error:", error);
        throw error;
    }
}
