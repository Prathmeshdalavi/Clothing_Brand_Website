import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { BarChart3, Boxes, ExternalLink, LayoutDashboard, Menu, Package, Settings, ShoppingBag, Users, X } from 'lucide-react'
import { cx } from '../../lib/utils'
import { ToastHost } from '../../components/ui'
import { usePageMeta } from '../../hooks/usePageMeta'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: ShoppingBag },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Website', icon: Settings },
]

export default function AdminLayout() {
  usePageMeta('Admin Dashboard (Demo)')
  const [open, setOpen] = useState(false)
  const links = (
    <nav aria-label="Admin" className="space-y-1">
      {NAV.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)} className={({ isActive }) => cx('flex items-center gap-3 px-4 h-11 text-sm transition', isActive ? 'bg-pastel text-navy font-medium' : 'text-ivory/75 hover:bg-white/10')}>
          <n.icon size={18} /> {n.label}
        </NavLink>
      ))}
    </nav>
  )
  return (
    <div className="min-h-screen bg-[#F3F5F7] text-charcoal flex">
      <aside className="hidden lg:flex w-64 shrink-0 bg-navy flex-col p-5 sticky top-0 h-screen">
        <Link to="/admin" className="font-display text-2xl text-ivory mb-1">Blues Apparel <span className="italic text-pastel">23</span></Link>
        <p className="text-[11px] tracking-[.2em] uppercase text-pastel/80 mb-8">Admin · Demo</p>
        {links}
        <Link to="/" className="mt-auto flex items-center gap-2 text-sm text-ivory/75 hover:text-white px-4 h-11"><ExternalLink size={16} /> View storefront</Link>
      </aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-navy p-5 overflow-y-auto"><div className="flex justify-between mb-6"><span className="font-display text-xl text-ivory">Admin</span><button onClick={() => setOpen(false)} aria-label="Close menu" className="text-ivory"><X /></button></div>{links}<Link to="/" className="mt-6 flex items-center gap-2 text-sm text-ivory/75 px-4 h-11"><ExternalLink size={16} /> View storefront</Link></div>
          <button className="flex-1 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-mist h-14 px-4 lg:px-8 flex items-center gap-3 sticky top-0 z-30 no-print">
          <button className="lg:hidden" aria-label="Open admin menu" onClick={() => setOpen(true)}><Menu /></button>
          <span className="text-xs uppercase tracking-widest bg-amber-100 text-amber-900 px-2.5 py-1">Demonstration data</span>
          <span className="hidden sm:inline text-xs text-charcoal/55">Everything here is saved in this browser only.</span>
          <Link to="/" className="ml-auto text-sm text-navy link-u lg:hidden">Storefront</Link>
        </header>
        <main className="p-4 lg:p-8 max-w-[1400px]"><Outlet /></main>
      </div>
      <ToastHost />
    </div>
  )
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div><h1 className="text-3xl md:text-4xl">{title}</h1>{sub && <p className="text-sm text-charcoal/60 mt-1">{sub}</p>}</div>
      {action}
    </div>
  )
}

export function Panel({ title, children, action, className }: { title?: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <section className={cx('bg-white shadow-soft', className)}>
      {title && <div className="flex items-center justify-between px-5 py-4 border-b border-mist"><h2 className="font-sans text-[15px] font-semibold text-navy">{title}</h2>{action}</div>}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function Stat({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: 'warn' | 'ok' }) {
  return (
    <div className="bg-white shadow-soft p-5">
      <p className="text-xs text-charcoal/55 uppercase tracking-wider">{label}</p>
      <p className={cx('font-display text-3xl mt-2', tone === 'warn' ? 'text-amber-700' : 'text-navy')}>{value}</p>
      {hint && <p className="text-xs text-charcoal/50 mt-1">{hint}</p>}
    </div>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'ok' | 'warn' | 'bad' | 'info' }) {
  const t = { neutral: 'bg-mist text-charcoal/70', ok: 'bg-emerald-100 text-emerald-800', warn: 'bg-amber-100 text-amber-900', bad: 'bg-red-100 text-red-800', info: 'bg-pastel-100 text-navy' }[tone]
  return <span className={cx('inline-block px-2.5 py-1 text-[11px] font-medium whitespace-nowrap', t)}>{children}</span>
}

export const th = 'relative text-left text-[11px] uppercase tracking-wider text-charcoal/50 font-medium py-3 px-4 whitespace-nowrap'
export const td = 'py-3 px-4 text-sm align-middle'
