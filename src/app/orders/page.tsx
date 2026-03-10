"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingCart, Truck, Loader2, CheckCircle2 } from "lucide-react";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/orders");
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to fetch orders");
            }
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

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
            case "completed": return "bg-emerald-400/10 text-emerald-400";
            case "processing": return "bg-blue-400/10 text-blue-400";
            case "on-hold": return "bg-amber-400/10 text-amber-400";
            case "cancelled": return "bg-red-400/10 text-red-400";
            case "refunded": return "bg-zinc-400/10 text-zinc-400";
            default: return "bg-purple-400/10 text-purple-400";
        }
    };

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

            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 shadow-md">
                <Search className="h-5 w-5 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search orders (ID, Customer name)..."
                    className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm shadow-xl">
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
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>

                                                {/* Action Dropdown Alternative using Select */}
                                                <div className="relative">
                                                    <select
                                                        disabled={isUpdating}
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                        className={`appearance-none bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-zinc-700"}`}
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
                                                            <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
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
        </div>
    );
}
