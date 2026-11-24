import { useState } from 'react'
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useDB } from '../../store'
import { Overlay, Field } from '../../components/ui'
import { ProductImage } from '../../components/art/Art'
import { Badge, PageHead, Panel, td, th } from './AdminLayout'
import { admin } from '../../services'
import { toast } from '../../store/ui'
import type { Category, Colour, Kind, Product } from '../../types'
import { cx, discountPct, downscaleImage, inr, totalStock, uid } from '../../lib/utils'

const SIZE_PRESETS = { Clothing: ['XS', 'S', 'M', 'L', 'XL'], Waist: ['28', '30', '32', '34', '36'], Shoes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'], 'One size': ['One Size'] }
const KINDS: Kind[] = ['tee', 'shirt', 'dress', 'trousers', 'coord', 'jacket', 'sneaker', 'slide', 'tote', 'sling', 'handbag']
const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function blank(cat: Category | undefined): Product {
  return {
    id: uid('p'), slug: '', name: '', category: cat?.id ?? 'tops', kind: cat?.kind ?? 'tee', price: 0, colours: [{ name: 'Navy', hex: '#243B53' }], sizes: ['S', 'M', 'L'],
    stock: {}, description: '', fabric: '', care: ['Machine wash cold'], images: ['art:0', 'art:1', 'art:2'], isNew: true, bestSeller: false, trending: false, featured: false,
    soldOut: false, createdAt: new Date().toISOString(), active: true,
  }
}

function Editor({ initial, isNew, onClose }: { initial: Product; isNew: boolean; onClose: () => void }) {
  const categories = useDB((d) => d.categories)
  const all = useDB((d) => d.products)
  const [p, setP] = useState<Product>(initial)
  const [mrp, setMrp] = useState(initial.mrp ? String(initial.mrp) : '')
  const [price, setPrice] = useState(initial.price ? String(initial.price) : '')
  const [defStock, setDefStock] = useState('5')
  const [sizeText, setSizeText] = useState(initial.sizes.join(', '))
  const [col, setCol] = useState({ name: '', hex: '#B8DCE8' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }))

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const f of Array.from(files).slice(0, 6)) {
        if (!f.type.startsWith('image/')) { toast(`${f.name} is not an image`, { tone: 'err' }); continue }
        urls.push(await downscaleImage(f))
      }
      const keep = p.images.filter((i) => !i.startsWith('art:'))
      set('images', [...keep, ...urls])
    } catch { toast('Could not read that image', { tone: 'err' }) }
    setUploading(false)
  }

  const save = () => {
    const e: Record<string, string> = {}
    const sizes = Array.from(new Set(sizeText.split(',').map((s) => s.trim()).filter(Boolean)))
    const pr = Number(price), mr = mrp ? Number(mrp) : undefined
    if (p.name.trim().length < 3) e.name = 'Enter a product name'
    if (!pr || pr <= 0) e.price = 'Enter a selling price'
    if (mr !== undefined && (Number.isNaN(mr) || mr <= pr)) e.mrp = 'Original price must be higher than the selling price'
    if (!sizes.length) e.sizes = 'Add at least one size'
    if (!p.colours.length) e.colours = 'Add at least one colour'
    setErrs(e)
    if (Object.keys(e).length) { toast('Please fix the highlighted fields', { tone: 'err' }); return }
    const stock: Record<string, number> = {}
    sizes.forEach((s) => p.colours.forEach((c) => { const k = `${s}|${c.name}`; stock[k] = p.stock[k] ?? Number(defStock || 0) }))
    let slug = p.slug || slugify(p.name)
    if (all.some((x) => x.slug === slug && x.id !== p.id)) slug = `${slug}-${Math.floor(Math.random() * 900 + 100)}`
    const images = p.images.length ? p.images : ['art:0', 'art:1', 'art:2']
    admin.saveProduct({ ...p, name: p.name.trim(), slug, price: pr, mrp: mr, sizes, stock, images })
    toast(isNew ? 'Product added' : 'Product updated')
    onClose()
  }

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl mb-6 pr-10">{isNew ? 'Add product' : 'Edit product'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="md:col-span-2"><Field label="Product name" error={errs.name}><input className={cx('field', errs.name && 'field-err')} value={p.name} onChange={(e) => set('name', e.target.value)} /></Field></div>
        <Field label="Category"><select className="field" value={p.category} onChange={(e) => { const c = categories.find((x) => x.id === e.target.value); setP({ ...p, category: e.target.value, kind: c?.kind ?? p.kind }) }}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Placeholder artwork style"><select className="field" value={p.kind} onChange={(e) => set('kind', e.target.value as Kind)}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></Field>
        <Field label="Selling price (₹)" error={errs.price}><input inputMode="numeric" className={cx('field', errs.price && 'field-err')} value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} /></Field>
        <Field label="Original price / MRP (₹) — optional, shows a discount" error={errs.mrp}><input inputMode="numeric" className={cx('field', errs.mrp && 'field-err')} value={mrp} onChange={(e) => setMrp(e.target.value.replace(/\D/g, ''))} /></Field>
        <div className="md:col-span-2"><Field label="Description (editable demo copy)"><textarea rows={3} className="field !h-auto py-3" value={p.description} onChange={(e) => set('description', e.target.value)} /></Field></div>
        <Field label="Fabric & material"><input className="field" value={p.fabric} onChange={(e) => set('fabric', e.target.value)} /></Field>
        <Field label="Care instructions (one per line)"><textarea rows={2} className="field !h-auto py-2" value={p.care.join('\n')} onChange={(e) => set('care', e.target.value.split('\n').filter(Boolean))} /></Field>

        <div className="md:col-span-2">
          <Field label="Sizes (comma separated)" error={errs.sizes}><input className={cx('field', errs.sizes && 'field-err')} value={sizeText} onChange={(e) => setSizeText(e.target.value)} /></Field>
          <div className="flex flex-wrap gap-2 mt-2">{Object.entries(SIZE_PRESETS).map(([k, v]) => <button key={k} type="button" className="text-xs px-3 h-8 border border-mist bg-white hover:border-navy" onClick={() => setSizeText(v.join(', '))}>{k}</button>)}</div>
        </div>

        <div className="md:col-span-2">
          <label className="label">Colours</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {p.colours.map((c) => <span key={c.name} className="inline-flex items-center gap-2 pl-2 pr-1 h-9 border border-mist bg-white text-sm"><span className="w-4 h-4 rounded-full border border-black/15" style={{ background: c.hex }} />{c.name}<button type="button" aria-label={`Remove ${c.name}`} className="w-7 h-7 grid place-items-center hover:bg-mist" onClick={() => set('colours', p.colours.filter((x) => x.name !== c.name))}><X size={13} /></button></span>)}
          </div>
          <div className="flex gap-2 items-center"><input type="color" aria-label="Pick colour" value={col.hex} onChange={(e) => setCol({ ...col, hex: e.target.value })} className="w-11 h-11 p-1 bg-white border border-mist" /><input className="field !h-11 max-w-[200px]" placeholder="Colour name" value={col.name} onChange={(e) => setCol({ ...col, name: e.target.value })} /><button type="button" className="btn btn-outline btn-sm !h-11" onClick={() => { const n = col.name.trim(); if (!n || p.colours.some((c) => c.name.toLowerCase() === n.toLowerCase())) { toast('Enter a unique colour name', { tone: 'err' }); return } set('colours', [...p.colours, { name: n, hex: col.hex } as Colour]); setCol({ name: '', hex: '#B8DCE8' }) }}><Plus size={15} /> Add</button></div>
          {errs.colours && <p className="text-xs text-red-600 mt-1">{errs.colours}</p>}
        </div>

        <Field label="Stock for each new size/colour combination"><input inputMode="numeric" className="field" value={defStock} onChange={(e) => setDefStock(e.target.value.replace(/\D/g, ''))} /></Field>
        <div className="flex items-end"><p className="text-xs text-charcoal/55 pb-3">Fine-tune each size and colour in Inventory.</p></div>

        <div className="md:col-span-2">
          <label className="label">Images</label>
          <div className="flex flex-wrap gap-3">
            {p.images.filter((i) => !i.startsWith('art:')).map((im, n) => (
              <div key={n} className="relative w-20 h-24 bg-mist"><img src={im} alt="" className="w-full h-full object-cover" /><button type="button" aria-label="Remove image" className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-navy text-white grid place-items-center" onClick={() => set('images', p.images.filter((x) => x !== im))}><X size={12} /></button></div>
            ))}
            {p.images.every((i) => i.startsWith('art:')) && <div className="w-20 h-24 bg-mist"><ProductImage product={p} className="w-full h-full" /></div>}
            <label className="w-20 h-24 border border-dashed border-navy/40 grid place-items-center text-navy cursor-pointer hover:bg-pastel-100 text-xs text-center p-1"><input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} /><span className="flex flex-col items-center gap-1"><ImagePlus size={18} />{uploading ? 'Reading…' : 'Upload'}</span></label>
          </div>
          <p className="text-xs text-charcoal/50 mt-2">Demo: images are resized and kept in this browser. Production would upload to cloud storage. Without uploads, placeholder artwork is shown.</p>
        </div>

        <fieldset className="md:col-span-2 flex flex-wrap gap-x-6 gap-y-2 text-sm pt-2">
          {([['isNew', 'New arrival'], ['bestSeller', 'Best seller'], ['trending', 'Trending'], ['featured', 'Featured'], ['soldOut', 'Mark as sold out'], ['active', 'Visible on website']] as const).map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-[#243B53]" checked={p[k]} onChange={(e) => set(k, e.target.checked)} />{l}</label>
          ))}
        </fieldset>
      </div>
      <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-mist"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>{isNew ? 'Add product' : 'Save changes'}</button></div>
    </div>
  )
}

