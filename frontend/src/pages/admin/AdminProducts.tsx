import { FormEvent, useState } from 'react';
import { createProduct, addFabric, addStyleGroup, addStyleOption } from '../../api/adminApi';

export default function AdminProducts() {
  const [category, setCategory] = useState('shirt');
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fabricName, setFabricName] = useState('');
  const [fabricPremium, setFabricPremium] = useState('0');
  const [fabricSupplier, setFabricSupplier] = useState('');

  const [groupName, setGroupName] = useState('');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [optionLabel, setOptionLabel] = useState('');
  const [optionPremium, setOptionPremium] = useState('0');

  async function handleCreateProduct(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const product = await createProduct({ category, name, basePrice: Number(basePrice) });
      setCreatedId(product.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    }
  }

  async function handleAddFabric(e: FormEvent) {
    e.preventDefault();
    if (!createdId) return;
    setError(null);
    try {
      await addFabric(createdId, {
        name: fabricName,
        swatchImageUrl: '/swatches/placeholder.jpg',
        pricePremium: Number(fabricPremium),
        supplierRef: fabricSupplier,
      });
      setFabricName('');
      setFabricPremium('0');
      setFabricSupplier('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add fabric');
    }
  }

  async function handleAddGroup(e: FormEvent) {
    e.preventDefault();
    if (!createdId) return;
    setError(null);
    try {
      const group = await addStyleGroup(createdId, groupName);
      setGroupId(group.id);
      setGroupName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add style group');
    }
  }

  async function handleAddOption(e: FormEvent) {
    e.preventDefault();
    if (!groupId) return;
    setError(null);
    try {
      await addStyleOption(groupId, { label: optionLabel, pricePremium: Number(optionPremium) });
      setOptionLabel('');
      setOptionPremium('0');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add style option');
    }
  }

  return (
    <section className="px-8 py-12 max-w-xl">
      <h1 className="font-display text-3xl text-navy-800 mb-8">Add Product</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleCreateProduct} className="space-y-3 mb-8 border border-navy-100 rounded-lg p-6">
        <h2 className="font-display text-lg text-navy-800">1. Product</h2>
        <input
          placeholder="Category (e.g. shirt)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-navy-200 rounded px-3 py-2"
        />
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-navy-200 rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="Base price"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          className="w-full border border-navy-200 rounded px-3 py-2"
        />
        <button type="submit" className="bg-navy-800 text-white rounded px-4 py-2">
          Create Product
        </button>
        {createdId && <p className="text-sm text-navy-400">Created: {createdId}</p>}
      </form>

      {createdId && (
        <form onSubmit={handleAddFabric} className="space-y-3 mb-8 border border-navy-100 rounded-lg p-6">
          <h2 className="font-display text-lg text-navy-800">2. Add Fabric</h2>
          <input
            placeholder="Fabric name"
            value={fabricName}
            onChange={(e) => setFabricName(e.target.value)}
            className="w-full border border-navy-200 rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Price premium"
            value={fabricPremium}
            onChange={(e) => setFabricPremium(e.target.value)}
            className="w-full border border-navy-200 rounded px-3 py-2"
          />
          <input
            placeholder="Supplier ref"
            value={fabricSupplier}
            onChange={(e) => setFabricSupplier(e.target.value)}
            className="w-full border border-navy-200 rounded px-3 py-2"
          />
          <button type="submit" className="bg-navy-800 text-white rounded px-4 py-2">
            Add Fabric
          </button>
        </form>
      )}

      {createdId && (
        <form onSubmit={handleAddGroup} className="space-y-3 mb-8 border border-navy-100 rounded-lg p-6">
          <h2 className="font-display text-lg text-navy-800">3. Add Style Group</h2>
          <input
            placeholder="Group name (e.g. Collar)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border border-navy-200 rounded px-3 py-2"
          />
          <button type="submit" className="bg-navy-800 text-white rounded px-4 py-2">
            Add Style Group
          </button>
          {groupId && <p className="text-sm text-navy-400">Group ready: {groupId}</p>}
        </form>
      )}

      {groupId && (
        <form onSubmit={handleAddOption} className="space-y-3 border border-navy-100 rounded-lg p-6">
          <h2 className="font-display text-lg text-navy-800">4. Add Style Option</h2>
          <input
            placeholder="Option label (e.g. Spread)"
            value={optionLabel}
            onChange={(e) => setOptionLabel(e.target.value)}
            className="w-full border border-navy-200 rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Price premium"
            value={optionPremium}
            onChange={(e) => setOptionPremium(e.target.value)}
            className="w-full border border-navy-200 rounded px-3 py-2"
          />
          <button type="submit" className="bg-navy-800 text-white rounded px-4 py-2">
            Add Option
          </button>
        </form>
      )}
    </section>
  );
}
