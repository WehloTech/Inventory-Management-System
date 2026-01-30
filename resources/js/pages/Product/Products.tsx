import React, { useEffect, useState } from 'react';
import { getProducts, deleteProduct } from '../../components/services/ProductServices';

type Product = {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  price: number;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = () => {
    getProducts().then(res => setProducts(res.data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (id: number) => {
    if (confirm('Delete this product?')) {
      deleteProduct(id).then(() => fetchProducts());
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Products</h1>

      {/* Add Product Button */}
      <div className="mb-4 text-right">
        <a
          href="/products/create"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Add Product
        </a>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {products.map(p => (
          <div
            key={p.id}
            className="flex justify-between items-center border p-4 rounded shadow-sm bg-white hover:shadow-md transition"
          >
            <div>
              <p className="font-semibold text-lg">{p.name}</p>
              {p.description && <p className="text-gray-500 text-sm">{p.description}</p>}
              <p className="text-gray-700">Quantity: {p.quantity} pcs</p>
              <p className="text-gray-700">Price: ₱{p.price}</p>
            </div>

            <div className="flex gap-2">
              <a
                href={`/products/${p.id}/edit`}
                className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 transition"
              >
                Edit
              </a>
              <button
                onClick={() => handleDelete(p.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
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
