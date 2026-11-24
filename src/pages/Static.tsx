import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronDown, Clock, Heart, Instagram, MessageCircle, Phone, Ruler, Sparkles } from 'lucide-react'
import { useDB } from '../store'
import { usePageMeta } from '../hooks/usePageMeta'
import { Breadcrumbs, EmptyState, Field, Reveal, SectionHeading } from '../components/ui'
import { Scene } from '../components/art/Art'
import { StoreVisit } from '../components/shop/Blocks'
import { faqs, BRAND } from '../data/seed'
import { enquiries } from '../services'
import { cx, isEmail, isMobile, waLink } from '../lib/utils'

export function About() {
  usePageMeta('About Us', 'Blues Apparel 23 — a fashion business established in 2023, bringing contemporary styles to everyday wardrobes.')
  const values = [
    { t: 'Individuality', d: 'Fashion is about expressing who you are, not following a formula.' },
    { t: 'Comfort', d: 'Pieces designed to feel as good as they look through a full day.' },
    { t: 'Confidence', d: 'Contemporary styles that help you step out ready for any occasion.' },
    { t: 'Community', d: 'A store you can visit, a team you can message, and a style you can share.' },
  ]
  return (
    <>
      <section className="container-x pt-8 md:pt-12">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About us' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mt-8 md:mt-14">
          <div>
            <p className="eyebrow mb-4">Our story · Since 2023</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">Fashion is about expressing your individuality.</h1>
            <p className="mt-6 text-lg text-charcoal/75 leading-relaxed">At Blues Apparel 23, fashion is about expressing your individuality. Discover a collection of contemporary styles designed to bring confidence and comfort to your everyday wardrobe.</p>
            <p className="mt-4 text-charcoal/65 leading-relaxed">Established in 2023, Blues Apparel 23 offers clothing, footwear and accessories through its store and, today, through Instagram, WhatsApp and phone. This website shows how those conversations could grow into a complete online store.</p>
          </div>
          <div className="relative grid grid-cols-2 gap-3">
            <div className="aspect-[3/4] overflow-hidden mt-10"><Scene name="about1" className="w-full h-full" /></div>
            <div className="aspect-[3/4] overflow-hidden"><Scene name="about2" className="w-full h-full" /></div>
            <span className="absolute -bottom-6 left-0 text-[11px] text-charcoal/50">Brand photography placeholders — replace with official images.</span>
          </div>
        </div>
      </section>
      <section className="container-x py-24">
        <Reveal><SectionHeading eyebrow="What we stand for" title="Brand values" center /></Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => <Reveal key={v.t} delay={i * 0.06}><div className="h-full bg-white shadow-soft p-7"><span className="font-display text-3xl text-pastel-400">0{i + 1}</span><h3 className="text-xl mt-3 mb-2">{v.t}</h3><p className="text-sm text-charcoal/65 leading-relaxed">{v.d}</p></div></Reveal>)}
        </div>
      </section>
      <section className="bg-navy text-ivory">
        <div className="container-x py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="aspect-[4/3] overflow-hidden max-h-[380px]"><Scene name="about3" className="w-full h-full" /></div>
          <div>
            <p className="eyebrow !text-pastel mb-3">Visit us</p>
            <h2 className="text-3xl md:text-4xl !text-ivory mb-4">Come and see the collection in person.</h2>
            <p className="text-ivory/75 mb-6">{BRAND.address}. Open {BRAND.hours}.</p>
            <div className="flex gap-3 flex-wrap"><Link to="/contact" className="btn btn-light">Plan your visit</Link><Link to="/shop" className="btn border border-white/40 text-ivory hover:bg-white/10">Shop online</Link></div>
          </div>
        </div>
      </section>
    </>
  )
}

