# Novaterra — Bespoke Custom Apparel Sourcing Platform & Configurator

> A high-performance luxury apparel e-commerce platform and 2D/3D custom suit builder inspired by **iTailor** and powered by **Link Sourcing Ltd** product catalog lines.

---

## 🌟 Key Features

### ✂️ 3-Panel iTailor Customizer Workspace
- **Step-by-Step Guidance Sidebar**: 5 primary steps (`FABRIC`, `STYLE`, `COLOR CONTRAST`, `MEASUREMENTS`, `SUMMARY`) with sub-step navigation for jacket buttons, lapels, lapel width, buttonholes, pockets, sleeve buttons, and vents.
- **Interactive SVG Mannequin Render Engine**: Dynamic real-time garment preview renderer tailored for each apparel category (**Suits & Tuxedos**, **Bespoke Shirts**, **Trousers & Denim**, **Vests**, and **Silk Ties**).
- **Realistic Luxury Swatches**: Authentic textile color maps covering Dark Navy Wool, Textured Light Grey, Jet Black, Royal Blue, Brown Wool, Charcoal, Khaki Linen, Beige, Forest Taupe, and Cream.
- **Fabric Inspector**: Close-up texture zoom modal for high-resolution weave inspection.
- **Dual Sizing & Measurements**: Standard jacket size picker (`36R`–`48L`) and custom body measurement inputs (Neck, Chest, Waist, Hips, Sleeve, Outseam) with unit toggles (`in` / `cm`).
- **Contrast & Personalization**: Choice of inner linings (*Matching Navy*, *Royal Blue Silk*, *Gold Paisley*, *Crimson Red*, *Silver Satin*), buttonhole accent thread, and custom monogram initials embroidery.
- **360 Specification Review**: Itemized price breakdown table, printable spec sheets, and instant shopping cart placement.

### 👔 Link Sourcing Ltd Product Catalog Alignment
Integrated product lines across all 7 apparel manufacturing divisions:
1. **Woven Suits & Tuxedos**: Bespoke 2-Piece Suits, Executive 3-Piece Suits, Italian Double-Breasted Suits, Formal Tuxedos.
2. **Bespoke Shirts & Woven Tops**: Egyptian Cotton Dress Shirts, Oxford Button-Downs, Linen Riviera Shirts, Tuxedo Pleated Shirts.
3. **Jackets & Outerwear**: Wool Sport Coats, Cashmere Blend Overcoats, Tweed Heritage Blazers.
4. **Knits & Sweaters**: Pique Polo Shirts, 100% Merino Wool Sweaters, Jacquard Pullovers.
5. **Trousers, Chinos & Denim**: Tailored Wool Trousers, Stretch Cotton Chinos, Japanese Selvedge Raw Denim Jeans.
6. **Vests & Waistcoats**: Bespoke Suit Vests, Silk Jacquard Tuxedo Vests.
7. **Silk Accessories**: Handmade Pure Silk Ties, Pocket Square & Tie Sets.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Zustand, React Router DOM.
- **Microservices Architecture**:
  - `catalog-service` (Port 4001): Product catalog, fabrics, and price calculations.
  - `order-service` (Port 4002): Shopping cart management & checkout flow.
  - `auth-service` (Port 4003): User authentication & JWT session management.
- **Database**: MySQL/MariaDB with microservice database isolation.
- **Styling & Design System**: Custom luxury dark theme (`#0A111C`), metallic gold highlights (`#D4AF37`), and cyan action CTAs (`#2EB2E2`).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Installation

Clone the repository:
```bash
git clone https://github.com/pinjor/buyinghouse_website.git
cd buyinghouse_website
```

Install frontend dependencies:
```bash
cd frontend
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000/`**

### 4. Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
Novaterra/
├── frontend/
│   ├── src/
│   │   ├── api/             # API client & demo catalog fallback dataset
│   │   ├── components/      # Luxury Header, GarmentPreview SVG, FabricPicker, StylePicker, MeasurementForm, ContrastLiningPicker, ConfiguratorSummary
│   │   ├── pages/           # Home, CategoryPage, ProductConfigurator, ProductDetail, Cart
│   │   ├── store/           # Zustand configurator & auth state stores
│   │   └── App.tsx          # Main layout & routing
│   ├── tailwind.config.js   # Custom iTailor luxury color theme tokens
│   └── package.json
├── services/
│   ├── catalog-service/     # Catalog API & database seed data
│   ├── order-service/       # Order management microservice
│   └── auth-service/        # Auth microservice
├── README.md
└── docker-compose.yml
```

---

## 📄 License

Developed for **Novaterra & Link Sourcing Ltd** Custom Apparel Sourcing Platform.
