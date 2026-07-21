import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, computePrice } from '../api/catalogApi';
import { addCartItem } from '../api/orderApi';
import { useAuthStore } from '../store/authStore';
import { useConfiguratorStore, CustomizerStep } from '../store/configuratorStore';
import GarmentPreview from '../components/configurator/GarmentPreview';
import FabricPicker from '../components/configurator/FabricPicker';
import StylePicker from '../components/configurator/StylePicker';
import ContrastLiningPicker from '../components/configurator/ContrastLiningPicker';
import MeasurementForm from '../components/configurator/MeasurementForm';
import ConfiguratorSummary from '../components/configurator/ConfiguratorSummary';

export default function ProductConfigurator() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = useConfiguratorStore((s) => s.product);
  const fabricId = useConfiguratorStore((s) => s.fabricId);
  const styleSelections = useConfiguratorStore((s) => s.styleSelections);
  const measurements = useConfiguratorStore((s) => s.measurements);
  const activeStep = useConfiguratorStore((s) => s.activeStep);
  const setActiveStep = useConfiguratorStore((s) => s.setActiveStep);
  const activeSubStep = useConfiguratorStore((s) => s.activeSubStep);
  const setActiveSubStep = useConfiguratorStore((s) => s.setActiveSubStep);
  const loadProduct = useConfiguratorStore((s) => s.loadProduct);
  const setFabric = useConfiguratorStore((s) => s.setFabric);
  const setStyleOption = useConfiguratorStore((s) => s.setStyleOption);
  const setPrice = useConfiguratorStore((s) => s.setPrice);
  const price = useConfiguratorStore((s) => s.price);
  const nextStep = useConfiguratorStore((s) => s.nextStep);
  const prevStep = useConfiguratorStore((s) => s.prevStep);

  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProduct(id).then(loadProduct);
  }, [id, loadProduct]);

  useEffect(() => {
    if (!product || !fabricId) return;
    computePrice(product.id, fabricId, Object.values(styleSelections)).then(setPrice);
  }, [product, fabricId, styleSelections, setPrice]);

  if (!product || product.id !== id) {
    return (
      <div className="min-h-screen bg-itailor-dark flex items-center justify-center p-12 text-itailor-gold font-display text-xl">
        Loading Bespoke Customizer Workspace…
      </div>
    );
  }

  async function handleAddToCart() {
    if (!product || !fabricId) return;
    if (!isAuthed) {
      navigate('/login');
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      await addCartItem({
        productId: product.id,
        fabricId,
        styleOptionIds: Object.values(styleSelections),
        measurements,
      });
      navigate('/cart');
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  }

  // Primary steps array
  const stepsList: { id: CustomizerStep; label: string }[] = [
    { id: 'FABRIC', label: '1. FABRIC' },
    { id: 'STYLE', label: '2. STYLE' },
    { id: 'CONTRAST', label: '3. COLOR CONTRAST' },
    { id: 'MEASUREMENTS', label: '4. MEASUREMENTS' },
    { id: 'SUMMARY', label: '5. SUMMARY' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col bg-itailor-dark text-itailor-cream relative overflow-hidden select-none">
      {/* 3-Panel Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[240px_1fr_420px] divide-y lg:divide-y-0 lg:divide-x divide-itailor-cardBorder/60">
        
        {/* PANEL 1: Left Step & Sub-Step Sidebar (iTailor Screenshot 1, 2, 3 Style) */}
        <aside className="bg-itailor-sidebar/95 p-4 flex flex-col justify-between border-r border-itailor-cardBorder/60 z-10">
          <div className="flex flex-col gap-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-itailor-gold border-b border-itailor-cardBorder/60 pb-2">
              CUSTOM WORKSPACE
            </h2>

            <nav className="flex flex-col gap-2">
              {stepsList.map((step) => {
                const isActive = activeStep === step.id;
                return (
                  <div key={step.id} className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-itailor-gold text-itailor-dark shadow-lg font-black'
                          : 'text-itailor-cream/70 hover:text-itailor-cream hover:bg-itailor-card'
                      }`}
                    >
                      <span>{step.label}</span>
                      {isActive && <span className="text-[10px]">●</span>}
                    </button>

                    {/* Sub-steps expansion for STYLE step */}
                    {step.id === 'STYLE' && isActive && (
                      <div className="pl-4 pr-1 py-1 flex flex-col gap-1 border-l-2 border-itailor-gold/40 ml-3">
                        <span className="text-[10px] font-bold text-itailor-gold/80 uppercase tracking-widest mb-1">
                          JACKET OPTIONS
                        </span>
                        {product.styleOptions.map((g) => {
                          const isSubActive = activeSubStep === g.name;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setActiveSubStep(g.name)}
                              className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-semibold tracking-wide transition-all ${
                                isSubActive
                                  ? 'text-itailor-gold font-bold bg-itailor-card/80'
                                  : 'text-itailor-cream/60 hover:text-itailor-cream'
                              }`}
                            >
                              • {g.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Trust Ratings & Product Info */}
          <div className="pt-4 border-t border-itailor-cardBorder/60 text-[10px] text-itailor-cream/50 flex flex-col gap-1">
            <span className="text-itailor-gold font-bold">★ Trustpilot 4.8 / 5.0</span>
            <span>Over 310,000 Custom Suits Delivered</span>
          </div>
        </aside>

        {/* PANEL 2: Center Customization Canvas (Dynamic Step Render) */}
        <main className="p-6 overflow-y-auto bg-itailor-panel/50 flex flex-col justify-start max-h-[calc(100vh-140px)]">
          {activeStep === 'FABRIC' && (
            <FabricPicker options={product.fabricOptions} selectedId={fabricId} onSelect={setFabric} />
          )}

          {activeStep === 'STYLE' && (
            <StylePicker groups={product.styleOptions} selections={styleSelections} onSelect={setStyleOption} />
          )}

          {activeStep === 'CONTRAST' && <ContrastLiningPicker />}

          {activeStep === 'MEASUREMENTS' && <MeasurementForm />}

          {activeStep === 'SUMMARY' && <ConfiguratorSummary />}
        </main>

        {/* PANEL 3: Right Interactive Garment Mannequin & Live Spec Card */}
        <section className="p-6 bg-[#070D16]/90 flex flex-col justify-between z-10 border-l border-itailor-cardBorder/60">
          <GarmentPreview />
        </section>
      </div>

      {/* FIXED BOTTOM ACTION BAR (iTailor Screenshot 1, 2, 3 Footer Style) */}
      <footer className="sticky bottom-0 z-40 bg-[#070D16] border-t border-itailor-cardBorder px-6 py-3 flex items-center justify-between shadow-2xl">
        <button
          type="button"
          onClick={prevStep}
          disabled={activeStep === 'FABRIC'}
          className="bg-itailor-card border border-itailor-cardBorder text-itailor-cream font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-lg hover:border-itailor-gold/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ‹ BACK
        </button>

        {/* Dynamic Running Total Price Indicator */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] text-itailor-cream/50 uppercase tracking-widest">Tailored Suit Total</span>
            <span className="text-lg font-bold text-itailor-gold font-display">
              ${price ? price.total.toFixed(2) : (product.basePrice + (product.fabricOptions[0]?.pricePremium ?? 0)).toFixed(2)}
            </span>
          </div>

          {addError && <p className="text-red-400 text-xs">{addError}</p>}

          {/* Action CTA Button */}
          {activeStep === 'SUMMARY' ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="bg-itailor-cyan hover:bg-itailor-cyanHover text-white font-extrabold text-xs uppercase tracking-widest px-8 py-3 rounded-lg shadow-xl shadow-itailor-cyan/20 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {adding ? 'Adding to Cart…' : 'ADD TO CART 🛒'}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="bg-itailor-cyan hover:bg-itailor-cyanHover text-white font-extrabold text-xs uppercase tracking-widest px-8 py-3 rounded-lg shadow-xl shadow-itailor-cyan/20 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <span>NEXT STEP</span>
              <span>›</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

