import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Invoice from './pages/Invoice';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Inventory from './pages/Inventory';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Coupons from './pages/Coupons';
import CouponForm from './pages/CouponForm';
import Reviews from './pages/Reviews';
import Returns from './pages/Returns';
import ReturnForm from './pages/ReturnForm';
import Payments from './pages/Payments';
import Marketing from './pages/Marketing';
import Wishlist from './pages/Wishlist';
import Team from './pages/Team';
import Navigation from './pages/Navigation';
import PaymentSettings from './pages/PaymentSettings';
import NotificationSettings from './pages/NotificationSettings';
import SocialLoginSettings from './pages/SocialLoginSettings';
import Pages from './pages/Pages';
import PageForm from './pages/PageForm';
import Apps from './pages/Apps';
import ShippingSettings from './pages/ShippingSettings';
import TaxSettings from './pages/TaxSettings';
import Analytics from './pages/Analytics';
import GiftCards from './pages/GiftCards';
import CurrencySettings from './pages/CurrencySettings';

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
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/new" element={<CategoryForm />} />
              <Route path="/categories/:id/edit" element={<CategoryForm />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/coupons/new" element={<CouponForm />} />
              <Route path="/coupons/:id/edit" element={<CouponForm />} />
              <Route path="/gift-cards" element={<GiftCards />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/returns/new" element={<ReturnForm />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/team" element={<Team />} />
              <Route path="/apps" element={<Apps />} />
              <Route path="/settings/navigation" element={<Navigation />} />
              <Route path="/settings/shipping" element={<ShippingSettings />} />
              <Route path="/settings/tax" element={<TaxSettings />} />
              <Route path="/settings/currency" element={<CurrencySettings />} />
              <Route path="/settings/payments" element={<PaymentSettings />} />
              <Route path="/settings/notifications" element={<NotificationSettings />} />
              <Route path="/apps/social-login" element={<SocialLoginSettings />} />
              <Route path="/settings/pages" element={<Pages />} />
              <Route path="/settings/pages/new" element={<PageForm />} />
              <Route path="/settings/pages/:id/edit" element={<PageForm />} />
            </Routes>
          </AdminLayout>
        }
      />
    </Routes>
  );
}

export default App;
