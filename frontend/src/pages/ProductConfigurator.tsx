import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct, computePrice } from '../api/catalogApi';
import { useConfiguratorStore } from '../store/configuratorStore';
import FabricPicker from '../components/configurator/FabricPicker';
import StylePicker from '../components/configurator/StylePicker';
import MeasurementForm from '../components/configurator/MeasurementForm';
import GarmentPreview from '../components/configurator/GarmentPreview';
import PriceSummary from '../components/configurator/PriceSummary';

export default function ProductConfigurator() {
  const { id } = useParams<{ id: string }>();
  const product = useConfiguratorStore((s) => s.product);
  const fabricId = useConfiguratorStore((s) => s.fabricId);
  const styleSelections = useConfiguratorStore((s) => s.styleSelections);
  const loadProduct = useConfiguratorStore((s) => s.loadProduct);
  const setFabric = useConfiguratorStore((s) => s.setFabric);
  const setStyleOption = useConfiguratorStore((s) => s.setStyleOption);
  const setPrice = useConfiguratorStore((s) => s.setPrice);

  useEffect(() => {
    if (!id) return;
    getProduct(id).then(loadProduct);
  }, [id, loadProduct]);

  useEffect(() => {
    if (!product || !fabricId) return;
    computePrice(product.id, fabricId, Object.values(styleSelections)).then(setPrice);
  }, [product, fabricId, styleSelections, setPrice]);

  if (!product || product.id !== id) return <p className="px-8 py-12 text-navy-400">Loading…</p>;

  return (
    <section className="px-8 py-12">
      <h1 className="font-display text-3xl text-navy-800 mb-8">{product.name}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        <GarmentPreview />
        <div>
          <FabricPicker options={product.fabricOptions} selectedId={fabricId} onSelect={setFabric} />
          <StylePicker groups={product.styleOptions} selections={styleSelections} onSelect={setStyleOption} />
          <MeasurementForm />
          <PriceSummary />
        </div>
      </div>
    </section>
  );
}
