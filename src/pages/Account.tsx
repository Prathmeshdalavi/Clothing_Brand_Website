import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, LogOut, MapPin, Package, Plus, Trash2, User as UserIcon, Eye } from 'lucide-react'
import { useDB, useShop } from '../store'
import { usePageMeta } from '../hooks/usePageMeta'
import { Breadcrumbs, EmptyState, Field } from '../components/ui'
import { ProductGrid } from '../components/shop/ProductCard'
import { Timeline } from './OrderPages'
import { auth } from '../services'
import { toast } from '../store/ui'
import { cx, fmtDate, inr, isEmail, isMobile, isPin } from '../lib/utils'

function AuthForms() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const customers = useDB((d) => d.customers)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (mode === 'register' && f.name.trim().length < 2) er.name = 'Enter your name'
    if (!isEmail(f.email)) er.email = 'Enter a valid email'
    if (mode === 'register' && f.phone && !isMobile(f.phone)) er.phone = 'Enter a valid mobile number'
    if (f.password.length < 6) er.password = 'Use at least 6 characters'
    setErrs(er)
    if (Object.keys(er).length) return
    auth.login(f.email.trim(), f.name.trim() || undefined, f.phone.trim() || undefined)
    toast(mode === 'login' ? 'Welcome back' : 'Account created (demo)')
  }
  const err = (k: string) => errs[k]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <form onSubmit={submit} noValidate className="bg-white shadow-soft p-6 sm:p-8 space-y-4">
        <div className="flex gap-1 bg-mist p-1 mb-2" role="tablist">
          {(['login', 'register'] as const).map((m) => <button type="button" key={m} role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setErrs({}) }} className={cx('flex-1 h-10 text-sm transition', mode === m ? 'bg-white text-navy font-medium shadow-soft' : 'text-charcoal/60')}>{m === 'login' ? 'Login' : 'Register'}</button>)}
        </div>
        {mode === 'register' && <Field label="Full name" error={err('name')}><input className={cx('field', err('name') && 'field-err')} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>}
        <Field label="Email address" error={err('email')}><input type="email" className={cx('field', err('email') && 'field-err')} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></Field>
        {mode === 'register' && <Field label="Mobile number (optional)" error={err('phone')}><input type="tel" className={cx('field', err('phone') && 'field-err')} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /></Field>}
        <Field label="Password" error={err('password')}><input type="password" className={cx('field', err('password') && 'field-err')} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></Field>
        <button className="btn btn-primary w-full">{mode === 'login' ? 'Login' : 'Create account'}</button>
        <p className="text-xs text-charcoal/55">Demo only: any email and a password of 6+ characters works. Passwords are never stored or sent anywhere. Production uses Spring Security.</p>
      </form>
      <div className="bg-pastel-100 p-6 sm:p-8 flex flex-col justify-center">
        <p className="eyebrow mb-3">Presenting the demo?</p>
        <h2 className="text-3xl mb-3">Skip the form.</h2>
        <p className="text-sm text-charcoal/70 mb-6">Log in as a sample customer who already has orders at different stages of delivery.</p>
        <button className="btn btn-primary" onClick={() => { const c = customers[0]; auth.login(c.email, c.name, c.phone); toast('Logged in as sample customer') }}>Use demo account</button>
      </div>
    </div>
  )
}

type Tab = 'orders' | 'profile' | 'addresses' | 'wishlist' | 'recent'