function Categories() {
  const cats = useDB((d) => d.categories)
  const products = useDB((d) => d.products)
  const [name, setName] = useState('')
  const add = () => {
    const n = name.trim()
    if (n.length < 2) { toast('Enter a category name', { tone: 'err' }); return }
    const id = slugify(n)
    if (cats.some((c) => c.id === id)) { toast('That category exists', { tone: 'err' }); return }
    admin.update((d) => ({ ...d, categories: [...d.categories, { id, name: n, group: 'clothing', kind: 'tee', blurb: '', enabled: true }] }))
    setName(''); toast('Category added')
  }
  const patch = (id: string, v: Partial<Category>) => admin.update((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, ...v } : c)) }))
  return (
    <Panel title="Categories" className="mb-6">
      <ul className="divide-y divide-mist">
        {cats.map((c) => {
          const n = products.filter((p) => p.category === c.id).length
          return (
            <li key={c.id} className="py-2.5 flex flex-wrap items-center gap-3 text-sm">
              <input aria-label={`Rename ${c.name}`} className="field !h-9 max-w-[230px]" value={c.name} onChange={(e) => patch(c.id, { name: e.target.value })} />
              <select aria-label="Group" className="h-9 border border-mist px-2 text-sm bg-white" value={c.group} onChange={(e) => patch(c.id, { group: e.target.value as Category['group'] })}><option value="clothing">Clothing</option><option value="footwear">Footwear</option><option value="accessories">Accessories</option></select>
              <span className="text-xs text-charcoal/55">{n} product{n === 1 ? '' : 's'}</span>
              <label className="flex items-center gap-1.5 ml-auto text-xs"><input type="checkbox" className="accent-[#243B53]" checked={c.enabled} onChange={(e) => patch(c.id, { enabled: e.target.checked })} /> Enabled</label>
              <button aria-label={`Delete ${c.name}`} disabled={n > 0} title={n ? 'Move or delete its products first' : 'Delete'} className="text-charcoal/50 hover:text-red-600 disabled:opacity-30" onClick={() => { admin.update((d) => ({ ...d, categories: d.categories.filter((x) => x.id !== c.id) })); toast('Category deleted') }}><Trash2 size={16} /></button>
            </li>
          )
        })}
      </ul>
      <div className="flex gap-2 mt-4"><input className="field !h-10 max-w-xs" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} /><button className="btn btn-outline btn-sm" onClick={add}><Plus size={15} /> Add category</button></div>
    </Panel>
  )
}

