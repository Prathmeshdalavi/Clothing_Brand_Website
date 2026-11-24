import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download } from 'lucide-react'
import { useDB } from '../../store'
import { PageHead, Panel, Stat, td, th } from './AdminLayout'
import { daily, downloadCsv, monthly, productPerformance } from './stats'
import { ORDER_STATUSES } from '../../types'
import { inr, totalStock } from '../../lib/utils'

const COLORS = ['#243B53', '#5F7FA0', '#B8DCE8', '#D6C2A3', '#6F7557', '#E2B9B4']

export default function Reports() {
  const orders = useDB((d) => d.orders)
  const products = useDB((d) => d.products)
  const cats = useDB((d) => d.categories)
  const d14 = useMemo(() => daily(orders, 14), [orders])
  const m6 = useMemo(() => monthly(orders, 6), [orders])
  const perf = useMemo(() => productPerformance(orders), [orders])
  const byStatus = ORDER_STATUSES.map((s) => ({ name: s, value: orders.filter((o) => o.status === s).length })).filter((x) => x.value)
  const byPay = ['UPI', 'Card', 'Net Banking'].map((m) => ({ name: m, value: orders.filter((o) => o.payment.method === m).length })).filter((x) => x.value)
  const aov = orders.length ? Math.round(orders.reduce((a, o) => a + o.total, 0) / orders.length) : 0
  const inv = cats.map((c) => {
    const ps = products.filter((p) => p.category === c.id)
    return { name: c.name, products: ps.length, units: ps.reduce((a, p) => a + totalStock(p), 0), value: ps.reduce((a, p) => a + totalStock(p) * p.price, 0) }
  })
  const exportOrders = () => downloadCsv('demo-orders.csv', [['Order', 'Date', 'Customer', 'Total', 'Payment', 'Status'], ...orders.map((o) => [o.id, o.createdAt, o.customer.name, o.total, o.payment.status, o.status])])
  const tip = (v: number) => inr(v)
  return (
    <>
      <PageHead title="Reports" sub="Simulated sales and inventory analytics." action={<button className="btn btn-outline btn-sm" onClick={exportOrders}><Download size={15} /> Export orders CSV</button>} />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Stat label="Orders" value={orders.length} /><Stat label="Average order value" value={inr(aov)} /><Stat label="Units sold" value={orders.reduce((a, o) => a + o.items.reduce((x, i) => x + i.qty, 0), 0)} /><Stat label="Delivered" value={orders.filter((o) => o.status === 'Delivered').length} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="Daily sales — last 14 days"><div className="h-72" role="img" aria-label="Bar chart of daily sales"><ResponsiveContainer width="100%" height="100%"><BarChart data={d14} margin={{ left: -10 }}><CartesianGrid stroke="#E9ECEF" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11 }} interval={1} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} /><Tooltip formatter={tip} /><Bar dataKey="revenue" name="Revenue" fill="#243B53" /></BarChart></ResponsiveContainer></div></Panel>
        <Panel title="Monthly sales"><div className="h-72" role="img" aria-label="Line chart of monthly sales"><ResponsiveContainer width="100%" height="100%"><LineChart data={m6} margin={{ left: -10 }}><CartesianGrid stroke="#E9ECEF" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} /><Tooltip formatter={tip} /><Line type="monotone" dataKey="revenue" name="Revenue" stroke="#243B53" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div></Panel>
        <Panel title="Product performance — top 8 by revenue"><div className="h-80" role="img" aria-label="Horizontal bar chart of top products"><ResponsiveContainer width="100%" height="100%"><BarChart data={perf.slice(0, 8)} layout="vertical" margin={{ left: 20 }}><CartesianGrid stroke="#E9ECEF" horizontal={false} /><XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} /><YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} /><Tooltip formatter={tip} /><Bar dataKey="revenue" name="Revenue" fill="#5F7FA0" /></BarChart></ResponsiveContainer></div></Panel>
        <Panel title="Order statistics">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-80">
            {[['By status', byStatus], ['By payment method', byPay]].map(([t, data]) => (
              <div key={t as string} className="h-full flex flex-col"><p className="text-xs text-charcoal/55 text-center">{t as string}</p>
                <div className="flex-1"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data as { name: string; value: number }[]} dataKey="value" nameKey="name" innerRadius={42} outerRadius={78} paddingAngle={2}>{(data as unknown[]).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer></div></div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Inventory report" className="mt-6">
        <div className="overflow-x-auto -mx-5"><table className="w-full min-w-[520px]"><thead><tr><th className={th}>Category</th><th className={th}>Products</th><th className={th}>Units in stock</th><th className={th}>Stock value (at selling price)</th></tr></thead>
          <tbody>{inv.map((r) => <tr key={r.name} className="border-t border-mist"><td className={td}>{r.name}</td><td className={td}>{r.products}</td><td className={td}>{r.units}</td><td className={td}>{inr(r.value)}</td></tr>)}</tbody></table></div>
      </Panel>
    </>
  )
}
