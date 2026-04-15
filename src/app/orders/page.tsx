"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingCart, Truck, Loader2, CheckCircle2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, X, Save, Trash2, Plus } from "lucide-react";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [viewingOrder, setViewingOrder] = useState<any | null>(null);
    const [editingOrderContent, setEditingOrderContent] = useState<any | null>(null);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchingProducts, setSearchingProducts] = useState(false);
    const [selectingVariationProduct, setSelectingVariationProduct] = useState<any | null>(null);
    const [productVariations, setProductVariations] = useState<any[]>([]);
    const [loadingVariations, setLoadingVariations] = useState(false);

    // Pagination & Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [jumpPage, setJumpPage] = useState("1");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const perPage = 20;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearch !== searchTerm) {
                setDebouncedSearch(searchTerm);
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearch]);

    const fetchOrders = async (page: number, search: string = "") => {
        setLoading(true);
        setError(null);
        try {
            let url = `/api/orders?page=${page}&per_page=${perPage}`;
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            const res = await fetch(url);
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to fetch orders");
            }
            const data = await res.json();
            setOrders(data.orders || []);
            setTotalItems(data.totalItems || 0);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(page);
            setJumpPage(page.toString());
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    const handleJumpPage = (e: React.FormEvent) => {
        e.preventDefault();
        const targetPage = parseInt(jumpPage, 10);
        if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
            setCurrentPage(targetPage);
        } else {
            setJumpPage(currentPage.toString()); // Revert if invalid
        }
    };

    useEffect(() => {
        if (viewingOrder) {
            setEditingOrderContent(JSON.parse(JSON.stringify(viewingOrder)));
        } else {
            setEditingOrderContent(null);
        }
    }, [viewingOrder]);

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        setUpdatingId(id);
        const previousOrders = [...orders];
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Update failed");
            // Refresh to get correct totals/states if needed
        } catch (err) {
            console.error(err);
            setOrders(previousOrders);
            alert("Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSaveOrder = async () => {
        if (!editingOrderContent) return;
        setIsSavingOrder(true);
        try {
            const res = await fetch(`/api/orders/${editingOrderContent.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingOrderContent),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save order");
            }
            const updated = await res.json();
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            setViewingOrder(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSavingOrder(false);
        }
    };

    const handleProductSearch = async (val: string) => {
        setProductSearch(val);
        if (val.length < 3) {
            setSearchResults([]);
            return;
        }
        setSearchingProducts(true);
        try {
            const res = await fetch(`/api/products?search=${encodeURIComponent(val)}&per_page=5`);
            const data = await res.json();
            setSearchResults(data.products || []);
        } catch (err) {
            console.error(err);
        } finally {
            setSearchingProducts(false);
        }
    };

    const addProductToOrder = async (product: any) => {
        if (!editingOrderContent) return;

        if (product.type === "variable") {
            setSelectingVariationProduct(product);
            setLoadingVariations(true);
            setProductVariations([]);
            try {
                const res = await fetch(`/api/products/${product.id}/variations`);
                const data = await res.json();
                setProductVariations(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch variations", err);
            } finally {
                setLoadingVariations(false);
            }
            return;
        }

        const newItem = {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            price: product.price,
            total: product.price,
            sku: product.sku
        };
        setEditingOrderContent({
            ...editingOrderContent,
            line_items: [...editingOrderContent.line_items, newItem]
        });
        setProductSearch("");
        setSearchResults([]);
    };

    const addVariationToOrder = (variation: any) => {
        if (!editingOrderContent || !selectingVariationProduct) return;

        const attributesSuffix = variation.attributes.map((a: any) => a.option).join(" - ");
        const newItem = {
            product_id: selectingVariationProduct.id,
            variation_id: variation.id,
            name: `${selectingVariationProduct.name} - ${attributesSuffix}`,
            quantity: 1,
            price: variation.price,
            total: variation.price,
            sku: variation.sku || selectingVariationProduct.sku
        };

        setEditingOrderContent({
            ...editingOrderContent,
            line_items: [...editingOrderContent.line_items, newItem]
        });

        setSelectingVariationProduct(null);
        setProductVariations([]);
        setProductSearch("");
        setSearchResults([]);
    };

    const removeProductFromOrder = (index: number) => {
        if (!editingOrderContent) return;
        const items = [...editingOrderContent.line_items];
        items.splice(index, 1);
        setEditingOrderContent({ ...editingOrderContent, line_items: items });
    };

    const updateItemQty = (index: number, qty: number) => {
        if (!editingOrderContent) return;
        const items = [...editingOrderContent.line_items];
        items[index].quantity = Math.max(1, qty);
        items[index].total = (parseFloat(items[index].price) * items[index].quantity).toFixed(2);
        setEditingOrderContent({ ...editingOrderContent, line_items: items });
    };

    const calculateSubtotal = () => {
        if (!editingOrderContent) return 0;
        return editingOrderContent.line_items.reduce((sum: number, item: any) => sum + parseFloat(item.total || 0), 0).toFixed(2);
    };

    const calculateTotal = () => {
        if (!editingOrderContent) return 0;
        const subtotal = parseFloat(calculateSubtotal().toString());
        const shipping = parseFloat(editingOrderContent.shipping_total || 0);
        const discount = parseFloat(editingOrderContent.discount_total || 0);
        return Math.max(0, subtotal + shipping - discount).toFixed(2);
    };

    const updateShippingTotal = (val: string) => {
        if (!editingOrderContent) return;
        const total = val || "0";

        // Update shipping_lines to ensure WC persists the change
        const shipping_lines = [...(editingOrderContent.shipping_lines || [])];
        if (shipping_lines.length > 0) {
            shipping_lines[0].total = total;
        } else {
            shipping_lines.push({
                method_id: "flat_rate",
                method_title: "Shipping",
                total: total
            });
        }

        setEditingOrderContent({
            ...editingOrderContent,
            shipping_total: total,
            shipping_lines
        });
    };

    const updateDiscountTotal = (val: string) => {
        if (!editingOrderContent) return;
        const total = val || "0";

        // Update coupon_lines if any exist
        const coupon_lines = [...(editingOrderContent.coupon_lines || [])];
        if (coupon_lines.length > 0) {
            coupon_lines[0].discount = total;
        }
        // Note: Creating a coupon from scratch requires a code. 
        // We'll update top-level as well for UI responsiveness.

        setEditingOrderContent({
            ...editingOrderContent,
            discount_total: total,
            coupon_lines
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-emerald-400/10 text-emerald-400 border-emerald-500/20";
            case "processing": return "bg-blue-400/10 text-blue-400 border-blue-500/20";
            case "on-hold": return "bg-amber-400/10 text-amber-400 border-amber-500/20";
            case "cancelled": return "bg-red-400/10 text-red-400 border-red-500/20";
            case "refunded": return "bg-zinc-400/10 text-zinc-400 border-zinc-500/20";
            default: return "bg-purple-400/10 text-purple-400 border-purple-500/20";
        }
    };

    const paginationJSX = (
        <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span className="font-medium whitespace-nowrap">
                {totalItems.toLocaleString()} items
            </span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1 || loading}
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <form onSubmit={handleJumpPage} className="flex items-center gap-2 mx-2">
                    <input
                        type="text"
                        value={jumpPage}
                        onChange={(e) => setJumpPage(e.target.value)}
                        onBlur={handleJumpPage}
                        className="w-12 text-center rounded border border-zinc-700 bg-zinc-950 px-2 py-1 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="whitespace-nowrap">of {totalPages}</span>
                </form>

                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
                <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || loading}
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-100 items-center flex gap-3">
                        <ShoppingCart className="h-8 w-8 text-indigo-400" /> Orders
                    </h1>
                    <p className="text-zinc-400 mt-2">Manage customer orders and fulfillments.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 shadow-md">
                <div className="flex w-full lg:w-auto items-center gap-3">
                    <Search className="h-5 w-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search orders (ID, Customer name)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 lg:w-64 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                    />
                </div>
                {/* Upper Pagination */}
                <div className="ml-auto">
                    {paginationJSX}
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm shadow-xl relative">
                {loading && (
                    <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none" />
                )}
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left text-sm text-zinc-400 min-w-[700px]">
                        <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-300">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Order</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Total</th>
                                <th className="px-6 py-4 font-semibold text-right">Status Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-red-400">
                                        Error: {error}
                                    </td>
                                </tr>
                            ) : loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-5 w-16 rounded bg-zinc-800"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-zinc-800"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-zinc-800"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-zinc-800"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-32 rounded bg-zinc-800 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No recent orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const isUpdating = updatingId === order.id;
                                    return (
                                        <tr key={order.id} className="transition-colors hover:bg-zinc-800/30">
                                            <td className="px-6 py-4 font-medium text-zinc-100 flex items-center gap-2">
                                                <span className="text-zinc-500">#</span>{order.number}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(order.date_created).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-zinc-200">{order.billing.first_name} {order.billing.last_name}</span>
                                                    <span className="text-xs text-zinc-500">{order.billing.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-zinc-300">
                                                {order.currency_symbol}{order.total}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => setViewingOrder(order)}
                                                        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-indigo-400"
                                                        title="Edit Order"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <div className="relative">
                                                        <select
                                                            disabled={isUpdating}
                                                            value={order.status}
                                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                            className={`appearance-none border text-xs font-semibold rounded-lg text-center pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all capitalize ${getStatusColor(order.status)} ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:brightness-110"}`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="on-hold">On Hold</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                            <option value="refunded">Refunded</option>
                                                        </select>
                                                        {isUpdating && (
                                                            <div className="absolute right-2 top-1.5 pointer-events-none">
                                                                <Loader2 className="h-4 w-4 text-current opacity-70 animate-spin" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Lower Pagination */}
                {orders.length > 0 && !error && (
                    <div className="border-t border-zinc-800 bg-zinc-900/80 px-6 py-4 flex justify-end">
                        {paginationJSX}
                    </div>
                )}
            </div>

            {/* Order Editor Modal */}
            {viewingOrder && editingOrderContent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200 relative">
                        <div className="px-4 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 sticky top-0 z-10">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-zinc-100 italic line-clamp-1">Edit Order #{editingOrderContent.number}</h2>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">{new Date(editingOrderContent.date_created).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    onClick={handleSaveOrder}
                                    disabled={isSavingOrder}
                                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    {isSavingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    <span className="hidden xs:inline">Save</span>
                                </button>
                                <button onClick={() => setViewingOrder(null)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 sm:space-y-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-zinc-950/30 p-4 sm:p-5 rounded-2xl border border-zinc-800/50 space-y-4">
                                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" /> Billing Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold">First Name</label>
                                                <input
                                                    value={editingOrderContent.billing.first_name}
                                                    onChange={(e) => setEditingOrderContent({ ...editingOrderContent, billing: { ...editingOrderContent.billing, first_name: e.target.value } })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold">Last Name</label>
                                                <input
                                                    value={editingOrderContent.billing.last_name}
                                                    onChange={(e) => setEditingOrderContent({ ...editingOrderContent, billing: { ...editingOrderContent.billing, last_name: e.target.value } })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="sm:col-span-2 space-y-1">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold">Address</label>
                                                <input
                                                    value={editingOrderContent.billing.address_1}
                                                    onChange={(e) => setEditingOrderContent({ ...editingOrderContent, billing: { ...editingOrderContent.billing, address_1: e.target.value } })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold">Phone</label>
                                                <input
                                                    value={editingOrderContent.billing.phone}
                                                    onChange={(e) => setEditingOrderContent({ ...editingOrderContent, billing: { ...editingOrderContent.billing, phone: e.target.value } })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold">Email</label>
                                                <input
                                                    value={editingOrderContent.billing.email}
                                                    onChange={(e) => setEditingOrderContent({ ...editingOrderContent, billing: { ...editingOrderContent.billing, email: e.target.value } })}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-zinc-950/30 p-4 sm:p-5 rounded-2xl border border-zinc-800/50 space-y-4 shadow-inner">
                                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Costs & Adjustments</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold">Shipping Cost (৳)</label>
                                                <input
                                                    type="number"
                                                    value={editingOrderContent.shipping_total}
                                                    onChange={(e) => updateShippingTotal(e.target.value)}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold">Discount / Coupon (৳)</label>
                                                <input
                                                    type="number"
                                                    value={editingOrderContent.discount_total}
                                                    onChange={(e) => updateDiscountTotal(e.target.value)}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold">Status</label>
                                                <select
                                                    value={editingOrderContent.status}
                                                    onChange={(e) => setEditingOrderContent({ ...editingOrderContent, status: e.target.value })}
                                                    className="w-full appearance-none border border-zinc-800 rounded-lg px-3 py-2 text-sm font-semibold capitalize bg-zinc-900 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="on-hold">On Hold</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 bg-zinc-950/20 p-4 sm:p-6 rounded-3xl border border-zinc-800/40">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-4 gap-4">
                                    <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                        Line Items
                                    </h3>
                                    <div className="relative w-full sm:w-64">
                                        <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">
                                            <Search className="h-4 w-4 text-zinc-500" />
                                            <input
                                                placeholder="Add product..."
                                                value={productSearch}
                                                onChange={(e) => handleProductSearch(e.target.value)}
                                                className="bg-transparent text-xs text-zinc-100 focus:outline-none w-full"
                                            />
                                        </div>
                                        {searchResults.length > 0 && (
                                            <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                                {searchResults.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => addProductToOrder(p)}
                                                        className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2"
                                                    >
                                                        <div className="h-6 w-6 rounded bg-zinc-800 shrink-0 overflow-hidden">
                                                            {p.images?.[0]?.src && <img src={p.images[0].src} className="h-full w-full object-cover" />}
                                                        </div>
                                                        <span className="truncate">{p.name} - ৳{p.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {searchingProducts && (
                                            <div className="absolute right-3 top-2.5">
                                                <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {editingOrderContent.line_items.map((item: any, idx: number) => (
                                        <div key={idx} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/50 hover:bg-zinc-800/40 transition-all gap-4">
                                            <div className="flex-1 space-y-1">
                                                <p className="text-zinc-100 font-bold text-sm group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{item.name}</p>
                                                <p className="text-[10px] text-zinc-500 font-mono">SKU: {item.sku || "N/A"}</p>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 border-t sm:border-t-0 border-zinc-800 pt-3 sm:pt-0">
                                                <div className="flex items-center gap-3">
                                                    <label className="text-[10px] text-zinc-500 uppercase font-black">Qty</label>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItemQty(idx, parseInt(e.target.value))}
                                                        className="w-12 sm:w-16 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-100 text-center font-bold"
                                                    />
                                                </div>
                                                <div className="w-20 sm:w-24 text-right shrink-0">
                                                    <p className="text-[10px] text-zinc-500 uppercase italic mb-1">Total</p>
                                                    <p className="font-bold text-zinc-100 text-sm">৳{item.total}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeProductFromOrder(idx)}
                                                    className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {editingOrderContent.line_items.length === 0 && (
                                        <div className="py-12 text-center text-zinc-600 italic text-sm">
                                            No products in this order. Use the search box above to add some.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Variation Selection Dropover */}
                        {selectingVariationProduct && (
                            <div className="absolute inset-0 z-30 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
                                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                                    <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-100 italic">Select Variation</h3>
                                            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">{selectingVariationProduct.name}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectingVariationProduct(null)}
                                            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
                                        {loadingVariations ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                                <p className="text-sm text-zinc-500 font-medium animate-pulse">Fetching variations...</p>
                                            </div>
                                        ) : productVariations.length === 0 ? (
                                            <div className="text-center py-12">
                                                <p className="text-zinc-500 italic">No variations found for this product.</p>
                                            </div>
                                        ) : (
                                            productVariations.map(v => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => addVariationToOrder(v)}
                                                    className="w-full text-left p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <p className="text-zinc-100 font-bold group-hover:text-indigo-400 transition-colors">
                                                                {v.attributes.map((a: any) => a.option).join(" / ")}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tight">SKU: {v.sku || "N/A"}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-zinc-100">৳{v.price}</p>
                                                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">
                                                                {v.stock_quantity !== null ? `${v.stock_quantity} in stock` : "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Total Footer Container with better wrapping for mobile */}
                        <div className="px-4 sm:px-8 py-5 border-t border-zinc-800 bg-zinc-950/80 flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-md mt-auto">
                            <div className="grid grid-cols-2 xs:flex gap-4 sm:gap-8 text-[10px] text-zinc-500 uppercase font-bold tracking-widest w-full md:w-auto">
                                <div>Subtotal: <span className="text-zinc-200 ml-1 italic block xs:inline">৳{calculateSubtotal()}</span></div>
                                <div>Shipping: <span className="text-zinc-200 ml-1 italic block xs:inline">৳{editingOrderContent.shipping_total}</span></div>
                                <div className="text-red-400/80">Discount: <span className="ml-1 italic block xs:inline">৳{editingOrderContent.discount_total}</span></div>
                            </div>
                            <div className="text-center md:text-right w-full md:w-auto border-t md:border-t-0 border-zinc-800/50 pt-4 md:pt-0">
                                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1">Payable Amount</p>
                                <p className="text-3xl sm:text-4xl font-black text-indigo-400 leading-none drop-shadow-2xl">৳{calculateTotal()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
