import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ruler } from 'lucide-react'
import type { Product } from '../../types'
import { cx, variantStock } from '../../lib/utils'
import { ui } from '../../store/ui'
import { Overlay } from '../ui'
import { useUI } from '../../store/ui'

export function useVariant(p: Product) {
  const firstAvail = p.colours.find((c) => p.sizes.some((s) => variantStock(p, s, c.name) > 0)) ?? p.colours[0]
  const [colour, setColour] = useState(firstAvail.name)
  const [size, setSize] = useState<string>(p.sizes.length === 1 ? p.sizes[0] : '')
  useEffect(() => {
    setColour(firstAvail.name)
    setSize(p.sizes.length === 1 ? p.sizes[0] : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id])
  const stock = size ? variantStock(p, size, colour) : null
  return { colour, setColour, size, setSize, stock, colourHex: p.colours.find((c) => c.name === colour)?.hex ?? p.colours[0].hex }
}

export function VariantPicker({ p, v, showGuide = true }: { p: Product; v: ReturnType<typeof useVariant>; showGuide?: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm mb-3"><span className="font-medium text-navy">Colour:</span> <span className="text-charcoal/70">{v.colour}</span></p>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Colour">
          {p.colours.map((c) => {
            const any = p.sizes.some((s) => variantStock(p, s, c.name) > 0)
            return (
              <button
                key={c.name} type="button" role="radio" aria-checked={v.colour === c.name} aria-label={`${c.name}${any ? '' : ' (sold out)'}`}
                onClick={() => v.setColour(c.name)}
                className={cx('relative w-10 h-10 rounded-full grid place-items-center transition', v.colour === c.name ? 'ring-2 ring-navy ring-offset-2 ring-offset-ivory' : 'ring-1 ring-black/10 hover:ring-navy/50', !any && 'opacity-40')}
              >
                <span className="w-7 h-7 rounded-full border border-black/10" style={{ background: c.hex }} />
                {!any && <span className="absolute w-px h-8 bg-charcoal/60 rotate-45" />}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-navy">Size {v.size && <span className="text-charcoal/70 font-normal">: {v.size}</span>}</p>
          {showGuide && p.sizes.length > 1 && (
            <button type="button" onClick={() => ui.set({ sizeGuide: p.kind })} className="text-xs text-navy flex items-center gap-1 link-u"><Ruler size={14} /> Size guide</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
          {p.sizes.map((s) => {
            const n = variantStock(p, s, v.colour)
            return (
              <button
                key={s} type="button" role="radio" aria-checked={v.size === s} disabled={n <= 0}
                onClick={() => v.setSize(s)}
                className={cx(
                  'min-w-[3.1rem] h-11 px-3 text-sm border rounded-sm transition',
                  v.size === s ? 'bg-navy text-ivory border-navy' : 'bg-white border-mist hover:border-navy text-charcoal',
                  n <= 0 && 'opacity-40 line-through cursor-not-allowed hover:border-mist',
                )}
              >{s}</button>
            )
          })}
        </div>
        <p className="mt-3 text-xs h-4" aria-live="polite">
          {v.size && v.stock !== null && (v.stock <= 0 ? <span className="text-red-600">Out of stock in this size and colour</span> : v.stock <= 5 ? <span className="text-amber-700">Only {v.stock} left</span> : <span className="text-emerald-700">In stock</span>)}
        </p>
      </div>
    </div>
  )
}

const GUIDE: Record<string, { head: string[]; rows: string[][]; note: string }> = {
  top: { head: ['Size', 'Chest (in)', 'Length (in)'], rows: [['XS', '34', '25'], ['S', '36', '26'], ['M', '38', '27'], ['L', '40', '28'], ['XL', '42', '29']], note: 'Sample measurements for demonstration. The store will confirm actual garment sizing.' },
  bottom: { head: ['Waist', 'Waist (in)', 'Hip (in)'], rows: [['28', '28', '36'], ['30', '30', '38'], ['32', '32', '40'], ['34', '34', '42'], ['36', '36', '44']], note: 'Sample measurements for demonstration. The store will confirm actual garment sizing.' },
  shoe: { head: ['UK size', 'Foot length (cm)', 'EU size'], rows: [['UK 6', '24.0', '39'], ['UK 7', '25.0', '40'], ['UK 8', '26.0', '42'], ['UK 9', '27.0', '43'], ['UK 10', '28.0', '44']], note: 'Sample conversions for demonstration. Please confirm fit with the store.' },
}
const groupOf = (kind: string | null) => (kind === 'trousers' ? 'bottom' : kind === 'sneaker' || kind === 'slide' ? 'shoe' : 'top')

export function SizeGuide() {
  const kind = useUI((u) => u.sizeGuide)
  const g = GUIDE[groupOf(kind)]
  return (
    <Overlay open={!!kind} onClose={() => ui.set({ sizeGuide: null })} title="Size guide">
      <div className="p-7 md:p-9">
        <h3 className="text-2xl mb-1">Size guide</h3>
        <p className="text-sm text-charcoal/65 mb-6">Need help choosing? <a className="link-u text-navy" href="https://wa.me/918794546813?text=Hi%20Blues%20Apparel%2023%2C%20I%20need%20help%20with%20sizing." target="_blank" rel="noreferrer">Ask the store on WhatsApp</a>.</p>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-navy border-b border-mist">{g.head.map((h) => <th key={h} className="py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>{g.rows.map((r) => <tr key={r[0]} className="border-b border-mist/70">{r.map((c, i) => <td key={i} className="py-2.5">{c}</td>)}</tr>)}</tbody>
        </table>
        <p className="mt-5 text-xs text-charcoal/55">{g.note}</p>
      </div>
    </Overlay>
  )
}

export function ProductLink({ p, children, className }: { p: Product; children: React.ReactNode; className?: string }) {
  return <Link to={`/product/${p.slug}`} className={className}>{children}</Link>
}
