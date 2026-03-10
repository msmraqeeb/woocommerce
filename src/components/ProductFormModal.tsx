import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";

export function ProductFormModal({ product, onClose, onSuccess }: { product: any; onClose: () => void; onSuccess: () => void }) {
    const isEditing = !!product;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: product?.name || "",
        regular_price: product?.regular_price || "",
        sku: product?.sku || "",
        status: product?.status || "publish",
        description: product?.description || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing ? `/api/products/${product.id}` : "/api/products";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save product");
            onSuccess();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md transition-all">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
                    <h2 className="text-xl font-semibold text-zinc-100">
                        {isEditing ? "Edit Product" : "Create Product"}
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Product Name</label>
                        <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                            placeholder="E.g., Blue T-Shirt"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Price (৳)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                name="regular_price"
                                value={formData.regular_price}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-indigo-500 focus:outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">SKU</label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-indigo-500 focus:outline-none"
                                placeholder="Item SKU"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-zinc-100 focus:border-indigo-500 focus:outline-none appearance-none"
                        >
                            <option value="publish">Published</option>
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="private">Private</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isEditing ? "Save Changes" : "Create Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
