import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Home, Menu, MessageCircle, Phone, Instagram, Search, ShoppingBag, Store, User, X, MapPin, Clock } from 'lucide-react'
import { useDB, useShop } from '../../store'
import { ui, useUI } from '../../store/ui'
import { BRAND } from '../../data/seed'
import { cx, inr } from '../../lib/utils'
import { Overlay, ToastHost } from '../ui'
import { ProductImage } from '../art/Art'
import { QuickView } from '../shop/QuickView'
import { SizeGuide } from '../shop/Variant'

function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" aria-label="Blues Apparel 23 — home" className="flex items-baseline gap-1.5 leading-none">
      <span className={cx('font-display text-[22px] md:text-[26px] tracking-tight', light ? 'text-ivory' : 'text-navy')}>Blues Apparel</span>
      <span className={cx('font-display italic text-[22px] md:text-[26px]', light ? 'text-pastel' : 'text-navy-500')}>23</span>
    </Link>
  )
}

function AnnouncementBar() {
  const offers = useDB((d) => d.offers.filter((o) => o.active))
  const [i, setI] = useState(0)
  useEffect(() => {
    if (offers.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % offers.length), 4200)
    return () => clearInterval(t)
  }, [offers.length])
  if (!offers.length) return null
  return (
    <div className="bg-navy text-ivory text-[12px] md:text-[13px] tracking-wide">
      <div className="container-x h-9 flex items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.35 }} className="text-center truncate">
            {offers[i % offers.length].text}
          </motion.p>
        </AnimatePresence>
        <a href={BRAND.whatsappUrl} target="_blank" rel="noreferrer" className="hidden lg:flex absolute right-10 items-center gap-1.5 text-pastel hover:text-white"><Phone size={12} /> {BRAND.phone}</a>
      </div>
    </div>
  )
}

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/new-arrivals', label: 'New Arrivals' },
  { to: '/shop?group=clothing', label: 'Clothing', key: 'clothing' },
  { to: '/shop?group=footwear', label: 'Footwear', key: 'footwear' },
  { to: '/shop?group=accessories', label: 'Accessories', key: 'accessories' },
  { to: '/collections', label: 'Collections' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
]

function SearchOverlay() {
  const open = useUI((u) => u.search)
  const products = useDB((d) => d.products)
  const nav = useNavigate()
  const [q, setQ] = useState('')
  useEffect(() => { if (!open) setQ('') }, [open])
  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return []
    return products.filter((p) => p.active && (p.name.toLowerCase().includes(t) || p.category.includes(t) || p.kind.includes(t))).slice(0, 6)
  }, [q, products])
  const go = (e?: React.FormEvent) => { e?.preventDefault(); ui.set({ search: false }); nav(`/shop?q=${encodeURIComponent(q.trim())}`) }
  return (
    <Overlay open={open} onClose={() => ui.set({ search: false })} title="Search" side="center" wide>
      <div className="p-5 md:p-8 min-h-[50vh] md:min-h-[320px]">
        <form onSubmit={go} role="search" className="flex items-center gap-3 border-b border-navy pb-3 pr-10">
          <Search size={20} className="text-navy shrink-0" aria-hidden />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dresses, sneakers, jackets…" aria-label="Search products" className="flex-1 bg-transparent text-lg outline-none placeholder:text-charcoal/40" />
        </form>
        <div className="mt-6">
          {!q.trim() && (
            <div>
              <p className="eyebrow mb-3">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {['Dress', 'Sneakers', 'Jacket', 'Co-ord', 'Tote'].map((t) => (
                  <button key={t} onClick={() => setQ(t)} className="px-4 h-9 border border-mist bg-white text-sm hover:border-navy transition">{t}</button>
                ))}
              </div>
            </div>
          )}
          {q.trim() && results.length === 0 && <p className="text-charcoal/65 text-sm">No products match “{q}”. Try a different word or <Link to="/contact" onClick={() => ui.set({ search: false })} className="link-u text-navy">ask the store</Link>.</p>}
          <ul className="divide-y divide-mist">
            {results.map((p) => (
              <li key={p.id}>
                <Link to={`/product/${p.slug}`} onClick={() => ui.set({ search: false })} className="flex items-center gap-4 py-3 hover:bg-white/60 transition px-1">
                  <div className="w-14 h-[70px] bg-mist shrink-0"><ProductImage product={p} className="w-full h-full" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-charcoal/60">{inr(p.price)}</p></div>
                </Link>
              </li>
            ))}
          </ul>
          {results.length > 0 && <button onClick={() => go()} className="btn btn-outline btn-sm mt-4">See all results</button>}
        </div>
      </div>
    </Overlay>
  )
}

