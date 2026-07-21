import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import ProductConfigurator from './pages/ProductConfigurator';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import RequireAdmin from './components/layout/RequireAdmin';
import { useAuthStore } from './store/authStore';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isConfigurator = location.pathname.startsWith('/configure');

  return (
    <div className="min-h-screen flex flex-col bg-itailor-dark text-itailor-cream">
      {/* Top Announcement & Utilities Bar */}
      <div className="bg-[#070D16] border-b border-itailor-cardBorder/40 px-6 py-1.5 flex justify-between items-center text-xs text-itailor-cream/70">
        <div className="flex items-center gap-4">
          <span className="text-itailor-gold font-medium">NOVATERRA LUXURY CUSTOM APPAREL</span>
          <span className="hidden sm:inline text-itailor-cream/40">•</span>
          <span className="hidden sm:inline">Crafted to your exact measurements</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 cursor-pointer hover:text-itailor-gold transition-colors">
            🌐 LANGUAGE: <strong className="text-itailor-gold">EN</strong>
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-itailor-gold transition-colors">
            💵 CURRENCY: <strong className="text-itailor-gold">USD ($)</strong>
          </span>
        </div>
      </div>

      {/* Main Luxury Navigation Bar */}
      <header className="sticky top-0 z-50 bg-itailor-sidebar/95 backdrop-blur-md border-b border-itailor-cardBorder px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.jpeg" alt="Novaterra Apparel" className="h-9 w-9 rounded-full ring-2 ring-itailor-gold/50 group-hover:ring-itailor-gold transition-all" />
          <div className="flex flex-col">
            <span className="font-display text-lg tracking-widest text-itailor-cream font-bold leading-none">
              NOVATERRA <span className="text-itailor-gold font-normal">APPAREL</span>
            </span>
            <span className="text-[10px] tracking-wider text-itailor-gold/70 uppercase mt-0.5">Bespoke Custom Apparel</span>
          </div>
        </Link>


        {/* Categories Navbar */}
        <nav className="hidden lg:flex items-center gap-1 text-xs uppercase font-semibold tracking-wider text-itailor-cream/80">
          <Link to="/suit" className="px-3 py-1.5 rounded hover:text-itailor-gold hover:bg-itailor-card transition-colors">
            SUITS
          </Link>
          <Link to="/tuxedo" className="px-3 py-1.5 rounded hover:text-itailor-gold hover:bg-itailor-card transition-colors">
            3-PIECE SUITS
          </Link>
          <Link to="/shirt" className="px-3 py-1.5 rounded hover:text-itailor-gold hover:bg-itailor-card transition-colors">
            SHIRTS
          </Link>
          <Link to="/jacket" className="px-3 py-1.5 rounded hover:text-itailor-gold hover:bg-itailor-card transition-colors">
            JACKETS
          </Link>
          <Link to="/vest" className="px-3 py-1.5 rounded hover:text-itailor-gold hover:bg-itailor-card transition-colors">
            VESTS
          </Link>
          <Link to="/pants" className="px-3 py-1.5 rounded hover:text-itailor-gold hover:bg-itailor-card transition-colors">
            PANTS
          </Link>
          <Link to="/jeans" className="px-3 py-1.5 rounded hover:text-itailor-gold hover:bg-itailor-card transition-colors">
            DENIM
          </Link>
          <Link to="/tie" className="px-3 py-1.5 rounded hover:text-itailor-gold hover:bg-itailor-card transition-colors">
            TIES
          </Link>
        </nav>

        {/* Right User & Cart Links */}
        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
          <AccountLink />
          <Link
            to="/cart"
            className="flex items-center gap-2 bg-itailor-gold/10 border border-itailor-gold/40 text-itailor-gold px-3 py-1.5 rounded-md hover:bg-itailor-gold hover:text-itailor-dark transition-all"
          >
            <span>🛒 CART</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 ${isConfigurator ? 'p-0' : ''}`}>{children}</main>

      {/* Luxury Footer (only on non-configurator views or subtle bottom bar) */}
      {!isConfigurator && (
        <footer className="bg-[#070D16] border-t border-itailor-cardBorder py-8 px-6 text-center text-xs text-itailor-cream/50">
          <p className="font-display text-sm text-itailor-gold mb-2">NOVATERRA APPAREL — BESPOKE CUSTOM TAILORING</p>
          <p>© {new Date().getFullYear()} Novaterra Apparel. Inspired by luxury custom suit craft.</p>
        </footer>
      )}
    </div>
  );
}

function AccountLink() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex items-center gap-3">
      {user?.role === 'admin' && (
        <>
          <Link to="/admin/orders" className="hover:text-itailor-gold transition-colors text-itailor-gold">
            Admin Orders
          </Link>
        </>
      )}
      <Link to="/login" className="hover:text-itailor-gold transition-colors">
        {user ? user.email.split('@')[0] : 'Sign In'}
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/:category" element={<CategoryPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/configure/:id" element={<ProductConfigurator />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders/:id" element={<OrderConfirmation />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Route>
      </Routes>
    </Layout>
  );
}

