"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Settings } from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Sidebar container */}
            <div className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-zinc-950 text-zinc-100 border-r border-zinc-800 shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                }`}>
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                            Kids Paradise
                        </span>
                    </div>
                </div>

                <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-8 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => onClose()}
                                className={`group flex items-center gap-x-3 rounded-lg p-3 text-sm font-semibold transition-all duration-200 ${isActive
                                    ? "bg-indigo-600/10 text-indigo-400 shadow-sm shadow-indigo-500/5"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                                    }`}
                            >
                                <item.icon
                                    className={`h-5 w-5 shrink-0 transition-colors duration-200 ${isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                                {isActive && (
                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-zinc-800 p-4">
                    <button className="group flex w-full items-center gap-x-3 rounded-lg p-3 text-sm font-semibold text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100">
                        <Settings className="h-5 w-5 shrink-0 text-zinc-500 group-hover:text-zinc-300" />
                        Settings
                    </button>
                </div>
            </div>
        </>
    );
}
