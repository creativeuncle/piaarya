import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const { customer, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/login?redirect=/account" replace />;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
      <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
        <p className="text-sm text-gray-500">Name</p>
        <p className="text-base font-medium text-gray-900 mb-3">{customer.name}</p>
        <p className="text-sm text-gray-500">Email</p>
        <p className="text-base font-medium text-gray-900 mb-3">{customer.email}</p>
        {customer.phone && (
          <>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-base font-medium text-gray-900">{customer.phone}</p>
          </>
        )}
      </div>
      <button onClick={handleLogout} className="border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-md text-sm">
        Logout
      </button>
    </div>
  );
}
