import { Routes, Route, Link } from 'react-router-dom';
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
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-navy-100">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Novaterra Apparel" className="h-10 w-10 rounded-full" />
          <span className="font-display text-xl tracking-wide text-navy-800">
            NOVATERRA <span className="text-gold-500">APPAREL</span>
          </span>
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-navy-600 items-center max-w-2xl justify-end">
          <Link to="/shirt">Shirts</Link>
          <Link to="/suit">Suits</Link>
          <Link to="/jacket">Jackets</Link>
          <Link to="/vest">Vests</Link>
          <Link to="/pants">Pants</Link>
          <Link to="/jeans">Jeans</Link>
          <Link to="/tuxedo">Tuxedos</Link>
          <Link to="/overcoat">Overcoats</Link>
          <Link to="/tie">Ties</Link>
          <Link to="/womens">Women's</Link>
          <Link to="/cart">Cart</Link>
          <AccountLink />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

function AccountLink() {
  const user = useAuthStore((s) => s.user);
  return (
    <>
      {user?.role === 'admin' && (
        <>
          <Link to="/admin/orders">Admin: Orders</Link>
          <Link to="/admin/products">Admin: Products</Link>
        </>
      )}
      <Link to="/login">{user ? user.email : 'Sign in'}</Link>
    </>
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
