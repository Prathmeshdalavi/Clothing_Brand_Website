import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { Overlay, Price } from '../ui'
import { ProductImage } from '../art/Art'
import { VariantPicker, useVariant } from './Variant'
import { useDB } from '../../store'
import { toast, ui, useUI } from '../../store/ui'
import { cart } from '../../services'
import type { Product } from '../../types'

function Inner({ p }: { p: Product }) {
  const v = useVariant(p)
  const add = () => {
    if (!v.size) { toast('Please select a size', { tone: 'err' }); return }
    const r = cart.add(p.id, v.size, v.colour, 1)
    if (r.ok) { toast('Added to bag', { action: { label: 'View bag', to: '/cart' } }); ui.set({ quickView: null }) } else toast(r.error, { tone: 'err' })
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="aspect-[4/5] md:aspect-auto md:min-h-[520px] bg-mist">
        <ProductImage product={p} src="art:0" colour={v.colourHex} className="w-full h-full" lazy={false} />
      </div>
      <div className="p-6 md:p-9 flex flex-col">
        <p className="eyebrow mb-2">{p.isNew ? 'New Arrival' : 'Quick view'}</p>
        <h3 className="text-2xl md:text-3xl mb-2 pr-8">{p.name}</h3>
        <Price p={p} size="lg" />
        <p className="text-sm text-charcoal/70 mt-4 mb-6 leading-relaxed line-clamp-3">{p.description}</p>
        <VariantPicker p={p} v={v} />
        <div className="mt-auto pt-6 grid gap-3">
          <button className="btn btn-primary w-full" onClick={add} disabled={p.soldOut}><ShoppingBag size={17} /> {p.soldOut ? 'Sold out' : 'Add to Bag'}</button>
          <Link to={`/product/${p.slug}`} onClick={() => ui.set({ quickView: null })} className="text-center text-sm link-u text-navy">View full details</Link>
        </div>
      </div>
    </div>
  )
}

export function QuickView() {
  const id = useUI((u) => u.quickView)
  const p = useDB((d) => d.products.find((x) => x.id === id))
  return (
    <Overlay open={!!p} onClose={() => ui.set({ quickView: null })} title="Quick view" wide>
      {p && <Inner key={p.id} p={p} />}
    </Overlay>
  )
}
