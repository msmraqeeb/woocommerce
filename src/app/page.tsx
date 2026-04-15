"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  monthlySales: string;
  monthlyOrders: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

const TakaSign = ({ className }: { className?: string }) => (
  <span className={className} style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>৳</span>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const metricCards = [
    {
      name: "Total Earnings",
      value: stats ? `৳${parseFloat(stats.monthlySales).toFixed(2)}` : "৳0.00",
      icon: TakaSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      description: "Sales this month",
    },
    {
      name: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      description: "All time recorded orders",
    },
    {
      name: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      description: "Inventory items across store",
    },
    {
      name: "Monthly Orders",
      value: stats?.monthlyOrders || 0,
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      description: "Orders placed this month",
    },
  ];

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

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-500">
        <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
        <p className="mt-2 text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Overview</h1>
        <p className="text-zinc-400 mt-2">Welcome back to your WooCommerce command center.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => (
          <div
            key={card.name}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-800/80 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">{card.name}</p>
                {loading ? (
                  <div className="mt-2 h-8 w-24 animate-pulse rounded-md bg-zinc-800" />
                ) : (
                  <p className="mt-2 text-3xl font-semibold text-zinc-100">{card.value}</p>
                )}
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-zinc-500">
              {loading ? (
                <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
              ) : (
                <p>{card.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Orders Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden shadow-xl">
          <div className="border-b border-zinc-800 bg-zinc-900/80 px-6 py-4">
            <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-indigo-400" /> Recent Orders
            </h2>
          </div>
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left text-sm text-zinc-400 min-w-[500px]">
              <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Order</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Total</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-12 rounded bg-zinc-800"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-zinc-800"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-zinc-800"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 rounded bg-zinc-800"></div></td>
                    </tr>
                  ))
                ) : stats?.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 italic">No recent orders.</td>
                  </tr>
                ) : (
                  stats?.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-200">#{order.number}</td>
                      <td className="px-6 py-4 text-zinc-400 truncate max-w-[120px]">{order.billing.first_name} {order.billing.last_name}</td>
                      <td className="px-6 py-4 text-zinc-100 font-medium">৳{order.total}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize transition-all duration-200 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Alert / Recent Products */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden shadow-xl">
          <div className="border-b border-zinc-800 bg-zinc-900/80 px-6 py-4 flex justify-between items-center">
            <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-400" /> Out of Stock items
            </h2>
          </div>
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left text-sm text-zinc-400 min-w-[500px]">
              <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">SKU</th>
                  <th className="px-6 py-3 font-semibold">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-zinc-800"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-zinc-800"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-8 rounded bg-zinc-800"></div></td>
                    </tr>
                  ))
                ) : stats?.lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-zinc-500 italic">All products are in stock.</td>
                  </tr>
                ) : (
                  stats?.lowStockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-200 truncate max-w-[200px]">{product.name}</td>
                      <td className="px-6 py-4 text-zinc-400">{product.sku || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className="text-red-400 font-bold">0</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Decorative gradient blur in background */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center -z-10 mix-blend-screen opacity-10">
        <div className="h-[40rem] w-[40rem] rounded-full bg-indigo-500 blur-[128px]" />
      </div>
    </div>
  );
}
