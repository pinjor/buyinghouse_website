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

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-20 text-center text-itailor-gold font-display text-lg">Loading Specs…</div>;
  if (!product) return <div className="max-w-4xl mx-auto px-6 py-20 text-center text-itailor-cream/50">Product not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="border-b border-itailor-cardBorder pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-itailor-gold uppercase tracking-widest bg-itailor-gold/10 border border-itailor-gold/30 px-3 py-1 rounded-full">
            Bespoke Custom Apparel
          </span>
          <h1 className="font-display text-3xl font-bold text-itailor-cream mt-3">{product.name}</h1>
          <p className="text-itailor-gold font-bold text-xl mt-1">Starting from ${product.basePrice.toFixed(2)}</p>
        </div>

        <Link
          to={`/configure/${product.id}`}
          className="bg-itailor-cyan hover:bg-itailor-cyanHover text-white font-extrabold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-xl shadow-itailor-cyan/20 transition-all transform hover:-translate-y-0.5"
        >
          START CUSTOMIZER WORKSPACE ✂️
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="font-display text-xl text-itailor-gold font-bold uppercase tracking-wide border-b border-itailor-cardBorder pb-2">
          Available Fabric Swatches ({product.fabricOptions.length})
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {product.fabricOptions.map((f) => (
            <li key={f.id} className="border border-itailor-cardBorder bg-itailor-card/60 rounded-xl p-4 text-xs">
              <p className="font-bold text-itailor-cream uppercase">{f.name}</p>
              <p className="text-itailor-gold mt-1">
                {f.pricePremium > 0 ? `+$${f.pricePremium.toFixed(2)}` : 'Included in Base Price'}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-6 pt-4">
        <h2 className="font-display text-xl text-itailor-gold font-bold uppercase tracking-wide border-b border-itailor-cardBorder pb-2">
          Customization Options
        </h2>
        {product.styleOptions.map((group) => (
          <div key={group.id} className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-itailor-cream uppercase tracking-wider">• {group.name}</h3>
            <ul className="flex flex-wrap gap-2">
              {group.options.map((o) => (
                <li key={o.id} className="border border-itailor-cardBorder bg-itailor-card/40 rounded-lg px-3 py-1.5 text-xs text-itailor-cream/80">
                  {o.label}
                  {o.pricePremium > 0 && <span className="text-itailor-gold font-semibold"> (+${o.pricePremium.toFixed(2)})</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

