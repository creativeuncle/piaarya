import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Invoice from './pages/Invoice';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import ComingSoon from './pages/ComingSoon';

const PLACEHOLDER_ROUTES = [
  ['/inventory', 'Inventory'],
  ['/categories', 'Categories'],
  ['/customers', 'Customers'],
  ['/coupons', 'Coupons'],
  ['/reviews', 'Reviews'],
  ['/returns', 'Returns'],
  ['/payments', 'Payments'],
];

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/orders/:id/invoice" element={<Invoice />} />
      <Route
        path="/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />
              {PLACEHOLDER_ROUTES.map(([path, title]) => (
                <Route key={path} path={path} element={<ComingSoon title={title} />} />
              ))}
            </Routes>
          </AdminLayout>
        }
      />
    </Routes>
  );
}

export default App;
