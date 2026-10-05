'use client';

import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/auth/hooks';

// Mock data — replace with API calls once the admin endpoints exist.
const stats = [
  { label: 'Revenue', value: '$48,290', change: '+12.4%', icon: DollarSign },
  { label: 'Orders', value: '1,284', change: '+8.1%', icon: ShoppingBag },
  { label: 'Customers', value: '932', change: '+3.2%', icon: Users },
  { label: 'Conversion', value: '3.8%', change: '+0.6%', icon: TrendingUp },
];

const weekly = [
  { day: 'Mon', value: 40 },
  { day: 'Tue', value: 65 },
  { day: 'Wed', value: 50 },
  { day: 'Thu', value: 80 },
  { day: 'Fri', value: 95 },
  { day: 'Sat', value: 60 },
  { day: 'Sun', value: 45 },
];

const activity = [
  { id: '#1042', customer: 'Amina Diallo', status: 'Completed', total: '$120.00' },
  { id: '#1041', customer: 'Kofi Mensah', status: 'Pending', total: '$75.50' },
  { id: '#1040', customer: 'Sara Ndiaye', status: 'Completed', total: '$310.00' },
  { id: '#1039', customer: 'Yao Koffi', status: 'Cancelled', total: '$42.90' },
  { id: '#1038', customer: 'Fatou Traoré', status: 'Completed', total: '$208.75' },
];

const statusStyle: Record<string, string> = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Cancelled: 'bg-rose-50 text-rose-700',
};

export default function DashboardView() {
  const { user } = useAuthContext();

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-semibold">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
        </h4>
        <p className="text-sm text-gray-500">
          Here is what is happening today. (Mock data)
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              {stat.label}
              <stat.icon className="size-4" />
            </div>
            <div className="mt-2 text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium text-emerald-600">
              {stat.change} vs last week
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border bg-white p-4 lg:col-span-2">
          <h5 className="text-sm font-semibold">Orders this week</h5>
          <div className="mt-4 flex h-40 items-end gap-2">
            {weekly.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary-first/80"
                  style={{ height: `${d.value}%` }}
                />
                <span className="text-xs text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 lg:col-span-3">
          <h5 className="text-sm font-semibold">Recent activity</h5>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="py-2 font-medium">Order</th>
                <th className="py-2 font-medium">Customer</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="py-2 font-medium">{row.id}</td>
                  <td className="py-2">{row.customer}</td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2 text-right">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
