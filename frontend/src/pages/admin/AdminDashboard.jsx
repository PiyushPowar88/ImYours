import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../api/admin';

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6">
    <p className="text-gray-500 text-sm mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data.stats);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Bookings" value={stats.totalBookings} />
        <StatCard label="Total Revenue" value={`₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`} />
        <StatCard label="Today's Appointments" value={stats.todayAppointments} />
      </div>
    </div>
  );
}