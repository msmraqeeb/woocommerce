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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...options.headers,
    };

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    try {
        const response = await fetch(`${url}/wp-json/wc/v3${path}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            let errorText = await response.text();
            // Sanitize HTML responses to prevent dumping raw HTML in UI
            if (errorText.includes('<html') || errorText.includes('<!DOCTYPE')) {
                // Try to extract text inside <title> or <h1>, otherwise default to status text
                const titleMatch = errorText.match(/<title>(.*?)<\/title>/i);
                const h1Match = errorText.match(/<h1>(.*?)<\/h1>/i);
                errorText = h1Match ? h1Match[1] : (titleMatch ? titleMatch[1] : 'Server returned an HTML error page');
            }

            console.error(`WooCommerce API Error (${response.status}):`, errorText);
            throw new Error(`WooCommerce Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
    } catch (error) {
        console.error("wooFetch Error:", error);
        throw error;
    }
}
