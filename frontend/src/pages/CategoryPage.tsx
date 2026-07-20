import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProducts, ProductSummary } from '../api/catalogApi';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts(category)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <section className="px-8 py-12">
      <h1 className="font-display text-3xl text-navy-800 capitalize mb-8">{category}</h1>
      {loading ? (
        <p className="text-navy-400">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-navy-400">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="border border-navy-100 rounded-lg p-6 hover:border-gold-400 transition-colors"
            >
              <h2 className="font-display text-xl text-navy-800 mb-2">{p.name}</h2>
              <p className="text-gold-600 font-medium">from ${p.basePrice.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
