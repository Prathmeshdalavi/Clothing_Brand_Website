import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Headset, MapPin, ShieldCheck, ShoppingBag, Sparkles, Store } from 'lucide-react'
import { useDB } from '../store'
import { usePageMeta } from '../hooks/usePageMeta'
import { ArtImage, ProductImage, Scene } from '../components/art/Art'
import { Reveal, SectionHeading } from '../components/ui'
import { ProductGrid } from '../components/shop/ProductCard'
import { InstagramSection, Newsletter, StoreVisit } from '../components/shop/Blocks'
import type { Look, Product } from '../types'
import { cx, inr, variantStock } from '../lib/utils'
import { cart } from '../services'
import { toast } from '../store/ui'
import { motion } from 'framer-motion'

function Hero() {
  const banner = useDB((d) => d.banners.find((b) => b.active)) ?? { eyebrow: 'New season', headline: 'Your Everyday Style, Elevated.', sub: 'Discover fashion that brings confidence, comfort and elegance to every occasion.', cta: 'Shop New Arrivals', link: '/new-arrivals' }
  return (
    <section className="relative bg-ivory overflow-hidden">
      <div className="container-x grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-0 items-center min-h-[560px] lg:min-h-[680px] py-8 lg:py-0">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="order-2 lg:order-1 lg:pr-12 pb-6 lg:pb-0">
          <p className="eyebrow mb-5">{banner.eyebrow} · Blues Apparel 23</p>
          <h1 className="text-[2.7rem] sm:text-6xl lg:text-[4.6rem] leading-[1.02] tracking-tight">{banner.headline}</h1>
          <p className="mt-6 text-[17px] text-charcoal/70 max-w-md leading-relaxed">{banner.sub}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to={banner.link} className="btn btn-primary">{banner.cta} <ArrowRight size={17} /></Link>
            <Link to="/collections" className="btn btn-outline">Explore Collections</Link>
          </div>
          <dl className="mt-12 hidden sm:grid grid-cols-3 gap-6 max-w-md text-sm">
            <div><dt className="font-display text-2xl text-navy">2023</dt><dd className="text-charcoal/60">Established</dd></div>
            <div><dt className="font-display text-2xl text-navy">30+</dt><dd className="text-charcoal/60">Demo styles</dd></div>
            <div><dt className="font-display text-2xl text-navy">9–8</dt><dd className="text-charcoal/60">Store hours</dd></div>
          </dl>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="order-1 lg:order-2 relative h-[300px] sm:h-[460px] lg:h-[620px]">
          <div className="absolute inset-0 rounded-t-[220px] lg:rounded-t-[300px] overflow-hidden shadow-lift">
            <Scene name="hero" className="w-full h-full" label="Editorial placeholder artwork" />
          </div>
          <span className="absolute bottom-3 right-3 text-[10px] tracking-widest uppercase bg-white/85 text-navy px-2 py-1">Placeholder artwork</span>
        </motion.div>
      </div>
    </section>
  )
}

