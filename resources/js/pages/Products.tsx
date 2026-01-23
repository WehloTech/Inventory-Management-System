import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../components/services/ProductServices';

interface Product {
    id: number;
    name: string;
    description?: string;
    quantity: number;
    price: number;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [form, setForm] = useState<Partial<Product>>({});
    const [editingId, setEditingId] = useState<number | null>(null);

    // Fetch products from API
    const fetchProducts = () => {
        getProducts().then(res => setProducts(res.data));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Create or update product
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateProduct(editingId, form).then(() => {
                fetchProducts();
                setForm({});
                setEditingId(null);
            });
        } else {
            createProduct(form).then(() => {
                fetchProducts();
                setForm({});
            });
        }
    };

    // Delete product
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id).then(() => fetchProducts());
        }
    };

    // Edit product
    const handleEdit = (p: Product) => {
        setForm(p);
        setEditingId(p.id);
    };

    // Cancel editing
    const handleCancel = () => {
        setForm({});
        setEditingId(null);
    };

    return (
        <div className="p-5 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Inventory</h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-6 border p-4 rounded bg-gray-50">
                <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h2>

                <div className="mb-2">
                    <label className="block mb-1">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name || ''}
                        onChange={handleChange}
                        className="border px-3 py-2 w-full rounded"
                        required
                    />
                </div>

                <div className="mb-2">
                    <label className="block mb-1">Description</label>
                    <textarea
                        name="description"
                        value={form.description || ''}
                        onChange={handleChange}
                        className="border px-3 py-2 w-full rounded"
                    />
                </div>

                <div className="mb-2 flex gap-2">
                    <div className="flex-1">
                        <label className="block mb-1">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={form.quantity || ''}
                            onChange={handleChange}
                            className="border px-3 py-2 w-full rounded"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block mb-1">Price</label>
                        <input
                            type="number"
                            step="0.01"
                            name="price"
                            value={form.price || ''}
                            onChange={handleChange}
                            className="border px-3 py-2 w-full rounded"
                            required
                        />
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        {editingId ? 'Update' : 'Add'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-300 text-black px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Product List */}
            <div>
                {products.map(p => (
                    <div key={p.id} className="border p-3 mb-2 rounded flex justify-between items-center">
                        <div>
                            <strong>{p.name}</strong> — Qty: {p.quantity} — ₱{p.price}
                            {p.description && <div className="text-sm text-gray-500">{p.description}</div>}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(p)}
                                className="bg-yellow-400 text-black px-3 py-1 rounded"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(p.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
