import { useState } from 'react'
import { Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useDB } from '../../store'
import { Field } from '../../components/ui'
import { PageHead, Panel } from './AdminLayout'
import { admin } from '../../services'
import { toast } from '../../store/ui'
import { cx, uid } from '../../lib/utils'
import type { Settings } from '../../types'

type Tab = 'store' | 'banner' | 'featured' | 'collections' | 'offers' | 'policies' | 'services' | 'demo'
const TABS: [Tab, string][] = [['store', 'Store info'], ['banner', 'Homepage banner'], ['featured', 'Featured products'], ['collections', 'Collections'], ['offers', 'Offers & coupons'], ['policies', 'Policies'], ['services', 'Customer services'], ['demo', 'Demo data']]

function Store() {
  const s = useDB((d) => d.settings)
  const [f, setF] = useState<Settings>(s)
  const save = () => {
    if (!f.storeName.trim() || !f.phone.trim()) { toast('Store name and phone are required', { tone: 'err' }); return }
    if (f.mapVerified && !/^https?:\/\//.test(f.mapUrl)) { toast('Enter the verified map link (https://…) before enabling directions', { tone: 'err' }); return }
    admin.update((d) => ({ ...d, settings: f })); toast('Store information saved')
  }
  const k = (key: keyof Settings) => ({ value: String(f[key] ?? ''), onChange: (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [key]: e.target.value }) })
  return (
    <Panel title="Store information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <Field label="Store name"><input className="field" {...k('storeName')} /></Field>
        <Field label="Opening hours"><input className="field" {...k('hours')} /></Field>
        <Field label="Phone"><input className="field" {...k('phone')} /></Field>
        <Field label="WhatsApp"><input className="field" {...k('whatsapp')} /></Field>
        <div className="md:col-span-2"><Field label="Store address"><input className="field" {...k('address')} /></Field></div>
        <Field label="Instagram URL"><input className="field" {...k('instagram')} /></Field>
        <Field label="Delivery charge placeholder (₹)"><input inputMode="numeric" className="field" value={String(f.deliveryCharge)} onChange={(e) => setF({ ...f, deliveryCharge: Number(e.target.value.replace(/\D/g, '')) })} /></Field>
        <Field label="Low-stock threshold (units)"><input inputMode="numeric" className="field" value={String(f.lowStockThreshold)} onChange={(e) => setF({ ...f, lowStockThreshold: Number(e.target.value.replace(/\D/g, '')) })} /></Field>
        <div className="md:col-span-2 border-t border-mist pt-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-[#243B53]" checked={f.mapVerified} onChange={(e) => setF({ ...f, mapVerified: e.target.checked })} /> Map location verified — enable “Get Directions”</label>
          <div className="mt-3"><Field label="Verified Google Maps link"><input className="field" placeholder="https://maps.google.com/…" {...k('mapUrl')} /></Field></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-[#243B53]" checked={f.codEnabled} onChange={(e) => setF({ ...f, codEnabled: e.target.checked })} /> Cash on Delivery confirmed (not yet used at checkout)</label>
      </div>
      <button className="btn btn-primary mt-6" onClick={save}>Save store information</button>
    </Panel>
  )
}

function Banner() {
  const b = useDB((d) => d.banners[0])
  const [f, setF] = useState(b)
  return (
    <Panel title="Homepage hero banner">
      <div className="grid gap-4 max-w-2xl">
        <Field label="Small heading"><input className="field" value={f.eyebrow} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} /></Field>
        <Field label="Headline"><input className="field" value={f.headline} onChange={(e) => setF({ ...f, headline: e.target.value })} /></Field>
        <Field label="Sub-headline"><textarea rows={2} className="field !h-auto py-3" value={f.sub} onChange={(e) => setF({ ...f, sub: e.target.value })} /></Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Field label="Button label"><input className="field" value={f.cta} onChange={(e) => setF({ ...f, cta: e.target.value })} /></Field><Field label="Button link"><input className="field" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} /></Field></div>
        <button className="btn btn-primary w-fit" onClick={() => { if (f.headline.trim().length < 3) { toast('Headline is required', { tone: 'err' }); return } admin.update((d) => ({ ...d, banners: [f, ...d.banners.slice(1)] })); toast('Banner updated — see the homepage') }}>Save banner</button>
      </div>
    </Panel>
  )
}

function Featured() {
  const products = useDB((d) => d.products)
  const flags = [['featured', 'Featured'], ['bestSeller', 'Best seller'], ['trending', 'Trending'], ['isNew', 'New arrival']] as const
  return (
    <Panel title="Featured products & merchandising flags">
      <div className="overflow-x-auto -mx-5"><table className="w-full min-w-[560px] text-sm">
        <thead><tr><th className="text-left py-2 px-5 text-[11px] uppercase tracking-wider text-charcoal/50">Product</th>{flags.map(([, l]) => <th key={l} className="text-[11px] uppercase tracking-wider text-charcoal/50 px-2">{l}</th>)}</tr></thead>
        <tbody>{products.map((p) => <tr key={p.id} className="border-t border-mist"><td className="py-2.5 px-5">{p.name}</td>{flags.map(([k, l]) => <td key={k} className="text-center"><input type="checkbox" aria-label={`${l}: ${p.name}`} className="w-4 h-4 accent-[#243B53]" checked={p[k]} onChange={(e) => admin.patchProduct(p.id, { [k]: e.target.checked })} /></td>)}</tr>)}</tbody></table></div>
    </Panel>
  )
}

