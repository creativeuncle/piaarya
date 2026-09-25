import Sidebar from '../../components/Sidebar';
import AuthGuard from '../../components/AuthGuard';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
