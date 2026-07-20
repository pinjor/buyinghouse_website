import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import ProductConfigurator from './pages/ProductConfigurator';
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
        <nav className="flex gap-6 text-sm font-medium text-navy-600 items-center">
          <Link to="/shirt">Shirts</Link>
          <Link to="/suit">Suits</Link>
          <Link to="/jacket">Jackets</Link>
          <AccountLink />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

function AccountLink() {
  const user = useAuthStore((s) => s.user);
  return <Link to="/login">{user ? user.email : 'Sign in'}</Link>;
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
      </Routes>
    </Layout>
  );
}
