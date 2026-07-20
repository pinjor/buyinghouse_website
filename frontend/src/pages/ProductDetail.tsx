import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct, ProductDetail as ProductDetailType } from '../api/catalogApi';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="px-8 py-12 text-navy-400">Loading…</p>;
  if (!product) return <p className="px-8 py-12 text-navy-400">Product not found.</p>;

  return (
    <section className="px-8 py-12 max-w-3xl">
      <h1 className="font-display text-3xl text-navy-800 mb-2">{product.name}</h1>
      <p className="text-gold-600 font-medium mb-4">from ${product.basePrice.toFixed(2)}</p>
      <Link
        to={`/configure/${product.id}`}
        className="inline-block bg-navy-800 text-white rounded px-5 py-2 mb-8 hover:bg-navy-700"
      >
        Customize
      </Link>

      <h2 className="font-display text-lg text-navy-800 mb-3">Fabrics</h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {product.fabricOptions.map((f) => (
          <li key={f.id} className="border border-navy-100 rounded p-3 text-sm">
            <p className="font-medium text-navy-800">{f.name}</p>
            <p className="text-navy-400">
              {f.pricePremium > 0 ? `+$${f.pricePremium.toFixed(2)}` : 'included'}
            </p>
          </li>
        ))}
      </ul>

      {product.styleOptions.map((group) => (
        <div key={group.id} className="mb-8">
          <h2 className="font-display text-lg text-navy-800 mb-3">{group.name}</h2>
          <ul className="flex flex-wrap gap-3">
            {group.options.map((o) => (
              <li key={o.id} className="border border-navy-100 rounded px-3 py-2 text-sm">
                {o.label}
                {o.pricePremium > 0 && <span className="text-navy-400"> +${o.pricePremium.toFixed(2)}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
