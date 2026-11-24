import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Heart, ShoppingBag } from 'lucide-react'
import type { Product } from '../../types'
import { ProductImage } from '../art/Art'
import { Price } from '../ui'
import { cx, totalStock } from '../../lib/utils'
import { useShop } from '../../store'
import { cart, wishlist } from '../../services'
import { toast, ui } from '../../store/ui'

export function WishButton({ id, className }: { id: string; className?: string }) {
  const on = useShop((s) => s.wishlist.includes(id))
  return (
    <button
      type="button" aria-pressed={on} aria-label={on ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); wishlist.toggle(id); toast(on ? 'Removed from wishlist' : 'Saved to wishlist') }}
      className={cx('w-10 h-10 grid place-items-center rounded-full bg-white/90 hover:bg-white shadow-soft transition active:scale-90', className)}
    >
      <Heart size={18} className={cx('transition', on ? 'fill-navy text-navy' : 'text-navy')} />
    </button>
  )
}

export function ProductCard({ p }: { p: Product }) {
  const [hover, setHover] = useState(false)
  const nav = useNavigate()
  const out = totalStock(p) === 0
  const quickAdd = () => {
    if (p.sizes.length === 1 && p.colours.length === 1) {
      const r = cart.add(p.id, p.sizes[0], p.colours[0].name, 1)
      if (r.ok) toast('Added to bag', { action: { label: 'View bag', to: '/cart' } }); else toast(r.error, { tone: 'err' })
    } else ui.set({ quickView: p.id })
  }
  return (
    <article className="group" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative overflow-hidden bg-mist aspect-[4/5]">
        <Link to={`/product/${p.slug}`} aria-label={p.name} onClick={() => window.scrollTo(0, 0)} className="block w-full h-full">
          <ProductImage product={p} src="art:0" className={cx('absolute inset-0 w-full h-full transition duration-700', hover && 'opacity-0 scale-105')} />
          <ProductImage product={p} src={p.images[1] ?? 'art:1'} className={cx('absolute inset-0 w-full h-full transition duration-700', hover ? 'opacity-100 scale-100' : 'opacity-0 scale-105')} />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {out ? <span className="bg-charcoal text-white text-[10px] tracking-widest uppercase px-2.5 py-1">Sold out</span>
            : p.isNew && <span className="bg-pastel text-navy text-[10px] font-medium tracking-widest uppercase px-2.5 py-1">New Arrival</span>}
        </div>
        <WishButton id={p.id} className="absolute top-3 right-3" />
        <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 md:translate-y-full md:group-hover:translate-y-0 md:group-focus-within:translate-y-0 transition duration-300">
          <button type="button" onClick={() => ui.set({ quickView: p.id })} className="btn btn-sm bg-white/95 text-navy hover:bg-white flex-1 shadow-soft" aria-label={`Quick view ${p.name}`}>
            <Eye size={15} /> <span className="hidden sm:inline">Quick View</span>
          </button>
          <button type="button" disabled={out} onClick={quickAdd} className="btn btn-sm btn-primary flex-1 shadow-soft" aria-label={`Add ${p.name} to bag`}>
            <ShoppingBag size={15} /> <span className="hidden sm:inline">Add to Bag</span>
          </button>
        </div>
      </div>
      <div className="pt-3.5 space-y-1.5">
        <h3 className="font-sans text-[14.5px] font-medium text-charcoal leading-snug">
          <Link to={`/product/${p.slug}`} onClick={(e) => { e.preventDefault(); nav(`/product/${p.slug}`); window.scrollTo(0, 0) }} className="hover:text-navy">{p.name}</Link>
        </h3>
        <Price p={p} />
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex gap-1.5" aria-label="Available colours">
            {p.colours.slice(0, 5).map((c) => <span key={c.name} title={c.name} className="w-3.5 h-3.5 rounded-full border border-black/15" style={{ background: c.hex }} />)}
          </div>
          <p className="text-[11px] text-charcoal/55 truncate">{p.sizes.length === 1 ? p.sizes[0] : p.sizes.join(' · ')}</p>
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({ products, cols = 4 }: { products: Product[]; cols?: 3 | 4 }) {
  return (
    <div className={cx('grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-5 md:gap-y-10', cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
      {products.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  )
}
