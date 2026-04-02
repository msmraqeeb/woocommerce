"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Search, Edit2, Trash2, Package, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { ProductFormModal } from "@/components/ProductFormModal";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    // Pagination & Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [jumpPage, setJumpPage] = useState("1");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState("date-desc");
    const [filterStatus, setFilterStatus] = useState("any");
    const [filterStock, setFilterStock] = useState("");
    const [focusValue, setFocusValue] = useState<any>(null);
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

    const fetchProducts = async (page: number, search: string = "") => {
        setLoading(true);
        setError(null);
        try {
            let url = `/api/products?page=${page}&per_page=${perPage}`;
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            if (sortBy) {
                const [orderby, order] = sortBy.split('-');
                url += `&orderby=${orderby}&order=${order}`;
            }
            if (filterStatus) {
                url += `&status=${filterStatus}`;
            }
            if (filterStock) {
                url += `&stock_status=${filterStock}`;
            }
            const res = await fetch(url);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to fetch products");
            }
            const data = await res.json();
            setProducts(data.products || []);
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
        fetchProducts(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch, sortBy, filterStatus, filterStock]);

    const handleJumpPage = (e: React.FormEvent) => {
        e.preventDefault();
        const targetPage = parseInt(jumpPage, 10);
        if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
            setCurrentPage(targetPage);
        } else {
            setJumpPage(currentPage.toString()); // Revert if invalid
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        // Optimistic UI update
        setProducts(products.filter((p) => p.id !== id));
        setTotalItems(prev => Math.max(0, prev - 1));

        try {
            await fetch(`/api/products/${id}`, { method: "DELETE" });
        } catch (err) {
            console.error("Delete failed", err);
            fetchProducts(currentPage, debouncedSearch); // Revert on failure
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

    const handleLiveUpdate = async (id: number, field: string, value: any) => {
        if (value === focusValue) return; // No change

        try {
            let updatePayload: any = {};
            if (field === 'stock_quantity') {
                updatePayload = { manage_stock: true, stock_quantity: value === "" ? 0 : Number(value) };
            } else if (field === 'regular_price') {
                updatePayload = { regular_price: String(value) };
            } else {
                updatePayload = { [field]: value };
            }

            const res = await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatePayload),
            });
            
            if (!res.ok) throw new Error("Failed to update");
            
            const updatedProduct = await res.json();
            setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
        } catch (err) {
            console.error("Live update failed", err);
            fetchProducts(currentPage, debouncedSearch); // Revert on failure
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

            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 shadow-md">
                <div className="flex flex-col sm:flex-row w-full xl:w-auto items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto bg-zinc-950/50 border border-zinc-800 px-3 py-1.5 rounded-lg">
                        <Search className="h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 sm:w-48 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <select 
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                            className="bg-zinc-950 border border-zinc-700 text-sm rounded-lg px-3 py-1.5 text-zinc-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                        >
                            <option value="any">All Status</option>
                            <option value="publish">Published</option>
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="private">Private</option>
                        </select>

                        <select 
                            value={filterStock}
                            onChange={(e) => { setFilterStock(e.target.value); setCurrentPage(1); }}
                            className="bg-zinc-950 border border-zinc-700 text-sm rounded-lg px-3 py-1.5 text-zinc-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                        >
                            <option value="">All Stock</option>
                            <option value="instock">In Stock</option>
                            <option value="outofstock">Out of Stock</option>
                            <option value="onbackorder">On Backorder</option>
                        </select>

                        <select 
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                            className="bg-zinc-950 border border-zinc-700 text-sm rounded-lg px-3 py-1.5 text-zinc-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="title-asc">Name (A-Z)</option>
                            <option value="title-desc">Name (Z-A)</option>
                            <option value="price-asc">Price (Low to High)</option>
                            <option value="price-desc">Price (High to Low)</option>
                        </select>
                    </div>
                </div>
                {/* Upper Pagination */}
                <div className="ml-auto flex shrink-0">
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
                            <th className="px-6 py-4 font-semibold">Product</th>
                            <th className="px-6 py-4 font-semibold">SKU</th>
                            <th className="px-6 py-4 font-semibold text-center">Quantity</th>
                            <th className="px-6 py-4 font-semibold">Price</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {error ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-red-400">
                                    Error: {error}
                                </td>
                            </tr>
                        ) : loading && products.length === 0 ? (
                            // Skeleton rows
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-5 w-48 rounded bg-zinc-800"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-zinc-800"></div></td>
                                    <td className="px-6 py-4 text-center"><div className="h-4 w-10 rounded bg-zinc-800 mx-auto"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-zinc-800"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-zinc-800"></div></td>
                                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 rounded bg-zinc-800 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
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
                                        <input
                                            type="text"
                                            value={product.name}
                                            onFocus={(e) => setFocusValue(e.target.value)}
                                            onChange={(e) => setProducts(prev => prev.map(p => p.id === product.id ? { ...p, name: e.target.value } : p))}
                                            onBlur={(e) => handleLiveUpdate(product.id, 'name', e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                            className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-indigo-500 focus:outline-none truncate w-[150px] sm:w-[200px]"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={product.sku || ""}
                                            placeholder="N/A"
                                            onFocus={(e) => setFocusValue(e.target.value)}
                                            onChange={(e) => setProducts(prev => prev.map(p => p.id === product.id ? { ...p, sku: e.target.value } : p))}
                                            onBlur={(e) => handleLiveUpdate(product.id, 'sku', e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                            className="w-24 bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-indigo-500 focus:outline-none text-zinc-300"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium">
                                        {product.type === "variable" ? (
                                            <span className="text-zinc-500 text-xs italic cursor-help" title="Variable products manage stock at the variation level">Variable</span>
                                        ) : (
                                            <input
                                                type="number"
                                                value={product.stock_quantity ?? ""}
                                                placeholder="—"
                                                onFocus={(e) => setFocusValue(e.target.value)}
                                                onChange={(e) => setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_quantity: e.target.value } : p))}
                                                onBlur={(e) => handleLiveUpdate(product.id, 'stock_quantity', e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                                className={`w-16 text-center bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-indigo-500 focus:outline-none ${product.manage_stock && product.stock_quantity <= 0 ? "text-red-400 font-bold" : "text-zinc-100"}`}
                                            />
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.type === "variable" ? (
                                            <span>৳{product.price || "0.00"}</span>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <span>৳</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={product.regular_price ?? product.price ?? ""}
                                                    placeholder="0.00"
                                                    onFocus={(e) => setFocusValue(e.target.value)}
                                                    onChange={(e) => setProducts(prev => prev.map(p => p.id === product.id ? { ...p, regular_price: e.target.value, price: e.target.value } : p))}
                                                    onBlur={(e) => handleLiveUpdate(product.id, 'regular_price', e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                                    className="w-20 bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-indigo-500 focus:outline-none"
                                                />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.status === "publish"
                                            ? "bg-emerald-400/10 text-emerald-400"
                                            : "bg-amber-400/10 text-amber-400"
                                            }`}>
                                            {product.status === "publish" ? "Published" : product.status.charAt(0).toUpperCase() + product.status.slice(1)}
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

                {/* Lower Pagination */}
                {products.length > 0 && !error && (
                    <div className="border-t border-zinc-800 bg-zinc-900/80 px-6 py-4 flex justify-end">
                        {paginationJSX}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <ProductFormModal
                    product={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchProducts(currentPage, debouncedSearch);
                    }}
                />
            )}
        </div>
    );
}
