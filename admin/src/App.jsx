import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ComingSoon from './pages/ComingSoon';

const PLACEHOLDER_ROUTES = [
  ['/orders', 'Orders'],
  ['/products', 'Products'],
  ['/inventory', 'Inventory'],
  ['/categories', 'Categories'],
  ['/customers', 'Customers'],
  ['/coupons', 'Coupons'],
  ['/reviews', 'Reviews'],
  ['/returns', 'Returns'],
  ['/payments', 'Payments'],
];

function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {PLACEHOLDER_ROUTES.map(([path, title]) => (
            <Route key={path} path={path} element={<ComingSoon title={title} />} />
          ))}
        </Routes>
      </main>
    </div>
  );
}

export default App;