function Categories() {
  const cats = useDB((d) => d.categories.filter((c) => c.enabled))
  const tones = [0, 1, 2, 3, 4, 5, 1]
  const colours = ['#F7F7F4', '#B8DCE8', '#5F7FA0', '#D6C2A3', '#6F7557', '#F7F7F4', '#243B53']
  return (
    <section className="container-x py-16 md:py-24" aria-labelledby="cat-h">
      <Reveal><SectionHeading eyebrow="Shop by category" title="Find your style" sub="Proposed demo categories — fully configurable to match actual inventory." /></Reveal>
      <h2 id="cat-h" className="sr-only">Shop by category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {cats.map((c, i) => (
          <Reveal key={c.id} delay={(i % 4) * 0.05}>
            <Link to={`/collections/${c.id}`} className="group relative block overflow-hidden bg-mist aspect-[4/5]">
              <ArtImage kind={c.kind} colour={colours[i % colours.length]} tone={tones[i % tones.length]} view={0} className="absolute inset-0 w-full h-full transition duration-700 group-hover:scale-105" label={c.name} />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-navy/75 to-transparent">
                <h3 className="font-display text-lg md:text-2xl !text-white leading-tight">{c.name}</h3>
                <span className="text-xs text-white/85 flex items-center gap-1 mt-1 group-hover:gap-2 transition-all">Shop now <ArrowRight size={13} /></span>
              </div>
            </Link>
          </Reveal>
        ))}
        <Reveal delay={0.2}>
          <Link to="/shop" className="group flex flex-col justify-end aspect-[4/5] bg-navy p-5 md:p-6 text-ivory hover:bg-navy-700 transition">
            <span className="eyebrow !text-pastel mb-2">Everything</span>
            <h3 className="font-display text-2xl !text-ivory leading-tight">Shop the full catalogue</h3>
            <span className="text-xs text-pastel flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">Browse all <ArrowRight size={13} /></span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function NewArrivals({ products }: { products: Product[] }) {
  const items = products.filter((p) => p.isNew && p.active).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8)
  return (
    <section className="container-x py-12 md:py-20" aria-labelledby="na-h">
      <Reveal><SectionHeading eyebrow="Just in" title="New Arrivals" action={<Link to="/new-arrivals" className="text-sm text-navy link-u flex items-center gap-1">View all <ArrowRight size={14} /></Link>} /></Reveal>
      <h2 id="na-h" className="sr-only">New arrivals</h2>
      <ProductGrid products={items} />
    </section>
  )
}

function Trending({ products }: { products: Product[] }) {
  const collection = useDB((d) => d.collections.find((c) => c.id === 'street-layers' && c.active) ?? d.collections.find((c) => c.active))
  const items = useMemo(() => {
    const ids = collection?.productIds ?? []
    const fromCol = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[]
    return (fromCol.length >= 3 ? fromCol : products.filter((p) => p.trending)).slice(0, 3)
  }, [collection, products])
  return (
    <section className="bg-navy my-12 md:my-20 text-ivory" aria-labelledby="tr-h">
      <div className="container-x py-16 md:py-24 grid lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-16 items-center">
        <Reveal>
          <p className="eyebrow !text-pastel mb-4">Trending collection</p>
          <h2 id="tr-h" className="text-4xl md:text-5xl !text-ivory leading-[1.1]">{collection?.name ?? 'Street Layers'}</h2>
          <p className="mt-5 text-ivory/75 max-w-md leading-relaxed">{collection?.blurb ?? 'Contemporary silhouettes and everyday styles.'} Contemporary pieces designed to move from morning errands to evening plans.</p>
          <Link to={`/collections/${collection?.id ?? ''}`} className="btn btn-light mt-8">Explore the collection <ArrowRight size={16} /></Link>
        </Reveal>
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08} className={cx(i === 1 && 'mt-8 md:mt-14')}>
              <Link to={`/product/${p.slug}`} className="group block">
                <div className="aspect-[3/4.2] overflow-hidden bg-mist"><ProductImage product={p} src="art:1" className="w-full h-full transition duration-700 group-hover:scale-105" /></div>
                <p className="mt-3 text-sm text-ivory">{p.name}</p>
                <p className="text-xs text-pastel">{inr(p.price)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function LookCard({ look, products }: { look: Look; products: Product[] }) {
  const items = look.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[]
  const defaults = (p: Product) => {
    const c = p.colours.find((c) => p.sizes.some((s) => variantStock(p, s, c.name) > 0)) ?? p.colours[0]
    const s = p.sizes.find((s) => variantStock(p, s, c.name) > 0) ?? p.sizes[0]
    return { colour: c.name, size: s }
  }
  const [sel, setSel] = useState(() => Object.fromEntries(items.map((p) => [p.id, { on: true, ...defaults(p) }])))
  const chosen = items.filter((p) => sel[p.id]?.on)
  const total = chosen.reduce((a, p) => a + p.price, 0)
  const add = () => {
    if (!chosen.length) { toast('Select at least one item', { tone: 'err' }); return }
    let added = 0
    const failed: string[] = []
    chosen.forEach((p) => {
      const r = cart.add(p.id, sel[p.id].size, sel[p.id].colour, 1)
      if (r.ok) added++; else failed.push(`${p.name}: ${r.error}`)
    })
    if (added) toast(`${added} item${added > 1 ? 's' : ''} added to bag`, { action: { label: 'View bag', to: '/cart' } })
    if (failed.length) toast(failed[0], { tone: 'err' })
  }
  return (
    <div className="bg-white shadow-soft flex flex-col">
      <div className="grid grid-cols-3 gap-px bg-mist">
        {items.map((p) => (
          <Link key={p.id} to={`/product/${p.slug}`} className="aspect-[3/4] bg-mist overflow-hidden block"><ProductImage product={p} colour={p.colours.find((c) => c.name === sel[p.id]?.colour)?.hex} className="w-full h-full hover:scale-105 transition duration-700" /></Link>
        ))}
      </div>
      <div className="p-5 md:p-6 flex-1 flex flex-col">
        <h3 className="text-2xl">{look.name}</h3>
        <p className="text-sm text-charcoal/65 mt-1 mb-4">{look.blurb}</p>
        <ul className="divide-y divide-mist text-sm mb-5">
          {items.map((p) => {
            const s = sel[p.id]
            return (
              <li key={p.id} className="py-2.5 flex items-center gap-3">
                <input type="checkbox" checked={s.on} onChange={(e) => setSel({ ...sel, [p.id]: { ...s, on: e.target.checked } })} aria-label={`Include ${p.name}`} className="w-4 h-4 accent-[#243B53]" />
                <span className="flex-1 min-w-0 truncate">{p.name}</span>
                <label className="sr-only" htmlFor={`${look.id}-${p.id}`}>Size for {p.name}</label>
                <select id={`${look.id}-${p.id}`} value={s.size} onChange={(e) => setSel({ ...sel, [p.id]: { ...s, size: e.target.value } })} className="h-8 border border-mist bg-ivory text-xs px-1.5 rounded-sm">
                  {p.sizes.map((z) => <option key={z} value={z} disabled={variantStock(p, z, s.colour) <= 0}>{z}</option>)}
                </select>
                <span className="w-16 text-right text-charcoal/75">{inr(p.price)}</span>
              </li>
            )
          })}
        </ul>
        <button onClick={add} className="btn btn-primary w-full mt-auto"><ShoppingBag size={16} /> Add {chosen.length === items.length ? 'entire outfit' : `${chosen.length} selected`} · {inr(total)}</button>
      </div>
    </div>
  )
}

function ShopLook({ products }: { products: Product[] }) {
  const looks = useDB((d) => d.looks)
  return (
    <section className="container-x py-12 md:py-20" aria-labelledby="look-h">
      <Reveal><SectionHeading eyebrow="Complete the outfit" title="Shop the Look" sub="Pick individual pieces or add the whole outfit to your bag in one tap." /></Reveal>
      <h2 id="look-h" className="sr-only">Shop the look</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {looks.map((l, i) => <Reveal key={l.id} delay={i * 0.07}><LookCard look={l} products={products} /></Reveal>)}
      </div>
    </section>
  )
}

function Footwear({ products }: { products: Product[] }) {
  const items = products.filter((p) => p.category === 'footwear' && p.active).slice(0, 4)
  return (
    <section className="bg-pastel-100 my-12 md:my-20" aria-labelledby="fw-h">
      <div className="container-x py-16 md:py-24">
        <Reveal><SectionHeading eyebrow="Step out" title="The Footwear Edit" sub="Sneakers, slides and casual shoes — proposed demo categories, configurable to actual stock." action={<Link to="/shop?group=footwear" className="btn btn-outline btn-sm">Shop footwear</Link>} /></Reveal>
        <h2 id="fw-h" className="sr-only">Footwear collection</h2>
        <ProductGrid products={items} />
      </div>
    </section>
  )
}

function Why() {
  const items = [
    { i: Sparkles, t: 'Carefully Curated Fashion', d: 'Contemporary styles chosen for everyday confidence and comfort.' },
    { i: ShoppingBag, t: 'Convenient Online Shopping', d: 'Browse, choose your size and colour, and check out from your phone.' },
    { i: Headset, t: 'Easy WhatsApp Assistance', d: 'Ask about sizes and availability and get help directly from the store.' },
    { i: ShieldCheck, t: 'Secure Online Checkout', d: 'A simple, guided checkout. Payments here are simulated for the demo.' },
    { i: Store, t: 'Visit Our Physical Store', d: 'See and try styles in person at our store on Mualpui Road.' },
  ]
  return (
    <section className="container-x py-12 md:py-20" aria-labelledby="why-h">
      <Reveal><SectionHeading eyebrow="Why Blues Apparel 23" title="Why shop with us?" center /></Reveal>
      <h2 id="why-h" className="sr-only">Why shop with us</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {items.map(({ i: I, t, d }, n) => (
          <Reveal key={t} delay={n * 0.05}>
            <div className="h-full p-6 bg-white shadow-soft hover:-translate-y-1 hover:shadow-lift transition duration-300">
              <div className="w-11 h-11 grid place-items-center bg-pastel-100 text-navy mb-5"><I size={20} /></div>
              <h3 className="font-sans text-[15px] font-semibold text-navy mb-2">{t}</h3>
              <p className="text-sm text-charcoal/65 leading-relaxed">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  usePageMeta('Blues Apparel 23 — Your Everyday Style, Elevated', 'Discover contemporary clothing, footwear and accessories from Blues Apparel 23. Demonstration online store.')
  const products = useDB((d) => d.products)
  const best = products.filter((p) => p.bestSeller && p.active).slice(0, 4)
  return (
    <>
      <Hero />
      <Categories />
      <NewArrivals products={products} />
      <Trending products={products} />
      <section className="container-x py-12 md:py-16" aria-labelledby="bs-h">
        <Reveal><SectionHeading eyebrow="Curated picks" title="Best Sellers" sub="A demonstration selection of customer favourites — no sales figures are claimed." action={<Link to="/shop" className="text-sm text-navy link-u flex items-center gap-1">Shop all <ArrowRight size={14} /></Link>} /></Reveal>
        <h2 id="bs-h" className="sr-only">Best sellers</h2>
        <ProductGrid products={best} />
      </section>
      <ShopLook products={products} />
      <Footwear products={products} />
      <Why />
      <InstagramSection />
      <StoreVisit />
      <Newsletter />
      <span className="hidden"><MapPin /></span>
    </>
  )
}
