"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingCart, Truck, Loader2, CheckCircle2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, X } from "lucide-react";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [viewingOrder, setViewingOrder] = useState<any | null>(null);

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

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        setUpdatingId(id);

        // Optimistic UI update
        const previousOrders = [...orders];
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));

        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Update failed");
        } catch (err) {
            console.error(err);
            setOrders(previousOrders); // Revert
            alert("Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
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
                <table className="w-full text-left text-sm text-zinc-400">
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
                            // Skeleton rows
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
                                                    title="View Items"
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
                                                        <option className="bg-zinc-900 text-zinc-300 capitalize" value="pending">Pending</option>
                                                        <option className="bg-zinc-900 text-zinc-300 capitalize" value="processing">Processing</option>
                                                        <option className="bg-zinc-900 text-zinc-300 capitalize" value="on-hold">On Hold</option>
                                                        <option className="bg-zinc-900 text-zinc-300 capitalize" value="completed">Completed</option>
                                                        <option className="bg-zinc-900 text-zinc-300 capitalize" value="cancelled">Cancelled</option>
                                                        <option className="bg-zinc-900 text-zinc-300 capitalize" value="refunded">Refunded</option>
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

                {/* Lower Pagination */}
                {orders.length > 0 && !error && (
                    <div className="border-t border-zinc-800 bg-zinc-900/80 px-6 py-4 flex justify-end">
                        {paginationJSX}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-100">Order #{viewingOrder.number}</h2>
                                <p className="text-xs text-zinc-500 mt-1">{new Date(viewingOrder.date_created).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setViewingOrder(null)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Customer Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Billing Address</h3>
                                    <p className="text-zinc-200 text-sm leading-relaxed">
                                        {viewingOrder.billing.first_name} {viewingOrder.billing.last_name}<br />
                                        {viewingOrder.billing.address_1}<br />
                                        {viewingOrder.billing.city}, {viewingOrder.billing.state} {viewingOrder.billing.postcode}<br />
                                        {viewingOrder.billing.phone}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Order Stats</h3>
                                    <div className="space-y-1">
                                        <p className="text-sm text-zinc-300 flex justify-between"><span>Status:</span> <span className="font-semibold text-indigo-400">{viewingOrder.status}</span></p>
                                        <p className="text-sm text-zinc-300 flex justify-between"><span>Payment:</span> <span className="font-semibold text-zinc-100">{viewingOrder.payment_method_title}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Item List */}
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Line Items</h3>
                                <div className="space-y-3">
                                    {viewingOrder.line_items.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-800/60">
                                            <div className="flex-1">
                                                <p className="text-zinc-100 font-medium text-sm">{item.name}</p>
                                                <p className="text-xs text-zinc-500 mt-1">Quantity: {item.quantity} × {viewingOrder.currency_symbol}{item.price}</p>
                                            </div>
                                            <p className="font-semibold text-zinc-100 text-sm ml-4">{viewingOrder.currency_symbol}{item.total}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-zinc-500 uppercase font-semibold">Total Amount</p>
                                <p className="text-2xl font-bold text-indigo-400">{viewingOrder.currency_symbol}{viewingOrder.total}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
