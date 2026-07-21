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
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="border-b border-itailor-cardBorder pb-4 flex justify-between items-end">
        <div>
          <h1 className="font-display text-3xl text-itailor-gold capitalize font-bold tracking-wide">
            {category} Collection
          </h1>
          <p className="text-xs text-itailor-cream/60 mt-1">Custom tailored bespoke apparel crafted to your exact specifications</p>
        </div>
        <span className="text-xs text-itailor-cream/50 uppercase tracking-widest">{products.length} Products</span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-itailor-gold font-display text-lg">Loading Collection…</div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-itailor-cream/50">No custom products found in this category yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between p-6 rounded-2xl border border-itailor-cardBorder bg-itailor-card/50 hover:border-itailor-gold transition-all duration-300 shadow-xl"
            >
              <div>
                <span className="text-[10px] font-bold text-itailor-gold uppercase tracking-widest bg-itailor-gold/10 border border-itailor-gold/30 px-2.5 py-1 rounded-full">
                  Custom Tailored
                </span>
                <h2 className="font-display text-xl text-itailor-cream font-bold mt-4 mb-2">{p.name}</h2>
                <p className="text-itailor-gold font-bold text-lg">from ${p.basePrice.toFixed(2)}</p>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Link
                  to={`/configure/${p.id}`}
                  className="flex-1 bg-itailor-cyan hover:bg-itailor-cyanHover text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-lg text-center shadow-lg transition-all"
                >
                  CUSTOMIZE NOW ✂️
                </Link>
                <Link
                  to={`/products/${p.id}`}
                  className="px-4 py-3 rounded-lg border border-itailor-cardBorder hover:border-itailor-gold text-xs text-itailor-cream/70 hover:text-itailor-cream transition-all"
                >
                  Specs
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