export function Contact() {
  usePageMeta('Contact Us', 'Call, WhatsApp or message Blues Apparel 23. Store hours 9 AM – 8 PM.')
  const s = useDB((d) => d.settings)
  const [f, setF] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [e, setE] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const er: Record<string, string> = {}
    if (f.name.trim().length < 2) er.name = 'Please enter your name'
    if (!isEmail(f.email)) er.email = 'Enter a valid email address'
    if (!isMobile(f.phone)) er.phone = 'Enter a valid 10-digit mobile number'
    if (f.subject.trim().length < 3) er.subject = 'Add a subject'
    if (f.message.trim().length < 10) er.message = 'Please write at least 10 characters'
    setE(er)
    if (Object.keys(er).length) return
    setState('busy')
    await new Promise((r) => setTimeout(r, 800))
    await enquiries.submit(f)
    setState('done')
  }
  const bind = (k: keyof typeof f) => ({ value: f[k], onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: ev.target.value }), 'aria-invalid': !!e[k], className: cx('field', e[k] && 'field-err') })
  return (
    <>
      <div className="container-x py-8 md:py-12">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact us' }]} />
        <h1 className="text-4xl md:text-5xl mt-5 mb-3">Contact us</h1>
        <p className="text-charcoal/70 max-w-xl mb-10">Questions about a style, size or your order? Reach the store the way you prefer.</p>
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-14 items-start">
          <div className="bg-white shadow-soft p-6 sm:p-9">
            {state === 'done' ? (
              <div className="text-center py-10" role="status"><Sparkles className="mx-auto text-navy mb-4" /><h2 className="text-3xl mb-2">Message received</h2><p className="text-charcoal/65 mb-6">Thank you, {f.name.split(' ')[0]}. This is a simulated submission — in the live site the store would reply by email, phone or WhatsApp.</p><button className="btn btn-outline" onClick={() => { setF({ name: '', email: '', phone: '', subject: '', message: '' }); setState('idle') }}>Send another</button></div>
            ) : (
              <form onSubmit={submit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <h2 className="sm:col-span-2 text-2xl">Send an enquiry</h2>
                <Field label="Name" error={e.name}><input autoComplete="name" {...bind('name')} /></Field>
                <Field label="Email" error={e.email}><input type="email" autoComplete="email" {...bind('email')} /></Field>
                <Field label="Mobile number" error={e.phone}><input type="tel" autoComplete="tel" {...bind('phone')} /></Field>
                <Field label="Subject" error={e.subject}><input {...bind('subject')} /></Field>
                <div className="sm:col-span-2"><Field label="Message" error={e.message}><textarea rows={5} {...(bind('message') as object)} className={cx('field !h-auto py-3', e.message && 'field-err')} /></Field></div>
                <button className="btn btn-primary sm:col-span-2 sm:w-fit" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Send message'}</button>
              </form>
            )}
          </div>
          <div className="space-y-4">
            <a href={`tel:${BRAND.phoneRaw}`} className="flex items-center gap-4 bg-white shadow-soft p-5 hover:shadow-lift transition"><span className="w-11 h-11 bg-pastel-100 grid place-items-center text-navy"><Phone size={19} /></span><span><span className="block text-xs text-charcoal/55">Call us</span><span className="font-medium text-navy">{s.phone}</span></span></a>
            <a href={waLink('Hi Blues Apparel 23, I have a question.')} target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white shadow-soft p-5 hover:shadow-lift transition"><span className="w-11 h-11 bg-pastel-100 grid place-items-center text-navy"><MessageCircle size={19} /></span><span><span className="block text-xs text-charcoal/55">WhatsApp</span><span className="font-medium text-navy">{s.whatsapp}</span></span></a>
            <a href={s.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white shadow-soft p-5 hover:shadow-lift transition"><span className="w-11 h-11 bg-pastel-100 grid place-items-center text-navy"><Instagram size={19} /></span><span><span className="block text-xs text-charcoal/55">Instagram</span><span className="font-medium text-navy">{BRAND.handle}</span></span></a>
            <div className="flex items-center gap-4 bg-white shadow-soft p-5"><span className="w-11 h-11 bg-pastel-100 grid place-items-center text-navy"><Clock size={19} /></span><span><span className="block text-xs text-charcoal/55">Store hours</span><span className="font-medium text-navy">{s.hours}</span></span></div>
          </div>
        </div>
      </div>
      <StoreVisit />
    </>
  )
}

export function Faq() {
  usePageMeta('FAQs & Customer Services', 'Frequently asked questions and customer services at Blues Apparel 23.')
  const services = useDB((d) => d.settings.services.filter((s) => s.enabled))
  const [open, setOpen] = useState<number | null>(0)
  const icons: Record<string, typeof Phone> = { whatsapp: MessageCircle, availability: Heart, styling: Ruler, store: Clock, delivery: Sparkles, support: Phone }
  const cta: Record<string, { label: string; href: string; ext?: boolean }> = {
    whatsapp: { label: 'Chat on WhatsApp', href: waLink('Hi Blues Apparel 23, I would like help with shopping.'), ext: true },
    availability: { label: 'Ask about a product', href: waLink('Hi Blues Apparel 23, is this style available? (name/size/colour)'), ext: true },
    styling: { label: 'Get sizing help', href: waLink('Hi Blues Apparel 23, I need help with size and styling.'), ext: true },
    store: { label: 'Store details', href: '/contact' },
    delivery: { label: 'Delivery policy', href: '/shipping-policy' },
    support: { label: 'Track an order', href: '/track-order' },
  }
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'FAQs & services' }]} />
      <h1 className="text-4xl md:text-5xl mt-5 mb-10">Customer services</h1>
      {services.length === 0 ? <EmptyState title="Services unavailable" text="Customer services are currently switched off." /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {services.map((s, i) => {
            const I = icons[s.id] ?? Sparkles
            const c = cta[s.id]
            return (
              <Reveal key={s.id} delay={i * 0.04}>
                <div className="h-full bg-white shadow-soft p-6 flex flex-col">
                  <span className="w-11 h-11 bg-pastel-100 grid place-items-center text-navy mb-4"><I size={20} /></span>
                  <h2 className="font-sans text-base font-semibold text-navy">{s.title}</h2>
                  <p className="text-sm text-charcoal/65 mt-2 mb-5 leading-relaxed flex-1">{s.desc}</p>
                  {c && (c.ext ? <a href={c.href} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm w-fit">{c.label}</a> : <Link to={c.href} className="btn btn-outline btn-sm w-fit">{c.label}</Link>)}
                </div>
              </Reveal>
            )
          })}
        </div>
      )}
      <div className="max-w-3xl">
        <h2 className="text-3xl mb-6">Frequently asked questions</h2>
        <div className="border-t border-mist">
          {faqs.map((f, i) => (
            <div key={f.q} className="border-b border-mist">
              <button className="w-full flex justify-between items-center gap-4 py-5 text-left font-medium text-navy" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{f.q}<ChevronDown size={18} className={cx('shrink-0 transition', open === i && 'rotate-180')} /></button>
              {open === i && <p className="pb-5 text-charcoal/70 leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PolicyPage({ slug: forced }: { slug?: string }) {
  const params = useParams()
  const slug = forced ?? params.slug ?? ''
  const page = useDB((d) => d.policies.find((p) => p.slug === slug))
  usePageMeta(page?.title ?? 'Policy', page?.body[1])
  const others = useDB((d) => d.policies)
  if (!page) return <div className="container-x py-20"><EmptyState title="Page not found" text="This policy page doesn't exist." action={<Link to="/" className="btn btn-primary">Back home</Link>} /></div>
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: page.title }]} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-12 mt-6">
        <article className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl mb-8">{page.title}</h1>
          <div className="space-y-5 text-[16px] leading-relaxed text-charcoal/80">
            {page.body.map((b, i) => <p key={i} className={cx(i === 0 && 'bg-pastel-100 text-navy text-sm p-4')}>{b}</p>)}
          </div>
          <p className="mt-10 text-sm text-charcoal/55">Questions? <a className="link-u text-navy" href={`tel:${BRAND.phoneRaw}`}>Call {BRAND.phone}</a> or <a className="link-u text-navy" target="_blank" rel="noreferrer" href={BRAND.whatsappUrl}>WhatsApp us</a>.</p>
        </article>
        <aside aria-label="Other policies"><p className="eyebrow mb-3">Policies</p><ul className="space-y-2 text-sm">{others.map((o) => <li key={o.slug}><Link to={`/${o.slug}`} className={cx('block py-1.5 border-l-2 pl-3 transition', o.slug === slug ? 'border-navy text-navy font-medium' : 'border-mist text-charcoal/65 hover:text-navy')}>{o.title}</Link></li>)}</ul></aside>
      </div>
    </div>
  )
}

export function NotFound() {
  usePageMeta('Page not found')
  return <div className="container-x py-24"><EmptyState title="Page not found" text="The page you’re looking for doesn’t exist or has moved." action={<div className="flex gap-3 justify-center"><Link to="/" className="btn btn-primary">Back home</Link><Link to="/shop" className="btn btn-outline">Shop all</Link></div>} /></div>
}