function Dashboard() {
  const nav = useNavigate()
  const user = useShop((s) => s.user)!
  const addresses = useShop((s) => s.addresses)
  const wish = useShop((s) => s.wishlist)
  const rec = useShop((s) => s.recent)
  const orders = useDB((d) => d.orders.filter((o) => o.customer.email.toLowerCase() === user.email.toLowerCase()))
  const products = useDB((d) => d.products)
  const [tab, setTab] = useState<Tab>('orders')
  const [open, setOpen] = useState<string | null>(null)
  const [p, setP] = useState(user)
  const [a, setA] = useState({ label: 'Home', address: '', city: '', state: '', pin: '', landmark: '' })
  const [ae, setAe] = useState<Record<string, string>>({})
  const pick = (ids: string[]) => ids.map((id) => products.find((x) => x.id === id)).filter(Boolean) as typeof products

  const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'orders', label: 'My Orders', icon: Package }, { id: 'profile', label: 'My Profile', icon: UserIcon }, { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart }, { id: 'recent', label: 'Recently Viewed', icon: Eye },
  ]
  const addAddr = (e: React.FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (a.address.trim().length < 6) er.address = 'Enter the full address'
    if (!a.city.trim()) er.city = 'Required'
    if (!a.state.trim()) er.state = 'Required'
    if (!isPin(a.pin)) er.pin = '6-digit PIN'
    setAe(er)
    if (Object.keys(er).length) return
    auth.addAddress(a); setA({ label: 'Home', address: '', city: '', state: '', pin: '', landmark: '' }); toast('Address saved')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 lg:gap-12">
      <aside>
        <div className="bg-white shadow-soft p-5 mb-4"><p className="eyebrow">Signed in</p><p className="font-display text-xl text-navy mt-1 truncate">{user.name}</p><p className="text-xs text-charcoal/55 truncate">{user.email}</p></div>
        <nav aria-label="Account" className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={cx('flex items-center gap-2.5 px-4 h-11 text-sm whitespace-nowrap transition', tab === t.id ? 'bg-navy text-ivory' : 'bg-white text-charcoal/75 hover:bg-mist')}><t.icon size={16} /> {t.label}</button>)}
          <button onClick={() => { auth.logout(); toast('Logged out'); nav('/account') }} className="flex items-center gap-2.5 px-4 h-11 text-sm whitespace-nowrap bg-white text-charcoal/75 hover:bg-mist"><LogOut size={16} /> Logout</button>
        </nav>
      </aside>
      <div>
        {tab === 'orders' && (
          <section>
            <h2 className="text-3xl mb-6">My orders</h2>
            {orders.length === 0 ? <EmptyState title="No orders yet" text="Orders placed with this email will appear here, with live tracking." action={<Link to="/shop" className="btn btn-primary">Start shopping</Link>} /> : (
              <ul className="space-y-4">
                {orders.map((o) => (
                  <li key={o.id} className="bg-white shadow-soft">
                    <button className="w-full p-5 flex flex-wrap items-center justify-between gap-3 text-left" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id}>
                      <div><p className="font-medium text-navy">{o.id}</p><p className="text-xs text-charcoal/55">{fmtDate(o.createdAt)} · {o.items.length} item{o.items.length > 1 ? 's' : ''}</p></div>
                      <span className="text-xs px-3 py-1 bg-pastel-100 text-navy">{o.status}</span>
                      <span className="font-medium">{inr(o.total)}</span>
                    </button>
                    {open === o.id && (
                      <div className="border-t border-mist p-5 grid md:grid-cols-2 gap-6">
                        <Timeline order={o} />
                        <div className="text-sm space-y-2">
                          {o.items.map((i, n) => <p key={n} className="flex justify-between gap-3"><span>{i.name} <span className="text-charcoal/55">· {i.size}, {i.colour} × {i.qty}</span></span><span>{inr(i.price * i.qty)}</span></p>)}
                          {o.tracking && <p className="pt-2 text-charcoal/65">Tracking: {o.tracking.courier} {o.tracking.number}</p>}
                          <Link to={`/track-order?id=${o.id}`} className="btn btn-outline btn-sm mt-3">Open order tracking</Link>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {tab === 'profile' && (
          <section className="max-w-lg">
            <h2 className="text-3xl mb-6">My profile</h2>
            <form className="bg-white shadow-soft p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); if (!isEmail(p.email)) { toast('Enter a valid email', { tone: 'err' }); return } auth.update(p); toast('Profile updated') }}>
              <Field label="Full name"><input className="field" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></Field>
              <Field label="Email"><input className="field" type="email" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} /></Field>
              <Field label="Mobile number"><input className="field" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></Field>
              <button className="btn btn-primary">Save changes</button>
            </form>
          </section>
        )}
        {tab === 'addresses' && (
          <section>
            <h2 className="text-3xl mb-6">Saved addresses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {addresses.map((x) => (
                <div key={x.id} className="bg-white shadow-soft p-5 text-sm"><p className="font-medium text-navy mb-1">{x.label}</p><p className="text-charcoal/70">{x.address}{x.landmark ? `, ${x.landmark}` : ''}<br />{x.city}, {x.state} {x.pin}</p><button className="mt-3 text-xs text-red-600 flex items-center gap-1" onClick={() => auth.removeAddress(x.id)}><Trash2 size={13} /> Remove</button></div>
              ))}
              {!addresses.length && <p className="text-sm text-charcoal/60">No saved addresses yet.</p>}
            </div>
            <form onSubmit={addAddr} noValidate className="bg-white shadow-soft p-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
              <h3 className="sm:col-span-2 text-xl">Add new address</h3>
              <Field label="Label"><input className="field" value={a.label} onChange={(e) => setA({ ...a, label: e.target.value })} /></Field>
              <Field label="PIN code" error={ae.pin}><input className={cx('field', ae.pin && 'field-err')} inputMode="numeric" maxLength={6} value={a.pin} onChange={(e) => setA({ ...a, pin: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="Complete address" error={ae.address}><input className={cx('field', ae.address && 'field-err')} value={a.address} onChange={(e) => setA({ ...a, address: e.target.value })} /></Field></div>
              <Field label="City" error={ae.city}><input className={cx('field', ae.city && 'field-err')} value={a.city} onChange={(e) => setA({ ...a, city: e.target.value })} /></Field>
              <Field label="State" error={ae.state}><input className={cx('field', ae.state && 'field-err')} value={a.state} onChange={(e) => setA({ ...a, state: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="Landmark"><input className="field" value={a.landmark} onChange={(e) => setA({ ...a, landmark: e.target.value })} /></Field></div>
              <button className="btn btn-primary sm:col-span-2 sm:w-fit"><Plus size={16} /> Save address</button>
            </form>
          </section>
        )}
        {tab === 'wishlist' && <section><h2 className="text-3xl mb-6">Wishlist</h2>{wish.length ? <ProductGrid products={pick(wish)} cols={3} /> : <EmptyState title="No saved items" text="Tap the heart on a product to save it." />}</section>}
        {tab === 'recent' && <section><h2 className="text-3xl mb-6">Recently viewed</h2>{rec.length ? <ProductGrid products={pick(rec)} cols={3} /> : <EmptyState title="Nothing viewed yet" text="Products you open will appear here." />}</section>}
      </div>
    </div>
  )
}

export default function Account() {
  usePageMeta('My Account', 'Manage your Blues Apparel 23 profile, orders, addresses and wishlist.')
  const user = useShop((s) => s.user)
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My account' }]} />
      <h1 className="text-4xl md:text-5xl mt-5 mb-8 text-center md:text-left">{user ? 'My account' : 'Login or register'}</h1>
      {user ? <Dashboard /> : <AuthForms />}
    </div>
  )
}