function Collections() {
  const cols = useDB((d) => d.collections)
  const products = useDB((d) => d.products)
  const [name, setName] = useState('')
  const patch = (id: string, v: object) => admin.update((d) => ({ ...d, collections: d.collections.map((c) => (c.id === id ? { ...c, ...v } : c)) }))
  return (
    <div className="space-y-5">
      {cols.map((c) => (
        <Panel key={c.id} title={c.name} action={<div className="flex items-center gap-3"><label className="text-xs flex items-center gap-1.5"><input type="checkbox" className="accent-[#243B53]" checked={c.active} onChange={(e) => patch(c.id, { active: e.target.checked })} /> Active</label><button aria-label={`Delete ${c.name}`} className="text-charcoal/50 hover:text-red-600" onClick={() => { admin.update((d) => ({ ...d, collections: d.collections.filter((x) => x.id !== c.id) })); toast('Collection deleted') }}><Trash2 size={16} /></button></div>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><Field label="Name"><input className="field" value={c.name} onChange={(e) => patch(c.id, { name: e.target.value })} /></Field><Field label="Description"><input className="field" value={c.blurb} onChange={(e) => patch(c.id, { blurb: e.target.value })} /></Field></div>
          <p className="label">Products in this collection</p>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">{products.map((p) => { const on = c.productIds.includes(p.id); return <button key={p.id} aria-pressed={on} className={cx('text-xs px-3 h-8 border transition', on ? 'bg-navy text-ivory border-navy' : 'bg-white border-mist hover:border-navy')} onClick={() => patch(c.id, { productIds: on ? c.productIds.filter((x) => x !== p.id) : [...c.productIds, p.id] })}>{p.name}</button> })}</div>
        </Panel>
      ))}
      <Panel title="New collection"><div className="flex gap-2"><input className="field !h-10 max-w-xs" placeholder="Collection name" value={name} onChange={(e) => setName(e.target.value)} /><button className="btn btn-outline btn-sm" onClick={() => { const n = name.trim(); if (!n) { toast('Enter a name', { tone: 'err' }); return } admin.update((d) => ({ ...d, collections: [...d.collections, { id: n.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: n, blurb: '', productIds: [], active: true, tone: 0 }] })); setName('') }}><Plus size={15} /> Create</button></div></Panel>
    </div>
  )
}

function Offers() {
  const offers = useDB((d) => d.offers)
  const coupons = useDB((d) => d.coupons)
  const [text, setText] = useState('')
  const [c, setC] = useState({ code: '', type: 'percent' as 'percent' | 'flat', value: '10', minOrder: '0' })
  return (
    <div className="space-y-5">
      <Panel title="Announcement bar messages">
        <ul className="divide-y divide-mist mb-4">{offers.map((o) => <li key={o.id} className="py-2.5 flex items-center gap-3 text-sm"><input aria-label="Message" className="field !h-10 flex-1" value={o.text} onChange={(e) => admin.update((d) => ({ ...d, offers: d.offers.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) }))} /><label className="text-xs flex items-center gap-1.5"><input type="checkbox" className="accent-[#243B53]" checked={o.active} onChange={(e) => admin.update((d) => ({ ...d, offers: d.offers.map((x) => (x.id === o.id ? { ...x, active: e.target.checked } : x)) }))} /> Show</label><button aria-label="Delete message" className="text-charcoal/50 hover:text-red-600" onClick={() => admin.update((d) => ({ ...d, offers: d.offers.filter((x) => x.id !== o.id) }))}><Trash2 size={16} /></button></li>)}</ul>
        <div className="flex gap-2"><input className="field !h-10 max-w-md" placeholder="New promotional message" value={text} onChange={(e) => setText(e.target.value)} /><button className="btn btn-outline btn-sm" onClick={() => { if (!text.trim()) return; admin.update((d) => ({ ...d, offers: [...d.offers, { id: uid('o'), text: text.trim(), active: true }] })); setText('') }}><Plus size={15} /> Add</button></div>
      </Panel>
      <Panel title="Coupon codes">
        <ul className="divide-y divide-mist mb-4 text-sm">{coupons.map((x) => <li key={x.code} className="py-2.5 flex flex-wrap items-center gap-3"><strong className="text-navy w-28">{x.code}</strong><span className="flex-1 text-charcoal/65">{x.type === 'percent' ? `${x.value}% off` : `₹${x.value} off`}{x.minOrder ? ` · min ₹${x.minOrder}` : ''}</span><label className="text-xs flex items-center gap-1.5"><input type="checkbox" className="accent-[#243B53]" checked={x.active} onChange={(e) => admin.update((d) => ({ ...d, coupons: d.coupons.map((y) => (y.code === x.code ? { ...y, active: e.target.checked } : y)) }))} /> Active</label><button aria-label={`Delete ${x.code}`} className="text-charcoal/50 hover:text-red-600" onClick={() => admin.update((d) => ({ ...d, coupons: d.coupons.filter((y) => y.code !== x.code) }))}><Trash2 size={16} /></button></li>)}</ul>
        <div className="flex flex-wrap gap-2 items-end">
          <Field label="Code"><input className="field !h-10 w-36" value={c.code} onChange={(e) => setC({ ...c, code: e.target.value.toUpperCase() })} /></Field>
          <Field label="Type"><select className="field !h-10 w-32" value={c.type} onChange={(e) => setC({ ...c, type: e.target.value as 'percent' | 'flat' })}><option value="percent">Percent</option><option value="flat">Flat ₹</option></select></Field>
          <Field label="Value"><input className="field !h-10 w-24" inputMode="numeric" value={c.value} onChange={(e) => setC({ ...c, value: e.target.value.replace(/\D/g, '') })} /></Field>
          <Field label="Min order ₹"><input className="field !h-10 w-28" inputMode="numeric" value={c.minOrder} onChange={(e) => setC({ ...c, minOrder: e.target.value.replace(/\D/g, '') })} /></Field>
          <button className="btn btn-outline btn-sm" onClick={() => { const v = Number(c.value); if (c.code.length < 3 || !v || (c.type === 'percent' && v > 90)) { toast('Enter a valid code and value', { tone: 'err' }); return } if (coupons.some((x) => x.code === c.code)) { toast('Code already exists', { tone: 'err' }); return } admin.update((d) => ({ ...d, coupons: [...d.coupons, { code: c.code, type: c.type, value: v, minOrder: Number(c.minOrder), active: true, note: 'Demo coupon' }] })); setC({ ...c, code: '' }); toast('Coupon added') }}><Plus size={15} /> Add coupon</button>
        </div>
      </Panel>
    </div>
  )
}

