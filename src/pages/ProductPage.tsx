import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, Heart, MessageCircle, Minus, Plus, ShoppingBag, Truck } from 'lucide-react'
import { useDB, useShop } from '../store'
import { usePageMeta } from '../hooks/usePageMeta'
import { Breadcrumbs, EmptyState, Price } from '../components/ui'
import { Gallery } from '../components/shop/Gallery'
import { VariantPicker, useVariant } from '../components/shop/Variant'
import { ProductGrid } from '../components/shop/ProductCard'
import { cart, recent, wishlist } from '../services'
import { toast } from '../store/ui'
import { cx, totalStock, waLink } from '../lib/utils'
import type { Product } from '../types'

function Accordion({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [o, setO] = useState(!!open)
  return (
    <div className="border-b border-mist">
      <button onClick={() => setO(!o)} aria-expanded={o} className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-navy">
        {title}<ChevronDown size={18} className={cx('transition', o && 'rotate-180')} />
      </button>
      {o && <div className="pb-5 text-sm text-charcoal/75 leading-relaxed">{children}</div>}
    </div>
  )
}

function Detail({ p }: { p: Product }) {
  const nav = useNavigate()
  const v = useVariant(p)
  const [qty, setQty] = useState(1)
  const wished = useShop((s) => s.wishlist.includes(p.id))
  const all = useDB((d) => d.products)
  const recentIds = useShop((s) => s.recent)
  const settings = useDB((d) => d.settings)
  const category = useDB((d) => d.categories.find((c) => c.id === p.category))
  const out = totalStock(p) === 0
  useEffect(() => { recent.push(p.id) }, [p.id])
  useEffect(() => setQty(1), [v.colour, v.size])

  const guard = () => {
    if (!v.size) { toast('Please select a size', { tone: 'err' }); document.getElementById('size-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return false }
    return true
  }
  const add = () => {
    if (!guard()) return
    const r = cart.add(p.id, v.size, v.colour, qty)
    if (r.ok) toast('Added to bag', { action: { label: 'View bag', to: '/cart' } }); else toast(r.error, { tone: 'err' })
  }
  const buy = () => {
    if (!guard()) return
    const r = cart.buyNow(p.id, v.size, v.colour, qty)
    if (r.ok) nav('/checkout'); else toast(r.error, { tone: 'err' })
  }
  const wa = waLink(`Hi Blues Apparel 23, I'm interested in "${p.name}".\nSize: ${v.size || 'not selected yet'}\nColour: ${v.colour}\nIs it available? (Sent from the demo website)`)
  const related = all.filter((x) => x.active && x.id !== p.id && x.category === p.category).slice(0, 4)
  const seen = recentIds.filter((id) => id !== p.id).map((id) => all.find((x) => x.id === id)).filter(Boolean).slice(0, 4) as Product[]
  const max = v.stock ?? 10
  const sticky = !out

  return (
    <div className="container-x py-6 md:py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: category?.name ?? 'Shop', to: `/collections/${p.category}` }, { label: p.name }]} />
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-16 mt-5 md:mt-8">
        <Gallery p={p} colour={v.colourHex} />
        <div className="md:sticky md:top-28 self-start">
          <div className="flex items-center gap-2 mb-3">
            {p.isNew && <span className="bg-pastel text-navy text-[10px] font-medium tracking-widest uppercase px-2.5 py-1">New Arrival</span>}
            {out && <span className="bg-charcoal text-white text-[10px] tracking-widest uppercase px-2.5 py-1">Sold out</span>}
          </div>
          <h1 className="text-3xl md:text-4xl leading-tight">{p.name}</h1>
          <div className="mt-3"><Price p={p} size="lg" /></div>
          <p className="text-xs text-charcoal/50 mt-1">Inclusive of taxes (sample price for demonstration)</p>
          <p className="mt-5 text-[15px] text-charcoal/75 leading-relaxed">{p.description}</p>

          <div className="mt-7" id="size-anchor"><VariantPicker p={p} v={v} /></div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-mist bg-white" role="group" aria-label="Quantity">
              <button aria-label="Decrease quantity" className="w-11 h-12 grid place-items-center hover:bg-mist" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
              <span className="w-10 text-center text-sm" aria-live="polite">{qty}</span>
              <button aria-label="Increase quantity" className="w-11 h-12 grid place-items-center hover:bg-mist" onClick={() => { if (qty < max) setQty(qty + 1); else toast(`Only ${max} available`, { tone: 'err' }) }}><Plus size={16} /></button>
            </div>
            <button onClick={() => { wishlist.toggle(p.id); toast(wished ? 'Removed from wishlist' : 'Saved to wishlist') }} aria-pressed={wished} className="btn btn-outline flex-1"><Heart size={17} className={wished ? 'fill-navy' : ''} /> {wished ? 'Saved' : 'Add to Wishlist'}</button>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <button className="btn btn-primary" onClick={add} disabled={out}><ShoppingBag size={17} /> {out ? 'Sold out' : 'Add to Bag'}</button>
            <button className="btn btn-light" onClick={buy} disabled={out}>Buy Now</button>
          </div>
          <a href={wa} target="_blank" rel="noreferrer" className="btn btn-outline w-full mt-3"><MessageCircle size={17} /> Ask on WhatsApp</a>
          <p className="text-xs text-charcoal/55 mt-2">Opens WhatsApp with this product, size and colour pre-filled.</p>

          <div className="mt-8 border-t border-mist">
            <Accordion title="Fabric & material" open><p>{p.fabric}</p><p className="text-xs text-charcoal/50 mt-2">Editable demonstration copy — confirm actual composition with the brand.</p></Accordion>
            <Accordion title="Care instructions"><ul className="list-disc pl-5 space-y-1">{p.care.map((c) => <li key={c}>{c}</li>)}</ul></Accordion>
            <Accordion title="Delivery information">
              <p className="flex gap-2"><Truck size={16} className="mt-0.5 shrink-0 text-navy" /> Delivery timelines and charges are yet to be confirmed by the business. {settings.deliveryCharge === 0 ? 'The delivery charge is shown as a placeholder at checkout.' : ''} See the <Link to="/shipping-policy" className="link-u text-navy">Shipping &amp; Delivery policy</Link>.</p>
            </Accordion>
            <Accordion title="Returns & exchanges"><p>The store’s currently stated policy is no refund, exchange or cancellation (subject to owner confirmation). Please check size and colour on WhatsApp before ordering. <Link to="/return-policy" className="link-u text-navy">Read policy</Link>.</p></Accordion>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="rel-h">
          <h2 id="rel-h" className="text-3xl mb-8">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
      {seen.length > 0 && (
        <section className="mt-20" aria-labelledby="rec-h">
          <h2 id="rec-h" className="text-3xl mb-8">Recently viewed</h2>
          <ProductGrid products={seen} />
        </section>
      )}

      {sticky && (
        <div className="md:hidden fixed inset-x-0 bottom-[58px] z-[58] bg-ivory/95 backdrop-blur border-t border-mist p-3 flex items-center gap-3 pb-safe no-print">
          <div className="leading-tight"><p className="text-[11px] text-charcoal/55">{v.size ? `Size ${v.size}` : 'Select size'}</p><p className="font-medium text-navy">₹{p.price.toLocaleString('en-IN')}</p></div>
          <button className="btn btn-primary flex-1" onClick={add}><ShoppingBag size={17} /> Add to Bag</button>
        </div>
      )}
    </div>
  )
}

export default function ProductPage() {
  const { slug = '' } = useParams()
  const p = useDB((d) => d.products.find((x) => x.slug === slug && x.active))
  usePageMeta(p ? p.name : 'Product not found', p?.description)
  if (!p) return <div className="container-x py-20"><EmptyState title="Product not found" text="This product may have been removed or the link is incorrect." action={<Link className="btn btn-primary" to="/shop">Continue shopping</Link>} /></div>
  return <Detail key={p.id} p={p} />
}
