"use client";

import { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  monthlySales: string;
  monthlyOrders: number;
}

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
      value: stats ? `৳${parseFloat(stats.monthlySales).toFixed(2)}` : "$0.00",
      icon: DollarSign,
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

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-500">
        <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
        <p className="mt-2 text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            {/* Glossy hover effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Decorative gradient blur in background */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center -z-10 mix-blend-screen opacity-20">
        <div className="h-[40rem] w-[40rem] rounded-full bg-indigo-500 blur-[128px]" />
      </div>
    </div>
  );
}
