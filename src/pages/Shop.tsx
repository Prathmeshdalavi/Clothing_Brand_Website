import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, Filter, Search, X } from 'lucide-react'
import { useDB } from '../store'
import { usePageMeta } from '../hooks/usePageMeta'
import { Breadcrumbs, EmptyState, Overlay, Reveal } from '../components/ui'
import { ProductGrid } from '../components/shop/ProductCard'
import { ArtImage, ProductImage } from '../components/art/Art'
import { cx, inr, totalStock } from '../lib/utils'
import type { Product } from '../types'

const PAGE = 12
const SORTS = [
  { v: 'featured', l: 'Featured' },
  { v: 'newest', l: 'Newest first' },
  { v: 'low', l: 'Price: low to high' },
  { v: 'high', l: 'Price: high to low' },
]

interface Filters { cats: string[]; sizes: string[]; colours: string[]; min: string; max: string; inStock: boolean }
const EMPTY: Filters = { cats: [], sizes: [], colours: [], min: '', max: '', inStock: false }

function Check({ on, label, count, onChange }: { on: boolean; label: React.ReactNode; count?: number; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 text-sm cursor-pointer group">
      <input type="checkbox" checked={on} onChange={onChange} className="w-4 h-4 accent-[#243B53]" />
      <span className="flex-1 group-hover:text-navy">{label}</span>
      {count !== undefined && <span className="text-xs text-charcoal/45">{count}</span>}
    </label>
  )
}

function FilterPanel({ f, setF, base, hideCats }: { f: Filters; setF: (f: Filters) => void; base: Product[]; hideCats?: boolean }) {
  const categories = useDB((d) => d.categories.filter((c) => c.enabled))
  const sizes = useMemo(() => Array.from(new Set(base.flatMap((p) => p.sizes))), [base])
  const colours = useMemo(() => {
    const m = new Map<string, string>()
    base.forEach((p) => p.colours.forEach((c) => m.set(c.name, c.hex)))
    return Array.from(m, ([name, hex]) => ({ name, hex }))
  }, [base])
  const toggle = (k: 'cats' | 'sizes' | 'colours', v: string) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] })
  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <fieldset className="py-5 border-b border-mist"><legend className="text-[13px] font-semibold text-navy mb-2 tracking-wide">{title}</legend>{children}</fieldset>
  )
  const buckets: [string, string, string][] = [['Under ₹1,000', '', '999'], ['₹1,000 – ₹2,000', '1000', '2000'], ['₹2,000 – ₹3,000', '2000', '3000'], ['Above ₹3,000', '3000', '']]
  return (
    <div>
      {!hideCats && (
        <Group title="Category">
          {categories.map((c) => <Check key={c.id} on={f.cats.includes(c.id)} label={c.name} count={base.filter((p) => p.category === c.id).length} onChange={() => toggle('cats', c.id)} />)}
        </Group>
      )}
      <Group title="Price range (₹)">
        <div className="flex items-center gap-2 mb-3">
          <input aria-label="Minimum price" inputMode="numeric" placeholder="Min" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value.replace(/\D/g, '') })} className="field !h-10" />
          <span className="text-charcoal/40">–</span>
          <input aria-label="Maximum price" inputMode="numeric" placeholder="Max" value={f.max} onChange={(e) => setF({ ...f, max: e.target.value.replace(/\D/g, '') })} className="field !h-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {buckets.map(([l, a, b]) => (
            <button key={l} type="button" onClick={() => setF({ ...f, min: a, max: b })} className={cx('text-xs px-3 h-8 border transition', f.min === a && f.max === b ? 'bg-navy text-ivory border-navy' : 'bg-white border-mist hover:border-navy')}>{l}</button>
          ))}
        </div>
      </Group>
      <Group title="Size">
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => <button key={s} type="button" aria-pressed={f.sizes.includes(s)} onClick={() => toggle('sizes', s)} className={cx('min-w-[2.6rem] h-9 px-2.5 text-xs border transition', f.sizes.includes(s) ? 'bg-navy text-ivory border-navy' : 'bg-white border-mist hover:border-navy')}>{s}</button>)}
        </div>
      </Group>
      <Group title="Colour">
        <div className="flex flex-wrap gap-2.5">
          {colours.map((c) => (
            <button key={c.name} type="button" title={c.name} aria-label={c.name} aria-pressed={f.colours.includes(c.name)} onClick={() => toggle('colours', c.name)}
              className={cx('w-8 h-8 rounded-full grid place-items-center transition', f.colours.includes(c.name) ? 'ring-2 ring-navy ring-offset-2 ring-offset-ivory' : 'ring-1 ring-black/10 hover:ring-navy/50')}>
              <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: c.hex }} />
            </button>
          ))}
        </div>
      </Group>
      <Group title="Availability">
        <Check on={f.inStock} label="In stock only" onChange={() => setF({ ...f, inStock: !f.inStock })} />
      </Group>
      <button type="button" onClick={() => setF(EMPTY)} className="mt-5 text-sm link-u text-navy">Clear all filters</button>
    </div>
  )
}