function Discounts({ onClose }: { onClose: () => void }) {
  const cats = useDB((d) => d.categories)
  const [cat, setCat] = useState('all')
  const [pct, setPct] = useState('10')
  const apply = (clear: boolean) => {
    const n = Number(pct)
    if (!clear && (!n || n < 1 || n > 90)) { toast('Enter a discount between 1 and 90', { tone: 'err' }); return }
    admin.update((d) => ({
      ...d, products: d.products.map((p) => {
        if (cat !== 'all' && p.category !== cat) return p
        if (clear) return p.mrp ? { ...p, price: p.mrp, mrp: undefined } : p
        const base = p.mrp ?? p.price
        return { ...p, mrp: base, price: Math.round(base * (1 - n / 100)) }
      }),
    }))
    toast(clear ? 'Discounts cleared' : `${n}% discount applied`)
    onClose()
  }
  return (
    <div className="p-7"><h2 className="text-2xl mb-5 pr-8">Manage discounts</h2>
      <div className="space-y-4"><Field label="Apply to"><select className="field" value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All products</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Discount (%) off the original price"><input className="field" inputMode="numeric" value={pct} onChange={(e) => setPct(e.target.value.replace(/\D/g, ''))} /></Field></div>
      <div className="flex gap-3 mt-6"><button className="btn btn-primary" onClick={() => apply(false)}>Apply discount</button><button className="btn btn-outline" onClick={() => apply(true)}>Clear discounts</button></div>
    </div>
  )
}

