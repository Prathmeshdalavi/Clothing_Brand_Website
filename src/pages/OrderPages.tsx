import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, CheckCircle2, MessageCircle, PackageSearch, Search } from 'lucide-react'
import { useDB, useShop } from '../store'
import { usePageMeta } from '../hooks/usePageMeta'
import { Breadcrumbs, EmptyState } from '../components/ui'
import { ORDER_STATUSES } from '../types'
import type { Order } from '../types'
import { cx, fmtDate, inr, waLink } from '../lib/utils'

export function Timeline({ order }: { order: Order }) {
  const idx = ORDER_STATUSES.indexOf(order.status)
  return (
    <ol className="relative">
      {ORDER_STATUSES.map((s, i) => {
        const done = i <= idx
        const at = order.timeline.find((t) => t.status === s)?.at
        return (
          <li key={s} className="flex gap-4 pb-7 last:pb-0 relative">
            {i < ORDER_STATUSES.length - 1 && <span className={cx('absolute left-[15px] top-8 bottom-0 w-px', i < idx ? 'bg-navy' : 'bg-mist')} aria-hidden />}
            <span className={cx('w-8 h-8 rounded-full grid place-items-center shrink-0 z-10 transition', done ? 'bg-navy text-ivory' : 'bg-white border border-mist text-charcoal/30', i === idx && i < 5 && 'ring-4 ring-pastel')}>
              {done ? <Check size={15} /> : <span className="text-xs">{i + 1}</span>}
            </span>
            <div className="pt-1">
              <p className={cx('text-sm', done ? 'font-medium text-navy' : 'text-charcoal/50')}>{s}</p>
              <p className="text-xs text-charcoal/50">{at ? fmtDate(at, true) : 'Pending'}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function OrderSummaryCard({ order }: { order: Order }) {
  return (
    <div className="bg-white shadow-soft p-6">
      <ul className="divide-y divide-mist text-sm">
        {order.items.map((i, n) => (
          <li key={n} className="py-3 flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0" style={{ background: i.colourHex }} />
            <span className="flex-1 min-w-0"><Link className="hover:text-navy" to={`/product/${i.slug}`}>{i.name}</Link><span className="block text-xs text-charcoal/55">{i.colour} · {i.size} × {i.qty}</span></span>
            <span>{inr(i.price * i.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 pt-4 border-t border-mist text-sm space-y-2">
        <div className="flex justify-between"><dt className="text-charcoal/65">Subtotal</dt><dd>{inr(order.subtotal)}</dd></div>
        {order.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount {order.coupon && `(${order.coupon})`}</dt><dd>− {inr(order.discount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-charcoal/65">Delivery</dt><dd>{order.delivery ? inr(order.delivery) : 'TBC'}</dd></div>
        <div className="flex justify-between font-semibold text-navy text-base pt-2"><dt>Total</dt><dd>{inr(order.total)}</dd></div>
      </dl>
    </div>
  )
}

export function OrderConfirmation() {
  usePageMeta('Order Confirmed', 'Your demo order has been placed.')
  const id = useShop((s) => s.lastOrderId)
  const order = useDB((d) => d.orders.find((o) => o.id === id))
  if (!order) return <div className="container-x py-20"><EmptyState title="No recent order" text="Place a demo order and its confirmation will appear here." action={<Link to="/shop" className="btn btn-primary">Start shopping</Link>} /></div>
  return (
    <div className="container-x py-10 md:py-16 max-w-4xl">
      <div className="text-center mb-10">
        <div className="mx-auto w-16 h-16 rounded-full bg-pastel grid place-items-center mb-5"><CheckCircle2 size={34} className="text-navy" /></div>
        <p className="eyebrow mb-2">Demo order placed</p>
        <h1 className="text-4xl md:text-5xl">Thank you, {order.customer.name.split(' ')[0]}.</h1>
        <p className="mt-4 text-charcoal/70">Your demo order <strong className="text-navy">{order.id}</strong> is confirmed. A confirmation would be sent to {order.customer.email}.</p>
        <p className="mt-1 text-xs text-charcoal/50">Simulated order — no payment was taken and nothing will be shipped.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrderSummaryCard order={order} />
        <div className="bg-white shadow-soft p-6 text-sm space-y-4">
          <div><p className="eyebrow mb-1">Payment</p><p>{order.payment.method} · <span className="text-emerald-700">{order.payment.status}</span> (simulated) · Ref {order.payment.ref}</p></div>
          <div><p className="eyebrow mb-1">Delivering to</p><p className="text-charcoal/75">{order.customer.name}<br />{order.address.address}{order.address.landmark ? `, ${order.address.landmark}` : ''}<br />{order.address.city}, {order.address.state} {order.address.pin}</p></div>
          <div><p className="eyebrow mb-1">Placed</p><p>{fmtDate(order.createdAt, true)}</p></div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={`/track-order?id=${order.id}`} className="btn btn-primary"><PackageSearch size={17} /> Track this order</Link>
        <Link to="/shop" className="btn btn-outline">Continue shopping</Link>
        <a className="btn btn-light" target="_blank" rel="noreferrer" href={waLink(`Hi Blues Apparel 23, I placed demo order ${order.id}.`)}><MessageCircle size={17} /> Message store</a>
      </div>
      <div className="mt-10 bg-pastel-100 p-5 text-sm text-navy text-center">
        Presenting this demo? Open <Link to="/admin/orders" className="link-u font-medium">Admin → Orders</Link>, update the status of <strong>{order.id}</strong>, then return to <Link to={`/track-order?id=${order.id}`} className="link-u font-medium">Track Order</Link> to see it change.
      </div>
    </div>
  )
}

export function TrackOrder() {
  usePageMeta('Track Order', 'Track the status of your Blues Apparel 23 demo order.')
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const last = useShop((s) => s.lastOrderId)
  const [input, setInput] = useState(sp.get('id') ?? last ?? '')
  const [query, setQuery] = useState(sp.get('id') ?? last ?? '')
  const order = useDB((d) => d.orders.find((o) => o.id.toLowerCase() === query.trim().toLowerCase()))
  const sample = useDB((d) => d.orders.slice(0, 3).map((o) => o.id))
  useEffect(() => { const id = sp.get('id'); if (id) { setInput(id); setQuery(id) } }, [sp])
  const submit = (e: React.FormEvent) => { e.preventDefault(); setQuery(input); nav(`/track-order?id=${encodeURIComponent(input.trim())}`, { replace: true }) }
  return (
    <div className="container-x py-8 md:py-12 max-w-4xl">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Track order' }]} />
      <h1 className="text-4xl md:text-5xl mt-5 mb-3">Track your order</h1>
      <p className="text-charcoal/70 mb-8">Enter your order ID to see its progress. Tracking in this demo is simulated and updated from the admin panel.</p>
      <form onSubmit={submit} className="flex gap-3 flex-col sm:flex-row" role="search">
        <div className="flex-1 relative"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" aria-hidden /><label htmlFor="oid" className="sr-only">Order ID</label><input id="oid" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. BA23-DEMO-12345" className="field !pl-11" /></div>
        <button className="btn btn-primary">Track order</button>
      </form>
      <p className="text-xs text-charcoal/55 mt-3">Sample IDs: {sample.map((s) => <button key={s} className="link-u text-navy mr-3" onClick={() => { setInput(s); setQuery(s) }}>{s}</button>)}</p>

      {query && !order && <div className="mt-10"><EmptyState title="Order not found" text={`We couldn't find “${query}”. Check the ID in your confirmation and try again.`} /></div>}
      {order && (
        <div className="mt-10 grid md:grid-cols-[1fr_1.2fr] gap-6">
          <div className="bg-white shadow-soft p-6 md:p-8">
            <p className="eyebrow mb-1">Order</p>
            <h2 className="text-2xl mb-1">{order.id}</h2>
            <p className="text-sm text-charcoal/60 mb-6">Placed {fmtDate(order.createdAt, true)}</p>
            <Timeline order={order} />
          </div>
          <div className="space-y-6">
            <div className="bg-white shadow-soft p-6 text-sm space-y-3">
              <p className="eyebrow">Current status</p>
              <p className="font-display text-3xl text-navy">{order.status}</p>
              {order.tracking ? <p className="text-charcoal/70">Courier: {order.tracking.courier}<br />Tracking number: <strong>{order.tracking.number}</strong></p> : <p className="text-charcoal/55">A tracking number will appear here once the order is shipped.</p>}
              {order.deliveryNote && <p className="text-charcoal/70">Note: {order.deliveryNote}</p>}
              <p className="text-charcoal/70">Payment: {order.payment.status}</p>
            </div>
            <OrderSummaryCard order={order} />
          </div>
        </div>
      )}
    </div>
  )
}