interface CatalogProps {
  title: string
  intro?: string
  eyebrow?: string
  mode: 'shop' | 'new' | 'category' | 'collection'
  fixedCategory?: string
  productIds?: string[]
  crumbs?: { label: string; to?: string }[]
}

export function Catalog({ title, intro, eyebrow, mode, fixedCategory, productIds, crumbs }: CatalogProps) {
  const [sp, setSp] = useSearchParams()
  const nav = useNavigate()
  const all = useDB((d) => d.products)
  const categories = useDB((d) => d.categories)
  const q = (sp.get('q') ?? '').trim()
  const group = sp.get('group')
  const sort = sp.get('sort') ?? (mode === 'new' ? 'newest' : 'featured')
  const [f, setF] = useState<Filters>(EMPTY)
  const [shown, setShown] = useState(PAGE)
  const [drawer, setDrawer] = useState(false)

  const base = useMemo(() => {
    let list = all.filter((p) => p.active)
    if (mode === 'new') list = list.filter((p) => p.isNew)
    if (fixedCategory) list = list.filter((p) => p.category === fixedCategory)
    if (productIds) list = list.filter((p) => productIds.includes(p.id))
    if (group) { const ids = categories.filter((c) => c.group === group).map((c) => c.id); list = list.filter((p) => ids.includes(p.category)) }
    if (q) { const t = q.toLowerCase(); list = list.filter((p) => [p.name, p.description, p.kind, categories.find((c) => c.id === p.category)?.name ?? ''].join(' ').toLowerCase().includes(t)) }
    return list
  }, [all, mode, fixedCategory, productIds, group, q, categories])

  const result = useMemo(() => {
    let list = base.filter((p) => {
      if (f.cats.length && !f.cats.includes(p.category)) return false
      if (f.sizes.length && !p.sizes.some((s) => f.sizes.includes(s))) return false
      if (f.colours.length && !p.colours.some((c) => f.colours.includes(c.name))) return false
      if (f.min && p.price < Number(f.min)) return false
      if (f.max && p.price > Number(f.max)) return false
      if (f.inStock && totalStock(p) === 0) return false
      return true
    })
    const by = { featured: (a: Product, b: Product) => Number(b.featured) - Number(a.featured) || Number(b.bestSeller) - Number(a.bestSeller), newest: (a: Product, b: Product) => +new Date(b.createdAt) - +new Date(a.createdAt), low: (a: Product, b: Product) => a.price - b.price, high: (a: Product, b: Product) => b.price - a.price }[sort] ?? (() => 0)
    list = [...list].sort(by)
    return list
  }, [base, f, sort])

  const activeCount = f.cats.length + f.sizes.length + f.colours.length + (f.min || f.max ? 1 : 0) + (f.inStock ? 1 : 0)
  const setParam = (k: string, v: string | null) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); setShown(PAGE) }
  const update = (nf: Filters) => { setF(nf); setShown(PAGE) }

  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={crumbs ?? [{ label: 'Home', to: '/' }, { label: title }]} />
      <div className="mt-5 mb-8 md:mb-10 max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-4xl md:text-5xl">{q ? `Results for “${q}”` : title}</h1>
        {intro && !q && <p className="mt-3 text-charcoal/70">{intro}</p>}
      </div>

      <div className="flex items-center gap-3 pb-4 border-b border-mist sticky top-16 md:top-[72px] z-30 bg-ivory/95 backdrop-blur -mx-4 px-4 sm:mx-0 sm:px-0 py-3">
        <button className="lg:hidden btn btn-outline btn-sm" onClick={() => setDrawer(true)}><Filter size={15} /> Filters{activeCount ? ` (${activeCount})` : ''}</button>
        <form role="search" className="relative flex-1 max-w-sm" onSubmit={(e) => e.preventDefault()}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/45" aria-hidden />
          <input aria-label="Search products" value={q} onChange={(e) => setParam('q', e.target.value || null)} placeholder="Search products" className="field !h-10 !pl-9" />
        </form>
        <p className="hidden md:block text-sm text-charcoal/60 ml-auto" aria-live="polite">{result.length} {result.length === 1 ? 'product' : 'products'}</p>
        <label className="ml-auto md:ml-0 flex items-center gap-2 text-sm">
          <span className="sr-only md:not-sr-only text-charcoal/60">Sort</span>
          <select value={sort} onChange={(e) => setParam('sort', e.target.value)} className="h-10 border border-mist bg-white px-3 text-sm rounded-sm">
            {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-10 mt-6">
        <aside className="hidden lg:block" aria-label="Filters"><FilterPanel f={f} setF={update} base={base} hideCats={!!fixedCategory} /></aside>
        <div>
          {(activeCount > 0 || group) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {group && <button onClick={() => setParam('group', null)} className="chip">{group} <X size={12} /></button>}
              {f.cats.map((c) => <button key={c} onClick={() => update({ ...f, cats: f.cats.filter((x) => x !== c) })} className="chip">{categories.find((x) => x.id === c)?.name} <X size={12} /></button>)}
              {f.sizes.map((c) => <button key={c} onClick={() => update({ ...f, sizes: f.sizes.filter((x) => x !== c) })} className="chip">Size {c} <X size={12} /></button>)}
              {f.colours.map((c) => <button key={c} onClick={() => update({ ...f, colours: f.colours.filter((x) => x !== c) })} className="chip">{c} <X size={12} /></button>)}
              {(f.min || f.max) && <button onClick={() => update({ ...f, min: '', max: '' })} className="chip">{f.min ? inr(Number(f.min)) : '₹0'} – {f.max ? inr(Number(f.max)) : 'any'} <X size={12} /></button>}
              {f.inStock && <button onClick={() => update({ ...f, inStock: false })} className="chip">In stock <X size={12} /></button>}
            </div>
          )}
          {result.length === 0 ? (
            <EmptyState
              title={q ? `No results for “${q}”` : 'No products match your filters'}
              text={q ? 'Check the spelling or try a broader term. You can also ask the store about availability on WhatsApp.' : 'Try removing a filter or two to see more styles.'}
              action={<div className="flex gap-3 justify-center flex-wrap"><button className="btn btn-primary" onClick={() => { update(EMPTY); setSp({}, { replace: true }) }}>Clear search &amp; filters</button><button className="btn btn-outline" onClick={() => nav('/contact')}>Ask the store</button></div>}
            />
          ) : (
            <>
              <ProductGrid products={result.slice(0, shown)} cols={3} />
              <div className="mt-12 text-center">
                <p className="text-sm text-charcoal/60 mb-4">Showing {Math.min(shown, result.length)} of {result.length}</p>
                {shown < result.length && <button className="btn btn-outline" onClick={() => setShown((n) => n + PAGE)}>Load more</button>}
              </div>
            </>
          )}
        </div>
      </div>

      <Overlay open={drawer} onClose={() => setDrawer(false)} title="Filters" side="left">
        <div className="p-6 pt-14 pb-28">
          <h2 className="text-2xl mb-2">Filters</h2>
          <FilterPanel f={f} setF={update} base={base} hideCats={!!fixedCategory} />
        </div>
        <div className="fixed bottom-0 left-0 w-[88vw] max-w-sm p-4 bg-ivory border-t border-mist">
          <button className="btn btn-primary w-full" onClick={() => setDrawer(false)}>Show {result.length} products</button>
        </div>
      </Overlay>
      <style>{`.chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;background:#E6F2F7;color:#243B53;font-size:12px;border-radius:2px;text-transform:capitalize}.chip:hover{background:#D3E8F0}`}</style>
    </div>
  )
}