export default function Products() {
  const products = useDB((d) => d.products)
  const cats = useDB((d) => d.categories)
  const [edit, setEdit] = useState<{ p: Product; isNew: boolean } | null>(null)
  const [disc, setDisc] = useState(false)
  const [q, setQ] = useState('')
  const [del, setDel] = useState<Product | null>(null)
  const list = products.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <PageHead title="Products" sub={`${products.length} products`} action={<div className="flex gap-2"><button className="btn btn-outline btn-sm" onClick={() => setDisc(true)}>Manage discounts</button><button className="btn btn-primary btn-sm" onClick={() => setEdit({ p: blank(cats[0]), isNew: true })}><Plus size={15} /> Add product</button></div>} />
      <Categories />
      <Panel>
        <input className="field !h-10 max-w-xs mb-4" placeholder="Search products" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full min-w-[760px]">
            <thead><tr><th className={th}>Product</th><th className={th}>Category</th><th className={th}>Price</th><th className={th}>Stock</th><th className={th}>Status</th><th className={th}><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-t border-mist hover:bg-ivory/60">
                  <td className={td}><div className="flex items-center gap-3"><div className="w-10 h-12 bg-mist shrink-0"><ProductImage product={p} className="w-full h-full" /></div><span className="font-medium">{p.name}</span></div></td>
                  <td className={td}>{cats.find((c) => c.id === p.category)?.name}</td>
                  <td className={td}>{inr(p.price)} {p.mrp && <span className="text-xs text-emerald-700 ml-1">−{discountPct(p)}%</span>}</td>
                  <td className={td}>{totalStock(p)}</td>
                  <td className={td}>{!p.active ? <Badge>Hidden</Badge> : p.soldOut || totalStock(p) === 0 ? <Badge tone="bad">Sold out</Badge> : <Badge tone="ok">Live</Badge>}</td>
                  <td className={td}>
                    <div className="flex items-center gap-1 justify-end">
                      <button className="text-xs link-u text-navy mr-2" onClick={() => { admin.patchProduct(p.id, { soldOut: !p.soldOut }); toast(p.soldOut ? 'Marked as available' : 'Marked as sold out') }}>{p.soldOut ? 'Mark available' : 'Mark sold out'}</button>
                      <button aria-label={`Edit ${p.name}`} className="w-9 h-9 grid place-items-center hover:bg-mist" onClick={() => setEdit({ p, isNew: false })}><Pencil size={16} /></button>
                      <button aria-label={`Delete ${p.name}`} className="w-9 h-9 grid place-items-center hover:bg-red-50 hover:text-red-600" onClick={() => setDel(p)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Overlay open={!!edit} onClose={() => setEdit(null)} title="Product editor" wide>{edit && <Editor key={edit.p.id} initial={edit.p} isNew={edit.isNew} onClose={() => setEdit(null)} />}</Overlay>
      <Overlay open={disc} onClose={() => setDisc(false)} title="Discounts"><Discounts onClose={() => setDisc(false)} /></Overlay>
      <Overlay open={!!del} onClose={() => setDel(null)} title="Confirm delete">
        {del && <div className="p-7"><h2 className="text-2xl mb-2 pr-8">Delete “{del.name}”?</h2><p className="text-sm text-charcoal/65 mb-6">This removes the product from the catalogue. Past orders keep their history. You can restore the original data with “Reset demo data” in Website settings.</p><div className="flex gap-3"><button className="btn bg-red-700 text-white hover:bg-red-800" onClick={() => { admin.deleteProduct(del.id); toast('Product deleted'); setDel(null) }}>Delete product</button><button className="btn btn-ghost" onClick={() => setDel(null)}>Cancel</button></div></div>}
      </Overlay>
    </>
  )
}
