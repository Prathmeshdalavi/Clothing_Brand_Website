import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useDB } from '../../store'
import { ProductImage } from '../../components/art/Art'
import { Badge, PageHead, Panel, Stat } from './AdminLayout'
import { admin } from '../../services'
import { cx, totalStock } from '../../lib/utils'

export default function Inventory() {
  const products = useDB((d) => d.products)
  const low = useDB((d) => d.settings.lowStockThreshold)
  const [open, setOpen] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const lowList = products.filter((p) => totalStock(p) > 0 && totalStock(p) <= low)
  const outList = products.filter((p) => totalStock(p) === 0)
  const shown = products.filter((p) => (filter === 'all' ? true : filter === 'low' ? lowList.includes(p) : outList.includes(p)))
  const units = products.reduce((a, p) => a + totalStock(p), 0)
  return (
    <>
      <PageHead title="Inventory" sub="Stock by product, size and colour. Placing a demo order deducts stock automatically." />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Stat label="Total units" value={units} />
        <Stat label="Products" value={products.length} />
        <Stat label="Low stock" value={lowList.length} tone={lowList.length ? 'warn' : undefined} hint={`${low} units or fewer`} />
        <Stat label="Out of stock" value={outList.length} tone={outList.length ? 'warn' : undefined} />
      </div>
      {lowList.length > 0 && (
        <div role="status" className="bg-amber-50 border border-amber-200 text-amber-900 text-sm p-4 mb-6"><strong>Low-stock alert:</strong> {lowList.map((p) => `${p.name} (${totalStock(p)})`).join(', ')}</div>
      )}
      <Panel>
        <div className="flex gap-2 mb-4" role="tablist">
          {([['all', 'All products'], ['low', 'Low stock'], ['out', 'Out of stock']] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)} className={cx('h-9 px-4 text-sm border transition', filter === k ? 'bg-navy text-ivory border-navy' : 'bg-white border-mist hover:border-navy')}>{l}</button>)}
        </div>
        <ul className="divide-y divide-mist -mx-5">
          {shown.map((p) => {
            const t = totalStock(p)
            return (
              <li key={p.id}>
                <button onClick={() => setOpen(open === p.id ? null : p.id)} aria-expanded={open === p.id} className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-ivory/60">
                  <div className="w-10 h-12 bg-mist shrink-0"><ProductImage product={p} className="w-full h-full" /></div>
                  <span className="flex-1 min-w-0 font-medium text-sm truncate">{p.name}</span>
                  {p.soldOut ? <Badge tone="bad">Marked sold out</Badge> : t === 0 ? <Badge tone="bad">Out of stock</Badge> : t <= low ? <Badge tone="warn">Low · {t}</Badge> : <Badge tone="ok">{t} in stock</Badge>}
                  <ChevronDown size={18} className={cx('transition shrink-0', open === p.id && 'rotate-180')} />
                </button>
                {open === p.id && (
                  <div className="px-5 pb-5 overflow-x-auto">
                    <table className="text-sm">
                      <thead><tr><th className="text-left text-[11px] uppercase tracking-wider text-charcoal/50 pr-6 py-2">Colour \ Size</th>{p.sizes.map((s) => <th key={s} className="text-center text-[11px] uppercase tracking-wider text-charcoal/50 px-2 py-2">{s}</th>)}</tr></thead>
                      <tbody>
                        {p.colours.map((c) => (
                          <tr key={c.name}>
                            <td className="pr-6 py-1.5"><span className="inline-flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border border-black/15" style={{ background: c.hex }} />{c.name}</span></td>
                            {p.sizes.map((s) => {
                              const k = `${s}|${c.name}`
                              const v = p.stock[k] ?? 0
                              return <td key={s} className="px-1 py-1"><input type="number" min={0} aria-label={`${p.name} ${c.name} ${s} stock`} value={v} onChange={(e) => admin.setStock(p.id, k, Number(e.target.value))} className={cx('w-16 h-9 text-center border text-sm', v === 0 ? 'border-red-300 bg-red-50' : v <= 2 ? 'border-amber-300 bg-amber-50' : 'border-mist bg-white')} /></td>
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            )
          })}
          {!shown.length && <li className="px-5 py-8 text-sm text-center text-charcoal/55">Nothing here.</li>}
        </ul>
      </Panel>
    </>
  )
}