function Policies() {
  const policies = useDB((d) => d.policies)
  return (
    <div className="space-y-5">
      {policies.map((p) => (
        <Panel key={p.slug} title={p.title}>
          <label className="label" htmlFor={p.slug}>Content (one paragraph per line)</label>
          <textarea id={p.slug} rows={6} className="field !h-auto py-3 text-sm" value={p.body.join('\n')} onChange={(e) => admin.update((d) => ({ ...d, policies: d.policies.map((x) => (x.slug === p.slug ? { ...x, body: e.target.value.split('\n') } : x)) }))} onBlur={() => admin.update((d) => ({ ...d, policies: d.policies.map((x) => (x.slug === p.slug ? { ...x, body: x.body.filter((l) => l.trim()) } : x)) }))} />
          <p className="text-xs text-charcoal/50 mt-2">Public page: /{p.slug}</p>
        </Panel>
      ))}
    </div>
  )
}

function Services() {
  const services = useDB((d) => d.settings.services)
  return (
    <Panel title="Customer services — switch on or off">
      <ul className="divide-y divide-mist">{services.map((s) => <li key={s.id} className="py-3 flex items-start gap-4"><div className="flex-1"><p className="font-medium text-sm text-navy">{s.title}</p><p className="text-xs text-charcoal/60 mt-0.5">{s.desc}</p></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-[#243B53]" checked={s.enabled} onChange={(e) => admin.update((d) => ({ ...d, settings: { ...d.settings, services: d.settings.services.map((x) => (x.id === s.id ? { ...x, enabled: e.target.checked } : x)) } }))} /> {s.enabled ? 'On' : 'Off'}</label></li>)}</ul>
    </Panel>
  )
}

function Demo() {
  return (
    <Panel title="Demo data">
      <p className="text-sm text-charcoal/70 max-w-xl mb-4">All data in this demo lives in your browser. Reset to restore the original products, orders, customers and settings, and clear your cart, wishlist and login.</p>
      <button className="btn btn-outline" onClick={() => { if (window.confirm('Reset all demo data? This cannot be undone.')) { admin.resetDemo(); toast('Demo data reset') } }}><RotateCcw size={16} /> Reset demo data</button>
    </Panel>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('store')
  return (
    <>
      <PageHead title="Website management" sub="Changes appear on the storefront immediately." />
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1" role="tablist">{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cx('h-10 px-4 text-sm border whitespace-nowrap transition', tab === k ? 'bg-navy text-ivory border-navy' : 'bg-white border-mist hover:border-navy')}>{l}</button>)}</div>
      {tab === 'store' && <Store />}{tab === 'banner' && <Banner />}{tab === 'featured' && <Featured />}{tab === 'collections' && <Collections />}{tab === 'offers' && <Offers />}{tab === 'policies' && <Policies />}{tab === 'services' && <Services />}{tab === 'demo' && <Demo />}
    </>
  )
}
