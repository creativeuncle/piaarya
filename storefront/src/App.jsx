import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import ProductReviews from './pages/ProductReviews';
import ProductListing from './pages/ProductListing';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardProfile from './pages/dashboard/Profile';
import DashboardOrders from './pages/dashboard/Orders';
import DashboardOrderDetail from './pages/dashboard/OrderDetail';
import DashboardWishlist from './pages/dashboard/Wishlist';
import DashboardMyReviews from './pages/dashboard/MyReviews';
import DashboardAddress from './pages/dashboard/Address';
import DashboardRequests from './pages/dashboard/Requests';
import StaticPage from './pages/StaticPage';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/products/:id/reviews" element={<ProductReviews />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard/profile" replace />} />
                <Route path="profile" element={<DashboardProfile />} />
                <Route path="orders" element={<DashboardOrders />} />
                <Route path="orders/:id" element={<DashboardOrderDetail />} />
                <Route path="wishlist" element={<DashboardWishlist />} />
                <Route path="reviews" element={<DashboardMyReviews />} />
                <Route path="address" element={<DashboardAddress />} />
                <Route path="requests" element={<DashboardRequests />} />
              </Route>
              <Route path="/pages/:slug" element={<StaticPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
