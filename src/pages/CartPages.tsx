import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react'
import { useDB, useShop } from '../store'
import { usePageMeta } from '../hooks/usePageMeta'
import { Breadcrumbs, EmptyState } from '../components/ui'
import { ProductImage } from '../components/art/Art'
import { ProductGrid } from '../components/shop/ProductCard'
import { cart, cartLines, coupons, pricing } from '../services'
import { toast } from '../store/ui'
import { inr } from '../lib/utils'

export function Summary({ showCoupon = true, cta }: { showCoupon?: boolean; cta?: React.ReactNode }) {
  const items = useShop((s) => s.cart)
  const code = useShop((s) => s.coupon)
  const settings = useDB((d) => d.settings)
  const available = useDB((d) => d.coupons.filter((c) => c.active))
  const [input, setInput] = useState('')
  const t = pricing(items, code)
  const apply = () => {
    if (!input.trim()) return
    const r = coupons.apply(input)
    toast(r.message, { tone: r.ok ? 'ok' : 'err' })
    if (r.ok) setInput('')
  }
  return (
    <div className="bg-white shadow-soft p-6">
      <h2 className="text-2xl mb-5">Order summary</h2>
      {showCoupon && (
        <div className="mb-5">
          {code ? (
            <div className="flex items-center justify-between bg-pastel-100 px-3 py-2.5 text-sm"><span className="flex items-center gap-2 text-navy"><Tag size={15} /> {code} applied</span><button aria-label="Remove coupon" onClick={() => coupons.remove()}><X size={16} /></button></div>
          ) : (
            <>
              <label htmlFor="coupon" className="label">Coupon code</label>
              <div className="flex gap-2">
                <input id="coupon" value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && apply()} placeholder="Enter code" className="field !h-11" />
                <button className="btn btn-outline btn-sm !h-11" onClick={apply}>Apply</button>
              </div>
              <p className="text-xs text-charcoal/55 mt-2">Demo codes: {available.map((c) => c.code).join(', ')}</p>
            </>
          )}
        </div>
      )}
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between"><dt className="text-charcoal/70">Subtotal</dt><dd>{inr(t.subtotal)}</dd></div>
        {t.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd>− {inr(t.discount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-charcoal/70">Delivery</dt><dd>{settings.deliveryCharge === 0 ? <span className="text-charcoal/55">To be confirmed</span> : inr(t.delivery)}</dd></div>
        <div className="flex justify-between border-t border-mist pt-4 text-base font-semibold text-navy"><dt>Payable amount</dt><dd>{inr(t.total)}</dd></div>
      </dl>
      {settings.deliveryCharge === 0 && <p className="text-xs text-charcoal/50 mt-3">Delivery charge is a placeholder (₹0) until confirmed by the business.</p>}
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  )
}

export function CartPage() {
  usePageMeta('Shopping Bag', 'Review the items in your Blues Apparel 23 shopping bag.')
  const nav = useNavigate()
  const items = useShop((s) => s.cart)
  const products = useDB((d) => d.products)
  const lines = cartLines(items, products)
  const recs = products.filter((p) => p.active && p.bestSeller).slice(0, 4)

  if (!lines.length) {
    return (
      <div className="container-x py-16 md:py-24">
        <EmptyState title="Your bag is empty" text="Add a few styles you love and they’ll wait for you here." action={<Link to="/shop" className="btn btn-primary">Continue shopping</Link>} />
        <h2 className="text-3xl mt-16 mb-8">Popular right now</h2>
        <ProductGrid products={recs} />
      </div>
    )
  }
  const issues = lines.filter((l) => l.max < l.item.qty)
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shopping bag' }]} />
      <h1 className="text-4xl mt-5 mb-8">Shopping bag <span className="text-charcoal/40 text-2xl font-sans">({lines.reduce((a, l) => a + l.item.qty, 0)})</span></h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
        <ul className="divide-y divide-mist border-y border-mist">
          {lines.map((l) => (
            <li key={l.item.key} className="py-5 flex gap-4">
              <Link to={`/product/${l.product.slug}`} className="w-24 sm:w-28 aspect-[4/5] bg-mist shrink-0 block"><ProductImage product={l.product} colour={l.colourHex} className="w-full h-full" /></Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link to={`/product/${l.product.slug}`} className="font-medium text-[15px] hover:text-navy">{l.product.name}</Link>
                    <p className="text-sm text-charcoal/60 mt-1 flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-black/15 inline-block" style={{ background: l.colourHex }} /> {l.item.colour} · {l.item.size}</p>
                  </div>
                  <p className="font-medium text-navy whitespace-nowrap">{inr(l.unit * l.item.qty)}</p>
                </div>
                {l.max < l.item.qty && <p role="alert" className="text-xs text-red-600 mt-2">{l.max === 0 ? 'No longer in stock — please remove this item.' : `Only ${l.max} left — reduce quantity.`}</p>}
                <div className="mt-auto pt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <div className="flex items-center border border-mist bg-white" role="group" aria-label={`Quantity for ${l.product.name}`}>
                    <button aria-label="Decrease quantity" className="w-9 h-9 grid place-items-center hover:bg-mist" onClick={() => l.item.qty > 1 ? cart.setQty(l.item.key, l.item.qty - 1) : cart.remove(l.item.key)}><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm">{l.item.qty}</span>
                    <button aria-label="Increase quantity" className="w-9 h-9 grid place-items-center hover:bg-mist" onClick={() => { const r = cart.setQty(l.item.key, l.item.qty + 1); if (!r.ok) toast(r.error, { tone: 'err' }) }}><Plus size={14} /></button>
                  </div>
                  <button className="text-xs text-navy flex items-center gap-1.5 link-u" onClick={() => { cart.moveToWishlist(l.item.key); toast('Moved to wishlist') }}><Heart size={14} /> Move to wishlist</button>
                  <button className="text-xs text-charcoal/60 flex items-center gap-1.5 hover:text-red-600" onClick={() => cart.remove(l.item.key)}><Trash2 size={14} /> Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="lg:sticky lg:top-28 space-y-4">
          <Summary cta={
            <div className="grid gap-3">
              <button className="btn btn-primary w-full" disabled={issues.length > 0} onClick={() => nav('/checkout')}>Proceed to Checkout</button>
              <Link to="/shop" className="btn btn-outline w-full">Continue Shopping</Link>
            </div>
          } />
        </div>
      </div>
    </div>
  )
}

export function WishlistPage() {
  usePageMeta('Wishlist', 'Your saved styles at Blues Apparel 23.')
  const ids = useShop((s) => s.wishlist)
  const products = useDB((d) => d.products)
  const list = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
      <h1 className="text-4xl mt-5 mb-8">Wishlist</h1>
      {list.length ? <ProductGrid products={list} /> : <EmptyState title="Nothing saved yet" text="Tap the heart on any product to save it here." action={<Link to="/shop" className="btn btn-primary"><ShoppingBag size={16} /> Start browsing</Link>} />}
    </div>
  )
}
