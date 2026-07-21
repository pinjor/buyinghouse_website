import { Link } from 'react-router-dom';

export default function Home() {
  const categories = [
    { title: 'Tailored Suits & Tuxedos', category: 'suit', price: 'from $239', desc: 'Bespoke 2-Piece & 3-Piece Suits with 900+ Wool Swatches', bg: 'bg-[#121D2D]' },
    { title: 'Bespoke Shirts & Woven Tops', category: 'shirt', price: 'from $60', desc: 'Egyptian Cotton, Linen & Oxford Custom Dress Shirts', bg: 'bg-[#142032]' },
    { title: 'Jackets & Blazers', category: 'jacket', price: 'from $280', desc: 'Handcrafted Sport Coats, Tweeds & Cashmere Blazers', bg: 'bg-[#111A28]' },
    { title: 'Knits & Sweaters', category: 'knit', price: 'from $75', desc: 'Pique Polo Shirts, Heavyweight Knitwear & Sweaters', bg: 'bg-[#152338]' },
    { title: 'Trousers & Custom Denim', category: 'pants', price: 'from $95', desc: 'Tailored Wool Trousers, Chinos & Selvedge Raw Denim', bg: 'bg-[#0E1725]' },
    { title: 'Vests & Waistcoats', category: 'vest', price: 'from $90', desc: 'Custom Suit Vests, Silk Waistcoats & Tuxedo Accents', bg: 'bg-[#16243A]' },
  ];

  return (
    <div className="w-full flex flex-col gap-16 pb-20 bg-itailor-dark text-itailor-cream">
      {/* Hero Banner Section */}
      <section className="relative w-full py-28 px-6 flex flex-col items-center text-center bg-gradient-to-b from-[#0B1422] via-[#0E1A2B] to-itailor-dark border-b border-itailor-cardBorder overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-itailor-gold/10 via-transparent to-transparent pointer-events-none" />

        <span className="uppercase tracking-[0.3em] text-itailor-gold text-xs font-bold mb-4 bg-itailor-gold/10 border border-itailor-gold/30 px-4 py-1.5 rounded-full shadow-lg">
          Novaterra Bespoke Luxury Tailoring
        </span>

        <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-wide max-w-4xl text-itailor-cream leading-tight mb-6">
          "We Believe Business is Built on Trust — <span className="text-itailor-gold italic">We Will Earn Yours</span>"
        </h1>

        <p className="max-w-2xl text-itailor-cream/70 text-sm sm:text-base leading-relaxed mb-10">
          Design your custom suit, dress shirt, or outerwear with 3D/2D live preview, premium fabrics, standard or custom body measurements, and 100% precision craftsmanship.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/suit"
            className="bg-itailor-cyan hover:bg-itailor-cyanHover text-white font-extrabold text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-xl shadow-itailor-cyan/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            START CUSTOM SUIT BUILDER ✂️
          </Link>
          <Link
            to="/shirt"
            className="bg-itailor-card border border-itailor-gold/40 hover:border-itailor-gold text-itailor-gold font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all hover:bg-itailor-cardBorder"
          >
            EXPLORE ALL COLLECTIONS
          </Link>
        </div>
      </section>

      {/* Category Offerings Grid */}
      <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-itailor-cardBorder pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-itailor-gold tracking-wide uppercase">
              Apparel Categories & Custom Collections
            </h2>
            <p className="text-xs text-itailor-cream/60 mt-1">High performance manufacturing across knits, woven tops, and tailored suits</p>
          </div>
          <span className="text-xs text-itailor-gold font-bold tracking-widest uppercase mt-2 sm:mt-0">
            6 Core Categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.category}
              to={`/${cat.category}`}
              className="group flex flex-col justify-between p-8 rounded-2xl border border-itailor-cardBorder bg-itailor-card/50 hover:border-itailor-gold hover:bg-itailor-card transition-all duration-300 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-itailor-gold/5 rounded-full filter blur-xl group-hover:bg-itailor-gold/15 transition-all" />

              <div>
                <span className="text-xs font-mono font-bold text-itailor-gold uppercase tracking-wider">
                  {cat.price}
                </span>
                <h3 className="font-display text-xl font-bold text-itailor-cream mt-2 group-hover:text-itailor-gold transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-itailor-cream/60 mt-3 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between pt-4 border-t border-itailor-cardBorder/60">
                <span className="text-xs font-bold uppercase tracking-wider text-itailor-cream/80 group-hover:text-itailor-gold transition-colors">
                  Configure Now
                </span>
                <span className="text-itailor-gold font-bold transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust & Craftsmanship Banner */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        <div className="p-10 rounded-2xl border border-itailor-gold/30 bg-gradient-to-r from-itailor-sidebar via-itailor-panel to-itailor-sidebar flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="flex flex-col gap-2 max-w-xl">
            <h3 className="font-display text-2xl font-bold text-itailor-gold uppercase">
              Direct Custom Apparel Sourcing
            </h3>
            <p className="text-xs text-itailor-cream/70 leading-relaxed">
              We manage every step of production with ethical compliance, in-house fashion design, 80 production lines for knits, 30 lines for woven garments, and 500 jacquard sweater looms.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="font-display text-3xl font-bold text-itailor-gold block">900+</span>
              <span className="text-[10px] text-itailor-cream/50 uppercase tracking-widest">Fabric Choice</span>
            </div>
            <div className="h-10 w-px bg-itailor-cardBorder" />
            <div className="text-center">
              <span className="font-display text-3xl font-bold text-itailor-gold block">100%</span>
              <span className="text-[10px] text-itailor-cream/50 uppercase tracking-widest">Fit Guarantee</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

