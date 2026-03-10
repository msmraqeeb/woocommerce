"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { ProductFormModal } from "@/components/ProductFormModal";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        // Optimistic UI update
        setProducts(products.filter((p) => p.id !== id));

        try {
            await fetch(`/api/products/${id}`, { method: "DELETE" });
        } catch (err) {
            console.error("Delete failed", err);
            fetchProducts(); // Revert on failure
        }
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-100 items-center flex gap-3">
                        <Package className="h-8 w-8 text-indigo-400" /> Products
                    </h1>
                    <p className="text-zinc-400 mt-2">Manage your store inventory.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </button>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 shadow-md">
                <Search className="h-5 w-5 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm shadow-xl">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-300">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Product</th>
                            <th className="px-6 py-4 font-semibold">SKU</th>
                            <th className="px-6 py-4 font-semibold">Price</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {loading ? (
                            // Skeleton rows
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-5 w-48 rounded bg-zinc-800"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-zinc-800"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-zinc-800"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-zinc-800"></div></td>
                                    <td className="px-6 py-4text-right"><div className="h-8 w-16 rounded bg-zinc-800 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                    No products found. Add one to get started.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="transition-colors hover:bg-zinc-800/30">
                                    <td className="px-6 py-4 font-medium text-zinc-100 flex items-center gap-3">
                                        {product.images?.[0]?.src ? (
                                            <img src={product.images[0].src} alt={product.name} className="h-10 w-10 min-w-10 rounded-lg object-cover bg-zinc-800" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                <Package className="h-5 w-5 text-zinc-500" />
                                            </div>
                                        )}
                                        <span className="truncate max-w-[200px]">{product.name}</span>
                                    </td>
                                    <td className="px-6 py-4">{product.sku || "N/A"}</td>
                                    <td className="px-6 py-4">৳{product.price || "0.00"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.status === "publish"
                                                ? "bg-emerald-400/10 text-emerald-400"
                                                : "bg-amber-400/10 text-amber-400"
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-indigo-400"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <ProductFormModal
                    product={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchProducts();
                    }}
                />
            )}
        </div>
    );
}