function MobileMenu() {
  const open = useUI((u) => u.menu)
  const close = () => ui.set({ menu: false })
  return (
    <Overlay open={open} onClose={close} title="Menu" side="left">
      <div className="p-6 pt-16">
        <nav aria-label="Mobile">
          <ul className="space-y-1">
            {[...NAV, { to: '/track-order', label: 'Track Order' }, { to: '/faq', label: 'FAQs & Services' }].map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={close} className="block py-3 font-display text-[22px] text-navy border-b border-mist">{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8 space-y-3 text-sm">
          <a className="flex items-center gap-2 text-navy" href={`tel:${BRAND.phoneRaw}`}><Phone size={16} /> {BRAND.phone}</a>
          <a className="flex items-center gap-2 text-navy" href={BRAND.whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp {BRAND.whatsapp}</a>
          <a className="flex items-center gap-2 text-navy" href={BRAND.instagram} target="_blank" rel="noreferrer"><Instagram size={16} /> {BRAND.handle}</a>
        </div>
      </div>
    </Overlay>
  )
}

function Header() {
  const cartCount = useShop((s) => s.cart.reduce((a, c) => a + c.qty, 0))
  const wish = useShop((s) => s.wishlist.length)
  const user = useShop((s) => s.user)
  const categories = useDB((d) => d.categories.filter((c) => c.enabled))
  const [menuKey, setMenuKey] = useState<string | null>(null)
  const loc = useLocation()
  useEffect(() => setMenuKey(null), [loc.pathname, loc.search])
  const Icon = ({ to, label, children, badge }: { to: string; label: string; children: React.ReactNode; badge?: number }) => (
    <Link to={to} aria-label={label} className="relative w-10 h-10 grid place-items-center text-navy hover:bg-mist rounded-full transition">
      {children}
      {!!badge && <span className="absolute top-0.5 right-0 min-w-[17px] h-[17px] px-1 rounded-full bg-navy text-ivory text-[10px] grid place-items-center">{badge}</span>}
    </Link>
  )
  return (
    <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-mist" onMouseLeave={() => setMenuKey(null)}>
      <div className="container-x h-16 md:h-[72px] flex items-center gap-4">
        <button className="lg:hidden -ml-2 w-10 h-10 grid place-items-center text-navy" aria-label="Open menu" onClick={() => ui.set({ menu: true })}><Menu size={22} /></button>
        <Logo />
        <nav aria-label="Primary" className="hidden lg:flex flex-1 justify-center">
          <ul className="flex items-center gap-5 xl:gap-9">
            {NAV.map((n) => (
              <li key={n.to} onMouseEnter={() => setMenuKey(n.key === 'clothing' ? 'clothing' : null)} className="relative">
                <NavLink
                  to={n.to} end={n.end}
                  className={({ isActive }) => cx('text-[13px] tracking-wide py-6 inline-block whitespace-nowrap relative after:absolute after:left-0 after:bottom-[22px] after:h-px after:bg-navy after:transition-all after:duration-300', isActive && !n.key && n.to !== '/shop' ? 'text-navy font-medium after:w-full' : 'text-charcoal/80 hover:text-navy after:w-0 hover:after:w-full')}
                >{n.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto lg:ml-0 flex items-center">
          <button onClick={() => ui.set({ search: true })} aria-label="Search" className="w-10 h-10 grid place-items-center text-navy hover:bg-mist rounded-full transition"><Search size={20} /></button>
          <span className="hidden md:block"><Icon to="/wishlist" label="Wishlist" badge={wish}><Heart size={20} /></Icon></span>
          <Icon to="/cart" label="Shopping bag" badge={cartCount}><ShoppingBag size={20} /></Icon>
          <span className="hidden md:block"><Icon to="/account" label={user ? 'My account' : 'Login or register'}><User size={20} /></Icon></span>
        </div>
      </div>
      <AnimatePresence>
        {menuKey === 'clothing' && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="hidden lg:block absolute inset-x-0 top-full bg-ivory border-b border-mist shadow-soft">
            <div className="container-x py-8 grid grid-cols-4 gap-8">
              <div>
                <p className="eyebrow mb-4">Clothing</p>
                <ul className="space-y-2.5 text-sm">
                  {categories.filter((c) => c.group === 'clothing').map((c) => <li key={c.id}><Link className="hover:text-navy link-u" to={`/collections/${c.id}`}>{c.name}</Link></li>)}
                  <li><Link className="text-navy font-medium link-u" to="/shop?group=clothing">Shop all clothing</Link></li>
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-4">Footwear &amp; Accessories</p>
                <ul className="space-y-2.5 text-sm">
                  {categories.filter((c) => c.group !== 'clothing').map((c) => <li key={c.id}><Link className="hover:text-navy link-u" to={`/collections/${c.id}`}>{c.name}</Link></li>)}
                </ul>
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <Link to="/new-arrivals" className="relative aspect-[16/10] bg-pastel overflow-hidden group"><span className="absolute left-4 bottom-4 font-display text-xl text-navy">New Arrivals</span><span className="absolute right-4 top-4 text-xs text-navy/70 group-hover:translate-x-1 transition">Shop →</span></Link>
                <Link to="/collections" className="relative aspect-[16/10] bg-navy overflow-hidden group"><span className="absolute left-4 bottom-4 font-display text-xl text-ivory">Collections</span><span className="absolute right-4 top-4 text-xs text-pastel group-hover:translate-x-1 transition">Explore →</span></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function Footer() {
  const s = useDB((d) => d.settings)
  const links = (arr: [string, string][]) => arr.map(([l, to]) => <li key={to}><Link to={to} className="hover:text-white transition">{l}</Link></li>)
  return (
    <footer className="bg-navy text-ivory/80 mt-24 text-sm">
      <div className="container-x py-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <Logo light />
          <p className="max-w-sm leading-relaxed text-ivory/70">Contemporary fashion, footwear and accessories — established 2023. Connect with us on Instagram, WhatsApp or visit the store.</p>
          <div className="flex gap-3 pt-1">
            <a href={BRAND.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="w-10 h-10 border border-white/20 grid place-items-center hover:bg-pastel hover:text-navy transition"><Instagram size={18} /></a>
            <a href={BRAND.whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-10 h-10 border border-white/20 grid place-items-center hover:bg-pastel hover:text-navy transition"><MessageCircle size={18} /></a>
            <a href={`tel:${BRAND.phoneRaw}`} aria-label="Call the store" className="w-10 h-10 border border-white/20 grid place-items-center hover:bg-pastel hover:text-navy transition"><Phone size={18} /></a>
          </div>
        </div>
        <div><p className="eyebrow !text-pastel mb-4">Shop</p><ul className="space-y-2.5">{links([['New Arrivals', '/new-arrivals'], ['Clothing', '/shop?group=clothing'], ['Footwear', '/shop?group=footwear'], ['Accessories', '/shop?group=accessories'], ['Collections', '/collections']])}</ul></div>
        <div><p className="eyebrow !text-pastel mb-4">Help</p><ul className="space-y-2.5">{links([['Track Order', '/track-order'], ['FAQs & Services', '/faq'], ['Contact Us', '/contact'], ['Shipping & Delivery', '/shipping-policy'], ['Returns & Refunds', '/return-policy'], ['Cancellation', '/cancellation-policy'], ['Payment Policy', '/payment-policy'], ['Privacy Policy', '/privacy-policy'], ['Terms & Conditions', '/terms']])}</ul></div>
        <div className="space-y-3">
          <p className="eyebrow !text-pastel mb-4">Visit &amp; Contact</p>
          <p className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> {s.address}</p>
          <p className="flex gap-2"><Clock size={16} className="mt-0.5 shrink-0" /> {s.hours}</p>
          <a href={`tel:${BRAND.phoneRaw}`} className="flex gap-2 hover:text-white"><Phone size={16} className="mt-0.5 shrink-0" /> {s.phone}</a>
          <a href={BRAND.whatsappUrl} target="_blank" rel="noreferrer" className="flex gap-2 hover:text-white"><MessageCircle size={16} className="mt-0.5 shrink-0" /> {s.whatsapp}</a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-6 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[12.5px] text-ivory/65 pb-24 md:pb-6">
          <p>© 2023–{new Date().getFullYear()} Blues Apparel 23. Demonstration website — sample products, prices and stock.</p>
          <p>Website Designed &amp; Developed by <span className="text-ivory">Rajsu Technologies</span>. Development Contact: <a href="tel:+919082332848" className="text-ivory hover:text-pastel">+91 9082332848</a>.</p>
        </div>
      </div>
    </footer>
  )
}

function MobileNav() {
  const cartCount = useShop((s) => s.cart.reduce((a, c) => a + c.qty, 0))
  const wish = useShop((s) => s.wishlist.length)
  const items = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/shop', label: 'Shop', icon: Store },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wish },
    { to: '/cart', label: 'Bag', icon: ShoppingBag, badge: cartCount },
    { to: '/account', label: 'Account', icon: User },
  ]
  return (
    <nav aria-label="Bottom navigation" className="md:hidden fixed bottom-0 inset-x-0 z-[60] bg-ivory/95 backdrop-blur border-t border-mist pb-safe no-print">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: I, end, badge }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => cx('relative flex flex-col items-center justify-center gap-0.5 h-[58px] text-[11px]', isActive ? 'text-navy font-medium' : 'text-charcoal/60')}>
              <span className="relative"><I size={21} />{!!badge && <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-navy text-ivory text-[10px] grid place-items-center">{badge}</span>}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Floaters() {
  const loc = useLocation()
  const onProduct = loc.pathname.startsWith('/product/') || loc.pathname === '/cart' || loc.pathname === '/checkout'
  return (
    <>
      <a
        href={BRAND.whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat with Blues Apparel 23 on WhatsApp"
        className={cx('fixed right-4 z-[55] w-[52px] h-[52px] rounded-full bg-[#128C4A] text-white grid place-items-center shadow-lift hover:scale-105 transition no-print', onProduct ? 'bottom-[9.5rem] md:bottom-6' : 'bottom-[4.9rem] md:bottom-6')}
      ><MessageCircle size={24} /></a>
      <div className="fixed left-3 bottom-[4.2rem] md:bottom-4 z-[55] bg-charcoal/85 text-white text-[10px] tracking-[.18em] uppercase px-2.5 py-1 rounded-sm pointer-events-none no-print">Demo website</div>
    </>
  )
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0 }) }, [pathname])
  return null
}

export default function Layout() {
  const loc = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollTop />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <AnnouncementBar />
      <Header />
      <motion.main id="main" key={loc.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="flex-1 pb-[4.5rem] md:pb-0">
        <Outlet />
      </motion.main>
      <Footer />
      <MobileNav />
      <Floaters />
      <SearchOverlay />
      <MobileMenu />
      <QuickView />
      <SizeGuide />
      <ToastHost />
    </div>
  )
}
