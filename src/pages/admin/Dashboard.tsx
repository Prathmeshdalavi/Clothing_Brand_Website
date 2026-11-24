import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useDB } from '../../store'
import { Badge, PageHead, Panel, Stat, td, th } from './AdminLayout'
import { fmtDate, inr, totalStock } from '../../lib/utils'
import { daily } from './stats'

export const statusTone = (s: string) => (s === 'Delivered' ? 'ok' : s === 'Order Placed' ? 'warn' : s === 'Confirmed' ? 'info' : 'neutral') as 'ok' | 'warn' | 'info' | 'neutral'

export default function Dashboard() {
  const orders = useDB((d) => d.orders)
  const products = useDB((d) => d.products)
  const customers = useDB((d) => d.customers)
  const low = useDB((d) => d.settings.lowStockThreshold)
  const revenue = orders.filter((o) => o.payment.status === 'Paid').reduce((a, o) => a + o.total, 0)
  const pending = orders.filter((o) => ['Order Placed', 'Confirmed', 'Packed'].includes(o.status)).length
  const lowStock = products.filter((p) => p.active && totalStock(p) > 0 && totalStock(p) <= low)
  const active = products.filter((p) => p.active && !p.soldOut).length
  const series = useMemo(() => daily(orders, 30), [orders])
  return (
    <>
      <PageHead title="Dashboard" sub="Overview of the demo store. All figures are simulated." />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="Total orders" value={orders.length} />
        <Stat label="Total revenue" value={inr(revenue)} hint="Paid orders only" />
        <Stat label="Total customers" value={customers.length} />
        <Stat label="Active products" value={active} />
        <Stat label="Pending orders" value={pending} tone={pending ? 'warn' : undefined} hint="Placed, confirmed or packed" />
        <Stat label="Low stock products" value={lowStock.length} tone={lowStock.length ? 'warn' : undefined} hint={`${low} units or fewer`} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6 mt-6">
        <Panel title="Sales performance — last 30 days">
          <div className="h-72" role="img" aria-label="Area chart of daily revenue for the last 30 days">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -10, right: 8, top: 8 }}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#243B53" stopOpacity={0.25} /><stop offset="1" stopColor="#243B53" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#E9ECEF" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={4} stroke="#9AA5B1" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9AA5B1" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: number) => [inr(v), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#243B53" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Low-stock alerts" action={<Link to="/admin/inventory" className="text-xs link-u text-navy">Manage</Link>}>
          {lowStock.length === 0 ? <p className="text-sm text-charcoal/55">No low-stock products.</p> : (
            <ul className="divide-y divide-mist text-sm">{lowStock.slice(0, 7).map((p) => <li key={p.id} className="py-2.5 flex justify-between gap-3"><span className="truncate">{p.name}</span><Badge tone="warn">{totalStock(p)} left</Badge></li>)}</ul>
          )}
        </Panel>
      </div>
      <Panel title="Recent orders" className="mt-6" action={<Link to="/admin/orders" className="text-xs link-u text-navy">View all</Link>}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full min-w-[640px]">
            <thead><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Date</th><th className={th}>Total</th><th className={th}>Payment</th><th className={th}>Status</th></tr></thead>
            <tbody>
              {orders.slice(0, 7).map((o) => (
                <tr key={o.id} className="border-t border-mist hover:bg-ivory/60">
                  <td className={td}><Link className="text-navy font-medium link-u" to={`/admin/orders?open=${o.id}`}>{o.id}</Link></td>
                  <td className={td}>{o.customer.name}</td><td className={td}>{fmtDate(o.createdAt)}</td><td className={td}>{inr(o.total)}</td>
                  <td className={td}><Badge tone={o.payment.status === 'Paid' ? 'ok' : 'warn'}>{o.payment.status}</Badge></td>
                  <td className={td}><Badge tone={statusTone(o.status)}>{o.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