export function ShopPage() {
  usePageMeta('Shop All', 'Browse all clothing, footwear and accessories from Blues Apparel 23.')
  return <Catalog mode="shop" title="Shop All" eyebrow="The catalogue" intro="Clothing, footwear and accessories — sample products for demonstration." />
}

export function NewArrivalsPage() {
  usePageMeta('New Arrivals', 'The latest styles at Blues Apparel 23.')
  return <Catalog mode="new" title="New Arrivals" eyebrow="Just in" intro="The newest additions to the Blues Apparel 23 demo catalogue." />
}

export function CollectionsIndex() {
  usePageMeta('Collections', 'Curated collections and categories from Blues Apparel 23.')
  const collections = useDB((d) => d.collections.filter((c) => c.active))
  const cats = useDB((d) => d.categories.filter((c) => c.enabled))
  const products = useDB((d) => d.products)
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Collections' }]} />
      <h1 className="text-4xl md:text-5xl mt-5 mb-3">Collections</h1>
      <p className="text-charcoal/70 max-w-xl mb-10">Edited groups of styles for different moments, plus every category in the store.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {collections.map((c, i) => {
          const items = c.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 3) as Product[]
          return (
            <Reveal key={c.id} delay={i * 0.05}>
              <Link to={`/collections/${c.id}`} className="group block bg-white shadow-soft hover:shadow-lift transition">
                <div className="grid grid-cols-3 gap-px bg-mist">
                  {items.map((p) => <div key={p.id} className="aspect-[3/4] overflow-hidden bg-mist"><ProductImage product={p} src="art:0" className="w-full h-full transition duration-700 group-hover:scale-105" /></div>)}
                </div>
                <div className="p-6 flex items-end justify-between gap-4">
                  <div><h2 className="text-2xl">{c.name}</h2><p className="text-sm text-charcoal/65 mt-1">{c.blurb}</p></div>
                  <ArrowRight className="text-navy shrink-0 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>
      <h2 className="text-3xl mt-16 mb-6">Shop by category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cats.map((c) => (
          <Link key={c.id} to={`/collections/${c.id}`} className="group relative aspect-[4/3] overflow-hidden bg-mist block">
            <ArtImage kind={c.kind} colour="#B8DCE8" tone={1} className="absolute inset-0 w-full h-full group-hover:scale-105 transition duration-700" label={c.name} />
            <span className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-navy/75 to-transparent text-white font-display text-lg">{c.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function CollectionPage() {
  const { category = '' } = useParams()
  const cat = useDB((d) => d.categories.find((c) => c.id === category))
  const col = useDB((d) => d.collections.find((c) => c.id === category))
  usePageMeta(cat?.name ?? col?.name ?? 'Collection', cat?.blurb ?? col?.blurb)
  if (cat) return <Catalog key={cat.id} mode="category" fixedCategory={cat.id} title={cat.name} eyebrow="Category" intro={cat.blurb} crumbs={[{ label: 'Home', to: '/' }, { label: 'Collections', to: '/collections' }, { label: cat.name }]} />
  if (col) return <Catalog key={col.id} mode="collection" productIds={col.productIds} title={col.name} eyebrow="Collection" intro={col.blurb} crumbs={[{ label: 'Home', to: '/' }, { label: 'Collections', to: '/collections' }, { label: col.name }]} />
  return (
    <div className="container-x py-16"><EmptyState title="Collection not found" text="This collection or category is not available." action={<Link to="/collections" className="btn btn-primary">All collections</Link>} /></div>
  )
}
