import { useSelector } from 'react-redux';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';

/** Shows the sign-in form until an admin key has been accepted. */
export default function AdminPage() {
  const key = useSelector((s) => s.admin.key);
  return key ? <AdminDashboard /> : <AdminLogin />;
}
